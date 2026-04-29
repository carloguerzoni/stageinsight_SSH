"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase-client"

export default function LoginPage() {
  const router = useRouter()

  const [role, setRole] = useState("STUDENT")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        })

      if (loginError) {
        throw new Error(loginError.message)
      }

      const accessToken = data.session?.access_token

      if (!accessToken) {
        throw new Error("Sessione non trovata")
      }

      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Profilo non trovato")
      }

      if (result.user.role !== role) {
        throw new Error("Il ruolo selezionato non corrisponde al tuo account.")
      }

      if (result.user.role === "STUDENT") {
        router.push("/area-studente")
      } else {
        router.push("/dashboard")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore durante il login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={pageStyle}>
      <div style={cardStyle}>
        <p style={eyebrow}>StageInsight</p>
        <h1 style={titleStyle}>Accesso piattaforma</h1>
        <p style={subtitleStyle}>
          Accedi come studente, referente scuola o admin.
        </p>

        <form onSubmit={handleLogin} style={{ display: "grid", gap: "16px" }}>
          <div>
            <label style={labelStyle}>Ruolo</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={inputStyle}
            >
              <option value="STUDENT">Studente</option>
              <option value="SCHOOL_REFERENT">Referente scuola</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          {error ? <p style={{ color: "#b91c1c" }}>{error}</p> : null}

          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? "Accesso in corso..." : "Accedi"}
          </button>
        </form>

        <p style={{ marginTop: "20px", color: "#475569" }}>
          Sei uno studente?{" "}
          <a href="/registrazione-studente" style={{ color: "#1d4ed8" }}>
            Registrati qui
          </a>
        </p>
      </div>
    </main>
  )
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "grid",
  placeItems: "center",
  padding: "24px",
  background: "linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%)",
}

const cardStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "520px",
  background: "#ffffff",
  borderRadius: "24px",
  padding: "32px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 18px 50px rgba(15, 23, 42, 0.08)",
}

const eyebrow: React.CSSProperties = {
  margin: 0,
  color: "#2563eb",
  fontWeight: 700,
  textTransform: "uppercase",
  fontSize: "0.85rem",
}

const titleStyle: React.CSSProperties = {
  margin: "10px 0",
  fontSize: "2rem",
  color: "#0f172a",
}

const subtitleStyle: React.CSSProperties = {
  margin: "0 0 24px",
  color: "#475569",
  lineHeight: 1.6,
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontWeight: 700,
  marginBottom: "8px",
  color: "#0f172a",
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "14px",
  border: "1px solid #cbd5e1",
  fontSize: "1rem",
  boxSizing: "border-box",
}

const buttonStyle: React.CSSProperties = {
  border: "none",
  borderRadius: "14px",
  background: "#1d4ed8",
  color: "white",
  padding: "14px 20px",
  fontSize: "1rem",
  fontWeight: 800,
  cursor: "pointer",
}