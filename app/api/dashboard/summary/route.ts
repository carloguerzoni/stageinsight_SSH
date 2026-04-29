import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)

const competenceQuestionLabels: Record<string, string> = {
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

const competenceQuestionCodes = Object.keys(competenceQuestionLabels)

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
          message: "Gli studenti non possono accedere alla dashboard.",
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

    const openWhere: Prisma.OpenResponseWhereInput =
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
      totalClosedResponses,
      totalMultiResponses,
      totalOpenResponses,
      recentSessions,
      infoSourceGroups,
      competenceAveragesRaw,
      learnedSkillsGroups,
    ] = await Promise.all([
      prisma.surveySession.count({
        where: sessionWhere,
      }),

      prisma.closedResponse.count({
        where: closedWhere,
      }),

      prisma.multiResponse.count({
        where: multiWhere,
      }),

      prisma.openResponse.count({
        where: openWhere,
      }),

      prisma.surveySession.findMany({
        where: sessionWhere,
        orderBy: {
          submittedAt: "desc",
        },
        take: 10,
        include: {
          studentProfile: true,
          appUser: {
            include: {
              school: true,
              ets: true,
            },
          },
          _count: {
            select: {
              closedResponses: true,
              multiResponses: true,
              openResponses: true,
            },
          },
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

      prisma.closedResponse.groupBy({
        by: ["questionCode"],
        where: {
          ...closedWhere,
          questionCode: {
            in: competenceQuestionCodes,
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
    ])

    const infoSourceData = infoSourceGroups
      .map((item) => ({
        label: item.answerLabel,
        value: item._count._all,
      }))
      .sort((a, b) => b.value - a.value)

    const competenceAverages = competenceQuestionCodes
      .map((code) => {
        const found = competenceAveragesRaw.find(
          (item) => item.questionCode === code
        )

        return {
          label: competenceQuestionLabels[code],
          value: Number((found?._avg.numericValue ?? 0).toFixed(2)),
        }
      })
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value)

    const learnedSkillsData = learnedSkillsGroups
      .map((item) => ({
        label: item.answerLabel,
        value: item._count._all,
      }))
      .sort((a, b) => b.value - a.value)

    return NextResponse.json({
      success: true,
      currentUser: {
        fullName: appUser.fullName,
        email: appUser.email,
        role: appUser.role,
        school: appUser.school?.name ?? null,
        ets: appUser.ets?.name ?? null,
      },
      totals: {
        totalSessions,
        totalClosedResponses,
        totalMultiResponses,
        totalOpenResponses,
      },
      charts: {
        infoSourceData,
        competenceAverages,
        learnedSkillsData,
      },
      recentSessions: recentSessions.map((session) => ({
        id: session.id,
        submittedAt: session.submittedAt,
        educationPath: session.studentProfile?.educationPath ?? null,
        classGroup: session.studentProfile?.classGroup ?? null,
        firstExperience: session.studentProfile?.firstExperience ?? null,
        informationSource: session.studentProfile?.informationSource ?? null,
        stageRole: session.studentProfile?.stageRole ?? null,
        studentName: session.appUser?.fullName ?? null,
        schoolName: session.appUser?.school?.name ?? null,
        etsName: session.appUser?.ets?.name ?? null,
        counts: {
          closedResponses: session._count.closedResponses,
          multiResponses: session._count.multiResponses,
          openResponses: session._count.openResponses,
        },
      })),
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        success: false,
        message: "Errore durante il caricamento della dashboard.",
      },
      { status: 500 }
    )
  }
}