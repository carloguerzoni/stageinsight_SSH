"use client"

import Link from "next/link"
import { useState } from "react"
import type { CSSProperties } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase-client"

export default function ExportPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleDownloadCsv() {
    setLoading(true)
    setError("")

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.access_token) {
        router.push("/login")
        return
      }

      const response = await fetch("/api/dashboard/export", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.message || "Errore durante l'esportazione.")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)

      const link = document.createElement("a")
      link.href = url
      link.download = "stageinsight_export.csv"
      document.body.appendChild(link)
      link.click()
      link.remove()

      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Errore durante il download del CSV."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={pageStyle}>
      <div style={{ maxWidth: "880px", margin: "0 auto" }}>
        <header style={headerStyle}>
          <div>
            <p style={eyebrow}>StageInsight · Export</p>

            <h1 style={titleStyle}>Esportazione dati CSV</h1>

            <p style={subtitleStyle}>
              Da questa pagina puoi scaricare i dati raccolti in formato CSV,
              utile per analisi esterne, documentazione, Excel e report.
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link href="/dashboard" style={secondaryButton}>
              Dashboard
            </Link>

            <Link href="/dashboard/analisi" style={secondaryButton}>
              Analisi
            </Link>
          </div>
        </header>

        <section style={cardStyle}>
          <h2 style={sectionTitle}>Scarica il dataset</h2>

          <p style={textStyle}>
            Il file CSV contiene una riga per ogni questionario compilato. Le
            colonne includono informazioni su studente, scuola, ente, profilo,
            risposte chiuse, risposte multiple e risposte aperte.
          </p>

          <div style={infoBox}>
            <strong>Nota:</strong> se accedi come referente scuola, il CSV
            contiene solo i dati della tua scuola. Se accedi come admin, contiene
            tutti i dati disponibili.
          </div>

          {error ? <p style={{ color: "#b91c1c" }}>{error}</p> : null}

          <button
            onClick={handleDownloadCsv}
            disabled={loading}
            style={{
              ...primaryButtonAsButton,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Preparazione CSV..." : "Scarica CSV"}
          </button>
        </section>

        <section style={cardStyle}>
          <h2 style={sectionTitle}>A cosa serve questo export?</h2>

          <ul style={{ margin: 0, paddingLeft: "20px", lineHeight: 1.9 }}>
            <li>Controllare i dati raccolti fuori dalla piattaforma.</li>
            <li>Aprire il dataset con Excel o Google Sheets.</li>
            <li>Condividere dati aggregabili con scuola, enti o azienda.</li>
            <li>Preparare analisi statistiche più avanzate.</li>
            <li>Usare i testi aperti per una futura analisi intelligente.</li>
          </ul>
        </section>
      </div>
    </main>
  )
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  background: "linear-gradient(180deg, #f8fbff 0%, #eef4ff 50%, #f8fafc 100%)",
  padding: "32px 16px 56px",
}

const headerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "16px",
  flexWrap: "wrap",
  marginBottom: "24px",
}

const eyebrow: CSSProperties = {
  margin: 0,
  color: "#2563eb",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.03em",
  fontSize: "0.9rem",
}

const titleStyle: CSSProperties = {
  margin: "8px 0 8px",
  fontSize: "2rem",
  lineHeight: 1.15,
  color: "#0f172a",
}

const subtitleStyle: CSSProperties = {
  margin: 0,
  color: "#475569",
  lineHeight: 1.7,
  maxWidth: "700px",
}

const cardStyle: CSSProperties = {
  background: "#ffffff",
  borderRadius: "24px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 14px 40px rgba(15, 23, 42, 0.05)",
  padding: "24px",
  marginBottom: "20px",
}

const sectionTitle: CSSProperties = {
  margin: "0 0 12px",
  fontSize: "1.25rem",
  color: "#0f172a",
}

const textStyle: CSSProperties = {
  margin: "0 0 18px",
  color: "#475569",
  lineHeight: 1.7,
}

const infoBox: CSSProperties = {
  background: "#eff6ff",
  border: "1px solid #bfdbfe",
  color: "#1e3a8a",
  borderRadius: "16px",
  padding: "14px 16px",
  marginBottom: "20px",
  lineHeight: 1.6,
}

const primaryButtonAsButton: CSSProperties = {
  border: "none",
  background: "#1d4ed8",
  color: "white",
  padding: "14px 20px",
  borderRadius: "14px",
  fontWeight: 800,
  fontSize: "1rem",
}

const secondaryButton: CSSProperties = {
  display: "inline-block",
  textDecoration: "none",
  background: "#eff6ff",
  color: "#1d4ed8",
  padding: "13px 18px",
  borderRadius: "14px",
  fontWeight: 700,
  border: "1px solid #bfdbfe",
}