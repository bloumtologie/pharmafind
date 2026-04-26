const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const { verifierToken, verifierRole } = require("./middleware/auth");
const pool = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

// ROUTES AUTH
app.use("/api/auth", authRoutes);

const pharmacies = [
  {
    id: 1,
    nom: "Pharmacie Centrale",
    lat: 6.3654,
    lng: 2.4183,
    telephone: "+229 97 00 00 01",
    horaires: { ouverture: 7, fermeture: 21 },
    medicaments: ["Amoxicilline", "Paracétamol", "Ibuprofène"],
  },
  {
    id: 2,
    nom: "Pharmacie du Nord",
    lat: 6.3700,
    lng: 2.4150,
    telephone: "+229 97 00 00 02",
    horaires: { ouverture: 8, fermeture: 20 },
    medicaments: ["Paracétamol", "Doliprane", "Aspirine"],
  },
  {
    id: 3,
    nom: "Pharmacie Express",
    lat: 6.3600,
    lng: 2.4200,
    telephone: "+229 97 00 00 03",
    horaires: { ouverture: 0, fermeture: 24 },
    medicaments: ["Ibuprofène", "Amoxicilline", "Doliprane"],
  },
];

function estOuverte(horaires) {
  const heure = new Date().getHours();
  if (horaires.fermeture === 24) return true;
  return heure >= horaires.ouverture && heure < horaires.fermeture;
}

function formaterHoraires(horaires) {
  if (horaires.fermeture === 24) return "24h/24";
  return horaires.ouverture + "h - " + horaires.fermeture + "h";
}

