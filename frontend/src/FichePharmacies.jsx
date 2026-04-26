export default function FichePharmacie({ pharmacie, onFermer, onReserver }) {
  if (!pharmacie) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      zIndex: 1000, display: "flex", alignItems: "flex-end"
    }}>
      <div style={{
        background: "white", borderRadius: "20px 20px 0 0",
        width: "100%", maxWidth: "480px", margin: "0 auto",
        padding: "1.5rem", maxHeight: "80vh", overflowY: "auto"
      }}>

        {/* HEADER FICHE */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "1.8rem" }}>🏥</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "#27500A" }}>{pharmacie.nom}</div>
              <span style={{ background: pharmacie.ouvert ? "#EAF3DE" : "#fff0f0", color: pharmacie.ouvert ? "#3B6D11" : "#c0392b", padding: "2px 8px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 600 }}>
                {pharmacie.ouvert ? "🟢 Ouvert" : "🔴 Fermé"}
              </span>
            </div>
          </div>
          <button onClick={onFermer} style={{ background: "#f0f0f0", border: "none", borderRadius: "50%", width: "32px", height: "32px", cursor: "pointer", fontSize: "1rem" }}>
            ✕
          </button>
        </div>

        {/* INFOS */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem", marginBottom: "1.2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "0.7rem", background: "#f8fdf6", borderRadius: "12px" }}>
            <span style={{ fontSize: "1.2rem" }}>📍</span>
            <div>
              <div style={{ fontSize: "0.75rem", color: "#888" }}>Distance</div>
              <div style={{ fontWeight: 500, fontSize: "0.9rem" }}>{pharmacie.distance} m de vous</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "0.7rem", background: "#f8fdf6", borderRadius: "12px" }}>
            <span style={{ fontSize: "1.2rem" }}>🕐</span>
            <div>
              <div style={{ fontSize: "0.75rem", color: "#888" }}>Horaires</div>
              <div style={{ fontWeight: 500, fontSize: "0.9rem" }}>{pharmacie.horairesTexte}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "0.7rem", background: "#f8fdf6", borderRadius: "12px" }}>
            <span style={{ fontSize: "1.2rem" }}>📞</span>
            <div>
              <div style={{ fontSize: "0.75rem", color: "#888" }}>Téléphone</div>
              <div style={{ fontWeight: 500, fontSize: "0.9rem" }}>{pharmacie.telephone}</div>
            </div>
          </div>
        </div>

        {/* MÉDICAMENTS DISPONIBLES */}
        <div style={{ marginBottom: "1.2rem" }}>
          <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#27500A", marginBottom: "0.5rem" }}>
            💊 Médicaments disponibles
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {pharmacie.medicaments.map((m) => (
              <span key={m} style={{ background: "#EAF3DE", color: "#3B6D11", padding: "4px 12px", borderRadius: "20px", fontSize: "0.82rem", fontWeight: 500 }}>
                ✅ {m}
              </span>
            ))}
          </div>
        </div>

        {/* BOUTON RÉSERVER */}
            <button
            onClick={onReserver}
            style={{ width: "100%", background: "#27500A", color: "white", padding: "0.9rem", borderRadius: "12px", fontSize: "0.9rem", textAlign: "center", fontWeight: 600, border: "none", cursor: "pointer", marginBottom: "0.8rem" }}
            >
            🔖 Réserver un médicament
            </button>

        {/* BOUTONS ACTION */}
        <div style={{ display: "flex", gap: "0.8rem" }}>
          <a href={"tel:" + pharmacie.telephone}
            style={{ flex: 1, background: "#EAF3DE", color: "#3B6D11", padding: "0.9rem", borderRadius: "12px", fontSize: "0.9rem", textDecoration: "none", textAlign: "center", fontWeight: 600 }}>
            📞 Appeler
          </a>
          <a href={"https://www.google.com/maps/dir/?api=1&destination=" + pharmacie.lat + "," + pharmacie.lng}
            target="_blank" rel="noreferrer"
            style={{ flex: 1, background: "#639922", color: "white", padding: "0.9rem", borderRadius: "12px", fontSize: "0.9rem", textDecoration: "none", textAlign: "center", fontWeight: 600 }}>
            🗺️ Itinéraire
          </a>
        </div>

      </div>
    </div>
  );
}