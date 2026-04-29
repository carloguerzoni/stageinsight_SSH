"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import type { CSSProperties, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase-client"

type ChartItem = {
  label: string
  value: number
}

type AnalysisData = {
  success: boolean
  currentUser: {
    fullName: string
    email: string
    role: string
    school: string | null
    ets: string | null
  }
  insights: string[]
  charts: {
    pathGroups: ChartItem[]
    firstExperienceGroups: ChartItem[]
    infoSourceGroups: ChartItem[]
    motivationGroups: ChartItem[]
    competenceAverages: ChartItem[]
    learnedSkillsGroups: ChartItem[]
    skillContextGroups: ChartItem[]
    volunteeringAverages: ChartItem[]
    schoolLifeAverages: ChartItem[]
  }
}

export default function AnalisiPage() {
  const router = useRouter()

  const [data, setData] = useState<AnalysisData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function loadAnalysis() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session?.access_token) {
          router.push("/login")
          return
        }

        const response = await fetch("/api/dashboard/analysis", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        })

        const result = await response.json()

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Accesso negato")
        }

        setData(result)
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Errore durante il caricamento dell’analisi."
        )
      } finally {
        setLoading(false)
      }
    }

    loadAnalysis()
  }, [router])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push("/login")
  }

  if (loading) {
    return (
      <main style={pageStyle}>
        <div style={centerCard}>
          <h1 style={{ margin: 0 }}>Caricamento analisi...</h1>
          <p style={{ color: "#64748b" }}>Controllo dell’accesso in corso.</p>
        </div>
      </main>
    )
  }

  if (error || !data) {
    return (
      <main style={pageStyle}>
        <div style={centerCard}>
          <p style={eyebrow}>StageInsight · Accesso negato</p>
          <h1 style={{ margin: "8px 0", color: "#0f172a" }}>
            Non puoi accedere all’analisi
          </h1>
          <p style={{ color: "#b91c1c", lineHeight: 1.6 }}>{error}</p>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link href="/login" style={primaryButton}>
              Vai al login
            </Link>
            <Link href="/" style={secondaryButton}>
              Home
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const { currentUser, insights, charts } = data

  return (
    <main style={pageStyle}>
      <div style={{ maxWidth: "1180px", margin: "0 auto" }}>
        <header style={headerStyle}>
          <div>
            <p style={eyebrow}>StageInsight · Analisi multi-dimensionale</p>
            <h1 style={titleStyle}>Lettura dei dati raccolti</h1>
            <p style={subtitleStyle}>
              Accesso effettuato come <strong>{currentUser.fullName}</strong> —{" "}
              ruolo: <strong>{currentUser.role}</strong>
              {currentUser.school ? (
                <>
                  {" "}
                  — scuola: <strong>{currentUser.school}</strong>
                </>
              ) : null}
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link href="/dashboard" style={secondaryButton}>
              Dashboard
            </Link>

            <Link href="/questionario" style={secondaryButton}>
              Questionario
            </Link>

            <button onClick={handleLogout} style={dangerButton}>
              Logout
            </button>
          </div>
        </header>

        <section style={insightBox}>
          <h2 style={sectionTitle}>Lettura automatica iniziale</h2>

          {insights.length === 0 ? (
            <p style={mutedText}>
              Non ci sono ancora dati sufficienti per generare una lettura.
            </p>
          ) : (
            <ul style={{ margin: 0, paddingLeft: "20px", lineHeight: 1.9 }}>
              {insights.map((insight) => (
                <li key={insight}>{insight}</li>
              ))}
            </ul>
          )}
        </section>

        <section style={gridTwo}>
          <ChartCard
            title="Distribuzione per percorso"
            subtitle="Quanti studenti appartengono a ogni percorso di studi"
          >
            <SimpleBarChart
              data={charts.pathGroups}
              maxValue={maxOf(charts.pathGroups)}
              emptyMessage="Nessun percorso disponibile."
            />
          </ChartCard>

          <ChartCard
            title="Prima esperienza"
            subtitle="Confronto tra studenti alla prima esperienza e non"
          >
            <SimpleBarChart
              data={charts.firstExperienceGroups}
              maxValue={maxOf(charts.firstExperienceGroups)}
              emptyMessage="Nessun dato disponibile."
            />
          </ChartCard>

          <ChartCard
            title="Fonti informative"
            subtitle="Da dove gli studenti hanno ricevuto informazioni"
          >
            <SimpleBarChart
              data={charts.infoSourceGroups}
              maxValue={maxOf(charts.infoSourceGroups)}
              emptyMessage="Nessuna fonte informativa disponibile."
            />
          </ChartCard>

          <ChartCard
            title="Motivazioni personali"
            subtitle="Motivi principali che hanno spinto gli studenti a partecipare"
          >
            <SimpleBarChart
              data={charts.motivationGroups}
              maxValue={maxOf(charts.motivationGroups)}
              emptyMessage="Nessuna motivazione disponibile."
            />
          </ChartCard>

          <ChartCard
            title="Competenze medie percepite"
            subtitle="Media delle risposte su scala 1-4"
          >
            <SimpleBarChart
              data={charts.competenceAverages}
              maxValue={4}
              emptyMessage="Nessun dato sulle competenze."
              valueFormatter={(value) => value.toFixed(2)}
            />
          </ChartCard>

          <ChartCard
            title="Competenze apprese"
            subtitle="Competenze selezionate più spesso dagli studenti"
          >
            <SimpleBarChart
              data={charts.learnedSkillsGroups}
              maxValue={maxOf(charts.learnedSkillsGroups)}
              emptyMessage="Nessuna competenza selezionata."
            />
          </ChartCard>

          <ChartCard
            title="Contesti futuri"
            subtitle="Dove gli studenti pensano di usare le competenze sviluppate"
          >
            <SimpleBarChart
              data={charts.skillContextGroups}
              maxValue={maxOf(charts.skillContextGroups)}
              emptyMessage="Nessun contesto futuro disponibile."
            />
          </ChartCard>

          <ChartCard
            title="Interesse verso il volontariato"
            subtitle="Media delle risposte su scala 1-4"
          >
            <SimpleBarChart
              data={charts.volunteeringAverages}
              maxValue={4}
              emptyMessage="Nessun dato sugli interessi del volontariato."
              valueFormatter={(value) => value.toFixed(2)}
            />
          </ChartCard>
        </section>

        <section style={{ marginTop: "20px" }}>
          <ChartCard
            title="Vita scolastica e personale"
            subtitle="Media delle risposte su benessere, relazioni, scuola e famiglia"
          >
            <SimpleBarChart
              data={charts.schoolLifeAverages}
              maxValue={4}
              emptyMessage="Nessun dato sulla vita scolastica/personale."
              valueFormatter={(value) => value.toFixed(2)}
            />
          </ChartCard>
        </section>
      </div>
    </main>
  )
}

function maxOf(data: ChartItem[]) {
  return Math.max(...data.map((item) => item.value), 1)
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: ReactNode
}) {
  return (
    <section style={cardStyle}>
      <h2 style={sectionTitle}>{title}</h2>
      <p style={mutedText}>{subtitle}</p>
      {children}
    </section>
  )
}

