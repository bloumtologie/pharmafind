import { useState } from "react";

export default function Reservation({ pharmacie, utilisateur, onFermer }) {
  const [etape, setEtape] = useState("choix");
  const [medicamentChoisi, setMedicamentChoisi] = useState(null);
  const [quantite, setQuantite] = useState(1);
  const [note, setNote] = useState("");
  const [confirmation, setConfirmation] = useState(null);

  const handleReserver = () => {
    const reservation = {
      id: Math.floor(Math.random() * 10000),
      pharmacie: pharmacie.nom,
      medicament: medicamentChoisi,
      quantite,
      note,
      statut: "en_attente",
      heure: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      date: new Date().toLocaleDateString("fr-FR"),
      patient: utilisateur?.nom || "Patient",
    };
    setConfirmation(reservation);
    setEtape("confirmation");
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
      zIndex: 2000, display: "flex", alignItems: "flex-end",
      fontFamily: "Segoe UI, sans-serif"
    }}>
      <div style={{
        background: "white", borderRadius: "20px 20px 0 0",
        width: "100%", maxWidth: "480px", margin: "0 auto",
        padding: "1.5rem", maxHeight: "85vh", overflowY: "auto"
      }}>

        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "#27500A" }}>🔖 Réserver un médicament</div>
            <div style={{ fontSize: "0.75rem", color: "#888" }}>🏥 {pharmacie?.nom}</div>
          </div>
          <button onClick={onFermer} style={{ background: "#f0f0f0", border: "none", borderRadius: "50%", width: "32px", height: "32px", cursor: "pointer", fontSize: "1rem" }}>
            ✕
          </button>
        </div>

        {/* ETAPE 1 — CHOIX MÉDICAMENT */}
        {etape === "choix" && (
          <div>
            <div style={{ fontWeight: 600, color: "#27500A", marginBottom: "0.8rem", fontSize: "0.9rem" }}>
              💊 Choisissez un médicament
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.2rem" }}>
              {pharmacie?.medicaments.map((m) => (
                <div
                  key={m}
                  onClick={() => setMedicamentChoisi(m)}
                  style={{
                    padding: "0.9rem 1rem", borderRadius: "12px", cursor: "pointer",
                    border: medicamentChoisi === m ? "2px solid #639922" : "1px solid #e2f0da",
                    background: medicamentChoisi === m ? "#EAF3DE" : "white",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    transition: "all 0.2s"
                  }}
                >
                  <span style={{ fontWeight: 500, color: "#27500A" }}>💊 {m}</span>
                  {medicamentChoisi === m && <span style={{ color: "#639922", fontWeight: 700 }}>✓</span>}
                </div>
              ))}
            </div>

            {medicamentChoisi && (
              <>
                {/* QUANTITÉ */}
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#555", display: "block", marginBottom: "6px" }}>
                    📦 Quantité
                  </label>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <button
                      onClick={() => setQuantite(Math.max(1, quantite - 1))}
                      style={{ width: "36px", height: "36px", borderRadius: "50%", border: "1px solid #c3e0a8", background: "white", fontSize: "1.2rem", cursor: "pointer", color: "#639922" }}
                    >
                      −
                    </button>
                    <span style={{ fontWeight: 700, fontSize: "1.2rem", color: "#27500A", minWidth: "30px", textAlign: "center" }}>
                      {quantite}
                    </span>
                    <button
                      onClick={() => setQuantite(quantite + 1)}
                      style={{ width: "36px", height: "36px", borderRadius: "50%", border: "1px solid #c3e0a8", background: "#639922", fontSize: "1.2rem", cursor: "pointer", color: "white" }}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* NOTE */}
                <div style={{ marginBottom: "1.2rem" }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#555", display: "block", marginBottom: "6px" }}>
                    📝 Note (optionnel)
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Ex: Dosage 500mg, générique accepté..."
                    rows={3}
                    style={{ width: "100%", padding: "0.7rem 1rem", borderRadius: "12px", border: "1.5px solid #c3e0a8", outline: "none", fontSize: "0.9rem", boxSizing: "border-box", resize: "none", fontFamily: "Segoe UI, sans-serif" }}
                  />
                </div>

                <button
                  onClick={() => setEtape("recap")}
                  style={{ width: "100%", padding: "0.9rem", background: "#639922", color: "white", border: "none", borderRadius: "12px", fontSize: "0.95rem", fontWeight: 700, cursor: "pointer" }}
                >
                  Continuer →
                </button>
              </>
            )}
          </div>
        )}

        {/* ETAPE 2 — RÉCAPITULATIF */}
        {etape === "recap" && (
          <div>
            <div style={{ fontWeight: 600, color: "#27500A", marginBottom: "1rem", fontSize: "0.9rem" }}>
              📋 Récapitulatif
            </div>

            <div style={{ background: "#f8fdf6", borderRadius: "14px", padding: "1rem", border: "1px solid #e2f0da", marginBottom: "1.2rem" }}>
              {[
                { label: "🏥 Pharmacie", valeur: pharmacie?.nom },
                { label: "💊 Médicament", valeur: medicamentChoisi },
                { label: "📦 Quantité", valeur: quantite },
                { label: "👤 Patient", valeur: utilisateur?.nom || "Patient" },
                { label: "📞 Téléphone", valeur: utilisateur?.telephone || "Non renseigné" },
              ].map((item) => (
                <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid #e8f5e0" }}>
                  <span style={{ fontSize: "0.82rem", color: "#666" }}>{item.label}</span>
                  <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#27500A" }}>{item.valeur}</span>
                </div>
              ))}
              {note && (
                <div style={{ marginTop: "0.5rem", fontSize: "0.82rem", color: "#666" }}>
                  📝 <em>{note}</em>
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: "0.8rem" }}>
              <button
                onClick={() => setEtape("choix")}
                style={{ flex: 1, background: "#EAF3DE", color: "#3B6D11", border: "none", borderRadius: "12px", padding: "0.9rem", fontSize: "0.9rem", fontWeight: 600, cursor: "pointer" }}
              >
                ← Modifier
              </button>
              <button
                onClick={handleReserver}
                style={{ flex: 1, background: "#639922", color: "white", border: "none", borderRadius: "12px", padding: "0.9rem", fontSize: "0.9rem", fontWeight: 700, cursor: "pointer" }}
              >
                ✅ Confirmer
              </button>
            </div>
          </div>
        )}

        {/* ETAPE 3 — CONFIRMATION */}
        {etape === "confirmation" && confirmation && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "4rem", marginBottom: "0.5rem" }}>🎉</div>
            <div style={{ fontWeight: 700, fontSize: "1.2rem", color: "#27500A", marginBottom: "0.3rem" }}>
              Réservation confirmée !
            </div>
            <div style={{ fontSize: "0.85rem", color: "#888", marginBottom: "1.5rem" }}>
              Votre réservation a été envoyée à la pharmacie
            </div>

            <div style={{ background: "#f8fdf6", borderRadius: "14px", padding: "1rem", border: "1px solid #e2f0da", marginBottom: "1.5rem", textAlign: "left" }}>
              <div style={{ fontWeight: 600, color: "#27500A", marginBottom: "0.6rem", fontSize: "0.85rem" }}>
                📋 N° {confirmation.id}
              </div>
              {[
                { label: "🏥 Pharmacie", valeur: confirmation.pharmacie },
                { label: "💊 Médicament", valeur: confirmation.medicament },
                { label: "📦 Quantité", valeur: confirmation.quantite },
                { label: "🕐 Heure", valeur: confirmation.heure },
                { label: "📅 Date", valeur: confirmation.date },
              ].map((item) => (
                <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "0.4rem 0", borderBottom: "1px solid #e8f5e0" }}>
                  <span style={{ fontSize: "0.8rem", color: "#666" }}>{item.label}</span>
                  <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#27500A" }}>{item.valeur}</span>
                </div>
              ))}
            </div>

            <div style={{ background: "#fff8e0", borderRadius: "12px", padding: "0.8rem", marginBottom: "1.2rem", fontSize: "0.82rem", color: "#e67e00" }}>
              ⏳ La pharmacie va confirmer votre réservation sous peu
            </div>

            <button
              onClick={onFermer}
              style={{ width: "100%", padding: "0.9rem", background: "#639922", color: "white", border: "none", borderRadius: "12px", fontSize: "0.95rem", fontWeight: 700, cursor: "pointer" }}
            >
              Terminé ✓
            </button>
          </div>
        )}
      </div>
    </div>
  );
}