import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const ets = await prisma.ets.create({
    data: {
      name: "ETS Demo",
      code: "ETS_DEMO_" + Date.now(),
      city: "Ferrara",
    },
  })

  return NextResponse.json({
    message: "Record creato con successo",
    ets,
  })
}