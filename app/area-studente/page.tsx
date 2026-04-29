"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase-client"

export default function AreaStudentePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.access_token) {
        router.push("/login")
        return
      }

      setLoading(false)
    }

    checkAuth()
  }, [router])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push("/login")
  }

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#f8fbff",
          color: "#0f172a",
        }}
      >
        <div>Controllo accesso...</div>
      </main>
    )
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #f8fbff 0%, #eef4ff 50%, #f8fafc 100%)",
        padding: "32px 16px",
      }}
    >
      <div
        style={{
          maxWidth: "860px",
          margin: "0 auto",
          background: "#ffffff",
          borderRadius: "24px",
          padding: "32px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 18px 50px rgba(15, 23, 42, 0.08)",
        }}
      >
        <p
          style={{
            margin: 0,
            color: "#2563eb",
            fontWeight: 700,
            textTransform: "uppercase",
            fontSize: "0.85rem",
          }}
        >
          StageInsight · Area studente
        </p>

        <h1 style={{ margin: "10px 0", fontSize: "2rem", color: "#0f172a" }}>
          Benvenuto nella tua area studente
        </h1>

        <p style={{ color: "#475569", lineHeight: 1.7 }}>
          Da qui puoi accedere al questionario di stage. La tua compilazione
          verrà collegata al tuo profilo, alla scuola e all’ente indicati in
          fase di registrazione.
        </p>

        <div
          style={{
            marginTop: "24px",
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/questionario"
            style={{
              display: "inline-block",
              textDecoration: "none",
              background: "#1d4ed8",
              color: "white",
              padding: "14px 20px",
              borderRadius: "14px",
              fontWeight: 800,
            }}
          >
            Compila questionario
          </Link>

          <button
            onClick={handleLogout}
            style={{
              border: "1px solid #fecaca",
              background: "#fef2f2",
              color: "#b91c1c",
              padding: "14px 20px",
              borderRadius: "14px",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </main>
  )
}