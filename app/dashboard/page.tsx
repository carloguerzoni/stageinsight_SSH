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

type RecentSession = {
  id: string
  submittedAt: string
  educationPath: string | null
  classGroup: string | null
  firstExperience: boolean | null
  informationSource: string | null
  stageRole: string | null
  studentName: string | null
  schoolName: string | null
  etsName: string | null
  counts: {
    closedResponses: number
    multiResponses: number
    openResponses: number
  }
}

type DashboardData = {
  success: boolean
  currentUser: {
    fullName: string
    email: string
    role: string
    school: string | null
    ets: string | null
  }
  totals: {
    totalSessions: number
    totalClosedResponses: number
    totalMultiResponses: number
    totalOpenResponses: number
  }
  charts: {
    infoSourceData: ChartItem[]
    competenceAverages: ChartItem[]
    learnedSkillsData: ChartItem[]
  }
  recentSessions: RecentSession[]
}

export default function DashboardPage() {
  const router = useRouter()

  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function loadDashboard() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session?.access_token) {
          router.push("/login")
          return
        }

        const response = await fetch("/api/dashboard/summary", {
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
            : "Errore durante il caricamento della dashboard."
        )
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [router])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push("/login")
  }

  if (loading) {
    return (
      <main style={pageStyle}>
        <div style={centerCard}>
          <h1 style={{ margin: 0 }}>Caricamento dashboard...</h1>
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
            Non puoi accedere alla dashboard
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

  const {
    currentUser,
    totals,
    charts: { infoSourceData, competenceAverages, learnedSkillsData },
    recentSessions,
  } = data

  return (
    <main style={pageStyle}>
      <div style={{ maxWidth: "1180px", margin: "0 auto" }}>
        <header style={headerStyle}>
          <div>
            <p style={eyebrow}>StageInsight · Dashboard protetta</p>

            <h1 style={titleStyle}>Panoramica dati raccolti</h1>

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
  	    <Link href="/" style={secondaryButton}>
    Home
  </Link>

  <Link href="/dashboard/analisi" style={secondaryButton}>
    Analisi
  </Link>

<Link href="/dashboard/export" style={secondaryButton}>
  Export CSV
</Link>

  {currentUser.role === "ADMIN" ? (
    <Link href="/admin/utenti" style={secondaryButton}>
      Gestione utenti
    </Link>
  ) : null}

  <Link href="/questionario" style={secondaryButton}>
    Questionario
  </Link>

  <button onClick={handleLogout} style={dangerButton}>
    Logout
  </button>
</div>
        </header>

        <section style={statsGrid}>
          <StatCard
            title="Compilazioni totali"
            value={totals.totalSessions}
            description="Numero totale di questionari visibili per il tuo ruolo"
          />

          <StatCard
            title="Risposte chiuse"
            value={totals.totalClosedResponses}
            description="Domande a scelta singola / scala Likert"
          />

          <StatCard
            title="Risposte multiple"
            value={totals.totalMultiResponses}
            description="Motivazioni, competenze e contesti"
          />

          <StatCard
            title="Risposte aperte"
            value={totals.totalOpenResponses}
            description="Testi liberi inseriti dagli studenti"
          />
        </section>

        <section style={chartsGrid}>
          <ChartCard
            title="Fonte informativa principale"
            subtitle="Quante volte è stata selezionata ogni fonte"
          >
            <SimpleBarChart
              data={infoSourceData}
              emptyMessage="Nessun dato disponibile per la fonte informativa."
              maxValue={Math.max(...infoSourceData.map((d) => d.value), 1)}
            />
          </ChartCard>

          <ChartCard
            title="Competenze medie percepite"
            subtitle="Media delle risposte Likert da 1 a 4"
          >
            <SimpleBarChart
              data={competenceAverages}
              emptyMessage="Nessun dato disponibile sulle competenze."
              maxValue={4}
              valueFormatter={(value) => value.toFixed(2)}
            />
          </ChartCard>

          <ChartCard
            title="Competenze apprese più selezionate"
            subtitle="Selezioni multiple degli apprendimenti percepiti"
          >
            <SimpleBarChart
              data={learnedSkillsData}
              emptyMessage="Nessun dato disponibile sulle competenze apprese."
              maxValue={Math.max(...learnedSkillsData.map((d) => d.value), 1)}
            />
          </ChartCard>
        </section>

        <section style={tableCard}>
          <div style={tableHeader}>
            <h2 style={{ margin: 0, fontSize: "1.3rem", color: "#0f172a" }}>
              Ultime compilazioni
            </h2>

            <p style={{ margin: "8px 0 0", color: "#64748b", lineHeight: 1.6 }}>
              Elenco delle ultime sessioni salvate nel database.
            </p>
          </div>

          {recentSessions.length === 0 ? (
            <div style={{ padding: "24px", color: "#475569" }}>
              Non ci sono ancora compilazioni salvate.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={tableStyle}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    <TableHead>ID</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Studente</TableHead>
                    <TableHead>Scuola</TableHead>
                    <TableHead>Ente</TableHead>
                    <TableHead>Percorso</TableHead>
                    <TableHead>Classe</TableHead>
                    <TableHead>Prima esperienza</TableHead>
                    <TableHead>Fonte</TableHead>
                    <TableHead>Ruolo stage</TableHead>
                    <TableHead>Chiuse</TableHead>
                    <TableHead>Multiple</TableHead>
                    <TableHead>Aperte</TableHead>
                  </tr>
                </thead>

                <tbody>
                  {recentSessions.map((session) => (
                    <tr
                      key={session.id}
                      style={{ borderTop: "1px solid #e2e8f0" }}
                    >
                      <TableCell mono>{session.id.slice(0, 8)}...</TableCell>
                      <TableCell>{formatDate(session.submittedAt)}</TableCell>
                      <TableCell>{session.studentName || "—"}</TableCell>
                      <TableCell>{session.schoolName || "—"}</TableCell>
                      <TableCell>{session.etsName || "—"}</TableCell>
                      <TableCell>{session.educationPath || "—"}</TableCell>
                      <TableCell>{session.classGroup || "—"}</TableCell>
                      <TableCell>
                        {session.firstExperience === true
                          ? "Sì"
                          : session.firstExperience === false
                          ? "No"
                          : "—"}
                      </TableCell>
                      <TableCell>{session.informationSource || "—"}</TableCell>
                      <TableCell>{session.stageRole || "—"}</TableCell>
                      <TableCell>{session.counts.closedResponses}</TableCell>
                      <TableCell>{session.counts.multiResponses}</TableCell>
                      <TableCell>{session.counts.openResponses}</TableCell>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

function StatCard({
  title,
  value,
  description,
}: {
  title: string
  value: number
  description: string
}) {
  return (
    <article style={statCard}>
      <p style={{ margin: 0, color: "#64748b", fontSize: "0.95rem" }}>
        {title}
      </p>

      <p
        style={{
          margin: "10px 0 8px",
          fontSize: "2rem",
          fontWeight: 800,
          color: "#0f172a",
        }}
      >
        {value}
      </p>

      <p
        style={{
          margin: 0,
          color: "#475569",
          lineHeight: 1.6,
          fontSize: "0.95rem",
        }}
      >
        {description}
      </p>
    </article>
  )
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
    <section style={chartCard}>
      <h2 style={{ margin: "0 0 6px", fontSize: "1.15rem", color: "#0f172a" }}>
        {title}
      </h2>

      <p
        style={{
          margin: "0 0 18px",
          color: "#64748b",
          lineHeight: 1.6,
          fontSize: "0.95rem",
        }}
      >
        {subtitle}
      </p>

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
    return <p style={{ margin: 0, color: "#475569" }}>{emptyMessage}</p>
  }

  return (
    <div style={{ display: "grid", gap: "14px" }}>
      {data.map((item) => {
        const width = `${Math.max((item.value / maxValue) * 100, 4)}%`

        return (
          <div key={item.label}>
            <div style={barLabelRow}>
              <span style={{ color: "#0f172a", fontSize: "0.95rem" }}>
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

function TableHead({ children }: { children: ReactNode }) {
  return <th style={tableHead}>{children}</th>
}

function TableCell({
  children,
  mono = false,
}: {
  children: ReactNode
  mono?: boolean
}) {
  return (
    <td
      style={{
        ...tableCell,
        fontFamily: mono ? "monospace" : "inherit",
      }}
    >
      {children}
    </td>
  )
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(date))
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
  marginBottom: "28px",
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
  margin: "8px 0 0",
  fontSize: "2rem",
  lineHeight: 1.15,
  color: "#0f172a",
}

const subtitleStyle: CSSProperties = {
  margin: "10px 0 0",
  color: "#475569",
  lineHeight: 1.6,
}

const statsGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "18px",
  marginBottom: "28px",
}

const chartsGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  gap: "20px",
  marginBottom: "28px",
}

const statCard: CSSProperties = {
  background: "#ffffff",
  borderRadius: "22px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 14px 40px rgba(15, 23, 42, 0.05)",
  padding: "22px",
}

const chartCard: CSSProperties = {
  background: "#ffffff",
  borderRadius: "24px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 14px 40px rgba(15, 23, 42, 0.05)",
  padding: "22px",
}

const tableCard: CSSProperties = {
  background: "#ffffff",
  borderRadius: "24px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 14px 40px rgba(15, 23, 42, 0.05)",
  overflow: "hidden",
}

const tableHeader: CSSProperties = {
  padding: "24px 24px 12px",
  borderBottom: "1px solid #e2e8f0",
}

const tableStyle: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: "1200px",
}

const tableHead: CSSProperties = {
  textAlign: "left",
  padding: "14px 16px",
  fontSize: "0.9rem",
  color: "#334155",
  fontWeight: 700,
}

const tableCell: CSSProperties = {
  padding: "14px 16px",
  color: "#0f172a",
  fontSize: "0.95rem",
  verticalAlign: "top",
}

const barLabelRow: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  marginBottom: "6px",
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