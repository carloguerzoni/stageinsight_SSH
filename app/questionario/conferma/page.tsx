import Link from "next/link"

export default function ConfermaPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "24px",
        background:
          "linear-gradient(180deg, #f4f7fb 0%, #eef3ff 45%, #f8fafc 100%)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "680px",
          background: "#ffffff",
          borderRadius: "24px",
          padding: "40px 32px",
          boxShadow: "0 20px 60px rgba(15, 23, 42, 0.08)",
          border: "1px solid #e5e7eb",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "999px",
            margin: "0 auto 20px",
            display: "grid",
            placeItems: "center",
            background: "#dbeafe",
            color: "#1d4ed8",
            fontSize: "2rem",
            fontWeight: 700,
          }}
        >
          ✓
        </div>

        <p
          style={{
            margin: 0,
            color: "#2563eb",
            fontWeight: 700,
            letterSpacing: "0.03em",
            textTransform: "uppercase",
            fontSize: "0.85rem",
          }}
        >
          Invio completato
        </p>

        <h1
          style={{
            margin: "12px 0 14px",
            fontSize: "2rem",
            lineHeight: 1.15,
            color: "#0f172a",
          }}
        >
          Questionario inviato correttamente
        </h1>

        <p
          style={{
            margin: "0 auto 28px",
            maxWidth: "560px",
            color: "#475569",
            lineHeight: 1.7,
            fontSize: "1rem",
          }}
        >
          Grazie. Le tue risposte sono state salvate nel sistema e potranno
          essere utilizzate per l’analisi dell’esperienza di stage.
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "14px",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/questionario"
            style={{
              textDecoration: "none",
              background: "#1d4ed8",
              color: "white",
              padding: "12px 18px",
              borderRadius: "14px",
              fontWeight: 700,
            }}
          >
            Compila di nuovo
          </Link>

          <Link
            href="/"
            style={{
              textDecoration: "none",
              background: "#eff6ff",
              color: "#1d4ed8",
              padding: "12px 18px",
              borderRadius: "14px",
              fontWeight: 700,
              border: "1px solid #bfdbfe",
            }}
          >
            Torna alla home
          </Link>
        </div>
      </div>
    </main>
  )
}