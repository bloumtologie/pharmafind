
import { useEffect, useState } from "react";

export default function Accueil({ onCommencer }) {
  const [animation, setAnimation] = useState(false);

  useEffect(() => {
    setAnimation(true);
    const timer = setTimeout(onCommencer, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "linear-gradient(160deg, #27500A 0%, #639922 100%)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      zIndex: 9999, fontFamily: "Segoe UI, sans-serif",
      maxWidth: "480px", margin: "0 auto",
      padding: "1.5rem",
      boxSizing: "border-box",
      overflow: "hidden"
    }}>

      {/* LOGO */}
      <div style={{
        transform: animation ? "translateY(0)" : "translateY(-20px)",
        opacity: animation ? 1 : 0,
        transition: "all 0.7s ease",
        textAlign: "center",
        marginBottom: "1.5rem"
      }}>
        <div style={{
          width: "80px", height: "80px", borderRadius: "24px",
          background: "rgba(255,255,255,0.15)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 0.8rem", fontSize: "2.8rem",
          border: "2px solid rgba(255,255,255,0.3)",
        }}>
          💊
        </div>
        <div style={{ color: "white", fontSize: "1.8rem", fontWeight: 800 }}>
          PharmaFind
        </div>
        <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.85rem", marginTop: "0.3rem" }}>
          Trouvez vos médicaments en un instant
        </div>
      </div>

      {/* FEATURES */}
      <div style={{
        width: "100%",
        display: "flex", flexDirection: "column", gap: "0.6rem",
        marginBottom: "1.5rem",
        opacity: animation ? 1 : 0,
        transform: animation ? "translateY(0)" : "translateY(20px)",
        transition: "all 0.8s ease 0.2s",
      }}>
        {[
          { icon: "📍", text: "Géolocalisation en temps réel" },
          { icon: "💊", text: "Stock des pharmacies à jour" },
          { icon: "📸", text: "Scan d'ordonnance intelligent" },
          { icon: "⭐", text: "Pharmacies favorites" },
        ].map((f) => (
          <div key={f.text} style={{
            display: "flex", alignItems: "center", gap: "12px",
            background: "rgba(255,255,255,0.12)",
            borderRadius: "12px",
            padding: "0.65rem 1rem",
            color: "white", fontSize: "0.88rem",
            border: "1px solid rgba(255,255,255,0.15)"
          }}>
            <span style={{ fontSize: "1.2rem" }}>{f.icon}</span>
            <span>{f.text}</span>
          </div>
        ))}
      </div>

      {/* BOUTON */}
      <button
        onClick={onCommencer}
        style={{
          width: "100%",
          background: "white", color: "#27500A",
          border: "none", borderRadius: "14px",
          padding: "0.95rem", fontSize: "1rem",
          fontWeight: 700, cursor: "pointer",
          boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
          opacity: animation ? 1 : 0,
          transition: "opacity 0.8s ease 0.4s",
          marginBottom: "0.8rem"
        }}
      >
        Commencer →
      </button>

      <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.72rem" }}>
        Version 1.0.0
      </div>

    </div>
  );
}


