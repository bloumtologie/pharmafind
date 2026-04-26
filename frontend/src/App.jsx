import { useState, useEffect } from "react";
import axios from "axios";
import FichePharmacie from "./FichePharmacies.jsx";
import ScanOrdonnance from "./ScanOrdonnance.jsx";
import Profil from "./Profil.jsx";
import Accueil from "./Accueil.jsx";
import Auth from "./Auth.jsx";
import Favoris from "./Favoris.jsx";
import DashboardPharmacien from "./DashboardPharmacien.jsx";
import PanelAdmin from "./PanelAdmin.jsx";
import Reservation from "./Reservation.jsx";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const API = "http://localhost:3001";

function calculerDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export default function App() {
  const [recherche, setRecherche] = useState("");
  const [tags, setTags] = useState([]);
  const [position, setPosition] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [vue, setVue] = useState("liste");
  const [selectionnee, setSelectionnee] = useState(null);
  const [pharmacies, setPharmacies] = useState([]);
  const [chargementAPI, setChargementAPI] = useState(false);
  const [filtrOuvert, setFiltrOuvert] = useState(false);
  const [erreurReseau, setErreurReseau] = useState(false);
  const [reservation, setReservation] = useState(null);
  const [ficheOuverte, setFicheOuverte] = useState(null);
  const [scanOuvert, setScanOuvert] = useState(false);
  const [profilOuvert, setProfilOuvert] = useState(false);
  const tokenSauvegarde = localStorage.getItem("token");
  const userSauvegarde = localStorage.getItem("utilisateur");
  const [splash, setSplash] = useState(true);
  const [auth, setAuth] = useState(false);
  const [utilisateur, setUtilisateur] = useState(
    tokenSauvegarde && userSauvegarde ? JSON.parse(userSauvegarde) : null
  );
  const [favoris, setFavoris] = useState([]);
  const [favorisOuvert, setFavorisOuvert] = useState(false);
  const [dashPharmacien, setDashPharmacien] = useState(false);
  const [panelAdmin, setPanelAdmin] = useState(false);
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => { setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setChargement(false); },
      () => { setPosition({ lat: 6.3654, lng: 2.4183 }); setChargement(false); }
    );
  }, []);

  useEffect(() => {
    const fetchPharmacies = async () => {
        setChargementAPI(true);
        try {
          let url = recherche
            ? API + "/api/pharmacies/recherche?medicament=" + recherche
            : API + "/api/pharmacies";
          if (filtrOuvert) url += (url.includes("?") ? "&" : "?") + "ouvert=true";
          const res = await axios.get(url);
          setPharmacies(res.data);
          setErreurReseau(false);
        } catch (err) {
          console.error("Erreur API", err);
          setErreurReseau(true);
        }
        setChargementAPI(false);
      };
    const timer = setTimeout(fetchPharmacies, 300);
    return () => clearTimeout(timer);
  }, [recherche, filtrOuvert]);

  const deconnecter = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("utilisateur");
    setUtilisateur(null);
    setAuth(true);
    setProfilOuvert(false);
    setDashPharmacien(false);
    setPanelAdmin(false);
  };

  const ajouterTag = (valeur) => {
    const med = valeur.trim();
    if (med && !tags.includes(med)) {
      setTags((prev) => [...prev, med]);
      setRecherche("");
    }
  };

  const supprimerTag = (tag) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const toggleFavori = (id) => {
    setFavoris((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const tousLesTags = tags.length > 0 ? tags : recherche ? [recherche] : [];

  const pharmaciesFiltrees = pharmacies
    .filter((p) =>
      tousLesTags.length === 0 ||
      tousLesTags.every((tag) =>
        p.medicaments.some((m) => m.toLowerCase().includes(tag.toLowerCase()))
      )
    )
    .map((p) => ({ ...p, distance: position ? calculerDistance(position.lat, position.lng, p.lat, p.lng) : 0 }))
    .sort((a, b) => a.distance - b.distance);
    if (splash) {
        return <Accueil onCommencer={() => { setSplash(false); setAuth(true); }} />;
    }

  if (splash && tokenSauvegarde && userSauvegarde) {
    return <Accueil onCommencer={() => setSplash(false)} />;
  }

  if (auth && !utilisateur) {
    return <Auth onConnecte={(u) => {
      setUtilisateur(u);
      setAuth(false);
      if (u.role === "pharmacien") setDashPharmacien(true);
      if (u.role === "admin") setPanelAdmin(true);
    }} />;
  }
  if (chargement) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", flexDirection: "column", gap: "1rem", background: "#f8fdf6", fontFamily: "sans-serif" }}>
        <div style={{ fontSize: "3rem" }}>💊</div>
        <p style={{ color: "#639922", fontSize: "1.1rem" }}>Détection de votre position...</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif", height: "100vh", display: "flex", flexDirection: "column", maxWidth: "480px", margin: "0 auto", background: "white", boxShadow: "0 0 30px rgba(0,0,0,0.1)" }}>

      {/* HEADER */}
      <div style={{ background: "#3B6D11", padding: "1rem 1.2rem", color: "white", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "1.4rem" }}>💊</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>PharmaFind</div>
            <div style={{ fontSize: "0.7rem", opacity: 0.85 }}>
              {utilisateur ? "Bonjour " + utilisateur.nom : "Médicaments près de vous"}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}
          onClick={() => {
            if (utilisateur?.role === "pharmacien") setDashPharmacien(true);
            if (utilisateur?.role === "admin") setPanelAdmin(true);
          }}      
        >
        <span style={{ background: "rgba(255,255,255,0.2)", borderRadius: "20px", padding: "3px 10px", fontSize: "0.75rem" }}>
          📍 Localisé
        </span>
        {utilisateur && (
          <span style={{ background: "rgba(255,255,255,0.15)", borderRadius: "20px", padding: "2px 8px", fontSize: "0.68rem" }}>
            {utilisateur.role === "admin" ? "🔑 Admin" : utilisateur.role === "pharmacien" ? "💊 Pharmacien" : "👤 Patient"}
          </span>
        )}
      </div>
      </div>

      {/* BARRE DE RECHERCHE + FILTRE */}
      <div style={{ padding: "0.8rem 1rem", background: "#f8fdf6", borderBottom: "1px solid #e8f5e0" }}>
        {/* TAGS MÉDICAMENTS */}
        {tags.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "0.5rem" }}>
            {tags.map((tag) => (
              <span key={tag} style={{ background: "#639922", color: "white", padding: "4px 10px", borderRadius: "20px", fontSize: "0.78rem", fontWeight: 500, display: "flex", alignItems: "center", gap: "6px" }}>
                💊 {tag}
                <button
                  onClick={() => supprimerTag(tag)}
                  style={{ background: "none", border: "none", color: "white", cursor: "pointer", fontSize: "0.9rem", padding: 0, lineHeight: 1 }}
                >
                  ✕
                </button>
              </span>
            ))}
            <button
              onClick={() => setTags([])}
              style={{ background: "#fff0f0", color: "#c0392b", border: "none", borderRadius: "20px", padding: "4px 10px", fontSize: "0.75rem", cursor: "pointer", fontWeight: 500 }}
            >
              Tout effacer
            </button>
          </div>
        )}

        <input
          type="text"
          placeholder={tags.length > 0 ? "➕ Ajouter un médicament..." : "🔍 Chercher un médicament..."}
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && recherche.trim()) ajouterTag(recherche);
            if (e.key === "Backspace" && !recherche && tags.length > 0) supprimerTag(tags[tags.length - 1]);
          }}
          style={{ width: "100%", padding: "0.7rem 1rem", fontSize: "0.9rem", borderRadius: "12px", border: "1.5px solid #c3e0a8", outline: "none", background: "white", boxSizing: "border-box" }}
        />
        {recherche && (
          <div
            onClick={() => ajouterTag(recherche)}
            style={{ marginTop: "4px", background: "#EAF3DE", borderRadius: "8px", padding: "6px 10px", fontSize: "0.8rem", color: "#3B6D11", cursor: "pointer", fontWeight: 500 }}
          >
            ➕ Ajouter "{recherche}" à la recherche
          </div>
        )}

        {/* FILTRE OUVERT */}
        <div style={{ marginTop: "0.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "0.78rem", color: "#639922" }}>
            🏥 {pharmaciesFiltrees.length} pharmacie(s)
            {chargementAPI && " ⏳"}
          </span>
          <button
            onClick={() => setFiltrOuvert(!filtrOuvert)}
            style={{
              background: filtrOuvert ? "#639922" : "white",
              color: filtrOuvert ? "white" : "#639922",
              border: "1.5px solid #c3e0a8",
              borderRadius: "20px",
              padding: "3px 12px",
              fontSize: "0.75rem",
              cursor: "pointer",
              fontWeight: 500,
              transition: "all 0.2s"
            }}
          >
            🕐 Ouvert maintenant
          </button>
        </div>
      </div>

      {erreurReseau && (
          <div style={{
            background: "#fff0f0", color: "#c0392b",
            padding: "0.6rem 1rem", fontSize: "0.82rem",
            textAlign: "center", borderBottom: "1px solid #f7c1c1",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
          }}>
            ⚠️ Connexion au serveur impossible
            <button
              onClick={() => fetchPharmacies()}
              style={{ background: "#c0392b", color: "white", border: "none", borderRadius: "6px", padding: "2px 8px", fontSize: "0.75rem", cursor: "pointer" }}
            >
              Réessayer
            </button>
          </div>
        )}

      {/* ONGLETS */}
      <div style={{ display: "flex", borderBottom: "1px solid #e8f5e0", background: "white" }}>
        <button onClick={() => setVue("liste")} style={{ flex: 1, padding: "0.7rem", border: "none", background: "none", cursor: "pointer", fontWeight: vue === "liste" ? 700 : 400, color: vue === "liste" ? "#3B6D11" : "#888", borderBottom: vue === "liste" ? "3px solid #3B6D11" : "3px solid transparent", fontSize: "0.9rem" }}>
          📋 Liste
        </button>
        <button onClick={() => setVue("carte")} style={{ flex: 1, padding: "0.7rem", border: "none", background: "none", cursor: "pointer", fontWeight: vue === "carte" ? 700 : 400, color: vue === "carte" ? "#3B6D11" : "#888", borderBottom: vue === "carte" ? "3px solid #3B6D11" : "3px solid transparent", fontSize: "0.9rem" }}>
          🗺️ Carte
        </button>
      </div>

      {/* VUE LISTE */}
      {vue === "liste" && (
        <div style={{ flex: 1, overflowY: "auto", background: "#f8fdf6" }}>
          {pharmaciesFiltrees.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "#888" }}>
              <div style={{ fontSize: "2rem" }}>😔</div>
              <p>{filtrOuvert ? "Aucune pharmacie ouverte en ce moment" : "Aucune pharmacie trouvée pour"} <strong>{recherche}</strong></p>
            </div>
          ) : pharmaciesFiltrees.map((p, index) => (
            <div
              key={p.id}
              onClick={() => setFicheOuverte(p)}
              style={{ margin: "0.6rem 0.8rem", background: "white", borderRadius: "16px", padding: "1rem", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: selectionnee === p.id ? "2px solid #639922" : "2px solid transparent", transition: "all 0.2s" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "28px", height: "28px", background: index === 0 ? "#639922" : "#EAF3DE", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: index === 0 ? "white" : "#639922", fontWeight: 700, fontSize: "0.8rem" }}>
                    {index + 1}
                  </div>
                  <strong style={{ color: "#27500A", fontSize: "0.95rem" }}>{p.nom}</strong>
                </div>
                <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                  <span style={{ background: p.ouvert ? "#EAF3DE" : "#fff0f0", color: p.ouvert ? "#3B6D11" : "#c0392b", padding: "2px 8px", borderRadius: "20px", fontSize: "0.7rem", fontWeight: 600 }}>
                    {p.ouvert ? "🟢 Ouvert" : "🔴 Fermé"}
                  </span>
                  <span style={{ background: "#EAF3DE", color: "#3B6D11", padding: "3px 10px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 600 }}>
                    {p.distance} m
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFavori(p.id); }}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem" }}
                  >
                    {favoris.includes(p.id) ? "⭐" : "☆"}
                  </button>
                </div>
              </div>

              <div style={{ marginTop: "0.5rem", fontSize: "0.8rem", color: "#666", display: "flex", gap: "0.8rem" }}>
                <span>🕐 {p.horairesTexte}</span>
                <span>📞 {p.telephone}</span>
              </div>

              <div style={{ marginTop: "0.5rem", display: "flex", flexWrap: "wrap", gap: "4px" }}>
                {p.medicaments.map((m) => (
                  <span key={m} style={{ background: recherche && m.toLowerCase().includes(recherche.toLowerCase()) ? "#639922" : "#f0f9e8", color: recherche && m.toLowerCase().includes(recherche.toLowerCase()) ? "white" : "#639922", padding: "2px 8px", borderRadius: "6px", fontSize: "0.72rem", fontWeight: 500 }}>
                    {m}
                  </span>
                ))}
              </div>

              {selectionnee === p.id && (
                <div style={{ marginTop: "0.8rem", display: "flex", gap: "0.5rem" }}>
                  <a href={"tel:" + p.telephone} style={{ flex: 1, background: "#EAF3DE", color: "#3B6D11", padding: "8px", borderRadius: "10px", fontSize: "0.82rem", textDecoration: "none", textAlign: "center", fontWeight: 500 }}>
                    📞 Appeler
                  </a>
                  <a href={"https://www.google.com/maps/dir/?api=1&destination=" + p.lat + "," + p.lng} target="_blank" rel="noreferrer" style={{ flex: 1, background: "#639922", color: "white", padding: "8px", borderRadius: "10px", fontSize: "0.82rem", textDecoration: "none", textAlign: "center", fontWeight: 500 }}>
                    🗺️ Itinéraire
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* VUE CARTE */}
      {vue === "carte" && (
        <div style={{ flex: 1 }}>
          <MapContainer center={[position.lat, position.lng]} zoom={14} style={{ height: "100%", width: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap" />
            <Circle center={[position.lat, position.lng]} radius={300} pathOptions={{ color: "#2563EB", fillColor: "#2563EB", fillOpacity: 0.15 }} />
            {pharmaciesFiltrees.map((p) => (
              <Marker key={p.id} position={[p.lat, p.lng]}>
                <Popup>
                  <div style={{ fontFamily: "sans-serif", minWidth: "150px" }}>
                    <strong style={{ color: "#27500A" }}>{p.nom}</strong><br />
                    <span style={{ color: p.ouvert ? "#639922" : "#c0392b", fontSize: "0.8rem" }}>{p.ouvert ? "🟢 Ouvert" : "🔴 Fermé"}</span><br />
                    <span style={{ color: "#639922", fontSize: "0.82rem" }}>📍 {p.distance} m</span><br />
                    <span style={{ fontSize: "0.8rem", color: "#555" }}>🕐 {p.horairesTexte}</span>
                    <div style={{ marginTop: "6px" }}>
                      {p.medicaments.map((m) => (
                        <div key={m} style={{ fontSize: "0.8rem" }}>✅ {m}</div>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
                      <a href={"tel:" + p.telephone} style={{ flex: 1, background: "#EAF3DE", color: "#3B6D11", padding: "4px 6px", borderRadius: "6px", fontSize: "0.75rem", textDecoration: "none", textAlign: "center" }}>📞</a>
                      <a href={"https://www.google.com/maps/dir/?api=1&destination=" + p.lat + "," + p.lng} target="_blank" rel="noreferrer" style={{ flex: 1, background: "#639922", color: "white", padding: "4px 6px", borderRadius: "6px", fontSize: "0.75rem", textDecoration: "none", textAlign: "center" }}>🗺️</a>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}
      <FichePharmacie
        pharmacie={ficheOuverte}
        onFermer={() => setFicheOuverte(null)}
        onReserver={() => { setReservation(ficheOuverte); setFicheOuverte(null); }}
      />
        {scanOuvert && (
            <ScanOrdonnance
              onMedicamentsDetectes={(m) => setRecherche(m)}
              onFermer={() => setScanOuvert(false)}
            />
          )}
          {profilOuvert && (
              <Profil
                onFermer={() => setProfilOuvert(false)}
                onDeconnecter={deconnecter}
                utilisateur={utilisateur}
            />
          )}
          {dashPharmacien && (
            <DashboardPharmacien
              utilisateur={utilisateur}
              onFermer={() => setDashPharmacien(false)}
            />
          )}

          {reservation && (
            <Reservation
              pharmacie={reservation}
              utilisateur={utilisateur}
              onFermer={() => setReservation(null)}
            />
          )}
          {panelAdmin && (
            <PanelAdmin
              utilisateur={utilisateur}
              onFermer={() => setPanelAdmin(false)}
            />
          )}

          {favorisOuvert && (
            <Favoris
              pharmacies={pharmaciesFiltrees}
              favoris={favoris}
              onToggleFavori={toggleFavori}
              onFermer={() => setFavorisOuvert(false)}
            />
          )}
      {/* BOTTOM NAV */}
      <div style={{ background: "white", borderTop: "1px solid #e8f5e0", padding: "0.6rem 0", display: "flex", justifyContent: "space-around" }}>
        <button onClick={() => setVue("liste")} style={{ background: "none", border: "none", cursor: "pointer", textAlign: "center", color: vue === "liste" ? "#3B6D11" : "#aaa" }}>
          <div style={{ fontSize: "1.2rem" }}>📋</div>
          <div style={{ fontSize: "0.65rem", fontWeight: vue === "liste" ? 600 : 400 }}>Liste</div>
        </button>
        <button onClick={() => setVue("carte")} style={{ background: "none", border: "none", cursor: "pointer", textAlign: "center", color: vue === "carte" ? "#3B6D11" : "#aaa" }}>
          <div style={{ fontSize: "1.2rem" }}>🗺️</div>
          <div style={{ fontSize: "0.65rem", fontWeight: vue === "carte" ? 600 : 400 }}>Carte</div>
        </button>
        <button onClick={() => setScanOuvert(true)} style={{ background: "none", border: "none", cursor: "pointer", textAlign: "center", color: scanOuvert ? "#3B6D11" : "#aaa" }}>
          <div style={{ fontSize: "1.2rem" }}>💊</div>
          <div style={{ fontSize: "0.65rem" }}>Ordonnance</div>
        </button>
        <button onClick={() => setFavorisOuvert(true)} style={{ background: "none", border: "none", cursor: "pointer", textAlign: "center", color: favorisOuvert ? "#3B6D11" : "#aaa" }}>
          <div style={{ fontSize: "1.2rem" }}>⭐</div>
          <div style={{ fontSize: "0.65rem", fontWeight: favorisOuvert ? 600 : 400 }}>Favoris</div>
        </button>
        <button onClick={() => setProfilOuvert(true)} style={{ background: "none", border: "none", cursor: "pointer", textAlign: "center", color: profilOuvert ? "#3B6D11" : "#aaa" }}>
          <div style={{ fontSize: "1.2rem" }}>👤</div>
          <div style={{ fontSize: "0.65rem", fontWeight: profilOuvert ? 600 : 400 }}>Profil</div>
        </button>
      </div>

    </div>
  );
}