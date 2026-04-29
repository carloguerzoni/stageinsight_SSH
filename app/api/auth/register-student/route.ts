import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { prisma } from "@/lib/prisma"

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)

export async function POST(request: Request) {
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

    const body = await request.json()
    const { fullName, email, schoolName, etsName } = body

    if (!fullName || !email || !schoolName || !etsName) {
      return NextResponse.json(
        { success: false, message: "Campi obbligatori mancanti" },
        { status: 400 }
      )
    }

    const result = await prisma.$transaction(async (tx) => {
      const school = await tx.school.upsert({
        where: { name: schoolName },
        update: {},
        create: {
          name: schoolName,
        },
      })

      const existingEts = await tx.ets.findFirst({
        where: {
          name: etsName,
        },
      })

      const ets =
        existingEts ??
        (await tx.ets.create({
          data: {
            name: etsName,
          },
        }))

      const appUser = await tx.appUser.upsert({
        where: { authUserId: user.id },
        update: {
          fullName,
          email,
          schoolId: school.id,
          etsId: ets.id,
          role: "STUDENT",
        },
        create: {
          authUserId: user.id,
          email,
          fullName,
          role: "STUDENT",
          schoolId: school.id,
          etsId: ets.id,
        },
      })

      return appUser
    })

    return NextResponse.json({
      success: true,
      user: result,
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { success: false, message: "Errore registrazione studente" },
      { status: 500 }
    )
  }
}