import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)

const readableColumns = [
  "ID compilazione",
  "Data invio",
  "Anno scolastico",
  "Nome studente",
  "Email studente",
  "Scuola",
  "Ente / ETS",
  "Percorso di studi",
  "Classe",
  "Prima esperienza di volontariato",
  "Fonte informazioni",
  "Ruolo svolto durante lo stage",

  "Motivazioni personali",

  "Rispetto di orari, appuntamenti, impegni e scadenze",
  "Valore - Rispetto impegni",

  "Miglioramento nel portare a termine incarichi",
  "Valore - Portare a termine incarichi",

  "Lavoro di gruppo",
  "Valore - Lavoro di gruppo",

  "Empatia",
  "Valore - Empatia",

  "Ascolto e accettazione punti di vista diversi",
  "Valore - Ascolto",

  "Comunicazione efficace",
  "Valore - Comunicazione efficace",

  "Gestione degli imprevisti",
  "Valore - Gestione imprevisti",

  "Capacità di chiedere aiuto",
  "Valore - Chiedere aiuto",

  "Curiosità e motivazione generate dall’esperienza",
  "Valore - Curiosità e motivazione",

  "Utilità delle competenze personali",
  "Valore - Competenze utili",

  "Crescita nella comunicazione efficace",
  "Valore - Crescita comunicativa",

  "Competenze apprese",
  "Contesti futuri in cui usare le competenze",

  "Interesse - Conoscere nuove persone/realtà",
  "Valore - Conoscere nuove persone/realtà",

  "Interesse - Attività manuali",
  "Valore - Attività manuali",

  "Interesse - Scoprire nuovi interessi",
  "Valore - Scoprire nuovi interessi",

  "Interesse - Scoprire nuove capacità",
  "Valore - Scoprire nuove capacità",

  "Interesse - Attività di proprio interesse",
  "Valore - Attività di proprio interesse",

  "Interesse - Lavorare in gruppo",
  "Valore - Interesse lavoro di gruppo",

  "Benessere in classe",
  "Valore - Benessere in classe",

  "Importanza e giustizia delle regole scolastiche",
  "Valore - Regole scolastiche",

  "Senso di appartenenza al gruppo di amici/compagni",
  "Valore - Gruppo amici/compagni",

  "Soddisfazione dei voti",
  "Valore - Soddisfazione voti",

  "Relazione con gli altri e lavoro in gruppo in classe",
  "Valore - Relazioni in classe",

  "Conoscenza dei propri bisogni e desideri",
  "Valore - Consapevolezza personale",

  "Supporto della famiglia",
  "Valore - Supporto famiglia",

  "Altri apprendimenti dichiarati dallo studente",
]

const closedQuestionLabels: Record<
  string,
  { label: string; valueLabel?: string }
> = {
  Q_INFO_SOURCE: {
    label: "Fonte informazioni",
  },
  Q_COMMITMENTS: {
    label: "Rispetto di orari, appuntamenti, impegni e scadenze",
    valueLabel: "Valore - Rispetto impegni",
  },
  Q_TASK_COMPLETION: {
    label: "Miglioramento nel portare a termine incarichi",
    valueLabel: "Valore - Portare a termine incarichi",
  },
  Q_TEAMWORK: {
    label: "Lavoro di gruppo",
    valueLabel: "Valore - Lavoro di gruppo",
  },
  Q_EMPATHY: {
    label: "Empatia",
    valueLabel: "Valore - Empatia",
  },
  Q_LISTENING: {
    label: "Ascolto e accettazione punti di vista diversi",
    valueLabel: "Valore - Ascolto",
  },
  Q_COMMUNICATION: {
    label: "Comunicazione efficace",
    valueLabel: "Valore - Comunicazione efficace",
  },
  Q_UNEXPECTED_EVENTS: {
    label: "Gestione degli imprevisti",
    valueLabel: "Valore - Gestione imprevisti",
  },
  Q_ASK_FOR_HELP: {
    label: "Capacità di chiedere aiuto",
    valueLabel: "Valore - Chiedere aiuto",
  },
  Q_CURIOSITY_MOTIVATION: {
    label: "Curiosità e motivazione generate dall’esperienza",
    valueLabel: "Valore - Curiosità e motivazione",
  },
  Q_SKILLS_USEFUL: {
    label: "Utilità delle competenze personali",
    valueLabel: "Valore - Competenze utili",
  },
  Q_COMMUNICATION_GROWTH: {
    label: "Crescita nella comunicazione efficace",
    valueLabel: "Valore - Crescita comunicativa",
  },
  Q_VOL_INTEREST_NEW_PEOPLE: {
    label: "Interesse - Conoscere nuove persone/realtà",
    valueLabel: "Valore - Conoscere nuove persone/realtà",
  },
  Q_VOL_INTEREST_MANUAL_ACTIVITIES: {
    label: "Interesse - Attività manuali",
    valueLabel: "Valore - Attività manuali",
  },
  Q_VOL_INTEREST_NEW_INTERESTS: {
    label: "Interesse - Scoprire nuovi interessi",
    valueLabel: "Valore - Scoprire nuovi interessi",
  },
  Q_VOL_INTEREST_NEW_CAPABILITIES: {
    label: "Interesse - Scoprire nuove capacità",
    valueLabel: "Valore - Scoprire nuove capacità",
  },
  Q_VOL_INTEREST_ACTIVITY_OF_INTEREST: {
    label: "Interesse - Attività di proprio interesse",
    valueLabel: "Valore - Attività di proprio interesse",
  },
  Q_VOL_INTEREST_TEAMWORK: {
    label: "Interesse - Lavorare in gruppo",
    valueLabel: "Valore - Interesse lavoro di gruppo",
  },
  Q_CLASS_WELLBEING: {
    label: "Benessere in classe",
    valueLabel: "Valore - Benessere in classe",
  },
  Q_SCHOOL_RULES: {
    label: "Importanza e giustizia delle regole scolastiche",
    valueLabel: "Valore - Regole scolastiche",
  },
  Q_PEER_GROUP: {
    label: "Senso di appartenenza al gruppo di amici/compagni",
    valueLabel: "Valore - Gruppo amici/compagni",
  },
  Q_GRADES_SATISFACTION: {
    label: "Soddisfazione dei voti",
    valueLabel: "Valore - Soddisfazione voti",
  },
  Q_CLASS_RELATIONS: {
    label: "Relazione con gli altri e lavoro in gruppo in classe",
    valueLabel: "Valore - Relazioni in classe",
  },
  Q_SELF_AWARENESS: {
    label: "Conoscenza dei propri bisogni e desideri",
    valueLabel: "Valore - Consapevolezza personale",
  },
  Q_FAMILY_SUPPORT: {
    label: "Supporto della famiglia",
    valueLabel: "Valore - Supporto famiglia",
  },
}