// ROUTE PUBLIQUE — Toutes les pharmacies
app.get("/api/pharmacies", async (req, res) => {
  const { ouvert } = req.query;
  try {
    const result = await pool.query(`
      SELECT p.*,
        ARRAY_AGG(m.nom) as medicaments,
        CASE
          WHEN p.heure_fermeture = 24 THEN true
          WHEN EXTRACT(HOUR FROM NOW()) >= p.heure_ouverture
            AND EXTRACT(HOUR FROM NOW()) < p.heure_fermeture THEN true
          ELSE false
        END as ouvert,
        CASE
          WHEN p.heure_fermeture = 24 THEN '24h/24'
          ELSE p.heure_ouverture || 'h - ' || p.heure_fermeture || 'h'
        END as "horairesTexte"
      FROM pharmacies p
      LEFT JOIN stocks s ON s.pharmacie_id = p.id AND s.quantite > 0
      LEFT JOIN medicaments m ON m.id = s.medicament_id
      GROUP BY p.id
    `);

    let resultats = result.rows.map((p) => ({
      ...p,
      medicaments: p.medicaments.filter(Boolean),
    }));

    if (ouvert === "true") resultats = resultats.filter((p) => p.ouvert);
    res.json(resultats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ROUTE PUBLIQUE — Recherche par médicament
app.get("/api/pharmacies/recherche", async (req, res) => {
  const { medicament, ouvert } = req.query;
  try {
    const result = await pool.query(`
      SELECT p.*,
        ARRAY_AGG(m.nom) as medicaments,
        CASE
          WHEN p.heure_fermeture = 24 THEN true
          WHEN EXTRACT(HOUR FROM NOW()) >= p.heure_ouverture
            AND EXTRACT(HOUR FROM NOW()) < p.heure_fermeture THEN true
          ELSE false
        END as ouvert,
        CASE
          WHEN p.heure_fermeture = 24 THEN '24h/24'
          ELSE p.heure_ouverture || 'h - ' || p.heure_fermeture || 'h'
        END as "horairesTexte"
      FROM pharmacies p
      LEFT JOIN stocks s ON s.pharmacie_id = p.id AND s.quantite > 0
      LEFT JOIN medicaments m ON m.id = s.medicament_id
      ${medicament ? `WHERE p.id IN (
        SELECT DISTINCT s2.pharmacie_id FROM stocks s2
        JOIN medicaments m2 ON m2.id = s2.medicament_id
        WHERE LOWER(m2.nom) LIKE LOWER($1) AND s2.quantite > 0
      )` : ""}
      GROUP BY p.id
    `, medicament ? [`%${medicament}%`] : []);

    let resultats = result.rows.map((p) => ({
      ...p,
      medicaments: p.medicaments.filter(Boolean),
    }));

    if (ouvert === "true") resultats = resultats.filter((p) => p.ouvert);
    res.json(resultats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});


// ADMIN — Liste tous les utilisateurs
app.get("/api/admin/utilisateurs", verifierToken, verifierRole("admin"), async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, nom, email, role, telephone, statut, created_at FROM utilisateurs ORDER BY created_at DESC"
    );
    console.log("Utilisateurs trouvés:", result.rows.length);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ADMIN — Valider un utilisateur
app.put("/api/admin/utilisateurs/:id/valider", verifierToken, verifierRole("admin"), async (req, res) => {
  try {
    await pool.query("UPDATE utilisateurs SET statut = 'actif' WHERE id = $1", [req.params.id]);
    res.json({ message: "Utilisateur validé" });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ADMIN — Supprimer un utilisateur
app.delete("/api/admin/utilisateurs/:id", verifierToken, verifierRole("admin"), async (req, res) => {
  try {
    await pool.query("DELETE FROM utilisateurs WHERE id = $1 AND role != 'admin'", [req.params.id]);
    res.json({ message: "Utilisateur supprimé" });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ADMIN — Liste toutes les pharmacies
app.get("/api/admin/pharmacies", verifierToken, verifierRole("admin"), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, u.nom as pharmacien_nom
      FROM pharmacies p
      LEFT JOIN utilisateurs u ON u.id = p.pharmacien_id
      ORDER BY p.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ADMIN — Valider une pharmacie
app.put("/api/admin/pharmacies/:id/valider", verifierToken, verifierRole("admin"), async (req, res) => {
  try {
    await pool.query("UPDATE pharmacies SET valide = true WHERE id = $1", [req.params.id]);
    res.json({ message: "Pharmacie validée" });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ADMIN — Statistiques
app.get("/api/admin/stats", verifierToken, verifierRole("admin"), async (req, res) => {
  try {
    const users = await pool.query("SELECT COUNT(*) as total, role FROM utilisateurs GROUP BY role");
    const pharmacies = await pool.query("SELECT COUNT(*) as total, valide FROM pharmacies GROUP BY valide");
    const reservations = await pool.query("SELECT COUNT(*) as total, statut FROM reservations GROUP BY statut");
    const medicaments = await pool.query("SELECT COUNT(*) as total FROM medicaments");
    res.json({
      utilisateurs: users.rows,
      pharmacies: pharmacies.rows,
      reservations: reservations.rows,
      medicaments: medicaments.rows[0].total
    });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// PHARMACIEN — Son stock
app.get("/api/pharmacien/stock", verifierToken, verifierRole("pharmacien", "admin"), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.id, m.nom, m.categorie, s.quantite, s.prix, s.updated_at,
        p.id as pharmacie_id
      FROM stocks s
      JOIN medicaments m ON m.id = s.medicament_id
      JOIN pharmacies p ON p.id = s.pharmacie_id
      JOIN utilisateurs u ON u.id = p.pharmacien_id
      WHERE u.id = $1
      ORDER BY m.nom ASC
    `, [req.utilisateur.id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// PHARMACIEN — Mettre à jour stock
app.put("/api/pharmacien/stock/:id", verifierToken, verifierRole("pharmacien", "admin"), async (req, res) => {
  const { quantite, prix } = req.body;
  try {
    await pool.query(
      "UPDATE stocks SET quantite = $1, prix = $2, updated_at = NOW() WHERE id = $3",
      [quantite, prix, req.params.id]
    );
    res.json({ message: "Stock mis à jour" });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// PHARMACIEN — Ajouter médicament au stock
app.post("/api/pharmacien/stock", verifierToken, verifierRole("pharmacien", "admin"), async (req, res) => {
  const { nom, categorie, quantite, prix } = req.body;
  try {
    // Cherche ou crée le médicament
    let med = await pool.query("SELECT id FROM medicaments WHERE LOWER(nom) = LOWER($1)", [nom]);
    let medicamentId;

    if (med.rows.length === 0) {
      const newMed = await pool.query(
        "INSERT INTO medicaments (nom, categorie) VALUES ($1, $2) RETURNING id",
        [nom, categorie || "Autre"]
      );
      medicamentId = newMed.rows[0].id;
    } else {
      medicamentId = med.rows[0].id;
    }

    // Trouve la pharmacie du pharmacien
    const pharmacie = await pool.query(
      "SELECT id FROM pharmacies WHERE pharmacien_id = $1",
      [req.utilisateur.id]
    );

    if (pharmacie.rows.length === 0) {
      return res.status(404).json({ message: "Pharmacie non trouvée" });
    }

    const pharmacieId = pharmacie.rows[0].id;

    // Vérifie si le stock existe déjà
    const stockExiste = await pool.query(
      "SELECT id FROM stocks WHERE pharmacie_id = $1 AND medicament_id = $2",
      [pharmacieId, medicamentId]
    );

    if (stockExiste.rows.length > 0) {
      await pool.query(
        "UPDATE stocks SET quantite = quantite + $1, prix = $2, updated_at = NOW() WHERE pharmacie_id = $3 AND medicament_id = $4",
        [quantite, prix, pharmacieId, medicamentId]
      );
    } else {
      await pool.query(
        "INSERT INTO stocks (pharmacie_id, medicament_id, quantite, prix) VALUES ($1, $2, $3, $4)",
        [pharmacieId, medicamentId, quantite, prix]
      );
    }

    res.status(201).json({ message: "Médicament ajouté au stock" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// PHARMACIEN — Ses réservations
app.get("/api/pharmacien/reservations", verifierToken, verifierRole("pharmacien", "admin"), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.*, u.nom as patient_nom, u.telephone as patient_telephone,
        m.nom as medicament_nom, p.nom as pharmacie_nom
      FROM reservations r
      JOIN utilisateurs u ON u.id = r.patient_id
      JOIN medicaments m ON m.id = r.medicament_id
      JOIN pharmacies p ON p.id = r.pharmacie_id
      JOIN utilisateurs ph ON ph.id = p.pharmacien_id
      WHERE ph.id = $1
      ORDER BY r.created_at DESC
    `, [req.utilisateur.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// PHARMACIEN — Mettre à jour statut réservation
app.put("/api/pharmacien/reservations/:id", verifierToken, verifierRole("pharmacien", "admin"), async (req, res) => {
  const { statut } = req.body;
  try {
    await pool.query(
      "UPDATE reservations SET statut = $1 WHERE id = $2",
      [statut, req.params.id]
    );
    res.json({ message: "Réservation mise à jour" });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ROUTE TEST
app.get("/", (req, res) => {
  res.json({ message: "💊 PharmaFind API fonctionne !" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log("Serveur démarré sur http://localhost:" + PORT);
});