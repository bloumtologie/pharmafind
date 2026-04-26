import { useState, useRef } from "react";

export default function ScanOrdonnance({ onMedicamentsDetectes, onFermer }) {
  const [image, setImage] = useState(null);
  const [chargement, setChargement] = useState(false);
  const [medicaments, setMedicaments] = useState([]);
  const [etape, setEtape] = useState("upload");
  const inputRef = useRef();

  const medicamentsConnus = [
    "Amoxicilline", "Paracétamol", "Ibuprofène",
    "Doliprane", "Aspirine", "Metformine",
    "Amlodipine", "Oméprazole", "Azithromycine",
    "Ciprofloxacine", "Diclofénac", "Tramadol",
  ];

  const analyserImage = async (fichier) => {
    setChargement(true);
    setEtape("analyse");

    // Simulation analyse OCR (2 secondes)
    await new Promise((r) => setTimeout(r, 2000));

    // Détection simulée de médicaments
    const detectes = medicamentsConnus
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    setMedicaments(detectes);
    setEtape("resultat");
    setChargement(false);
  };

  const handleFichier = (e) => {
    const fichier = e.target.files[0];
    if (!fichier) return;
    const url = URL.createObjectURL(fichier);
    setImage(url);
    analyserImage(fichier);
  };

  const handleRechercher = () => {
    onMedicamentsDetectes(medicaments[0]);
    onFermer();
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
      zIndex: 1000, display: "flex", alignItems: "flex-end"
    }}>
      <div style={{
        background: "white", borderRadius: "20px 20px 0 0",
        width: "100%", maxWidth: "480px", margin: "0 auto",
        padding: "1.5rem", maxHeight: "85vh", overflowY: "auto"
      }}>

        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "#27500A" }}>📸 Scan d'ordonnance</div>
            <div style={{ fontSize: "0.75rem", color: "#888" }}>Photographiez votre ordonnance</div>
          </div>
          <button onClick={onFermer} style={{ background: "#f0f0f0", border: "none", borderRadius: "50%", width: "32px", height: "32px", cursor: "pointer", fontSize: "1rem" }}>
            ✕
          </button>
        </div>

        {/* ETAPE 1 — UPLOAD */}
        {etape === "upload" && (
          <div>
            <div
              onClick={() => inputRef.current.click()}
              style={{
                border: "2px dashed #c3e0a8", borderRadius: "16px",
                padding: "2.5rem 1rem", textAlign: "center",
                cursor: "pointer", background: "#f8fdf6",
                transition: "all 0.2s"
              }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>📷</div>
              <div style={{ fontWeight: 600, color: "#27500A", marginBottom: "0.3rem" }}>
                Prendre une photo
              </div>
              <div style={{ fontSize: "0.82rem", color: "#888" }}>
                ou importer depuis la galerie
              </div>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFichier}
              style={{ display: "none" }}
            />

            {/* SAISIE MANUELLE */}
            <div style={{ marginTop: "1rem", textAlign: "center" }}>
              <div style={{ fontSize: "0.8rem", color: "#888", marginBottom: "0.5rem" }}>
                — ou saisissez manuellement —
              </div>
              <input
                type="text"
                placeholder="Ex: Paracétamol, Amoxicilline..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.target.value) {
                    onMedicamentsDetectes(e.target.value);
                    onFermer();
                  }
                }}
                style={{
                  width: "100%", padding: "0.7rem 1rem",
                  borderRadius: "12px", border: "1.5px solid #c3e0a8",
                  outline: "none", fontSize: "0.9rem", boxSizing: "border-box"
                }}
              />
              <div style={{ fontSize: "0.72rem", color: "#aaa", marginTop: "4px" }}>
                Appuyez sur Entrée pour rechercher
              </div>
            </div>
          </div>
        )}

        {/* ETAPE 2 — ANALYSE */}
        {etape === "analyse" && (
          <div style={{ textAlign: "center", padding: "2rem 0" }}>
            {image && (
              <img src={image} alt="ordonnance" style={{ width: "100%", maxHeight: "200px", objectFit: "cover", borderRadius: "12px", marginBottom: "1rem" }} />
            )}
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🔍</div>
            <div style={{ fontWeight: 600, color: "#27500A", marginBottom: "0.3rem" }}>
              Analyse en cours...
            </div>
            <div style={{ fontSize: "0.82rem", color: "#888" }}>
              Extraction des médicaments de votre ordonnance
            </div>
            <div style={{ marginTop: "1rem", display: "flex", justifyContent: "center", gap: "6px" }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{
                  width: "8px", height: "8px", borderRadius: "50%",
                  background: "#639922", animation: "pulse 1s infinite",
                  animationDelay: i * 0.2 + "s"
                }} />
              ))}
            </div>
          </div>
        )}

        {/* ETAPE 3 — RÉSULTAT */}
        {etape === "resultat" && (
          <div>
            {image && (
              <img src={image} alt="ordonnance" style={{ width: "100%", maxHeight: "150px", objectFit: "cover", borderRadius: "12px", marginBottom: "1rem" }} />
            )}
            <div style={{ fontWeight: 600, color: "#27500A", marginBottom: "0.8rem" }}>
              ✅ Médicaments détectés
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.2rem" }}>
              {medicaments.map((m) => (
                <div key={m} style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "0.7rem 1rem", background: "#f8fdf6",
                  borderRadius: "10px", border: "1px solid #e2f0da"
                }}>
                  <span style={{ fontSize: "1.1rem" }}>💊</span>
                  <span style={{ fontWeight: 500, color: "#27500A" }}>{m}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: "0.8rem" }}>
              <button
                onClick={() => { setEtape("upload"); setImage(null); setMedicaments([]); }}
                style={{ flex: 1, background: "#EAF3DE", color: "#3B6D11", padding: "0.9rem", borderRadius: "12px", fontSize: "0.9rem", border: "none", cursor: "pointer", fontWeight: 600 }}
              >
                🔄 Réessayer
              </button>
              <button
                onClick={handleRechercher}
                style={{ flex: 1, background: "#639922", color: "white", padding: "0.9rem", borderRadius: "12px", fontSize: "0.9rem", border: "none", cursor: "pointer", fontWeight: 600 }}
              >
                🔍 Rechercher
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}