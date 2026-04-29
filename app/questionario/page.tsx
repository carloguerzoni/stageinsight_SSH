"use client"

import { useEffect, useState } from "react"
import type { CSSProperties, FormEvent } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase-client"

const likertOptions = [
  "Moltissimo",
  "Molto",
  "Abbastanza",
  "Poco per nulla",
]

const motivationOptions = [
  "Il confronto con i miei insegnanti",
  "Gli stimoli degli amici",
  "Gli stimoli della mia famiglia",
  "La curiosità di provare qualcosa di nuovo",
  "Le mie convinzioni personali",
  "Qualche cosa che mi è successo",
]

const learnedSkillsOptions = [
  "Problem solving",
  "Empatia",
  "Adattabilità",
  "Autocontrollo",
  "Lavoro di squadra / networking",
  "Sicurezza in sé stessi",
  "Spirito di collaborazione",
  "Volontà di apprendere",
  "Creatività e pensiero critico",
]

const skillContextOptions = [
  "Nel mondo della scuola",
  "Nel mondo del lavoro",
  "Nell'attività di volontariato",
  "Nel mio contesto di amici",
  "In famiglia",
]

const volunteeringInterestItems = [
  {
    key: "newPeople",
    label: "Conoscere nuove persone/realtà al di fuori della scuola",
  },
  {
    key: "manualActivities",
    label: "Impegnarsi in attività manuali",
  },
  {
    key: "newInterests",
    label: "Scoprire nuovi interessi",
  },
  {
    key: "newCapabilities",
    label: "Scoprire nuove capacità",
  },
  {
    key: "activitiesOfInterest",
    label: "Svolgere attività di tuo interesse",
  },
  {
    key: "teamwork",
    label: "Lavorare in gruppo",
  },
]

const schoolLifeItems = [
  {
    key: "classWellbeing",
    label: "Quanto ti senti a tuo agio e felice in classe?",
  },
  {
    key: "schoolRules",
    label: "Quanto pensi che le regole della scuola siano importanti e giuste?",
  },
  {
    key: "peerGroup",
    label: "Quanto ti senti parte di un gruppo di amici e compagni di classe?",
  },
  {
    key: "gradesSatisfaction",
    label: "Quanto sei soddisfatto dei tuoi voti?",
  },
  {
    key: "classRelations",
    label:
      "Quanto riesci a relazionarti con gli altri in classe e a lavorare in gruppo?",
  },
  {
    key: "selfAwareness",
    label: "Quanto pensi di conoscere i tuoi bisogni e desideri?",
  },
  {
    key: "familySupport",
    label: "Quanto ti senti supportato dalla tua famiglia?",
  },
]

const initialVolunteeringInterests = Object.fromEntries(
  volunteeringInterestItems.map((item) => [item.key, ""])
) as Record<string, string>

const initialSchoolLife = Object.fromEntries(
  schoolLifeItems.map((item) => [item.key, ""])
) as Record<string, string>

