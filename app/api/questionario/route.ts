import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { prisma } from "@/lib/prisma"

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)

const likertOptions = [
  "Moltissimo",
  "Molto",
  "Abbastanza",
  "Poco per nulla",
]

const volunteeringInterestKeys = [
  "newPeople",
  "manualActivities",
  "newInterests",
  "newCapabilities",
  "activitiesOfInterest",
  "teamwork",
]

const schoolLifeKeys = [
  "classWellbeing",
  "schoolRules",
  "peerGroup",
  "gradesSatisfaction",
  "classRelations",
  "selfAwareness",
  "familySupport",
]

function likertToNumber(value: string) {
  switch (value) {
    case "Moltissimo":
      return 4
    case "Molto":
      return 3
    case "Abbastanza":
      return 2
    case "Poco per nulla":
      return 1
    default:
      return null
  }
}

function isLikert(value: unknown): value is string {
  return typeof value === "string" && likertOptions.includes(value)
}

function hasAllLikertValues(
  obj: Record<string, string>,
  keys: string[]
): boolean {
  return keys.every((key) => isLikert(obj?.[key]))
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Devi effettuare il login prima di compilare il questionario.",
        },
        { status: 401 }
      )
    }

    const {
      data: { user },
      error: authError,
    } = await supabaseServer.auth.getUser(token)

    if (authError || !user) {
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
          message: "Profilo studente non trovato.",
        },
        { status: 404 }
      )
    }

    if (appUser.role !== "STUDENT") {
      return NextResponse.json(
        {
          success: false,
          message: "Solo gli studenti possono compilare il questionario.",
        },
        { status: 403 }
      )
    }

    const body = await request.json()

    const {
      educationPath,
      classGroup,
      firstExperience,
      informationSource,
      stageRole,
      motivations,
      commitments,
      taskCompletion,
      teamwork,
      empathy,
      listening,
      communication,
      unexpectedEvents,
      askForHelp,
      curiosityMotivation,
      skillsUseful,
      communicationGrowth,
      learnedSkills,
      skillContexts,
      volunteeringInterests,
      schoolLife,
      otherLearnedText,
    } = body

    if (
      !educationPath?.trim() ||
      !classGroup?.trim() ||
      typeof firstExperience !== "boolean" ||
      !informationSource?.trim() ||
      !stageRole?.trim() ||
      !Array.isArray(motivations) ||
      motivations.length === 0 ||
      !isLikert(commitments) ||
      !isLikert(taskCompletion) ||
      !isLikert(teamwork) ||
      !isLikert(empathy) ||
      !isLikert(listening) ||
      !isLikert(communication) ||
      !isLikert(unexpectedEvents) ||
      !isLikert(askForHelp) ||
      !isLikert(curiosityMotivation) ||
      !isLikert(skillsUseful) ||
      !isLikert(communicationGrowth) ||
      !Array.isArray(learnedSkills) ||
      learnedSkills.length === 0 ||
      !Array.isArray(skillContexts) ||
      skillContexts.length === 0 ||
      !hasAllLikertValues(volunteeringInterests, volunteeringInterestKeys) ||
      !hasAllLikertValues(schoolLife, schoolLifeKeys)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Compila correttamente tutti i campi obbligatori.",
        },
        { status: 400 }
      )
    }

    const result = await prisma.$transaction(async (tx) => {
      const session = await tx.surveySession.create({
        data: {
          schoolYear: "2025/2026",
          appUserId: appUser.id,
          etsId: appUser.etsId,
        },
      })

      await tx.studentProfile.create({
        data: {
          surveySessionId: session.id,
          educationPath,
          classGroup,
          firstExperience,
          stageRole,
          informationSource,
        },
      })

      await tx.closedResponse.createMany({
        data: [
          {
            surveySessionId: session.id,
            questionCode: "Q_INFO_SOURCE",
            answerLabel: informationSource,
            numericValue: null,
          },
          {
            surveySessionId: session.id,
            questionCode: "Q_COMMITMENTS",
            answerLabel: commitments,
            numericValue: likertToNumber(commitments),
          },
          {
            surveySessionId: session.id,
            questionCode: "Q_TASK_COMPLETION",
            answerLabel: taskCompletion,
            numericValue: likertToNumber(taskCompletion),
          },
          {
            surveySessionId: session.id,
            questionCode: "Q_TEAMWORK",
            answerLabel: teamwork,
            numericValue: likertToNumber(teamwork),
          },
          {
            surveySessionId: session.id,
            questionCode: "Q_EMPATHY",
            answerLabel: empathy,
            numericValue: likertToNumber(empathy),
          },
          {
            surveySessionId: session.id,
            questionCode: "Q_LISTENING",
            answerLabel: listening,
            numericValue: likertToNumber(listening),
          },
          {
            surveySessionId: session.id,
            questionCode: "Q_COMMUNICATION",
            answerLabel: communication,
            numericValue: likertToNumber(communication),
          },
          {
            surveySessionId: session.id,
            questionCode: "Q_UNEXPECTED_EVENTS",
            answerLabel: unexpectedEvents,
            numericValue: likertToNumber(unexpectedEvents),
          },
          {
            surveySessionId: session.id,
            questionCode: "Q_ASK_FOR_HELP",
            answerLabel: askForHelp,
            numericValue: likertToNumber(askForHelp),
          },
          {
            surveySessionId: session.id,
            questionCode: "Q_CURIOSITY_MOTIVATION",
            answerLabel: curiosityMotivation,
            numericValue: likertToNumber(curiosityMotivation),
          },
          {
            surveySessionId: session.id,
            questionCode: "Q_SKILLS_USEFUL",
            answerLabel: skillsUseful,
            numericValue: likertToNumber(skillsUseful),
          },
          {
            surveySessionId: session.id,
            questionCode: "Q_COMMUNICATION_GROWTH",
            answerLabel: communicationGrowth,
            numericValue: likertToNumber(communicationGrowth),
          },
          {
            surveySessionId: session.id,
            questionCode: "Q_VOL_INTEREST_NEW_PEOPLE",
            answerLabel: volunteeringInterests.newPeople,
            numericValue: likertToNumber(volunteeringInterests.newPeople),
          },
          {
            surveySessionId: session.id,
            questionCode: "Q_VOL_INTEREST_MANUAL_ACTIVITIES",
            answerLabel: volunteeringInterests.manualActivities,
            numericValue: likertToNumber(volunteeringInterests.manualActivities),
          },
          {
            surveySessionId: session.id,
            questionCode: "Q_VOL_INTEREST_NEW_INTERESTS",
            answerLabel: volunteeringInterests.newInterests,
            numericValue: likertToNumber(volunteeringInterests.newInterests),
          },
          {
            surveySessionId: session.id,
            questionCode: "Q_VOL_INTEREST_NEW_CAPABILITIES",
            answerLabel: volunteeringInterests.newCapabilities,
            numericValue: likertToNumber(volunteeringInterests.newCapabilities),
          },
          {
            surveySessionId: session.id,
            questionCode: "Q_VOL_INTEREST_ACTIVITY_OF_INTEREST",
            answerLabel: volunteeringInterests.activitiesOfInterest,
            numericValue: likertToNumber(volunteeringInterests.activitiesOfInterest),
          },
          {
            surveySessionId: session.id,
            questionCode: "Q_VOL_INTEREST_TEAMWORK",
            answerLabel: volunteeringInterests.teamwork,
            numericValue: likertToNumber(volunteeringInterests.teamwork),
          },
          {
            surveySessionId: session.id,
            questionCode: "Q_CLASS_WELLBEING",
            answerLabel: schoolLife.classWellbeing,
            numericValue: likertToNumber(schoolLife.classWellbeing),
          },
          {
            surveySessionId: session.id,
            questionCode: "Q_SCHOOL_RULES",
            answerLabel: schoolLife.schoolRules,
            numericValue: likertToNumber(schoolLife.schoolRules),
          },
          {
            surveySessionId: session.id,
            questionCode: "Q_PEER_GROUP",
            answerLabel: schoolLife.peerGroup,
            numericValue: likertToNumber(schoolLife.peerGroup),
          },
          {
            surveySessionId: session.id,
            questionCode: "Q_GRADES_SATISFACTION",
            answerLabel: schoolLife.gradesSatisfaction,
            numericValue: likertToNumber(schoolLife.gradesSatisfaction),
          },
          {
            surveySessionId: session.id,
            questionCode: "Q_CLASS_RELATIONS",
            answerLabel: schoolLife.classRelations,
            numericValue: likertToNumber(schoolLife.classRelations),
          },
          {
            surveySessionId: session.id,
            questionCode: "Q_SELF_AWARENESS",
            answerLabel: schoolLife.selfAwareness,
            numericValue: likertToNumber(schoolLife.selfAwareness),
          },
          {
            surveySessionId: session.id,
            questionCode: "Q_FAMILY_SUPPORT",
            answerLabel: schoolLife.familySupport,
            numericValue: likertToNumber(schoolLife.familySupport),
          },
        ],
      })

      await tx.multiResponse.createMany({
        data: [
          ...motivations.map((item: string) => ({
            surveySessionId: session.id,
            questionCode: "Q_PERSONAL_MOTIVATIONS",
            answerLabel: item,
          })),
          ...learnedSkills.map((item: string) => ({
            surveySessionId: session.id,
            questionCode: "Q_LEARNED_SKILLS",
            answerLabel: item,
          })),
          ...skillContexts.map((item: string) => ({
            surveySessionId: session.id,
            questionCode: "Q_SKILL_CONTEXTS",
            answerLabel: item,
          })),
        ],
      })

      if (typeof otherLearnedText === "string" && otherLearnedText.trim()) {
        await tx.openResponse.create({
          data: {
            surveySessionId: session.id,
            questionCode: "Q_OTHER_LEARNED_OPEN",
            answerText: otherLearnedText.trim(),
          },
        })
      }

      return session
    })

    return NextResponse.json({
      success: true,
      message: "Questionario salvato correttamente",
      sessionId: result.id,
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        success: false,
        message: "Errore durante il salvataggio del questionario",
      },
      { status: 500 }
    )
  }
}