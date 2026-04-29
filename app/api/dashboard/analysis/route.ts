import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)

const competenceLabels: Record<string, string> = {
  Q_COMMITMENTS: "Rispetto impegni",
  Q_TASK_COMPLETION: "Portare a termine incarichi",
  Q_TEAMWORK: "Lavoro di gruppo",
  Q_EMPATHY: "Empatia",
  Q_LISTENING: "Ascolto",
  Q_COMMUNICATION: "Comunicazione",
  Q_UNEXPECTED_EVENTS: "Gestione imprevisti",
  Q_ASK_FOR_HELP: "Chiedere aiuto",
  Q_CURIOSITY_MOTIVATION: "Curiosità e motivazione",
  Q_SKILLS_USEFUL: "Competenze utili",
  Q_COMMUNICATION_GROWTH: "Crescita comunicativa",
}

const volunteeringInterestLabels: Record<string, string> = {
  Q_VOL_INTEREST_NEW_PEOPLE: "Conoscere nuove persone/realtà",
  Q_VOL_INTEREST_MANUAL_ACTIVITIES: "Attività manuali",
  Q_VOL_INTEREST_NEW_INTERESTS: "Scoprire nuovi interessi",
  Q_VOL_INTEREST_NEW_CAPABILITIES: "Scoprire nuove capacità",
  Q_VOL_INTEREST_ACTIVITY_OF_INTEREST: "Attività di interesse",
  Q_VOL_INTEREST_TEAMWORK: "Lavorare in gruppo",
}

const schoolLifeLabels: Record<string, string> = {
  Q_CLASS_WELLBEING: "Benessere in classe",
  Q_SCHOOL_RULES: "Importanza regole scolastiche",
  Q_PEER_GROUP: "Gruppo amici/compagni",
  Q_GRADES_SATISFACTION: "Soddisfazione voti",
  Q_CLASS_RELATIONS: "Relazioni e gruppo classe",
  Q_SELF_AWARENESS: "Conoscenza bisogni/desideri",
  Q_FAMILY_SUPPORT: "Supporto famiglia",
}

type ChartItem = {
  label: string
  value: number
}

function sortDesc(data: ChartItem[]) {
  return [...data].sort((a, b) => b.value - a.value)
}

