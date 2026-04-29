import Link from "next/link"

const features = [
  {
    title: "Raccolta questionari online",
    description:
      "Gli studenti possono compilare il questionario direttamente dal sito in modo semplice e ordinato.",
  },
  {
    title: "Analisi multi-dimensionale",
    description:
      "Le risposte permettono di leggere l’esperienza per competenze, motivazioni, contesto e percezione finale.",
  },
  {
    title: "Supporto a enti e scuola",
    description:
      "Il sistema è pensato per aiutare enti ospitanti e scuola a comprendere meglio il valore formativo dello stage.",
  },
]

const sections = [
  "Profilo dello studente e prima esperienza di volontariato",
  "Canali informativi e motivazioni personali",
  "Competenze percepite durante lo stage",
  "Riflessione finale su apprendimenti e contesti futuri",
  "Benessere scolastico e dimensione relazionale",
]

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #f8fbff 0%, #eef4ff 50%, #f8fafc 100%)",
        color: "#0f172a",
      }}
    >
      <section
        style={{
          maxWidth: "1120px",
          margin: "0 auto",
          padding: "32px 20px 24px",
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
            marginBottom: "40px",
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                fontSize: "0.95rem",
                fontWeight: 700,
                color: "#2563eb",
                letterSpacing: "0.03em",
                textTransform: "uppercase",
              }}
            >
              5_StageInsight
            </p>
            <h1
              style={{
                margin: "8px 0 0",
                fontSize: "1.6rem",
                lineHeight: 1.2,
              }}
            >
              Analisi multi-dimensionale dei questionari di stage
            </h1>
          </div>

          <nav
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <Link href="/questionario" style={primaryButton}>
              Vai al questionario
            </Link>
          </nav>
        </header>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 0.8fr",
            gap: "24px",
            alignItems: "stretch",
          }}
        >
          <div style={heroCard}>
            <p
              style={{
                margin: 0,
                color: "#2563eb",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                fontSize: "0.85rem",
              }}
            >
              Piattaforma web per la raccolta dati
            </p>

            <h2
              style={{
                margin: "14px 0 14px",
                fontSize: "2.4rem",
                lineHeight: 1.08,
              }}
            >
              Un questionario online per leggere meglio l’esperienza di stage
            </h2>

            <p
              style={{
                margin: "0 0 24px",
                fontSize: "1.05rem",
                lineHeight: 1.75,
                color: "#334155",
                maxWidth: "760px",
              }}
            >
              Questo progetto raccoglie e organizza i dati dei questionari di
              stage degli studenti, con l’obiettivo di produrre letture utili
              sugli enti coinvolti, sulle competenze sviluppate, sui punti di
              forza e sulle criticità emerse durante l’esperienza.
            </p>

            <div
              style={{
                display: "flex",
                gap: "14px",
                flexWrap: "wrap",
              }}
            >
              <Link href="/questionario" style={primaryButton}>
                Compila il questionario
              </Link>

              <a href="#come-funziona" style={secondaryButton}>
                Scopri di più
              </a>
            </div>
          </div>

          <div style={sideCard}>
            <p
              style={{
                margin: 0,
                fontSize: "0.9rem",
                color: "#64748b",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.03em",
              }}
            >
              Obiettivi
            </p>

            <ul
              style={{
                margin: "18px 0 0",
                paddingLeft: "18px",
                color: "#334155",
                lineHeight: 1.8,
              }}
            >
              <li>Raccogliere dati in modo ordinato e digitale</li>
              <li>Leggere l’esperienza per ente e per studente</li>
              <li>Analizzare competenze, motivazioni e percezioni</li>
              <li>Preparare grafici e report per la fase successiva</li>
            </ul>
          </div>
        </div>
      </section>

      <section
        id="come-funziona"
        style={{
          maxWidth: "1120px",
          margin: "0 auto",
          padding: "12px 20px 24px",
        }}
      >
        <h2
          style={{
            fontSize: "1.8rem",
            margin: "0 0 10px",
          }}
        >
          Come funziona il sistema
        </h2>

        <p
          style={{
            margin: "0 0 24px",
            color: "#475569",
            lineHeight: 1.7,
            maxWidth: "820px",
          }}
        >
          La piattaforma permette allo studente di compilare un questionario
          online. Le risposte vengono salvate nel database e, nelle fasi
          successive del progetto, saranno usate per costruire analisi, grafici
          e confronti tra enti, percorsi e competenze.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "18px",
          }}
        >
          {features.map((feature) => (
            <article key={feature.title} style={featureCard}>
              <h3
                style={{
                  margin: "0 0 10px",
                  fontSize: "1.1rem",
                }}
              >
                {feature.title}
              </h3>
              <p
                style={{
                  margin: 0,
                  color: "#475569",
                  lineHeight: 1.7,
                }}
              >
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section
        style={{
          maxWidth: "1120px",
          margin: "0 auto",
          padding: "12px 20px 32px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
          }}
        >
          <div style={contentCard}>
            <h2
              style={{
                margin: "0 0 14px",
                fontSize: "1.45rem",
              }}
            >
              Cosa raccoglie il questionario
            </h2>

            <ul
              style={{
                margin: 0,
                paddingLeft: "18px",
                color: "#334155",
                lineHeight: 1.9,
              }}
            >
              {sections.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div style={contentCard}>
            <h2
              style={{
                margin: "0 0 14px",
                fontSize: "1.45rem",
              }}
            >
              Stato attuale del progetto
            </h2>

            <div style={{ color: "#334155", lineHeight: 1.8 }}>
              <p style={{ marginTop: 0 }}>
                La piattaforma è già collegata al database e il questionario è
                già in grado di salvare le risposte.
              </p>
              <p>
                Nelle prossime fasi verranno aggiunte la dashboard, i grafici e
                le letture aggregate per supportare l’analisi finale.
              </p>
              <div
                style={{
                  marginTop: "18px",
                  display: "flex",
                  gap: "12px",
                  flexWrap: "wrap",
                }}
              >
                <Link href="/questionario" style={primaryButton}>
                  Apri il questionario
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        style={{
          maxWidth: "1120px",
          margin: "0 auto",
          padding: "0 20px 56px",
        }}
      >
        <div
          style={{
            borderRadius: "28px",
            background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)",
            color: "white",
            padding: "32px",
            boxShadow: "0 18px 50px rgba(37, 99, 235, 0.22)",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "0.9rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.03em",
              opacity: 0.9,
            }}
          >
            Accesso rapido
          </p>

          <h2
            style={{
              margin: "10px 0 12px",
              fontSize: "1.9rem",
              lineHeight: 1.15,
            }}
          >
            Pronto per la compilazione
          </h2>

          <p
            style={{
              margin: "0 0 22px",
              maxWidth: "760px",
              lineHeight: 1.7,
              opacity: 0.95,
            }}
          >
            Usa il pulsante qui sotto per aprire il questionario completo e
            testare il salvataggio reale delle risposte nel database.
          </p>

          <Link
            href="/questionario"
            style={{
              display: "inline-block",
              textDecoration: "none",
              background: "#ffffff",
              color: "#1d4ed8",
              padding: "14px 20px",
              borderRadius: "14px",
              fontWeight: 800,
            }}
          >
            Vai al questionario
          </Link>
        </div>
      </section>
    </main>
  )
}

const heroCard: React.CSSProperties = {
  background: "#ffffff",
  borderRadius: "28px",
  padding: "32px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 18px 50px rgba(15, 23, 42, 0.06)",
}

const sideCard: React.CSSProperties = {
  background: "#f8fafc",
  borderRadius: "28px",
  padding: "28px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 18px 50px rgba(15, 23, 42, 0.04)",
}

const featureCard: React.CSSProperties = {
  background: "#ffffff",
  borderRadius: "22px",
  padding: "22px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 14px 40px rgba(15, 23, 42, 0.05)",
}

const contentCard: React.CSSProperties = {
  background: "#ffffff",
  borderRadius: "24px",
  padding: "26px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 14px 40px rgba(15, 23, 42, 0.05)",
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