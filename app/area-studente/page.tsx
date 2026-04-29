import Link from "next/link"

export default function AreaStudentePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #f8fbff 0%, #eef4ff 50%, #f8fafc 100%)",
        padding: "32px 16px",
      }}
    >
      <div
        style={{
          maxWidth: "860px",
          margin: "0 auto",
          background: "#ffffff",
          borderRadius: "24px",
          padding: "32px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 18px 50px rgba(15, 23, 42, 0.08)",
        }}
      >
        <p
          style={{
            margin: 0,
            color: "#2563eb",
            fontWeight: 700,
            textTransform: "uppercase",
            fontSize: "0.85rem",
          }}
        >
          StageInsight · Area studente
        </p>

        <h1 style={{ margin: "10px 0", fontSize: "2rem", color: "#0f172a" }}>
          Benvenuto nella tua area studente
        </h1>

        <p style={{ color: "#475569", lineHeight: 1.7 }}>
          Da qui puoi accedere al questionario di stage. In una fase successiva
          questa pagina mostrerà anche lo stato della tua compilazione.
        </p>

        <div style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
          <Link
            href="/questionario"
            style={{
              display: "inline-block",
              textDecoration: "none",
              background: "#1d4ed8",
              color: "white",
              padding: "14px 20px",
              borderRadius: "14px",
              fontWeight: 800,
            }}
          >
            Compila questionario
          </Link>

          <Link
            href="/"
            style={{
              display: "inline-block",
              textDecoration: "none",
              background: "#eff6ff",
              color: "#1d4ed8",
              padding: "14px 20px",
              borderRadius: "14px",
              fontWeight: 800,
              border: "1px solid #bfdbfe",
            }}
          >
            Home
          </Link>
        </div>
      </div>
    </main>
  )
}