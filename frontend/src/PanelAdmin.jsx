import { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:3001";

export default function PanelAdmin({ utilisateur, onFermer }) {
  const [onglet, setOnglet] = useState("overview");
  const [users, setUsers] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [stats, setStats] = useState({ medicaments: 0 });
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
    const [usersRes, pharmaciesRes, statsRes] = await Promise.all([
      axios.get(API + "/api/admin/utilisateurs", { headers: getHeaders() }),
      axios.get(API + "/api/admin/pharmacies", { headers: getHeaders() }),
      axios.get(API + "/api/admin/stats", { headers: getHeaders() }),
    ]);
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
      setPharmacies(Array.isArray(pharmaciesRes.data) ? pharmaciesRes.data : []);
      setStats(statsRes.data || { medicaments: 0 });
    } catch (err) {
      console.error("Erreur chargement admin", err);
      setUsers([]);
      setPharmacies([]);
    }
    setChargement(false);
  };

  const validerUser = async (id) => {
    try {
      await axios.put(API + "/api/admin/utilisateurs/" + id + "/valider", {}, { headers: getHeaders() });
      afficherMessage("✅ Utilisateur validé !");
      chargerDonnees();
    } catch (err) {
      afficherMessage("❌ Erreur lors de la validation");
    }
  };

  const supprimerUser = async (id) => {
    if (!window.confirm("Supprimer cet utilisateur ?")) return;
    try {
      await axios.delete(API + "/api/admin/utilisateurs/" + id, { headers: getHeaders() });
      afficherMessage("🗑️ Utilisateur supprimé !");
      chargerDonnees();
    } catch (err) {
      afficherMessage("❌ Erreur lors de la suppression");
    }
  };

  const validerPharmacie = async (id) => {
    try {
      await axios.put(API + "/api/admin/pharmacies/" + id + "/valider", {}, { headers: getHeaders() });
      afficherMessage("✅ Pharmacie validée !");
      chargerDonnees();
    } catch (err) {
      afficherMessage("❌ Erreur lors de la validation");
    }
  };

  const afficherMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  const roleIcon = (role) => role === "admin" ? "🔑" : role === "pharmacien" ? "💊" : "👤";
  const roleCouleur = (role) => role === "admin" ? "#7B2FBE" : role === "pharmacien" ? "#3B6D11" : "#2563EB";

  const totalPatients = users.filter((u) => u.role === "patient").length;
  const totalPharmaciens = users.filter((u) => u.role === "pharmacien").length;
  const enAttente = users.filter((u) => u.statut === "en_attente").length;
  const pharmaciesValidees = pharmacies.filter((p) => p.valide).length;

  if (chargement) {
    return (
      <div style={{ position: "fixed", inset: 0, background: "white", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "1rem", fontFamily: "Segoe UI, sans-serif" }}>
        <div style={{ fontSize: "2rem" }}>🔑</div>
        <p style={{ color: "#27500A" }}>Chargement du panel admin...</p>
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "white", zIndex: 2000, fontFamily: "Segoe UI, sans-serif", display: "flex", flexDirection: "column", maxWidth: "480px", margin: "0 auto" }}>

      {/* HEADER */}
      <div style={{ background: "#27500A", padding: "1rem 1.2rem", color: "white" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: "1rem" }}>🔑 Panel Admin</div>
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
            { label: "Patients", valeur: totalPatients, icon: "👤" },
            { label: "Pharmaciens", valeur: totalPharmaciens, icon: "💊" },
            { label: "En attente", valeur: enAttente, icon: "⏳" },
            { label: "Pharmacies", valeur: pharmaciesValidees, icon: "🏥" },
          ].map((s) => (
            <div key={s.label} style={{ flex: 1, background: "rgba(255,255,255,0.15)", borderRadius: "10px", padding: "0.5rem", textAlign: "center" }}>
              <div style={{ fontSize: "1rem" }}>{s.icon}</div>
              <div style={{ fontWeight: 700, fontSize: "1rem", color: "white" }}>{s.valeur}</div>
              <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.8)" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ONGLETS */}
      <div style={{ display: "flex", borderBottom: "1px solid #e8f5e0", background: "white" }}>
        {[
          { id: "overview", label: "📊 Vue" },
          { id: "utilisateurs", label: "👥 Users" },
          { id: "pharmacies", label: "🏥 Pharmacies" },
        ].map((o) => (
          <button key={o.id} onClick={() => setOnglet(o.id)}
            style={{ flex: 1, padding: "0.7rem 0.3rem", border: "none", background: "none", cursor: "pointer", fontWeight: onglet === o.id ? 700 : 400, color: onglet === o.id ? "#27500A" : "#888", borderBottom: onglet === o.id ? "3px solid #27500A" : "3px solid transparent", fontSize: "0.78rem" }}>
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

        {/* OVERVIEW */}
        {onglet === "overview" && stats && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
            <div style={{ background: "white", borderRadius: "16px", padding: "1.2rem", border: "1px solid #e2f0da" }}>
              <div style={{ fontWeight: 600, color: "#27500A", marginBottom: "0.8rem" }}>📈 Statistiques globales</div>
              {[
                { label: "Total utilisateurs", valeur: users.length, color: "#2563EB" },
                { label: "Pharmacies validées", valeur: pharmaciesValidees, color: "#3B6D11" },
                { label: "En attente validation", valeur: enAttente, color: "#e67e00" },
                { label: "Médicaments référencés", valeur: stats.medicaments, color: "#7B2FBE" },
              ].map((s) => (
                <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 0", borderBottom: "1px solid #f0f0ec" }}>
                  <span style={{ fontSize: "0.85rem", color: "#555" }}>{s.label}</span>
                  <span style={{ fontWeight: 700, color: s.color, fontSize: "1rem" }}>{s.valeur}</span>
                </div>
              ))}
            </div>

            {/* EN ATTENTE */}
            <div style={{ background: "white", borderRadius: "16px", padding: "1.2rem", border: "1px solid #e2f0da" }}>
              <div style={{ fontWeight: 600, color: "#27500A", marginBottom: "0.8rem" }}>⏳ En attente de validation</div>
              {users.filter((u) => u.statut === "en_attente").length === 0 ? (
                <div style={{ fontSize: "0.85rem", color: "#888", textAlign: "center", padding: "1rem" }}>✅ Aucune validation en attente</div>
              ) : users.filter((u) => u.statut === "en_attente").map((u) => (
                <div key={u.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.6rem 0", borderBottom: "1px solid #f0f0ec" }}>
                  <div>
                    <div style={{ fontSize: "0.85rem", fontWeight: 500 }}>{roleIcon(u.role)} {u.nom}</div>
                    <div style={{ fontSize: "0.72rem", color: "#888" }}>{u.email}</div>
                  </div>
                  <button onClick={() => validerUser(u.id)} style={{ background: "#639922", color: "white", border: "none", borderRadius: "8px", padding: "4px 10px", fontSize: "0.75rem", cursor: "pointer" }}>
                    Valider
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* UTILISATEURS */}
        {onglet === "utilisateurs" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {users.map((u) => (
              <div key={u.id} style={{ background: "white", borderRadius: "14px", padding: "0.9rem", border: "1px solid #e2f0da", boxShadow: "0 2px 6px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#27500A" }}>{roleIcon(u.role)} {u.nom}</div>
                    <div style={{ fontSize: "0.75rem", color: "#888" }}>{u.email}</div>
                    <div style={{ fontSize: "0.75rem", color: "#888" }}>📞 {u.telephone || "Non renseigné"}</div>
                    <div style={{ fontSize: "0.72rem", marginTop: "4px", display: "flex", gap: "6px" }}>
                      <span style={{ background: u.statut === "actif" ? "#EAF3DE" : "#fff8e0", color: u.statut === "actif" ? "#3B6D11" : "#e67e00", padding: "1px 8px", borderRadius: "20px", fontWeight: 500 }}>
                        {u.statut === "actif" ? "✅ Actif" : "⏳ En attente"}
                      </span>
                      <span style={{ color: roleCouleur(u.role), fontWeight: 500 }}>{u.role}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    {u.statut === "en_attente" && (
                      <button onClick={() => validerUser(u.id)} style={{ background: "#639922", color: "white", border: "none", borderRadius: "8px", padding: "4px 10px", fontSize: "0.72rem", cursor: "pointer" }}>
                        ✅ Valider
                      </button>
                    )}
                    {u.role !== "admin" && (
                      <button onClick={() => supprimerUser(u.id)} style={{ background: "#fff0f0", color: "#c0392b", border: "none", borderRadius: "8px", padding: "4px 10px", fontSize: "0.72rem", cursor: "pointer" }}>
                        🗑️ Supprimer
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PHARMACIES */}
        {onglet === "pharmacies" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {pharmacies.map((p) => (
              <div key={p.id} style={{ background: "white", borderRadius: "14px", padding: "0.9rem", border: p.valide ? "1px solid #e2f0da" : "2px solid #ffe0a0", boxShadow: "0 2px 6px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#27500A" }}>🏥 {p.nom}</div>
                    <div style={{ fontSize: "0.75rem", color: "#888" }}>💊 {p.pharmacien_nom || "Non assigné"}</div>
                    <div style={{ fontSize: "0.75rem", color: "#888" }}>📞 {p.telephone}</div>
                    <span style={{ background: p.valide ? "#EAF3DE" : "#fff8e0", color: p.valide ? "#3B6D11" : "#e67e00", padding: "2px 8px", borderRadius: "20px", fontSize: "0.72rem", fontWeight: 500, marginTop: "4px", display: "inline-block" }}>
                      {p.valide ? "✅ Validée" : "⏳ En attente"}
                    </span>
                  </div>
                  {!p.valide && (
                    <button onClick={() => validerPharmacie(p.id)} style={{ background: "#639922", color: "white", border: "none", borderRadius: "8px", padding: "6px 12px", fontSize: "0.78rem", cursor: "pointer", fontWeight: 500 }}>
                      ✅ Valider
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}