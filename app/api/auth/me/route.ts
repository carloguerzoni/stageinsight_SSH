import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { prisma } from "@/lib/prisma"

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Token mancante" },
        { status: 401 }
      )
    }

    const {
      data: { user },
      error,
    } = await supabaseServer.auth.getUser(token)

    if (error || !user) {
      return NextResponse.json(
        { success: false, message: "Utente non autenticato" },
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
        { success: false, message: "Profilo applicativo non trovato" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      user: appUser,
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { success: false, message: "Errore recupero utente" },
      { status: 500 }
    )
  }
}