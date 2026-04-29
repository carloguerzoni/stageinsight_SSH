import Link from "next/link"
import { prisma } from "@/lib/prisma"
import type { CSSProperties, ReactNode } from "react"

const competenceLabels: Record<string, string> = {
  Q_COMMITMENTS: "Rispetto impegni",
  Q_TASK_COMPLETION: "Portare a termine incarichi",
  Q_TEAMWORK: "Lavoro di gruppo",
  Q_EMPATHY: "Empatia",
  Q_LISTENING: "Ascolto",
  Q_COMMUNICATION: "Comunicazione",
  Q_UNEXPECTED_EVENTS: "Gestione imprevisti",
  Q_ASK_FOR_HELP: "Chiedere aiuto",
  Q_CURIOSITY_MOTIVATION: "Curiosità e motivazione",
  Q_SKILLS_USEFUL: "Competenze utili",
  Q_COMMUNICATION_GROWTH: "Crescita comunicativa",
}

const volunteeringInterestLabels: Record<string, string> = {
  Q_VOL_INTEREST_NEW_PEOPLE: "Conoscere nuove persone/realtà",
  Q_VOL_INTEREST_MANUAL_ACTIVITIES: "Attività manuali",
  Q_VOL_INTEREST_NEW_INTERESTS: "Scoprire nuovi interessi",
  Q_VOL_INTEREST_NEW_CAPABILITIES: "Scoprire nuove capacità",
  Q_VOL_INTEREST_ACTIVITY_OF_INTEREST: "Attività di interesse",
  Q_VOL_INTEREST_TEAMWORK: "Lavorare in gruppo",
}

const schoolLifeLabels: Record<string, string> = {
  Q_CLASS_WELLBEING: "Benessere in classe",
  Q_SCHOOL_RULES: "Importanza regole scolastiche",
  Q_PEER_GROUP: "Gruppo amici/compagni",
  Q_GRADES_SATISFACTION: "Soddisfazione voti",
  Q_CLASS_RELATIONS: "Relazioni e gruppo classe",
  Q_SELF_AWARENESS: "Conoscenza bisogni/desideri",
  Q_FAMILY_SUPPORT: "Supporto famiglia",
}