function SimpleBarChart({
  data,
  maxValue,
  emptyMessage,
  valueFormatter,
}: {
  data: ChartItem[]
  maxValue: number
  emptyMessage: string
  valueFormatter?: (value: number) => string
}) {
  if (data.length === 0) {
    return <p style={mutedText}>{emptyMessage}</p>
  }

  return (
    <div style={{ display: "grid", gap: "14px" }}>
      {data.map((item) => {
        const width = `${Math.max((item.value / maxValue) * 100, 4)}%`

        return (
          <div key={item.label}>
            <div style={barLabelRow}>
              <span style={{ color: "#0f172a", lineHeight: 1.4 }}>
                {item.label}
              </span>

              <strong style={{ color: "#1d4ed8", whiteSpace: "nowrap" }}>
                {valueFormatter ? valueFormatter(item.value) : item.value}
              </strong>
            </div>

            <div style={barTrack}>
              <div style={{ ...barFill, width }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  background: "linear-gradient(180deg, #f8fbff 0%, #eef4ff 50%, #f8fafc 100%)",
  padding: "32px 16px 56px",
}

const centerCard: CSSProperties = {
  maxWidth: "620px",
  margin: "80px auto",
  background: "#ffffff",
  borderRadius: "24px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 14px 40px rgba(15, 23, 42, 0.05)",
  padding: "28px",
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
  maxWidth: "760px",
}

const gridTwo: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
  gap: "20px",
}

const cardStyle: CSSProperties = {
  background: "#ffffff",
  borderRadius: "24px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 14px 40px rgba(15, 23, 42, 0.05)",
  padding: "22px",
}

const insightBox: CSSProperties = {
  ...cardStyle,
  marginBottom: "20px",
  background: "#f8fafc",
}

const sectionTitle: CSSProperties = {
  margin: "0 0 8px",
  fontSize: "1.15rem",
  color: "#0f172a",
}

const mutedText: CSSProperties = {
  margin: "0 0 18px",
  color: "#64748b",
  lineHeight: 1.6,
  fontSize: "0.95rem",
}

const barLabelRow: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  marginBottom: "6px",
  fontSize: "0.95rem",
}

const barTrack: CSSProperties = {
  width: "100%",
  height: "12px",
  borderRadius: "999px",
  background: "#e2e8f0",
  overflow: "hidden",
}

const barFill: CSSProperties = {
  height: "100%",
  borderRadius: "999px",
  background: "linear-gradient(90deg, #2563eb, #60a5fa)",
}

const primaryButton: CSSProperties = {
  display: "inline-block",
  textDecoration: "none",
  background: "#1d4ed8",
  color: "white",
  padding: "13px 18px",
  borderRadius: "14px",
  fontWeight: 700,
  boxShadow: "0 12px 30px rgba(29, 78, 216, 0.22)",
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

const dangerButton: CSSProperties = {
  border: "1px solid #fecaca",
  background: "#fef2f2",
  color: "#b91c1c",
  padding: "13px 18px",
  borderRadius: "14px",
  fontWeight: 700,
  cursor: "pointer",
}