const multiQuestionLabels: Record<string, string> = {
  Q_PERSONAL_MOTIVATIONS: "Motivazioni personali",
  Q_LEARNED_SKILLS: "Competenze apprese",
  Q_SKILL_CONTEXTS: "Contesti futuri in cui usare le competenze",
}

const openQuestionLabels: Record<string, string> = {
  Q_OTHER_LEARNED_OPEN: "Altri apprendimenti dichiarati dallo studente",
}

function csvEscape(value: unknown) {
  if (value === null || value === undefined) return ""

  const stringValue = String(value)
  const escaped = stringValue.replace(/"/g, '""')

  return `"${escaped}"`
}

function buildCsv(rows: Record<string, unknown>[]) {
  const separator = ";"

  if (rows.length === 0) {
    return "\uFEFF" + "Nessun dato disponibile\n"
  }

  const headerLine = readableColumns.map(csvEscape).join(separator)

  const dataLines = rows.map((row) =>
    readableColumns.map((column) => csvEscape(row[column] ?? "")).join(separator)
  )

  return "\uFEFF" + [headerLine, ...dataLines].join("\n")
}

function formatDateForCsv(date: Date) {
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date)
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
          message: "Gli studenti non possono esportare i dati.",
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
        : {
            appUserId: {
              not: null,
            },
          }

    const sessions = await prisma.surveySession.findMany({
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
        closedResponses: true,
        multiResponses: true,
        openResponses: true,
      },
    })

    const rows = sessions.map((session) => {
      const row: Record<string, unknown> = {
        "ID compilazione": session.id,
        "Data invio": formatDateForCsv(session.submittedAt),
        "Anno scolastico": session.schoolYear ?? "",
        "Nome studente": session.appUser?.fullName ?? "",
        "Email studente": session.appUser?.email ?? "",
        "Scuola": session.appUser?.school?.name ?? "",
        "Ente / ETS": session.appUser?.ets?.name ?? "",
        "Percorso di studi": session.studentProfile?.educationPath ?? "",
        "Classe": session.studentProfile?.classGroup ?? "",
        "Prima esperienza di volontariato":
          session.studentProfile?.firstExperience === true
            ? "Sì"
            : session.studentProfile?.firstExperience === false
            ? "No"
            : "",
        "Fonte informazioni": session.studentProfile?.informationSource ?? "",
        "Ruolo svolto durante lo stage": session.studentProfile?.stageRole ?? "",
      }

      for (const response of session.closedResponses) {
        const labels = closedQuestionLabels[response.questionCode]

        if (!labels) continue

        row[labels.label] = response.answerLabel

        if (labels.valueLabel) {
          row[labels.valueLabel] = response.numericValue ?? ""
        }
      }

      for (const response of session.multiResponses) {
        const label = multiQuestionLabels[response.questionCode]

        if (!label) continue

        const existing = row[label]

        if (existing) {
          row[label] = `${existing} | ${response.answerLabel}`
        } else {
          row[label] = response.answerLabel
        }
      }

      for (const response of session.openResponses) {
        const label = openQuestionLabels[response.questionCode]

        if (!label) continue

        row[label] = response.answerText
      }

      return row
    })

    const csv = buildCsv(rows)

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="stageinsight_export_leggibile.csv"`,
      },
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        success: false,
        message: "Errore durante l'esportazione CSV.",
      },
      { status: 500 }
    )
  }
}