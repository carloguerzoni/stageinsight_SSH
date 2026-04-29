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

type FinalAnalysisData = {
  success: boolean
  currentUser: {
    fullName: string
    email: string
    role: string
    school: string | null
    ets: string | null
  }
  filters: {
    selected: {
      school: string
      ets: string
      path: string
      firstExperience: string
      infoSource: string
      from: string
      to: string
    }
    options: {
      schools: string[]
      ets: string[]
      paths: string[]
      infoSources: string[]
    }
  }
  totals: {
    totalSessions: number
    totalStudents: number
    totalSchools: number
    totalEts: number
    totalClosedResponses: number
    totalMultiResponses: number
    totalOpenResponses: number
  }
  insights: string[]
  charts: {
    schools: ChartItem[]
    etsData: ChartItem[]
    paths: ChartItem[]
    classes: ChartItem[]
    firstExperienceData: ChartItem[]
    infoSources: ChartItem[]
    motivations: ChartItem[]
    competenceAverages: ChartItem[]
    competenceIndexes: ChartItem[]
    learnedSkills: ChartItem[]
    skillContexts: ChartItem[]
    volunteeringAverages: ChartItem[]
    schoolLifeAverages: ChartItem[]
    openThemes: ChartItem[]
    openTopWords: ChartItem[]
  }
  recentSessions: {
    id: string
    submittedAt: string
    studentName: string | null
    schoolName: string | null
    etsName: string | null
    educationPath: string | null
    classGroup: string | null
    firstExperience: boolean | null
    informationSource: string | null
    stageRole: string | null
  }[]
  openSamples: {
    id: string
    text: string
    themes: string[]
    studentName: string | null
    schoolName: string | null
    etsName: string | null
    educationPath: string | null
    classGroup: string | null
  }[]
}

type Filters = {
  school: string
  ets: string
  path: string
  firstExperience: string
  infoSource: string
  from: string
  to: string
}

const emptyFilters: Filters = {
  school: "",
  ets: "",
  path: "",
  firstExperience: "",
  infoSource: "",
  from: "",
  to: "",
}