export default async function AnalisiPage() {
  const [
    totalSessions,
    pathGroupsRaw,
    firstExperienceGroupsRaw,
    infoSourceGroupsRaw,
    motivationGroupsRaw,
    competenceAveragesRaw,
    learnedSkillsGroupsRaw,
    skillContextGroupsRaw,
    volunteeringAveragesRaw,
    schoolLifeAveragesRaw,
  ] = await Promise.all([
    prisma.surveySession.count(),

    prisma.studentProfile.groupBy({
      by: ["educationPath"],
      _count: { _all: true },
    }),

    prisma.studentProfile.groupBy({
      by: ["firstExperience"],
      _count: { _all: true },
    }),

    prisma.closedResponse.groupBy({
      by: ["answerLabel"],
      where: { questionCode: "Q_INFO_SOURCE" },
      _count: { _all: true },
    }),

    prisma.multiResponse.groupBy({
      by: ["answerLabel"],
      where: { questionCode: "Q_PERSONAL_MOTIVATIONS" },
      _count: { _all: true },
    }),

    prisma.closedResponse.groupBy({
      by: ["questionCode"],
      where: {
        questionCode: { in: Object.keys(competenceLabels) },
        numericValue: { not: null },
      },
      _avg: { numericValue: true },
    }),

    prisma.multiResponse.groupBy({
      by: ["answerLabel"],
      where: { questionCode: "Q_LEARNED_SKILLS" },
      _count: { _all: true },
    }),

    prisma.multiResponse.groupBy({
      by: ["answerLabel"],
      where: { questionCode: "Q_SKILL_CONTEXTS" },
      _count: { _all: true },
    }),

    prisma.closedResponse.groupBy({
      by: ["questionCode"],
      where: {
        questionCode: { in: Object.keys(volunteeringInterestLabels) },
        numericValue: { not: null },
      },
      _avg: { numericValue: true },
    }),

    prisma.closedResponse.groupBy({
      by: ["questionCode"],
      where: {
        questionCode: { in: Object.keys(schoolLifeLabels) },
        numericValue: { not: null },
      },
      _avg: { numericValue: true },
    }),
  ])

  const pathGroups = sortDesc(
    pathGroupsRaw.map((item) => ({
      label: item.educationPath || "Non indicato",
      value: item._count._all,
    }))
  )

  const firstExperienceGroups = sortDesc(
    firstExperienceGroupsRaw.map((item) => ({
      label:
        item.firstExperience === true
          ? "Prima esperienza"
          : item.firstExperience === false
          ? "Esperienza precedente"
          : "Non indicato",
      value: item._count._all,
    }))
  )

  const infoSourceGroups = sortDesc(
    infoSourceGroupsRaw.map((item) => ({
      label: item.answerLabel,
      value: item._count._all,
    }))
  )

  const motivationGroups = sortDesc(
    motivationGroupsRaw.map((item) => ({
      label: item.answerLabel,
      value: item._count._all,
    }))
  )

  const learnedSkillsGroups = sortDesc(
    learnedSkillsGroupsRaw.map((item) => ({
      label: item.answerLabel,
      value: item._count._all,
    }))
  )

  const skillContextGroups = sortDesc(
    skillContextGroupsRaw.map((item) => ({
      label: item.answerLabel,
      value: item._count._all,
    }))
  )

  const competenceAverages = sortDesc(
    competenceAveragesRaw.map((item) => ({
      label: competenceLabels[item.questionCode] || item.questionCode,
      value: Number((item._avg.numericValue ?? 0).toFixed(2)),
    }))
  )

  const volunteeringAverages = sortDesc(
    volunteeringAveragesRaw.map((item) => ({
      label: volunteeringInterestLabels[item.questionCode] || item.questionCode,
      value: Number((item._avg.numericValue ?? 0).toFixed(2)),
    }))
  )

  const schoolLifeAverages = sortDesc(
    schoolLifeAveragesRaw.map((item) => ({
      label: schoolLifeLabels[item.questionCode] || item.questionCode,
      value: Number((item._avg.numericValue ?? 0).toFixed(2)),
    }))
  )

  const insights = buildInsights({
    totalSessions,
    infoSourceGroups,
    motivationGroups,
    competenceAverages,
    learnedSkillsGroups,
    skillContextGroups,
    schoolLifeAverages,
  })

  return (
    <main style={pageStyle}>
      <div style={{ maxWidth: "1180px", margin: "0 auto" }}>
        <header style={headerStyle}>
          <div>
            <p style={eyebrow}>StageInsight · Analisi multi-dimensionale</p>
            <h1 style={titleStyle}>Lettura dei dati raccolti</h1>
            <p style={subtitleStyle}>
              Questa pagina legge i dati da più punti di vista: profilo,
              motivazioni, competenze, contesti futuri e percezione scolastica.
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link href="/dashboard" style={secondaryButton}>
              Dashboard
            </Link>
            <Link href="/questionario" style={primaryButton}>
              Questionario
            </Link>
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
              data={pathGroups}
              maxValue={maxOf(pathGroups)}
              emptyMessage="Nessun percorso disponibile."
            />
          </ChartCard>

          <ChartCard
            title="Prima esperienza"
            subtitle="Confronto tra studenti alla prima esperienza e non"
          >
            <SimpleBarChart
              data={firstExperienceGroups}
              maxValue={maxOf(firstExperienceGroups)}
              emptyMessage="Nessun dato disponibile."
            />
          </ChartCard>

          <ChartCard
            title="Fonti informative"
            subtitle="Da dove gli studenti hanno ricevuto informazioni"
          >
            <SimpleBarChart
              data={infoSourceGroups}
              maxValue={maxOf(infoSourceGroups)}
              emptyMessage="Nessuna fonte informativa disponibile."
            />
          </ChartCard>

          <ChartCard
            title="Motivazioni personali"
            subtitle="Motivi principali che hanno spinto gli studenti a partecipare"
          >
            <SimpleBarChart
              data={motivationGroups}
              maxValue={maxOf(motivationGroups)}
              emptyMessage="Nessuna motivazione disponibile."
            />
          </ChartCard>

          <ChartCard
            title="Competenze medie percepite"
            subtitle="Media delle risposte su scala 1-4"
          >
            <SimpleBarChart
              data={competenceAverages}
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
              data={learnedSkillsGroups}
              maxValue={maxOf(learnedSkillsGroups)}
              emptyMessage="Nessuna competenza selezionata."
            />
          </ChartCard>

          <ChartCard
            title="Contesti futuri"
            subtitle="Dove gli studenti pensano di usare le competenze sviluppate"
          >
            <SimpleBarChart
              data={skillContextGroups}
              maxValue={maxOf(skillContextGroups)}
              emptyMessage="Nessun contesto futuro disponibile."
            />
          </ChartCard>

          <ChartCard
            title="Interesse verso il volontariato"
            subtitle="Media delle risposte su scala 1-4"
          >
            <SimpleBarChart
              data={volunteeringAverages}
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
              data={schoolLifeAverages}
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

function buildInsights({
  totalSessions,
  infoSourceGroups,
  motivationGroups,
  competenceAverages,
  learnedSkillsGroups,
  skillContextGroups,
  schoolLifeAverages,
}: {
  totalSessions: number
  infoSourceGroups: ChartItem[]
  motivationGroups: ChartItem[]
  competenceAverages: ChartItem[]
  learnedSkillsGroups: ChartItem[]
  skillContextGroups: ChartItem[]
  schoolLifeAverages: ChartItem[]
}) {
  if (totalSessions === 0) return []

  const topSource = infoSourceGroups[0]
  const topMotivation = motivationGroups[0]
  const topCompetence = competenceAverages[0]
  const weakestCompetence = [...competenceAverages].sort(
    (a, b) => a.value - b.value
  )[0]
  const topLearnedSkill = learnedSkillsGroups[0]
  const topContext = skillContextGroups[0]
  const topSchoolLife = schoolLifeAverages[0]

  const insights: string[] = []

  insights.push(
    `Sono presenti ${totalSessions} compilazioni totali nel database.`
  )

  if (topSource) {
    insights.push(
      `La fonte informativa più frequente è "${topSource.label}", selezionata ${topSource.value} volte.`
    )
  }

  if (topMotivation) {
    insights.push(
      `La motivazione personale più ricorrente è "${topMotivation.label}".`
    )
  }

  if (topCompetence) {
    insights.push(
      `La competenza/area con media più alta è "${topCompetence.label}" con valore medio ${topCompetence.value.toFixed(
        2
      )} su 4.`
    )
  }

  if (weakestCompetence) {
    insights.push(
      `L’area con media più bassa, quindi potenzialmente da osservare meglio, è "${weakestCompetence.label}" con valore medio ${weakestCompetence.value.toFixed(
        2
      )} su 4.`
    )
  }

  if (topLearnedSkill) {
    insights.push(
      `La competenza appresa più selezionata è "${topLearnedSkill.label}".`
    )
  }

  if (topContext) {
    insights.push(
      `Il contesto futuro più indicato per spendere le competenze è "${topContext.label}".`
    )
  }

  if (topSchoolLife) {
    insights.push(
      `Nella parte scolastica/personale, l’aspetto con media più alta è "${topSchoolLife.label}".`
    )
  }

  return insights
}

type ChartItem = {
  label: string
  value: number
}

function sortDesc(data: ChartItem[]) {
  return [...data].sort((a, b) => b.value - a.value)
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