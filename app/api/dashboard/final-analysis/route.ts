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
  Q_COMMUNICATION: "Comunicazione efficace",
  Q_UNEXPECTED_EVENTS: "Gestione imprevisti",
  Q_ASK_FOR_HELP: "Chiedere aiuto",
  Q_CURIOSITY_MOTIVATION: "Curiosità e motivazione",
  Q_SKILLS_USEFUL: "Competenze personali utili",
  Q_COMMUNICATION_GROWTH: "Crescita comunicativa",
}

const volunteeringLabels: Record<string, string> = {
  Q_VOL_INTEREST_NEW_PEOPLE: "Conoscere nuove persone/realtà",
  Q_VOL_INTEREST_MANUAL_ACTIVITIES: "Attività manuali",
  Q_VOL_INTEREST_NEW_INTERESTS: "Scoprire nuovi interessi",
  Q_VOL_INTEREST_NEW_CAPABILITIES: "Scoprire nuove capacità",
  Q_VOL_INTEREST_ACTIVITY_OF_INTEREST: "Attività di proprio interesse",
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

const indexDefinitions: Record<string, string[]> = {
  "Indice responsabilità": ["Q_COMMITMENTS", "Q_TASK_COMPLETION"],
  "Indice relazionale": ["Q_TEAMWORK", "Q_EMPATHY", "Q_LISTENING"],
  "Indice comunicativo": ["Q_COMMUNICATION", "Q_COMMUNICATION_GROWTH"],
  "Indice autonomia": ["Q_UNEXPECTED_EVENTS", "Q_ASK_FOR_HELP"],
  "Indice coinvolgimento": ["Q_CURIOSITY_MOTIVATION", "Q_SKILLS_USEFUL"],
}

const themeRules = [
  {
    name: "Lavoro di gruppo",
    keywords: ["gruppo", "squadra", "collaborazione", "collaborare", "team"],
  },
  {
    name: "Comunicazione",
    keywords: ["comunicazione", "comunicare", "parlare", "ascolto", "ascoltare"],
  },
  {
    name: "Empatia e relazione",
    keywords: ["empatia", "emozioni", "relazione", "persone", "aiutare", "aiuto"],
  },
  {
    name: "Autonomia e responsabilità",
    keywords: ["autonomia", "responsabilità", "responsabile", "gestire"],
  },
  {
    name: "Problem solving",
    keywords: ["problema", "problemi", "soluzione", "risolvere", "imprevisti"],
  },
  {
    name: "Crescita personale",
    keywords: ["crescita", "cresciuto", "sicurezza", "fiducia", "migliorato"],
  },
  {
    name: "Organizzazione",
    keywords: ["organizzazione", "orari", "tempo", "scadenze", "puntualità"],
  },
  {
    name: "Volontariato e cittadinanza",
    keywords: ["volontariato", "cittadinanza", "comunità", "solidarietà", "sociale"],
  },
  {
    name: "Accoglienza ente",
    keywords: ["accoglienza", "accolto", "ente", "tutor", "disponibili"],
  },
  {
    name: "Criticità o difficoltà",
    keywords: ["difficoltà", "difficile", "confusione", "mancanza", "poco"],
  },
]

const stopWords = new Set([
  "che",
  "con",
  "per",
  "una",
  "uno",
  "gli",
  "delle",
  "della",
  "dello",
  "dei",
  "del",
  "nel",
  "nella",
  "nelle",
  "sono",
  "molto",
  "anche",
  "piu",
  "meno",
  "come",
  "fare",
  "fatto",
  "stata",
  "stato",
  "questa",
  "questo",
  "esperienza",
  "stage",
  "imparato",
  "sviluppato",
  "essere",
  "avere",
  "quando",
  "dove",
  "non",
  "si",
  "mi",
  "ma",
  "da",
  "di",
  "a",
  "e",
  "il",
  "lo",
  "la",
  "le",
  "i",
  "un",
  "in",
])

type ChartItem = {
  label: string
  value: number
}

function normalizeText(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

function sortDesc(data: ChartItem[]) {
  return [...data].sort((a, b) => b.value - a.value)
}

function countBy<T>(items: T[], getLabel: (item: T) => string | null | undefined) {
  const map = new Map<string, number>()

  for (const item of items) {
    const label = getLabel(item)

    if (!label) continue

    map.set(label, (map.get(label) ?? 0) + 1)
  }

  return sortDesc(
    Array.from(map.entries()).map(([label, value]) => ({ label, value }))
  )
}

function averageByQuestion(
  responses: { questionCode: string; numericValue: number | null }[],
  labels: Record<string, string>
) {
  return sortDesc(
    Object.entries(labels)
      .map(([code, label]) => {
        const values = responses
          .filter((response) => response.questionCode === code)
          .map((response) => response.numericValue)
          .filter((value): value is number => typeof value === "number")

        const average =
          values.length > 0
            ? values.reduce((sum, value) => sum + value, 0) / values.length
            : 0

        return {
          label,
          value: Number(average.toFixed(2)),
        }
      })
      .filter((item) => item.value > 0)
  )
}

function buildIndexes(
  responses: { questionCode: string; numericValue: number | null }[]
) {
  const averagesByCode = new Map<string, number>()

  for (const code of Object.keys(competenceLabels)) {
    const values = responses
      .filter((response) => response.questionCode === code)
      .map((response) => response.numericValue)
      .filter((value): value is number => typeof value === "number")

    if (values.length > 0) {
      averagesByCode.set(
        code,
        values.reduce((sum, value) => sum + value, 0) / values.length
      )
    }
  }

  return sortDesc(
    Object.entries(indexDefinitions)
      .map(([label, codes]) => {
        const values = codes
          .map((code) => averagesByCode.get(code))
          .filter((value): value is number => typeof value === "number")

        const average =
          values.length > 0
            ? values.reduce((sum, value) => sum + value, 0) / values.length
            : 0

        return {
          label,
          value: Number(average.toFixed(2)),
        }
      })
      .filter((item) => item.value > 0)
  )
}

function detectThemes(text: string) {
  const normalized = normalizeText(text)

  return themeRules
    .filter((theme) =>
      theme.keywords.some((keyword) =>
        normalized.includes(normalizeText(keyword))
      )
    )
    .map((theme) => theme.name)
}

function extractWords(texts: string[]) {
  const counts = new Map<string, number>()

  for (const text of texts) {
    const words = normalizeText(text)
      .replace(/[^a-zA-Z0-9\s]/g, " ")
      .split(/\s+/)
      .map((word) => word.trim())
      .filter((word) => word.length >= 3)
      .filter((word) => !stopWords.has(word))

    for (const word of words) {
      counts.set(word, (counts.get(word) ?? 0) + 1)
    }
  }

  return sortDesc(
    Array.from(counts.entries()).map(([label, value]) => ({ label, value }))
  ).slice(0, 20)
}

function percentage(part: number, total: number) {
  if (total === 0) return 0
  return Number(((part / total) * 100).toFixed(1))
}

function buildInsights({
  totalSessions,
  totalSchools,
  totalEts,
  firstExperienceData,
  infoSources,
  motivations,
  competenceAverages,
  competenceIndexes,
  learnedSkills,
  skillContexts,
  themeData,
}: {
  totalSessions: number
  totalSchools: number
  totalEts: number
  firstExperienceData: ChartItem[]
  infoSources: ChartItem[]
  motivations: ChartItem[]
  competenceAverages: ChartItem[]
  competenceIndexes: ChartItem[]
  learnedSkills: ChartItem[]
  skillContexts: ChartItem[]
  themeData: ChartItem[]
}) {
  if (totalSessions === 0) {
    return [
      "Non sono ancora presenti questionari compilati per i filtri selezionati.",
    ]
  }

  const insights: string[] = []

  insights.push(
    `Sono presenti ${totalSessions} questionari compilati, relativi a ${totalSchools} scuole e ${totalEts} enti/ETS.`
  )

  const first = firstExperienceData.find(
    (item) => item.label === "Prima esperienza"
  )

  if (first) {
    insights.push(
      `Gli studenti alla prima esperienza sono ${first.value}, pari al ${percentage(
        first.value,
        totalSessions
      )}% delle compilazioni filtrate.`
    )
  }

  if (infoSources[0]) {
    insights.push(
      `La fonte informativa più frequente è "${infoSources[0].label}", selezionata ${infoSources[0].value} volte.`
    )
  }

  if (motivations[0]) {
    insights.push(
      `La motivazione personale più ricorrente è "${motivations[0].label}".`
    )
  }

  if (competenceAverages[0]) {
    insights.push(
      `La competenza con media più alta è "${competenceAverages[0].label}", con valore medio ${competenceAverages[0].value.toFixed(
        2
      )} su 4.`
    )
  }

  const weakestCompetence = [...competenceAverages].sort(
    (a, b) => a.value - b.value
  )[0]

  if (weakestCompetence) {
    insights.push(
      `L’area con media più bassa, quindi da osservare meglio, è "${weakestCompetence.label}", con valore medio ${weakestCompetence.value.toFixed(
        2
      )} su 4.`
    )
  }

  if (competenceIndexes[0]) {
    insights.push(
      `L’indice sintetico più alto è "${competenceIndexes[0].label}", con valore medio ${competenceIndexes[0].value.toFixed(
        2
      )} su 4.`
    )
  }

  if (learnedSkills[0]) {
    insights.push(
      `La competenza appresa più indicata dagli studenti è "${learnedSkills[0].label}".`
    )
  }

  if (skillContexts[0]) {
    insights.push(
      `Il contesto futuro più indicato per usare le competenze è "${skillContexts[0].label}".`
    )
  }

  if (themeData[0]) {
    insights.push(
      `Dalle risposte aperte emerge soprattutto il tema "${themeData[0].label}", rilevato ${themeData[0].value} volte.`
    )
  }

  return insights
}

function uniqueSorted(values: Array<string | null | undefined>) {
  return Array.from(
    new Set(values.filter((value): value is string => Boolean(value)))
  ).sort((a, b) => a.localeCompare(b))
}

function makeRelationWhere(sessionWhere: Prisma.SurveySessionWhereInput) {
  return {
    surveySession: {
      is: sessionWhere,
    },
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)

    const school = url.searchParams.get("school") || ""
    const ets = url.searchParams.get("ets") || ""
    const path = url.searchParams.get("path") || ""
    const firstExperience = url.searchParams.get("firstExperience") || ""
    const infoSource = url.searchParams.get("infoSource") || ""
    const from = url.searchParams.get("from") || ""
    const to = url.searchParams.get("to") || ""

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

    const baseConditions: Prisma.SurveySessionWhereInput[] = [
      {
        appUserId: {
          not: null,
        },
      },
    ]

    if (appUser.role === "SCHOOL_REFERENT") {
      baseConditions.push({
        appUser: {
          is: {
            schoolId: appUser.schoolId,
          },
        },
      })
    }

    const roleBaseWhere: Prisma.SurveySessionWhereInput = {
      AND: baseConditions,
    }

    const filterConditions: Prisma.SurveySessionWhereInput[] = [
      ...baseConditions,
    ]

    if (school && appUser.role === "ADMIN") {
      filterConditions.push({
        appUser: {
          is: {
            school: {
              is: {
                name: school,
              },
            },
          },
        },
      })
    }

    if (ets) {
      filterConditions.push({
        appUser: {
          is: {
            ets: {
              is: {
                name: ets,
              },
            },
          },
        },
      })
    }

    if (path) {
      filterConditions.push({
        studentProfile: {
          is: {
            educationPath: path,
          },
        },
      })
    }

    if (firstExperience === "true" || firstExperience === "false") {
      filterConditions.push({
        studentProfile: {
          is: {
            firstExperience: firstExperience === "true",
          },
        },
      })
    }

    if (infoSource) {
      filterConditions.push({
        studentProfile: {
          is: {
            informationSource: infoSource,
          },
        },
      })
    }

    if (from) {
      filterConditions.push({
        submittedAt: {
          gte: new Date(`${from}T00:00:00`),
        },
      })
    }

    if (to) {
      filterConditions.push({
        submittedAt: {
          lte: new Date(`${to}T23:59:59`),
        },
      })
    }

    const sessionWhere: Prisma.SurveySessionWhereInput = {
      AND: filterConditions,
    }

    const [optionSessions, sessions, closedResponses, multiResponses, openResponses] =
      await Promise.all([
        prisma.surveySession.findMany({
          where: roleBaseWhere,
          include: {
            appUser: {
              include: {
                school: true,
                ets: true,
              },
            },
            studentProfile: true,
          },
        }),

        prisma.surveySession.findMany({
          where: sessionWhere,
          orderBy: {
            submittedAt: "desc",
          },
          include: {
            appUser: {
              include: {
                school: true,
                ets: true,
              },
            },
            studentProfile: true,
          },
        }),

        prisma.closedResponse.findMany({
          where: makeRelationWhere(sessionWhere),
        }),

        prisma.multiResponse.findMany({
          where: makeRelationWhere(sessionWhere),
        }),

        prisma.openResponse.findMany({
          where: makeRelationWhere(sessionWhere),
          orderBy: {
            createdAt: "desc",
          },
          include: {
            surveySession: {
              include: {
                appUser: {
                  include: {
                    school: true,
                    ets: true,
                  },
                },
                studentProfile: true,
              },
            },
          },
        }),
      ])

    const schools = countBy(sessions, (session) => session.appUser?.school?.name)
    const etsData = countBy(sessions, (session) => session.appUser?.ets?.name)
    const paths = countBy(
      sessions,
      (session) => session.studentProfile?.educationPath
    )
    const classes = countBy(
      sessions,
      (session) => session.studentProfile?.classGroup
    )
    const firstExperienceData = countBy(sessions, (session) =>
      session.studentProfile?.firstExperience === true
        ? "Prima esperienza"
        : session.studentProfile?.firstExperience === false
        ? "Esperienza precedente"
        : "Non indicato"
    )
    const infoSources = countBy(
      sessions,
      (session) => session.studentProfile?.informationSource
    )

    const motivations = countBy(
      multiResponses.filter(
        (response) => response.questionCode === "Q_PERSONAL_MOTIVATIONS"
      ),
      (response) => response.answerLabel
    )

    const learnedSkills = countBy(
      multiResponses.filter(
        (response) => response.questionCode === "Q_LEARNED_SKILLS"
      ),
      (response) => response.answerLabel
    )

    const skillContexts = countBy(
      multiResponses.filter(
        (response) => response.questionCode === "Q_SKILL_CONTEXTS"
      ),
      (response) => response.answerLabel
    )

    const competenceAverages = averageByQuestion(closedResponses, competenceLabels)
    const competenceIndexes = buildIndexes(closedResponses)
    const volunteeringAverages = averageByQuestion(closedResponses, volunteeringLabels)
    const schoolLifeAverages = averageByQuestion(closedResponses, schoolLifeLabels)

    const themeCounts = new Map<string, number>()

    for (const response of openResponses) {
      const themes = detectThemes(response.answerText)

      for (const theme of themes) {
        themeCounts.set(theme, (themeCounts.get(theme) ?? 0) + 1)
      }
    }

    const openThemes = sortDesc(
      Array.from(themeCounts.entries()).map(([label, value]) => ({
        label,
        value,
      }))
    )

    const openTopWords = extractWords(
      openResponses.map((response) => response.answerText)
    )

    const totalStudents = new Set(
      sessions
        .map((session) => session.appUserId)
        .filter((value): value is string => Boolean(value))
    ).size

    const totalSchools = new Set(
      sessions
        .map((session) => session.appUser?.school?.name)
        .filter((value): value is string => Boolean(value))
    ).size

    const totalEts = new Set(
      sessions
        .map((session) => session.appUser?.ets?.name)
        .filter((value): value is string => Boolean(value))
    ).size

    const insights = buildInsights({
      totalSessions: sessions.length,
      totalSchools,
      totalEts,
      firstExperienceData,
      infoSources,
      motivations,
      competenceAverages,
      competenceIndexes,
      learnedSkills,
      skillContexts,
      themeData: openThemes,
    })

    const recentSessions = sessions.slice(0, 10).map((session) => ({
      id: session.id,
      submittedAt: session.submittedAt,
      studentName: session.appUser?.fullName ?? null,
      schoolName: session.appUser?.school?.name ?? null,
      etsName: session.appUser?.ets?.name ?? null,
      educationPath: session.studentProfile?.educationPath ?? null,
      classGroup: session.studentProfile?.classGroup ?? null,
      firstExperience: session.studentProfile?.firstExperience ?? null,
      informationSource: session.studentProfile?.informationSource ?? null,
      stageRole: session.studentProfile?.stageRole ?? null,
    }))

    const openSamples = openResponses.slice(0, 20).map((response) => ({
      id: response.id,
      text: response.answerText,
      themes: detectThemes(response.answerText),
      studentName: response.surveySession.appUser?.fullName ?? null,
      schoolName: response.surveySession.appUser?.school?.name ?? null,
      etsName: response.surveySession.appUser?.ets?.name ?? null,
      educationPath:
        response.surveySession.studentProfile?.educationPath ?? null,
      classGroup: response.surveySession.studentProfile?.classGroup ?? null,
    }))

    return NextResponse.json({
      success: true,
      currentUser: {
        fullName: appUser.fullName,
        email: appUser.email,
        role: appUser.role,
        school: appUser.school?.name ?? null,
        ets: appUser.ets?.name ?? null,
      },
      filters: {
        selected: {
          school,
          ets,
          path,
          firstExperience,
          infoSource,
          from,
          to,
        },
        options: {
          schools: uniqueSorted(
            optionSessions.map((session) => session.appUser?.school?.name)
          ),
          ets: uniqueSorted(
            optionSessions.map((session) => session.appUser?.ets?.name)
          ),
          paths: uniqueSorted(
            optionSessions.map(
              (session) => session.studentProfile?.educationPath
            )
          ),
          infoSources: uniqueSorted(
            optionSessions.map(
              (session) => session.studentProfile?.informationSource
            )
          ),
        },
      },
      totals: {
        totalSessions: sessions.length,
        totalStudents,
        totalSchools,
        totalEts,
        totalClosedResponses: closedResponses.length,
        totalMultiResponses: multiResponses.length,
        totalOpenResponses: openResponses.length,
      },
      insights,
      charts: {
        schools,
        etsData,
        paths,
        classes,
        firstExperienceData,
        infoSources,
        motivations,
        competenceAverages,
        competenceIndexes,
        learnedSkills,
        skillContexts,
        volunteeringAverages,
        schoolLifeAverages,
        openThemes,
        openTopWords,
      },
      recentSessions,
      openSamples,
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        success: false,
        message: "Errore durante il caricamento dell’analisi finale.",
      },
      { status: 500 }
    )
  }
}