export default function QuestionarioPage() {
  const router = useRouter()

  const [authChecking, setAuthChecking] = useState(true)

  const [educationPath, setEducationPath] = useState("")
  const [classGroup, setClassGroup] = useState("")
  const [firstExperience, setFirstExperience] = useState("")
  const [informationSource, setInformationSource] = useState("")
  const [stageRole, setStageRole] = useState("")
  const [motivations, setMotivations] = useState<string[]>([])

  const [commitments, setCommitments] = useState("")
  const [taskCompletion, setTaskCompletion] = useState("")
  const [teamwork, setTeamwork] = useState("")
  const [empathy, setEmpathy] = useState("")
  const [listening, setListening] = useState("")
  const [communication, setCommunication] = useState("")
  const [unexpectedEvents, setUnexpectedEvents] = useState("")
  const [askForHelp, setAskForHelp] = useState("")
  const [curiosityMotivation, setCuriosityMotivation] = useState("")
  const [skillsUseful, setSkillsUseful] = useState("")
  const [communicationGrowth, setCommunicationGrowth] = useState("")

  const [learnedSkills, setLearnedSkills] = useState<string[]>([])
  const [skillContexts, setSkillContexts] = useState<string[]>([])

  const [volunteeringInterests, setVolunteeringInterests] = useState<
    Record<string, string>
  >(initialVolunteeringInterests)

  const [schoolLife, setSchoolLife] = useState<Record<string, string>>(
    initialSchoolLife
  )

  const [otherLearnedText, setOtherLearnedText] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.access_token) {
        router.push("/login")
        return
      }

      setAuthChecking(false)
    }

    checkAuth()
  }, [router])

  function toggleValue(
    value: string,
    values: string[],
    setValues: (next: string[]) => void
  ) {
    if (values.includes(value)) {
      setValues(values.filter((item) => item !== value))
    } else {
      setValues([...values, value])
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
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

      const response = await fetch("/api/questionario", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          educationPath,
          classGroup,
          firstExperience: firstExperience === "si",
          informationSource,
          stageRole,
          motivations,
          commitments,
          taskCompletion,
          teamwork,
          empathy,
          listening,
          communication,
          unexpectedEvents,
          askForHelp,
          curiosityMotivation,
          skillsUseful,
          communicationGrowth,
          learnedSkills,
          skillContexts,
          volunteeringInterests,
          schoolLife,
          otherLearnedText,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Errore durante il salvataggio")
      }

      router.push("/questionario/conferma")
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Si è verificato un errore durante il salvataggio."
      )
    } finally {
      setLoading(false)
    }
  }

  if (authChecking) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#f8fbff",
          color: "#0f172a",
        }}
      >
        <div>Controllo accesso...</div>
      </main>
    )
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #f4f7fb 0%, #eef3ff 45%, #f8fafc 100%)",
        padding: "32px 16px 64px",
      }}
    >
      <div style={{ maxWidth: "1050px", margin: "0 auto" }}>
        <div
          style={{
            background: "#ffffff",
            borderRadius: "24px",
            boxShadow: "0 20px 60px rgba(15, 23, 42, 0.08)",
            overflow: "hidden",
            border: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)",
              color: "white",
              padding: "32px",
            }}
          >
            <p style={{ margin: 0, fontSize: "0.95rem", opacity: 0.9 }}>
              StageInsight · Questionario studenti
            </p>

            <h1
              style={{
                margin: "10px 0 10px",
                fontSize: "2rem",
                lineHeight: 1.15,
              }}
            >
              Questionario completo
            </h1>

            <p
              style={{
                margin: 0,
                fontSize: "1rem",
                maxWidth: "780px",
                opacity: 0.95,
                lineHeight: 1.6,
              }}
            >
              Compila il questionario relativo alla tua esperienza di stage. Le
              risposte saranno collegate al tuo profilo studente, alla tua
              scuola e all’ente indicato in fase di registrazione.
            </p>
          </div>

          <div style={{ padding: "32px" }}>
            <form
              onSubmit={handleSubmit}
              style={{ display: "grid", gap: "28px" }}
            >
              <section>
                <h2 style={sectionTitle}>1. Profilo studente</h2>

                <div style={gridStyle}>
                  <div>
                    <label style={labelStyle}>Percorso di studi</label>
                    <input
                      type="text"
                      value={educationPath}
                      onChange={(e) => setEducationPath(e.target.value)}
                      required
                      placeholder="Es. Liceo scientifico"
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Classe</label>
                    <input
                      type="text"
                      value={classGroup}
                      onChange={(e) => setClassGroup(e.target.value)}
                      required
                      placeholder="Es. 3A"
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>
                      È la prima esperienza di volontariato e cittadinanza?
                    </label>
                    <select
                      value={firstExperience}
                      onChange={(e) => setFirstExperience(e.target.value)}
                      required
                      style={inputStyle}
                    >
                      <option value="">Seleziona</option>
                      <option value="si">Sì</option>
                      <option value="no">No</option>
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>
                      Dove o da chi hai ricevuto le informazioni?
                    </label>
                    <select
                      value={informationSource}
                      onChange={(e) => setInformationSource(e.target.value)}
                      required
                      style={inputStyle}
                    >
                      <option value="">Seleziona</option>
                      <option value="Progetto Cantieri Giovani">
                        Progetto Cantieri Giovani
                      </option>
                      <option value="Dalla scuola">Dalla scuola</option>
                      <option value="Dall'informagiovani">
                        Dall'informagiovani
                      </option>
                      <option value="Dai centri giovani">
                        Dai centri giovani
                      </option>
                      <option value="Dal CSV Terre Estensi">
                        Dal CSV Terre Estensi
                      </option>
                      <option value="Materiale promozionale">
                        Materiale promozionale
                      </option>
                      <option value="Servizi sociali">Servizi sociali</option>
                      <option value="Dalla mia famiglia">
                        Dalla mia famiglia
                      </option>
                      <option value="Da un amico">Da un amico</option>
                    </select>
                  </div>

                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={labelStyle}>
                      Che ruolo hai avuto durante lo stage?
                    </label>
                    <input
                      type="text"
                      value={stageRole}
                      onChange={(e) => setStageRole(e.target.value)}
                      required
                      placeholder="Es. supporto alle attività, accoglienza, aiuto organizzativo..."
                      style={inputStyle}
                    />
                  </div>
                </div>
              </section>

              <section>
                <h2 style={sectionTitle}>2. Motivazioni personali</h2>
                <p style={helperText}>
                  Seleziona una o più motivazioni che ti hanno spinto a fare
                  questa esperienza.
                </p>

                <CheckboxGroup
                  options={motivationOptions}
                  values={motivations}
                  onToggle={(value) =>
                    toggleValue(value, motivations, setMotivations)
                  }
                />
              </section>

              <section>
                <h2 style={sectionTitle}>3. Esperienza di stage</h2>

                <div style={gridStyle}>
                  <LikertField
                    label="Credi di essere riuscit* a rispettare orari, appuntamenti, impegni e scadenze?"
                    value={commitments}
                    onChange={setCommitments}
                  />

                  <LikertField
                    label="Ritieni di essere migliorat* nella tua capacità di portare a termine gli incarichi assegnati?"
                    value={taskCompletion}
                    onChange={setTaskCompletion}
                  />

                  <LikertField
                    label="Quanto sei riuscit* a lavorare in gruppo?"
                    value={teamwork}
                    onChange={setTeamwork}
                  />

                  <LikertField
                    label="Quanto sei riuscit* a comprendere gli stati d'animo e le emozioni altrui (empatia)?"
                    value={empathy}
                    onChange={setEmpathy}
                  />

                  <LikertField
                    label="Quanto sei riuscit* ad ascoltare ed accettare i punti di vista diversi dai tuoi?"
                    value={listening}
                    onChange={setListening}
                  />

                  <LikertField
                    label="Sei riuscit* a comunicare in modo efficace?"
                    value={communication}
                    onChange={setCommunication}
                  />

                  <LikertField
                    label="Sei riuscit* ad affrontare e gestire gli imprevisti?"
                    value={unexpectedEvents}
                    onChange={setUnexpectedEvents}
                  />

                  <LikertField
                    label="Sei riuscit* a chiedere aiuto quando non sapevi fare qualcosa?"
                    value={askForHelp}
                    onChange={setAskForHelp}
                  />

                  <LikertField
                    label="Quanto questa esperienza ti ha incuriosit* e motivat*?"
                    value={curiosityMotivation}
                    onChange={setCuriosityMotivation}
                  />

                  <LikertField
                    label="Le tue competenze (relazionali, informatiche, linguistiche, ecc.) ti sono state utili in questa esperienza?"
                    value={skillsUseful}
                    onChange={setSkillsUseful}
                  />

                  <LikertField
                    label="Quanto è cresciuta la tua capacità di comunicare in modo efficace?"
                    value={communicationGrowth}
                    onChange={setCommunicationGrowth}
                  />
                </div>
              </section>

              <section>
                <h2 style={sectionTitle}>
                  4. Cosa pensi di aver imparato dall’esperienza di stage?
                </h2>
                <p style={helperText}>Seleziona una o più competenze.</p>

                <CheckboxGroup
                  options={learnedSkillsOptions}
                  values={learnedSkills}
                  onToggle={(value) =>
                    toggleValue(value, learnedSkills, setLearnedSkills)
                  }
                />
              </section>

              <section>
                <h2 style={sectionTitle}>
                  5. In quale contesto pensi che potresti spendere le competenze
                  che hai sviluppato?
                </h2>
                <p style={helperText}>Seleziona uno o più contesti.</p>

                <CheckboxGroup
                  options={skillContextOptions}
                  values={skillContexts}
                  onToggle={(value) =>
                    toggleValue(value, skillContexts, setSkillContexts)
                  }
                />
              </section>

              <section>
                <h2 style={sectionTitle}>
                  6. Quanto reputi interessanti i seguenti aspetti dell'attività
                  di volontariato?
                </h2>

                <div style={{ display: "grid", gap: "18px" }}>
                  {volunteeringInterestItems.map((item) => (
                    <div key={item.key}>
                      <label style={labelStyle}>{item.label}</label>
                      <LikertSelect
                        value={volunteeringInterests[item.key]}
                        onChange={(value) =>
                          setVolunteeringInterests((prev) => ({
                            ...prev,
                            [item.key]: value,
                          }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 style={sectionTitle}>7. Vita scolastica e personale</h2>
                <p style={helperText}>
                  Rispondi alle seguenti domande usando la stessa scala.
                </p>

                <div style={{ display: "grid", gap: "18px" }}>
                  {schoolLifeItems.map((item) => (
                    <div key={item.key}>
                      <label style={labelStyle}>{item.label}</label>
                      <LikertSelect
                        value={schoolLife[item.key]}
                        onChange={(value) =>
                          setSchoolLife((prev) => ({
                            ...prev,
                            [item.key]: value,
                          }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 style={sectionTitle}>
                  8. Ci sono altre cose che hai imparato o sviluppato non
                  elencate sopra che vuoi dirci?
                </h2>

                <textarea
                  value={otherLearnedText}
                  onChange={(e) => setOtherLearnedText(e.target.value)}
                  rows={5}
                  placeholder="Questa risposta può anche essere lasciata vuota."
                  style={textareaStyle}
                />
              </section>

              {error ? (
                <div
                  style={{
                    background: "#fef2f2",
                    color: "#991b1b",
                    border: "1px solid #fecaca",
                    borderRadius: "14px",
                    padding: "14px 16px",
                  }}
                >
                  {error}
                </div>
              ) : null}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "16px",
                  flexWrap: "wrap",
                }}
              >
                <p style={{ margin: 0, color: "#64748b", fontSize: "0.95rem" }}>
                  I gruppi a checkbox richiedono almeno una selezione.
                </p>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    border: "none",
                    borderRadius: "14px",
                    background: loading ? "#94a3b8" : "#1d4ed8",
                    color: "white",
                    padding: "14px 22px",
                    fontSize: "1rem",
                    fontWeight: 700,
                    cursor: loading ? "not-allowed" : "pointer",
                    boxShadow: "0 12px 30px rgba(29, 78, 216, 0.25)",
                  }}
                >
                  {loading ? "Invio in corso..." : "Invia questionario"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}

function LikertField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <LikertSelect value={value} onChange={onChange} />
    </div>
  )
}

function LikertSelect({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required
      style={inputStyle}
    >
      <option value="">Seleziona</option>
      {likertOptions.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  )
}

function CheckboxGroup({
  options,
  values,
  onToggle,
}: {
  options: string[]
  values: string[]
  onToggle: (value: string) => void
}) {
  return (
    <div style={{ display: "grid", gap: "12px" }}>
      {options.map((option) => {
        const checked = values.includes(option)

        return (
          <label
            key={option}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
              padding: "14px 16px",
              borderRadius: "14px",
              border: checked ? "1px solid #60a5fa" : "1px solid #e2e8f0",
              background: checked ? "#eff6ff" : "#ffffff",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => onToggle(option)}
              style={{ marginTop: "3px" }}
            />
            <span style={{ color: "#0f172a", lineHeight: 1.5 }}>{option}</span>
          </label>
        )
      })}
    </div>
  )
}

const sectionTitle: CSSProperties = {
  fontSize: "1.15rem",
  margin: "0 0 14px",
  color: "#0f172a",
}

const helperText: CSSProperties = {
  margin: "0 0 12px",
  color: "#64748b",
  lineHeight: 1.6,
}

const labelStyle: CSSProperties = {
  display: "block",
  fontWeight: 600,
  marginBottom: "8px",
  color: "#0f172a",
  lineHeight: 1.45,
}

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "18px",
}

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "14px",
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  fontSize: "1rem",
  color: "#0f172a",
  outline: "none",
  boxSizing: "border-box",
}

const textareaStyle: CSSProperties = {
  ...inputStyle,
  resize: "vertical",
  minHeight: "120px",
}