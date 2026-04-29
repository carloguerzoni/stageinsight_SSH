"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase-client"

export default function RegistrazioneStudentePage() {
  const router = useRouter()

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [schoolName, setSchoolName] = useState("")
  const [etsName, setEtsName] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (signUpError) {
        throw new Error(signUpError.message)
      }

      const accessToken = data.session?.access_token

      if (!accessToken) {
        setMessage(
          "Registrazione avviata. Controlla la tua email per confermare l'account, poi effettua il login."
        )
        return
      }

      const response = await fetch("/api/auth/register-student", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          fullName,
          email,
          schoolName,
          etsName,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Errore durante il salvataggio del profilo")
      }

      router.push("/area-studente")
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Errore durante la registrazione"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={pageStyle}>
      <div style={cardStyle}>
        <p style={eyebrow}>StageInsight · Studente</p>
        <h1 style={titleStyle}>Registrazione studente</h1>
        <p style={subtitleStyle}>
          Crea un account per accedere al questionario di stage.
        </p>

        <form onSubmit={handleRegister} style={{ display: "grid", gap: "16px" }}>
          <div>
            <label style={labelStyle}>Nome e cognome</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              style={inputStyle}
              placeholder="Es. Mario Rossi"
            />
          </div>

          <div>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
              placeholder="nome@email.it"
            />
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={inputStyle}
              placeholder="Minimo 6 caratteri"
            />
          </div>

          <div>
            <label style={labelStyle}>Scuola</label>
            <input
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              required
              style={inputStyle}
              placeholder="Nome della scuola"
            />
          </div>

          <div>
            <label style={labelStyle}>Ente / ETS</label>
            <input
              value={etsName}
              onChange={(e) => setEtsName(e.target.value)}
              required
              style={inputStyle}
              placeholder="Nome dell'ente ospitante"
            />
          </div>

          {message ? <p style={{ color: "#2563eb" }}>{message}</p> : null}
          {error ? <p style={{ color: "#b91c1c" }}>{error}</p> : null}

          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? "Registrazione in corso..." : "Registrati"}
          </button>
        </form>

        <p style={{ marginTop: "20px", color: "#475569" }}>
          Hai già un account?{" "}
          <a href="/login" style={{ color: "#1d4ed8", fontWeight: 700 }}>
            Accedi
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
  maxWidth: "560px",
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