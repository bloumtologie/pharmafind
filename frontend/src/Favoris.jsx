import { useState } from "react";

export default function Favoris({ pharmacies, favoris, onToggleFavori, onFermer }) {
  const pharmaciesFavorites = pharmacies.filter((p) => favoris.includes(p.id));

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
            <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "#27500A" }}>⭐ Mes Favoris</div>
            <div style={{ fontSize: "0.75rem", color: "#888" }}>Vos pharmacies préférées</div>
          </div>
          <button onClick={onFermer} style={{ background: "#f0f0f0", border: "none", borderRadius: "50%", width: "32px", height: "32px", cursor: "pointer", fontSize: "1rem" }}>
            ✕
          </button>
        </div>

        {/* LISTE FAVORIS */}
        {pharmaciesFavorites.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#888" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⭐</div>
            <div style={{ fontWeight: 600, marginBottom: "0.5rem", color: "#27500A" }}>Aucun favori</div>
            <div style={{ fontSize: "0.85rem" }}>
              Appuyez sur ⭐ sur une pharmacie pour l'ajouter à vos favoris
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
            {pharmaciesFavorites.map((p) => (
              <div key={p.id} style={{
                background: "#f8fdf6", borderRadius: "16px",
                padding: "1rem", border: "1px solid #e2f0da"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong style={{ color: "#27500A" }}>{p.nom}</strong>
                  <button
                    onClick={() => onToggleFavori(p.id)}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.3rem" }}
                  >
                    ⭐
                  </button>
                </div>
                <div style={{ fontSize: "0.8rem", color: "#666", marginTop: "0.4rem", display: "flex", gap: "1rem" }}>
                  <span>🕐 {p.horairesTexte}</span>
                  <span style={{ color: p.ouvert ? "#3B6D11" : "#c0392b" }}>
                    {p.ouvert ? "🟢 Ouvert" : "🔴 Fermé"}
                  </span>
                </div>
                <div style={{ marginTop: "0.5rem", display: "flex", flexWrap: "wrap", gap: "4px" }}>
                  {p.medicaments.map((m) => (
                    <span key={m} style={{
                      background: "#EAF3DE", color: "#3B6D11",
                      padding: "2px 8px", borderRadius: "6px", fontSize: "0.72rem"
                    }}>
                      ✅ {m}
                    </span>
                  ))}
                </div>
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.8rem" }}>
                  <a href={"tel:" + p.telephone} style={{ flex: 1, background: "#EAF3DE", color: "#3B6D11", padding: "7px", borderRadius: "10px", fontSize: "0.82rem", textDecoration: "none", textAlign: "center", fontWeight: 500 }}>
                    📞 Appeler
                  </a>
                  <a href={"https://www.google.com/maps/dir/?api=1&destination=" + p.lat + "," + p.lng} target="_blank" rel="noreferrer" style={{ flex: 1, background: "#639922", color: "white", padding: "7px", borderRadius: "10px", fontSize: "0.82rem", textDecoration: "none", textAlign: "center", fontWeight: 500 }}>
                    🗺️ Itinéraire
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}