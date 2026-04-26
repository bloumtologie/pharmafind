import { useState } from "react";
import axios from "axios";

const API = "http://localhost:3001";

export default function Auth({ onConnecte }) {
  const [mode, setMode] = useState("connexion");
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");
  const [form, setForm] = useState({
    nom: "", email: "", motDePasse: "", telephone: "", role: "patient"
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErreur("");
  };

  const handleSubmit = async () => {
    setChargement(true);
    setErreur("");
    try {
      const url = mode === "connexion"
        ? API + "/api/auth/connexion"
        : API + "/api/auth/inscription";

      const body = mode === "connexion"
        ? { email: form.email, motDePasse: form.motDePasse }
        : { nom: form.nom, email: form.email, motDePasse: form.motDePasse, telephone: form.telephone, role: form.role };

      const res = await axios.post(url, body);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("utilisateur", JSON.stringify(res.data.utilisateur));
      onConnecte(res.data.utilisateur);
    } catch (err) {
      setErreur(err.response?.data?.message || "Une erreur est survenue");
    }
    setChargement(false);
  };

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "linear-gradient(160deg, #27500A 0%, #639922 100%)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      zIndex: 9999, fontFamily: "Segoe UI, sans-serif",
      padding: "1.5rem", boxSizing: "border-box"
    }}>

      {/* LOGO */}
      <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "0.3rem" }}>💊</div>
        <div style={{ color: "white", fontSize: "1.5rem", fontWeight: 800 }}>PharmaFind</div>
      </div>

      {/* CARTE */}
      <div style={{
        background: "white", borderRadius: "20px",
        padding: "1.5rem", width: "100%",
        maxWidth: "400px", boxShadow: "0 8px 32px rgba(0,0,0,0.2)"
      }}>

        {/* ONGLETS */}
        <div style={{ display: "flex", marginBottom: "1.5rem", background: "#f0f0f0", borderRadius: "12px", padding: "4px" }}>
          <button
            onClick={() => setMode("connexion")}
            style={{ flex: 1, padding: "0.6rem", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: 600, fontSize: "0.9rem", background: mode === "connexion" ? "white" : "transparent", color: mode === "connexion" ? "#27500A" : "#888", boxShadow: mode === "connexion" ? "0 2px 8px rgba(0,0,0,0.1)" : "none", transition: "all 0.2s" }}
          >
            Connexion
          </button>
          <button
            onClick={() => setMode("inscription")}
            style={{ flex: 1, padding: "0.6rem", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: 600, fontSize: "0.9rem", background: mode === "inscription" ? "white" : "transparent", color: mode === "inscription" ? "#27500A" : "#888", boxShadow: mode === "inscription" ? "0 2px 8px rgba(0,0,0,0.1)" : "none", transition: "all 0.2s" }}
          >
            Inscription
          </button>
        </div>

        {/* CHAMPS INSCRIPTION */}
        {mode === "inscription" && (
          <>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#555", display: "block", marginBottom: "4px" }}>👤 Nom complet</label>
              <input name="nom" value={form.nom} onChange={handleChange} placeholder="Jean Dupont"
                style={{ width: "100%", padding: "0.7rem 1rem", borderRadius: "12px", border: "1.5px solid #c3e0a8", outline: "none", fontSize: "0.9rem", boxSizing: "border-box" }} />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#555", display: "block", marginBottom: "4px" }}>📞 Téléphone</label>
              <input name="telephone" value={form.telephone} onChange={handleChange} placeholder="+229 97 00 00 00"
                style={{ width: "100%", padding: "0.7rem 1rem", borderRadius: "12px", border: "1.5px solid #c3e0a8", outline: "none", fontSize: "0.9rem", boxSizing: "border-box" }} />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#555", display: "block", marginBottom: "4px" }}>👥 Je suis</label>
              <select name="role" value={form.role} onChange={handleChange}
                style={{ width: "100%", padding: "0.7rem 1rem", borderRadius: "12px", border: "1.5px solid #c3e0a8", outline: "none", fontSize: "0.9rem", boxSizing: "border-box", background: "white" }}>
                <option value="patient">👤 Patient</option>
                <option value="pharmacien">💊 Pharmacien</option>
              </select>
            </div>
          </>
        )}

        {/* EMAIL */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#555", display: "block", marginBottom: "4px" }}>📧 Email</label>
          <input name="email" value={form.email} onChange={handleChange} placeholder="email@exemple.com" type="email"
            style={{ width: "100%", padding: "0.7rem 1rem", borderRadius: "12px", border: "1.5px solid #c3e0a8", outline: "none", fontSize: "0.9rem", boxSizing: "border-box" }} />
        </div>

        {/* MOT DE PASSE */}
        <div style={{ marginBottom: "1.2rem" }}>
          <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#555", display: "block", marginBottom: "4px" }}>🔒 Mot de passe</label>
          <input name="motDePasse" value={form.motDePasse} onChange={handleChange} placeholder="••••••••" type="password"
            style={{ width: "100%", padding: "0.7rem 1rem", borderRadius: "12px", border: "1.5px solid #c3e0a8", outline: "none", fontSize: "0.9rem", boxSizing: "border-box" }} />
        </div>

        {/* ERREUR */}
        {erreur && (
          <div style={{ background: "#fff0f0", color: "#c0392b", padding: "0.7rem 1rem", borderRadius: "10px", fontSize: "0.85rem", marginBottom: "1rem", border: "1px solid #f7c1c1" }}>
            ⚠️ {erreur}
          </div>
        )}

        {/* BOUTON */}
        <button
          onClick={handleSubmit}
          disabled={chargement}
          style={{ width: "100%", padding: "0.9rem", background: chargement ? "#aaa" : "#639922", color: "white", border: "none", borderRadius: "12px", fontSize: "1rem", fontWeight: 700, cursor: chargement ? "not-allowed" : "pointer", transition: "background 0.2s" }}
        >
          {chargement ? "⏳ Chargement..." : mode === "connexion" ? "Se connecter →" : "S'inscrire →"}
        </button>

        {/* COMPTES TEST */}
        <div style={{ marginTop: "1rem", padding: "0.8rem", background: "#f8fdf6", borderRadius: "10px", border: "1px solid #e2f0da" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#27500A", marginBottom: "0.4rem" }}>🧪 Comptes de test</div>
          {[
            { role: "Admin", email: "admin@pharmafind.com", mdp: "admin123" },
            { role: "Pharmacien", email: "centrale@pharmafind.com", mdp: "pharma123" },
            { role: "Patient", email: "patient@pharmafind.com", mdp: "patient123" },
          ].map((c) => (
            <div
              key={c.role}
              onClick={() => setForm({ ...form, email: c.email, motDePasse: c.mdp })}
              style={{ fontSize: "0.75rem", color: "#639922", cursor: "pointer", padding: "2px 0" }}
            >
              👆 {c.role} — {c.email}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}