export default function AnalisiPage() {
  const router = useRouter()

  const [data, setData] = useState<FinalAnalysisData | null>(null)
  const [filters, setFilters] = useState<Filters>(emptyFilters)
  const [loading, setLoading] = useState(true)
  const [applyingFilters, setApplyingFilters] = useState(false)
  const [error, setError] = useState("")

  async function loadAnalysis(nextFilters = filters) {
    try {
      setError("")

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.access_token) {
        router.push("/login")
        return
      }

      const params = new URLSearchParams()

      Object.entries(nextFilters).forEach(([key, value]) => {
        if (value) params.set(key, value)
      })

      const response = await fetch(
        `/api/dashboard/final-analysis?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      )

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Accesso negato")
      }

      setData(result)
      setFilters(result.filters.selected)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Errore durante il caricamento dell’analisi."
      )
    } finally {
      setLoading(false)
      setApplyingFilters(false)
    }
  }

  useEffect(() => {
    loadAnalysis(emptyFilters)
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push("/login")
  }

  function updateFilter(key: keyof Filters, value: string) {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  function handleApplyFilters() {
    setApplyingFilters(true)
    loadAnalysis(filters)
  }

  function handleResetFilters() {
    setApplyingFilters(true)
    setFilters(emptyFilters)
    loadAnalysis(emptyFilters)
  }

  if (loading) {
    return (
      <main style={pageStyle}>
        <div style={centerCard}>
          <h1 style={{ margin: 0 }}>Caricamento analisi definitiva...</h1>
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
            <Link href="/dashboard" style={secondaryButton}>
              Dashboard
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const { currentUser, totals, insights, charts, recentSessions, openSamples } =
    data

  return (
    <main style={pageStyle}>
      <div style={{ maxWidth: "1240px", margin: "0 auto" }}>
        <header style={headerStyle}>
          <div>
            <p style={eyebrow}>StageInsight · Analisi definitiva</p>
            <h1 style={titleStyle}>Analisi multi-dimensionale dei questionari</h1>
            <p style={subtitleStyle}>
              Accesso come <strong>{currentUser.fullName}</strong> — ruolo:{" "}
              <strong>{currentUser.role}</strong>
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
            <Link href="/dashboard/export" style={secondaryButton}>
              Export CSV
            </Link>
            <button onClick={handleLogout} style={dangerButton}>
              Logout
            </button>
          </div>
        </header>

        <section style={cardStyle}>
          <h2 style={sectionTitle}>Filtri di analisi</h2>
          <p style={mutedText}>
            Usa i filtri per leggere i dati da più punti di vista: scuola, ente,
            percorso, prima esperienza, fonte informativa e periodo.
          </p>

          <div style={filterGrid}>
            {currentUser.role === "ADMIN" ? (
              <FilterSelect
                label="Scuola"
                value={filters.school}
                onChange={(value) => updateFilter("school", value)}
                options={data.filters.options.schools}
              />
            ) : null}

            <FilterSelect
              label="Ente / ETS"
              value={filters.ets}
              onChange={(value) => updateFilter("ets", value)}
              options={data.filters.options.ets}
            />

            <FilterSelect
              label="Percorso"
              value={filters.path}
              onChange={(value) => updateFilter("path", value)}
              options={data.filters.options.paths}
            />

            <FilterSelect
              label="Prima esperienza"
              value={filters.firstExperience}
              onChange={(value) => updateFilter("firstExperience", value)}
              options={[
                { label: "Prima esperienza", value: "true" },
                { label: "Esperienza precedente", value: "false" },
              ]}
            />

            <FilterSelect
              label="Fonte informativa"
              value={filters.infoSource}
              onChange={(value) => updateFilter("infoSource", value)}
              options={data.filters.options.infoSources}
            />

            <div>
              <label style={labelStyle}>Da</label>
              <input
                type="date"
                value={filters.from}
                onChange={(e) => updateFilter("from", e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>A</label>
              <input
                type="date"
                value={filters.to}
                onChange={(e) => updateFilter("to", e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button onClick={handleApplyFilters} style={primaryButtonAsButton}>
              {applyingFilters ? "Applicazione..." : "Applica filtri"}
            </button>

            <button onClick={handleResetFilters} style={secondaryButtonAsButton}>
              Reset filtri
            </button>
          </div>
        </section>

        <section style={statsGrid}>
          <StatCard
            title="Questionari"
            value={totals.totalSessions}
            description="Compilazioni considerate dai filtri"
          />
          <StatCard
            title="Studenti"
            value={totals.totalStudents}
            description="Studenti unici collegati alle compilazioni"
          />
          <StatCard
            title="Scuole"
            value={totals.totalSchools}
            description="Scuole coinvolte"
          />
          <StatCard
            title="Enti / ETS"
            value={totals.totalEts}
            description="Enti coinvolti"
          />
          <StatCard
            title="Risposte chiuse"
            value={totals.totalClosedResponses}
            description="Scale e scelte singole"
          />
          <StatCard
            title="Risposte multiple"
            value={totals.totalMultiResponses}
            description="Motivazioni, competenze e contesti"
          />
          <StatCard
            title="Risposte aperte"
            value={totals.totalOpenResponses}
            description="Testi liberi analizzati"
          />
        </section>

        <section style={insightBox}>
          <h2 style={sectionTitle}>Sintesi interpretativa automatica</h2>

          {insights.length === 0 ? (
            <p style={mutedText}>Nessuna sintesi disponibile.</p>
          ) : (
            <ul style={{ margin: 0, paddingLeft: "20px", lineHeight: 1.9 }}>
              {insights.map((insight) => (
                <li key={insight}>{insight}</li>
              ))}
            </ul>
          )}
        </section>

        <SectionTitle
          title="1. Profilo studenti, scuole ed enti"
          subtitle="Questa sezione mostra chi ha partecipato e da quali contesti provengono le compilazioni."
        />

        <section style={gridTwo}>
          <ChartCard title="Studenti per scuola" subtitle="Distribuzione per scuola">
            <SimpleBarChart data={charts.schools} maxValue={maxOf(charts.schools)} />
          </ChartCard>

          <ChartCard title="Studenti per ente / ETS" subtitle="Distribuzione per ente">
            <SimpleBarChart data={charts.etsData} maxValue={maxOf(charts.etsData)} />
          </ChartCard>

          <ChartCard title="Percorsi di studi" subtitle="Distribuzione per percorso">
            <SimpleBarChart data={charts.paths} maxValue={maxOf(charts.paths)} />
          </ChartCard>

          <ChartCard title="Classi" subtitle="Distribuzione per classe">
            <SimpleBarChart data={charts.classes} maxValue={maxOf(charts.classes)} />
          </ChartCard>

          <ChartCard
            title="Prima esperienza"
            subtitle="Confronto tra prima esperienza e precedenti esperienze"
          >
            <SimpleBarChart
              data={charts.firstExperienceData}
              maxValue={maxOf(charts.firstExperienceData)}
            />
          </ChartCard>

          <ChartCard
            title="Fonti informative"
            subtitle="Canali da cui gli studenti hanno ricevuto informazioni"
          >
            <SimpleBarChart
              data={charts.infoSources}
              maxValue={maxOf(charts.infoSources)}
            />
          </ChartCard>
        </section>

        <SectionTitle
          title="2. Motivazioni e competenze"
          subtitle="Questa sezione collega motivazioni personali, competenze percepite e indici sintetici."
        />

        <section style={gridTwo}>
          <ChartCard
            title="Motivazioni personali"
            subtitle="Motivazioni più selezionate"
          >
            <SimpleBarChart
              data={charts.motivations}
              maxValue={maxOf(charts.motivations)}
            />
          </ChartCard>

          <ChartCard
            title="Competenze medie percepite"
            subtitle="Media delle risposte su scala 1-4"
          >
            <SimpleBarChart
              data={charts.competenceAverages}
              maxValue={4}
              valueFormatter={(value) => value.toFixed(2)}
            />
          </ChartCard>

          <ChartCard
            title="Indici sintetici"
            subtitle="Responsabilità, relazione, comunicazione, autonomia e coinvolgimento"
          >
            <SimpleBarChart
              data={charts.competenceIndexes}
              maxValue={4}
              valueFormatter={(value) => value.toFixed(2)}
            />
          </ChartCard>

          <ChartCard
            title="Competenze apprese"
            subtitle="Competenze che gli studenti dichiarano di aver sviluppato"
          >
            <SimpleBarChart
              data={charts.learnedSkills}
              maxValue={maxOf(charts.learnedSkills)}
            />
          </ChartCard>

          <ChartCard
            title="Contesti futuri"
            subtitle="Dove gli studenti pensano di usare le competenze"
          >
            <SimpleBarChart
              data={charts.skillContexts}
              maxValue={maxOf(charts.skillContexts)}
            />
          </ChartCard>
        </section>

        <SectionTitle
          title="3. Volontariato, scuola e dimensione personale"
          subtitle="Questa parte confronta l’interesse verso il volontariato con aspetti scolastici e personali."
        />

        <section style={gridTwo}>
          <ChartCard
            title="Interesse verso il volontariato"
            subtitle="Media delle risposte su scala 1-4"
          >
            <SimpleBarChart
              data={charts.volunteeringAverages}
              maxValue={4}
              valueFormatter={(value) => value.toFixed(2)}
            />
          </ChartCard>

          <ChartCard
            title="Vita scolastica e personale"
            subtitle="Benessere, relazioni, regole, voti e supporto familiare"
          >
            <SimpleBarChart
              data={charts.schoolLifeAverages}
              maxValue={4}
              valueFormatter={(value) => value.toFixed(2)}
            />
          </ChartCard>
        </section>

        <SectionTitle
          title="4. Analisi intelligente delle risposte aperte"
          subtitle="Questa sezione usa una classificazione automatica a parole chiave per individuare temi ricorrenti nei testi liberi."
        />

        <section style={gridTwo}>
          <ChartCard
            title="Temi ricorrenti"
            subtitle="Classificazione automatica delle risposte aperte"
          >
            <SimpleBarChart
              data={charts.openThemes}
              maxValue={maxOf(charts.openThemes)}
            />
          </ChartCard>

          <ChartCard
            title="Parole chiave"
            subtitle="Parole significative più frequenti nei testi"
          >
            <SimpleBarChart
              data={charts.openTopWords}
              maxValue={maxOf(charts.openTopWords)}
            />
          </ChartCard>
        </section>

        <section style={cardStyle}>
          <h2 style={sectionTitle}>Esempi di risposte aperte analizzate</h2>
          <p style={mutedText}>
            Ogni risposta viene mostrata con i temi rilevati automaticamente.
          </p>

          {openSamples.length === 0 ? (
            <p style={mutedText}>Non ci sono risposte aperte da mostrare.</p>
          ) : (
            <div style={{ display: "grid", gap: "14px" }}>
              {openSamples.map((sample) => (
                <article key={sample.id} style={sampleCard}>
                  <strong>{sample.studentName || "Studente non indicato"}</strong>
                  <p style={{ margin: "4px 0 10px", color: "#64748b" }}>
                    {sample.schoolName || "Scuola non indicata"} ·{" "}
                    {sample.etsName || "Ente non indicato"} ·{" "}
                    {sample.educationPath || "Percorso non indicato"} ·{" "}
                    {sample.classGroup || "Classe non indicata"}
                  </p>

                  <p style={{ margin: "0 0 12px", color: "#334155", lineHeight: 1.7 }}>
                    “{sample.text}”
                  </p>

                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {sample.themes.length === 0 ? (
                      <span style={emptyTag}>Nessun tema rilevato</span>
                    ) : (
                      sample.themes.map((theme) => (
                        <span key={theme} style={tagStyle}>
                          {theme}
                        </span>
                      ))
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section style={cardStyle}>
          <h2 style={sectionTitle}>Ultime compilazioni considerate</h2>
          <p style={mutedText}>
            Elenco sintetico delle ultime compilazioni incluse nei filtri attivi.
          </p>

          {recentSessions.length === 0 ? (
            <p style={mutedText}>Nessuna compilazione disponibile.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={tableStyle}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    <TableHead>Data</TableHead>
                    <TableHead>Studente</TableHead>
                    <TableHead>Scuola</TableHead>
                    <TableHead>Ente</TableHead>
                    <TableHead>Percorso</TableHead>
                    <TableHead>Classe</TableHead>
                    <TableHead>Prima esperienza</TableHead>
                    <TableHead>Fonte</TableHead>
                    <TableHead>Ruolo stage</TableHead>
                  </tr>
                </thead>

                <tbody>
                  {recentSessions.map((session) => (
                    <tr key={session.id} style={{ borderTop: "1px solid #e2e8f0" }}>
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

function maxOf(data: ChartItem[]) {
  return Math.max(...data.map((item) => item.value), 1)
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(date))
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: string[] | { label: string; value: string }[]
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={inputStyle}
      >
        <option value="">Tutti</option>
        {options.map((option) => {
          if (typeof option === "string") {
            return (
              <option key={option} value={option}>
                {option}
              </option>
            )
          }

          return (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          )
        })}
      </select>
    </div>
  )
}

function SectionTitle({
  title,
  subtitle,
}: {
  title: string
  subtitle: string
}) {
  return (
    <div style={{ margin: "30px 0 16px" }}>
      <h2 style={{ margin: "0 0 6px", color: "#0f172a" }}>{title}</h2>
      <p style={{ margin: 0, color: "#64748b", lineHeight: 1.6 }}>
        {subtitle}
      </p>
    </div>
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
      <p style={{ margin: 0, color: "#475569", lineHeight: 1.6 }}>
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
  valueFormatter,
}: {
  data: ChartItem[]
  maxValue: number
  valueFormatter?: (value: number) => string
}) {
  if (data.length === 0) {
    return <p style={mutedText}>Nessun dato disponibile.</p>
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

function TableHead({ children }: { children: ReactNode }) {
  return <th style={tableHead}>{children}</th>
}

function TableCell({ children }: { children: ReactNode }) {
  return <td style={tableCell}>{children}</td>
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

const filterGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "16px",
  marginBottom: "18px",
}

const statsGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
  gap: "18px",
  marginBottom: "20px",
}

const gridTwo: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
  gap: "20px",
  marginBottom: "20px",
}

const cardStyle: CSSProperties = {
  background: "#ffffff",
  borderRadius: "24px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 14px 40px rgba(15, 23, 42, 0.05)",
  padding: "22px",
  marginBottom: "20px",
}

const insightBox: CSSProperties = {
  ...cardStyle,
  background: "#f8fafc",
}

const statCard: CSSProperties = {
  background: "#ffffff",
  borderRadius: "22px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 14px 40px rgba(15, 23, 42, 0.05)",
  padding: "22px",
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

const labelStyle: CSSProperties = {
  display: "block",
  fontWeight: 700,
  marginBottom: "8px",
  color: "#0f172a",
}

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "14px",
  border: "1px solid #cbd5e1",
  fontSize: "1rem",
  boxSizing: "border-box",
  background: "white",
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

const sampleCard: CSSProperties = {
  border: "1px solid #e2e8f0",
  borderRadius: "18px",
  padding: "18px",
  background: "#f8fafc",
}

const tagStyle: CSSProperties = {
  display: "inline-block",
  background: "#dbeafe",
  color: "#1d4ed8",
  borderRadius: "999px",
  padding: "6px 10px",
  fontSize: "0.85rem",
  fontWeight: 700,
}

const emptyTag: CSSProperties = {
  display: "inline-block",
  background: "#f1f5f9",
  color: "#64748b",
  borderRadius: "999px",
  padding: "6px 10px",
  fontSize: "0.85rem",
  fontWeight: 700,
}

const tableStyle: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: "1000px",
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

const primaryButtonAsButton: CSSProperties = {
  ...primaryButton,
  border: "none",
  cursor: "pointer",
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

const secondaryButtonAsButton: CSSProperties = {
  ...secondaryButton,
  cursor: "pointer",
  fontSize: "1rem",
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