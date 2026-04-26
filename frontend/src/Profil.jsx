import { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:3001";

export default function Profil({ onFermer, onDeconnecter, utilisateur }) {
  const [nom, setNom] = useState(utilisateur?.nom || "");
  const [telephone, setTelephone] = useState(utilisateur?.telephone || "");
  const [email, setEmail] = useState(utilisateur?.email || "");
  const [ville, setVille] = useState("");
  const [sauvegarde, setSauvegarde] = useState(false);
  const [message, setMessage] = useState("");
  const [historique, setHistorique] = useState([]);

  useEffect(() => {
    // Charge le profil depuis l'API
    const token = localStorage.getItem("token");
    if (token) {
      axios.get(API + "/api/auth/profil", {
        headers: { Authorization: "Bearer " + token }
      }).then((res) => {
        const u = res.data.utilisateur;
        setNom(u.nom || "");
        setEmail(u.email || "");
        setTelephone(u.telephone || "");
      }).catch((err) => console.error(err));
    }

    // Charge l'historique depuis localStorage
    const hist = JSON.parse(localStorage.getItem("historique") || "[]");
    setHistorique(hist);
  }, []);

  const handleSauvegarder = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(API + "/api/auth/profil", { nom, telephone, ville }, {
        headers: { Authorization: "Bearer " + token }
      });
      setSauvegarde(true);
      setMessage("✅ Profil sauvegardé !");
      setTimeout(() => { setSauvegarde(false); setMessage(""); }, 2000);
    } catch (err) {
      setMessage("❌ Erreur lors de la sauvegarde");
    }
  };

  const roleLabel = utilisateur?.role === "admin" ? "🔑 Admin" :
    utilisateur?.role === "pharmacien" ? "💊 Pharmacien" : "👤 Patient";

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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "#27500A" }}>👤 Mon Profil</div>
            <div style={{ fontSize: "0.75rem", color: "#888" }}>Gérez vos informations</div>
          </div>
          <button onClick={onFermer} style={{ background: "#f0f0f0", border: "none", borderRadius: "50%", width: "32px", height: "32px", cursor: "pointer", fontSize: "1rem" }}>
            ✕
          </button>
        </div>

        {/* AVATAR */}
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{
            width: "80px", height: "80px", borderRadius: "50%",
            background: "#EAF3DE", display: "flex", alignItems: "center",
            justifyContent: "center", margin: "0 auto", fontSize: "2.5rem",
            border: "3px solid #c3e0a8"
          }}>
            {utilisateur?.role === "admin" ? "🔑" : utilisateur?.role === "pharmacien" ? "💊" : "👤"}
          </div>
          <div style={{ marginTop: "0.5rem", fontWeight: 600, color: "#27500A" }}>{nom}</div>
          <div style={{ fontSize: "0.8rem", color: "#888" }}>{roleLabel}</div>
          <div style={{ fontSize: "0.75rem", color: "#aaa", marginTop: "2px" }}>{email}</div>
        </div>

        {/* FORMULAIRE */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
          <div>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#555", display: "block", marginBottom: "4px" }}>
              👤 Nom complet
            </label>
            <input
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              style={{ width: "100%", padding: "0.7rem 1rem", borderRadius: "12px", border: "1.5px solid #c3e0a8", outline: "none", fontSize: "0.9rem", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#555", display: "block", marginBottom: "4px" }}>
              📞 Téléphone
            </label>
            <input
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              style={{ width: "100%", padding: "0.7rem 1rem", borderRadius: "12px", border: "1.5px solid #c3e0a8", outline: "none", fontSize: "0.9rem", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#555", display: "block", marginBottom: "4px" }}>
              🏙️ Ville
            </label>
            <input
              value={ville}
              onChange={(e) => setVille(e.target.value)}
              placeholder="Ex: Cotonou"
              style={{ width: "100%", padding: "0.7rem 1rem", borderRadius: "12px", border: "1.5px solid #c3e0a8", outline: "none", fontSize: "0.9rem", boxSizing: "border-box" }}
            />
          </div>
        </div>

        {/* HISTORIQUE */}
        {historique.length > 0 && (
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#27500A", marginBottom: "0.8rem" }}>
              🕐 Dernières recherches
            </div>
            {historique.slice(0, 5).map((h, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "0.6rem 1rem", background: "#f8fdf6",
                borderRadius: "10px", marginBottom: "0.4rem",
                border: "1px solid #e2f0da"
              }}>
                <span style={{ fontSize: "0.85rem", color: "#27500A" }}>💊 {h.terme}</span>
                <span style={{ fontSize: "0.72rem", color: "#aaa" }}>{h.date}</span>
              </div>
            ))}
          </div>
        )}

        {/* MESSAGE */}
        {message && (
          <div style={{ background: message.includes("✅") ? "#EAF3DE" : "#fff0f0", color: message.includes("✅") ? "#3B6D11" : "#c0392b", padding: "0.7rem", borderRadius: "10px", fontSize: "0.85rem", marginBottom: "1rem", textAlign: "center" }}>
            {message}
          </div>
        )}

        {/* BOUTON DÉCONNEXION */}
        <button
          onClick={() => {
            if (window.confirm("Voulez-vous vraiment vous déconnecter ?")) {
              onDeconnecter();
            }
          }}
          style={{ width: "100%", padding: "0.9rem", background: "#fff0f0", color: "#c0392b", border: "1px solid #f7c1c1", borderRadius: "12px", fontSize: "0.95rem", fontWeight: 600, cursor: "pointer", marginBottom: "0.8rem" }}
        >
          🚪 Se déconnecter
        </button>

        {/* BOUTON SAUVEGARDER */}
        <button
          onClick={handleSauvegarder}
          style={{ width: "100%", padding: "0.9rem", background: sauvegarde ? "#27500A" : "#639922", color: "white", border: "none", borderRadius: "12px", fontSize: "0.95rem", fontWeight: 600, cursor: "pointer", transition: "background 0.3s" }}
        >
          {sauvegarde ? "✅ Sauvegardé !" : "💾 Sauvegarder"}
        </button>

      </div>
    </div>
  );
}