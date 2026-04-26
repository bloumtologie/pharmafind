import { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:3001";

export default function DashboardPharmacien({ utilisateur, onFermer }) {
  const [stock, setStock] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [onglet, setOnglet] = useState("stock");
  const [nouveauMed, setNouveauMed] = useState({ nom: "", quantite: "", prix: "", categorie: "" });
  const [message, setMessage] = useState("");
  const [chargement, setChargement] = useState(true);

  const getHeaders = () => ({
    Authorization: "Bearer " + localStorage.getItem("token")
  });

  useEffect(() => {
    chargerDonnees();
  }, []);

  const chargerDonnees = async () => {
    setChargement(true);
    try {
      const [stockRes, resaRes] = await Promise.all([
        axios.get(API + "/api/pharmacien/stock", { headers: getHeaders() }),
        axios.get(API + "/api/pharmacien/reservations", { headers: getHeaders() }),
      ]);
      setStock(Array.isArray(stockRes.data) ? stockRes.data : []);
      setReservations(Array.isArray(resaRes.data) ? resaRes.data : []);
    } catch (err) {
      console.error("Erreur chargement pharmacien", err);
      setStock([]);
      setReservations([]);
    }
    setChargement(false);
  };

  const mettreAJour = async (id, quantite, prix) => {
    try {
      await axios.put(API + "/api/pharmacien/stock/" + id, { quantite, prix }, { headers: getHeaders() });
      afficherMessage("✅ Stock mis à jour !");
      chargerDonnees();
    } catch (err) {
      afficherMessage("❌ Erreur mise à jour");
    }
  };

  const ajouterMedicament = async () => {
    if (!nouveauMed.nom || !nouveauMed.quantite || !nouveauMed.prix) {
      afficherMessage("❌ Remplissez tous les champs");
      return;
    }
    try {
      await axios.post(API + "/api/pharmacien/stock", {
        nom: nouveauMed.nom,
        categorie: nouveauMed.categorie || "Autre",
        quantite: Number(nouveauMed.quantite),
        prix: Number(nouveauMed.prix),
      }, { headers: getHeaders() });
      setNouveauMed({ nom: "", quantite: "", prix: "", categorie: "" });
      afficherMessage("✅ Médicament ajouté !");
      chargerDonnees();
    } catch (err) {
      afficherMessage("❌ " + (err.response?.data?.message || "Erreur"));
    }
  };

  const mettreAJourReservation = async (id, statut) => {
    try {
      await axios.put(API + "/api/pharmacien/reservations/" + id, { statut }, { headers: getHeaders() });
      afficherMessage(statut === "confirme" ? "✅ Réservation confirmée !" : "❌ Réservation annulée");
      chargerDonnees();
    } catch (err) {
      afficherMessage("❌ Erreur");
    }
  };

  const afficherMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  const stockFaible = stock.filter((m) => m.quantite <= 10 && m.quantite > 0);
  const ruptures = stock.filter((m) => m.quantite === 0);
  const enAttente = reservations.filter((r) => r.statut === "en_attente");

  if (chargement) {
    return (
      <div style={{ position: "fixed", inset: 0, background: "white", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "1rem", fontFamily: "Segoe UI, sans-serif" }}>
        <div style={{ fontSize: "2rem" }}>💊</div>
        <p style={{ color: "#3B6D11" }}>Chargement du dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "white", zIndex: 2000, fontFamily: "Segoe UI, sans-serif", display: "flex", flexDirection: "column", maxWidth: "480px", margin: "0 auto" }}>

      {/* HEADER */}
      <div style={{ background: "#3B6D11", padding: "1rem 1.2rem", color: "white" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: "1rem" }}>💊 Dashboard Pharmacien</div>
            <div style={{ fontSize: "0.75rem", opacity: 0.85 }}>{utilisateur?.nom}</div>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button onClick={chargerDonnees} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "8px", padding: "4px 10px", cursor: "pointer", color: "white", fontSize: "0.8rem" }}>
              🔄
            </button>
            <button onClick={onFermer} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%", width: "32px", height: "32px", cursor: "pointer", color: "white", fontSize: "1rem" }}>
              ✕
            </button>
          </div>
        </div>

        {/* STATS */}
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.8rem" }}>
          {[
            { label: "Total", valeur: stock.length, couleur: "rgba(255,255,255,0.2)" },
            { label: "⚠️ Faible", valeur: stockFaible.length, couleur: "rgba(255,165,0,0.3)" },
            { label: "❌ Rupture", valeur: ruptures.length, couleur: "rgba(255,0,0,0.3)" },
            { label: "⏳ Résa", valeur: enAttente.length, couleur: "rgba(37,99,235,0.3)" },
          ].map((s) => (
            <div key={s.label} style={{ flex: 1, background: s.couleur, borderRadius: "10px", padding: "0.5rem", textAlign: "center" }}>
              <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "white" }}>{s.valeur}</div>
              <div style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.85)" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ONGLETS */}
      <div style={{ display: "flex", borderBottom: "1px solid #e8f5e0", background: "white" }}>
        {[
          { id: "stock", label: "📦 Stock" },
          { id: "reservations", label: `📋 Résa (${enAttente.length})` },
          { id: "ajouter", label: "➕ Ajouter" },
        ].map((o) => (
          <button key={o.id} onClick={() => setOnglet(o.id)}
            style={{ flex: 1, padding: "0.7rem 0.3rem", border: "none", background: "none", cursor: "pointer", fontWeight: onglet === o.id ? 700 : 400, color: onglet === o.id ? "#3B6D11" : "#888", borderBottom: onglet === o.id ? "3px solid #3B6D11" : "3px solid transparent", fontSize: "0.78rem" }}>
            {o.label}
          </button>
        ))}
      </div>

      {/* MESSAGE */}
      {message && (
        <div style={{ background: message.includes("✅") ? "#EAF3DE" : "#fff0f0", color: message.includes("✅") ? "#3B6D11" : "#c0392b", padding: "0.6rem 1rem", fontSize: "0.85rem", textAlign: "center", fontWeight: 500 }}>
          {message}
        </div>
      )}

      {/* CONTENU */}
      <div style={{ flex: 1, overflowY: "auto", background: "#f8fdf6", padding: "0.8rem" }}>

        {/* STOCK */}
        {onglet === "stock" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {stock.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem", color: "#888" }}>
                <div style={{ fontSize: "2rem" }}>📦</div>
                <p>Aucun médicament en stock</p>
                <p style={{ fontSize: "0.82rem" }}>Ajoutez des médicaments via l'onglet ➕</p>
              </div>
            ) : stock.map((m) => (
              <div key={m.id} style={{
                background: "white", borderRadius: "14px", padding: "0.9rem",
                border: m.quantite === 0 ? "2px solid #f7c1c1" : m.quantite <= 10 ? "2px solid #ffe0a0" : "1px solid #e2f0da",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <div>
                    <div style={{ fontWeight: 600, color: "#27500A", fontSize: "0.9rem" }}>{m.nom}</div>
                    <div style={{ fontSize: "0.72rem", color: "#888" }}>{m.categorie}</div>
                  </div>
                  <span style={{
                    background: m.quantite === 0 ? "#fff0f0" : m.quantite <= 10 ? "#fff8e0" : "#EAF3DE",
                    color: m.quantite === 0 ? "#c0392b" : m.quantite <= 10 ? "#e67e00" : "#3B6D11",
                    padding: "3px 10px", borderRadius: "20px", fontSize: "0.72rem", fontWeight: 600
                  }}>
                    {m.quantite === 0 ? "❌ Rupture" : m.quantite <= 10 ? "⚠️ Faible" : "✅ OK"}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.72rem", color: "#888", marginBottom: "2px" }}>Quantité</div>
                    <input
                      type="number" defaultValue={m.quantite} min="0"
                      onBlur={(e) => mettreAJour(m.id, Number(e.target.value), m.prix)}
                      style={{ width: "100%", padding: "0.4rem 0.6rem", borderRadius: "8px", border: "1px solid #c3e0a8", fontSize: "0.85rem", boxSizing: "border-box" }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.72rem", color: "#888", marginBottom: "2px" }}>Prix (FCFA)</div>
                    <input
                      type="number" defaultValue={m.prix} min="0"
                      onBlur={(e) => mettreAJour(m.id, m.quantite, Number(e.target.value))}
                      style={{ width: "100%", padding: "0.4rem 0.6rem", borderRadius: "8px", border: "1px solid #c3e0a8", fontSize: "0.85rem", boxSizing: "border-box" }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* RÉSERVATIONS */}
        {onglet === "reservations" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {reservations.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem", color: "#888" }}>
                <div style={{ fontSize: "2rem" }}>📋</div>
                <p>Aucune réservation</p>
              </div>
            ) : reservations.map((r) => (
              <div key={r.id} style={{ background: "white", borderRadius: "14px", padding: "1rem", border: r.statut === "en_attente" ? "2px solid #ffe0a0" : "1px solid #e2f0da" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 600, color: "#27500A", fontSize: "0.9rem" }}>👤 {r.patient_nom}</div>
                    <div style={{ fontSize: "0.82rem", color: "#555", marginTop: "2px" }}>💊 {r.medicament_nom}</div>
                    <div style={{ fontSize: "0.75rem", color: "#888", marginTop: "2px" }}>📦 Qté : {r.quantite}</div>
                    {r.patient_telephone && <div style={{ fontSize: "0.75rem", color: "#888" }}>📞 {r.patient_telephone}</div>}
                    {r.note && <div style={{ fontSize: "0.75rem", color: "#888", fontStyle: "italic" }}>📝 {r.note}</div>}
                    <div style={{ fontSize: "0.7rem", color: "#aaa", marginTop: "2px" }}>
                      {new Date(r.created_at).toLocaleDateString("fr-FR")} {new Date(r.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                  <span style={{
                    background: r.statut === "confirme" ? "#EAF3DE" : r.statut === "annule" ? "#fff0f0" : "#fff8e0",
                    color: r.statut === "confirme" ? "#3B6D11" : r.statut === "annule" ? "#c0392b" : "#e67e00",
                    padding: "4px 10px", borderRadius: "20px", fontSize: "0.72rem", fontWeight: 600
                  }}>
                    {r.statut === "confirme" ? "✅ Confirmé" : r.statut === "annule" ? "❌ Annulé" : "⏳ En attente"}
                  </span>
                </div>
                {r.statut === "en_attente" && (
                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.7rem" }}>
                    <button
                      onClick={() => mettreAJourReservation(r.id, "confirme")}
                      style={{ flex: 1, background: "#639922", color: "white", border: "none", borderRadius: "8px", padding: "6px", fontSize: "0.8rem", cursor: "pointer", fontWeight: 500 }}>
                      ✅ Confirmer
                    </button>
                    <button
                      onClick={() => mettreAJourReservation(r.id, "annule")}
                      style={{ flex: 1, background: "#fff0f0", color: "#c0392b", border: "none", borderRadius: "8px", padding: "6px", fontSize: "0.8rem", cursor: "pointer", fontWeight: 500 }}>
                      ❌ Annuler
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* AJOUTER */}
        {onglet === "ajouter" && (
          <div style={{ background: "white", borderRadius: "16px", padding: "1.2rem", border: "1px solid #e2f0da" }}>
            <div style={{ fontWeight: 600, color: "#27500A", marginBottom: "1rem", fontSize: "0.95rem" }}>
              ➕ Ajouter un médicament
            </div>
            {[
              { label: "💊 Nom du médicament", key: "nom", placeholder: "Ex: Amoxicilline" },
              { label: "📦 Quantité", key: "quantite", placeholder: "Ex: 100", type: "number" },
              { label: "💰 Prix (FCFA)", key: "prix", placeholder: "Ex: 2500", type: "number" },
              { label: "🏷️ Catégorie", key: "categorie", placeholder: "Ex: Antibiotique" },
            ].map((f) => (
              <div key={f.key} style={{ marginBottom: "0.9rem" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#555", display: "block", marginBottom: "4px" }}>{f.label}</label>
                <input
                  type={f.type || "text"}
                  value={nouveauMed[f.key]}
                  onChange={(e) => setNouveauMed({ ...nouveauMed, [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                  style={{ width: "100%", padding: "0.7rem 1rem", borderRadius: "12px", border: "1.5px solid #c3e0a8", outline: "none", fontSize: "0.9rem", boxSizing: "border-box" }}
                />
              </div>
            ))}

            {message && (
              <div style={{ padding: "0.7rem", borderRadius: "10px", background: message.includes("✅") ? "#EAF3DE" : "#fff0f0", color: message.includes("✅") ? "#3B6D11" : "#c0392b", fontSize: "0.85rem", marginBottom: "0.8rem", textAlign: "center" }}>
                {message}
              </div>
            )}

            <button
              onClick={ajouterMedicament}
              style={{ width: "100%", padding: "0.9rem", background: "#639922", color: "white", border: "none", borderRadius: "12px", fontSize: "0.95rem", fontWeight: 700, cursor: "pointer" }}
            >
              ➕ Ajouter au stock
            </button>
          </div>
        )}
      </div>
    </div>
  );
}