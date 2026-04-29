import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)

function csvEscape(value: unknown) {
  if (value === null || value === undefined) return ""

  const stringValue = String(value)
  const escaped = stringValue.replace(/"/g, '""')

  return `"${escaped}"`
}

function buildCsv(rows: Record<string, unknown>[]) {
  if (rows.length === 0) {
    return "nessun_dato\n"
  }

  const headers = Array.from(
    rows.reduce((set, row) => {
      Object.keys(row).forEach((key) => set.add(key))
      return set
    }, new Set<string>())
  )

  const headerLine = headers.map(csvEscape).join(",")

  const dataLines = rows.map((row) =>
    headers.map((header) => csvEscape(row[header])).join(",")
  )

  return [headerLine, ...dataLines].join("\n")
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
        : {}

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
        session_id: session.id,
        data_invio: session.submittedAt.toISOString(),
        anno_scolastico: session.schoolYear ?? "",
        studente_nome: session.appUser?.fullName ?? "",
        studente_email: session.appUser?.email ?? "",
        ruolo_utente: session.appUser?.role ?? "",
        scuola: session.appUser?.school?.name ?? "",
        ente: session.appUser?.ets?.name ?? "",
        percorso: session.studentProfile?.educationPath ?? "",
        classe: session.studentProfile?.classGroup ?? "",
        prima_esperienza:
          session.studentProfile?.firstExperience === true
            ? "Sì"
            : session.studentProfile?.firstExperience === false
            ? "No"
            : "",
        fonte_informazioni: session.studentProfile?.informationSource ?? "",
        ruolo_stage: session.studentProfile?.stageRole ?? "",
      }

      for (const response of session.closedResponses) {
        row[response.questionCode] = response.answerLabel
        row[`${response.questionCode}_valore`] = response.numericValue ?? ""
      }

      for (const response of session.multiResponses) {
        const existing = row[response.questionCode]

        if (existing) {
          row[response.questionCode] = `${existing}; ${response.answerLabel}`
        } else {
          row[response.questionCode] = response.answerLabel
        }
      }

      for (const response of session.openResponses) {
        row[response.questionCode] = response.answerText
      }

      return row
    })

    const csv = buildCsv(rows)

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="stageinsight_export.csv"`,
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