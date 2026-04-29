import Link from "next/link"
import { prisma } from "@/lib/prisma"

export default async function DashboardPage() {
  const [
    totalSessions,
    totalClosedResponses,
    totalMultiResponses,
    totalOpenResponses,
    recentSessions,
  ] = await Promise.all([
    prisma.surveySession.count(),
    prisma.closedResponse.count(),
    prisma.multiResponse.count(),
    prisma.openResponse.count(),
    prisma.surveySession.findMany({
      orderBy: {
        submittedAt: "desc",
      },
      take: 10,
      include: {
        studentProfile: true,
        _count: {
          select: {
            closedResponses: true,
            multiResponses: true,
            openResponses: true,
          },
        },
      },
    }),
  ])

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #f8fbff 0%, #eef4ff 50%, #f8fafc 100%)",
        padding: "32px 16px 56px",
      }}
    >
      <div style={{ maxWidth: "1120px", margin: "0 auto" }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
            marginBottom: "28px",
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                color: "#2563eb",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.03em",
                fontSize: "0.9rem",
              }}
            >
              StageInsight · Dashboard
            </p>

            <h1
              style={{
                margin: "8px 0 0",
                fontSize: "2rem",
                lineHeight: 1.15,
                color: "#0f172a",
              }}
            >
              Panoramica dati raccolti
            </h1>
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link href="/" style={secondaryButton}>
              Home
            </Link>
            <Link href="/questionario" style={primaryButton}>
              Vai al questionario
            </Link>
          </div>
        </header>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "18px",
            marginBottom: "28px",
          }}
        >
          <StatCard
            title="Compilazioni totali"
            value={totalSessions}
            description="Numero totale di questionari inviati"
          />
          <StatCard
            title="Risposte chiuse"
            value={totalClosedResponses}
            description="Domande a scelta singola / scala Likert"
          />
          <StatCard
            title="Risposte multiple"
            value={totalMultiResponses}
            description="Motivazioni, competenze e contesti"
          />
          <StatCard
            title="Risposte aperte"
            value={totalOpenResponses}
            description="Testi liberi inseriti dagli studenti"
          />
        </section>

        <section
          style={{
            background: "#ffffff",
            borderRadius: "24px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 14px 40px rgba(15, 23, 42, 0.05)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "24px 24px 12px",
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "1.3rem",
                color: "#0f172a",
              }}
            >
              Ultime compilazioni
            </h2>
            <p
              style={{
                margin: "8px 0 0",
                color: "#64748b",
                lineHeight: 1.6,
              }}
            >
              Elenco delle ultime sessioni salvate nel database.
            </p>
          </div>

          {recentSessions.length === 0 ? (
            <div style={{ padding: "24px", color: "#475569" }}>
              Non ci sono ancora compilazioni salvate.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: "900px",
                }}
              >
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    <TableHead>ID sessione</TableHead>
                    <TableHead>Data invio</TableHead>
                    <TableHead>Percorso</TableHead>
                    <TableHead>Classe</TableHead>
                    <TableHead>Prima esperienza</TableHead>
                    <TableHead>Fonte info</TableHead>
                    <TableHead>Ruolo</TableHead>
                    <TableHead>Chiuse</TableHead>
                    <TableHead>Multiple</TableHead>
                    <TableHead>Aperte</TableHead>
                  </tr>
                </thead>

                <tbody>
                  {recentSessions.map((session) => (
                    <tr key={session.id} style={{ borderTop: "1px solid #e2e8f0" }}>
                      <TableCell mono>{session.id.slice(0, 8)}...</TableCell>
                      <TableCell>{formatDate(session.submittedAt)}</TableCell>
                      <TableCell>
                        {session.studentProfile?.educationPath || "—"}
                      </TableCell>
                      <TableCell>{session.studentProfile?.classGroup || "—"}</TableCell>
                      <TableCell>
                        {session.studentProfile?.firstExperience === true
                          ? "Sì"
                          : session.studentProfile?.firstExperience === false
                          ? "No"
                          : "—"}
                      </TableCell>
                      <TableCell>
                        {session.studentProfile?.informationSource || "—"}
                      </TableCell>
                      <TableCell>{session.studentProfile?.stageRole || "—"}</TableCell>
                      <TableCell>{session._count.closedResponses}</TableCell>
                      <TableCell>{session._count.multiResponses}</TableCell>
                      <TableCell>{session._count.openResponses}</TableCell>
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
    <article
      style={{
        background: "#ffffff",
        borderRadius: "22px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 14px 40px rgba(15, 23, 42, 0.05)",
        padding: "22px",
      }}
    >
      <p
        style={{
          margin: 0,
          color: "#64748b",
          fontSize: "0.95rem",
          lineHeight: 1.5,
        }}
      >
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

function TableHead({ children }: { children: React.ReactNode }) {
  return (
    <th
      style={{
        textAlign: "left",
        padding: "14px 16px",
        fontSize: "0.9rem",
        color: "#334155",
        fontWeight: 700,
      }}
    >
      {children}
    </th>
  )
}

function TableCell({
  children,
  mono = false,
}: {
  children: React.ReactNode
  mono?: boolean
}) {
  return (
    <td
      style={{
        padding: "14px 16px",
        color: "#0f172a",
        fontSize: "0.95rem",
        verticalAlign: "top",
        fontFamily: mono ? "monospace" : "inherit",
      }}
    >
      {children}
    </td>
  )
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date)
}

const primaryButton: React.CSSProperties = {
  display: "inline-block",
  textDecoration: "none",
  background: "#1d4ed8",
  color: "white",
  padding: "13px 18px",
  borderRadius: "14px",
  fontWeight: 700,
  boxShadow: "0 12px 30px rgba(29, 78, 216, 0.22)",
}

const secondaryButton: React.CSSProperties = {
  display: "inline-block",
  textDecoration: "none",
  background: "#eff6ff",
  color: "#1d4ed8",
  padding: "13px 18px",
  borderRadius: "14px",
  fontWeight: 700,
  border: "1px solid #bfdbfe",
}