function buildInsights({
  totalSessions,
  infoSourceGroups,
  motivationGroups,
  competenceAverages,
  learnedSkillsGroups,
  skillContextGroups,
  schoolLifeAverages,
}: {
  totalSessions: number
  infoSourceGroups: ChartItem[]
  motivationGroups: ChartItem[]
  competenceAverages: ChartItem[]
  learnedSkillsGroups: ChartItem[]
  skillContextGroups: ChartItem[]
  schoolLifeAverages: ChartItem[]
}) {
  if (totalSessions === 0) return []

  const topSource = infoSourceGroups[0]
  const topMotivation = motivationGroups[0]
  const topCompetence = competenceAverages[0]
  const weakestCompetence = [...competenceAverages].sort(
    (a, b) => a.value - b.value
  )[0]
  const topLearnedSkill = learnedSkillsGroups[0]
  const topContext = skillContextGroups[0]
  const topSchoolLife = schoolLifeAverages[0]

  const insights: string[] = []

  insights.push(`Sono presenti ${totalSessions} compilazioni visibili per il tuo ruolo.`)

  if (topSource) {
    insights.push(
      `La fonte informativa più frequente è "${topSource.label}", selezionata ${topSource.value} volte.`
    )
  }

  if (topMotivation) {
    insights.push(`La motivazione personale più ricorrente è "${topMotivation.label}".`)
  }

  if (topCompetence) {
    insights.push(
      `L’area con media più alta è "${topCompetence.label}", con valore medio ${topCompetence.value.toFixed(
        2
      )} su 4.`
    )
  }

  if (weakestCompetence) {
    insights.push(
      `L’area con media più bassa, quindi da osservare meglio, è "${weakestCompetence.label}", con valore medio ${weakestCompetence.value.toFixed(
        2
      )} su 4.`
    )
  }

  if (topLearnedSkill) {
    insights.push(`La competenza appresa più selezionata è "${topLearnedSkill.label}".`)
  }

  if (topContext) {
    insights.push(
      `Il contesto futuro più indicato per usare le competenze è "${topContext.label}".`
    )
  }

  if (topSchoolLife) {
    insights.push(
      `Nella parte scolastica/personale, l’aspetto con media più alta è "${topSchoolLife.label}".`
    )
  }

  return insights
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Accesso non autorizzato. Effettua il login.",
        },
        { status: 401 }
      )
    }

    const {
      data: { user },
      error,
    } = await supabaseServer.auth.getUser(token)

    if (error || !user) {
      return NextResponse.json(
        {
          success: false,
          message: "Sessione non valida. Effettua di nuovo il login.",
        },
        { status: 401 }
      )
    }

    const appUser = await prisma.appUser.findUnique({
      where: {
        authUserId: user.id,
      },
      include: {
        school: true,
        ets: true,
      },
    })

    if (!appUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Profilo applicativo non trovato.",
        },
        { status: 404 }
      )
    }

    if (appUser.role === "STUDENT") {
      return NextResponse.json(
        {
          success: false,
          message: "Gli studenti non possono accedere all’analisi.",
        },
        { status: 403 }
      )
    }

    if (appUser.role === "SCHOOL_REFERENT" && !appUser.schoolId) {
      return NextResponse.json(
        {
          success: false,
          message: "Il referente scuola non è collegato a una scuola.",
        },
        { status: 403 }
      )
    }

    const sessionWhere: Prisma.SurveySessionWhereInput =
      appUser.role === "SCHOOL_REFERENT"
        ? {
            appUser: {
              schoolId: appUser.schoolId,
            },
          }
        : {}

    const studentProfileWhere: Prisma.StudentProfileWhereInput =
      appUser.role === "SCHOOL_REFERENT"
        ? {
            surveySession: {
              appUser: {
                schoolId: appUser.schoolId,
              },
            },
          }
        : {}

    const closedWhere: Prisma.ClosedResponseWhereInput =
      appUser.role === "SCHOOL_REFERENT"
        ? {
            surveySession: {
              appUser: {
                schoolId: appUser.schoolId,
              },
            },
          }
        : {}

    const multiWhere: Prisma.MultiResponseWhereInput =
      appUser.role === "SCHOOL_REFERENT"
        ? {
            surveySession: {
              appUser: {
                schoolId: appUser.schoolId,
              },
            },
          }
        : {}

    const [
      totalSessions,
      pathGroupsRaw,
      firstExperienceGroupsRaw,
      infoSourceGroupsRaw,
      motivationGroupsRaw,
      competenceAveragesRaw,
      learnedSkillsGroupsRaw,
      skillContextGroupsRaw,
      volunteeringAveragesRaw,
      schoolLifeAveragesRaw,
    ] = await Promise.all([
      prisma.surveySession.count({
        where: sessionWhere,
      }),

      prisma.studentProfile.groupBy({
        by: ["educationPath"],
        where: studentProfileWhere,
        _count: {
          _all: true,
        },
      }),

      prisma.studentProfile.groupBy({
        by: ["firstExperience"],
        where: studentProfileWhere,
        _count: {
          _all: true,
        },
      }),

      prisma.closedResponse.groupBy({
        by: ["answerLabel"],
        where: {
          ...closedWhere,
          questionCode: "Q_INFO_SOURCE",
        },
        _count: {
          _all: true,
        },
      }),

      prisma.multiResponse.groupBy({
        by: ["answerLabel"],
        where: {
          ...multiWhere,
          questionCode: "Q_PERSONAL_MOTIVATIONS",
        },
        _count: {
          _all: true,
        },
      }),

      prisma.closedResponse.groupBy({
        by: ["questionCode"],
        where: {
          ...closedWhere,
          questionCode: {
            in: Object.keys(competenceLabels),
          },
          numericValue: {
            not: null,
          },
        },
        _avg: {
          numericValue: true,
        },
      }),

      prisma.multiResponse.groupBy({
        by: ["answerLabel"],
        where: {
          ...multiWhere,
          questionCode: "Q_LEARNED_SKILLS",
        },
        _count: {
          _all: true,
        },
      }),

      prisma.multiResponse.groupBy({
        by: ["answerLabel"],
        where: {
          ...multiWhere,
          questionCode: "Q_SKILL_CONTEXTS",
        },
        _count: {
          _all: true,
        },
      }),

      prisma.closedResponse.groupBy({
        by: ["questionCode"],
        where: {
          ...closedWhere,
          questionCode: {
            in: Object.keys(volunteeringInterestLabels),
          },
          numericValue: {
            not: null,
          },
        },
        _avg: {
          numericValue: true,
        },
      }),

      prisma.closedResponse.groupBy({
        by: ["questionCode"],
        where: {
          ...closedWhere,
          questionCode: {
            in: Object.keys(schoolLifeLabels),
          },
          numericValue: {
            not: null,
          },
        },
        _avg: {
          numericValue: true,
        },
      }),
    ])

    const pathGroups = sortDesc(
      pathGroupsRaw.map((item) => ({
        label: item.educationPath || "Non indicato",
        value: item._count._all,
      }))
    )

    const firstExperienceGroups = sortDesc(
      firstExperienceGroupsRaw.map((item) => ({
        label:
          item.firstExperience === true
            ? "Prima esperienza"
            : item.firstExperience === false
            ? "Esperienza precedente"
            : "Non indicato",
        value: item._count._all,
      }))
    )

    const infoSourceGroups = sortDesc(
      infoSourceGroupsRaw.map((item) => ({
        label: item.answerLabel,
        value: item._count._all,
      }))
    )

    const motivationGroups = sortDesc(
      motivationGroupsRaw.map((item) => ({
        label: item.answerLabel,
        value: item._count._all,
      }))
    )

    const competenceAverages = sortDesc(
      competenceAveragesRaw.map((item) => ({
        label: competenceLabels[item.questionCode] || item.questionCode,
        value: Number((item._avg.numericValue ?? 0).toFixed(2)),
      }))
    )

    const learnedSkillsGroups = sortDesc(
      learnedSkillsGroupsRaw.map((item) => ({
        label: item.answerLabel,
        value: item._count._all,
      }))
    )

    const skillContextGroups = sortDesc(
      skillContextGroupsRaw.map((item) => ({
        label: item.answerLabel,
        value: item._count._all,
      }))
    )

    const volunteeringAverages = sortDesc(
      volunteeringAveragesRaw.map((item) => ({
        label: volunteeringInterestLabels[item.questionCode] || item.questionCode,
        value: Number((item._avg.numericValue ?? 0).toFixed(2)),
      }))
    )

    const schoolLifeAverages = sortDesc(
      schoolLifeAveragesRaw.map((item) => ({
        label: schoolLifeLabels[item.questionCode] || item.questionCode,
        value: Number((item._avg.numericValue ?? 0).toFixed(2)),
      }))
    )

    const insights = buildInsights({
      totalSessions,
      infoSourceGroups,
      motivationGroups,
      competenceAverages,
      learnedSkillsGroups,
      skillContextGroups,
      schoolLifeAverages,
    })

    return NextResponse.json({
      success: true,
      currentUser: {
        fullName: appUser.fullName,
        email: appUser.email,
        role: appUser.role,
        school: appUser.school?.name ?? null,
        ets: appUser.ets?.name ?? null,
      },
      insights,
      charts: {
        pathGroups,
        firstExperienceGroups,
        infoSourceGroups,
        motivationGroups,
        competenceAverages,
        learnedSkillsGroups,
        skillContextGroups,
        volunteeringAverages,
        schoolLifeAverages,
      },
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        success: false,
        message: "Errore durante il caricamento dell’analisi.",
      },
      { status: 500 }
    )
  }
}