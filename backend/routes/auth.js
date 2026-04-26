const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { SECRET } = require("../middleware/auth");
const pool = require("../db");

const router = express.Router();

// INSCRIPTION
router.post("/inscription", async (req, res) => {
  const { nom, email, motDePasse, role, telephone } = req.body;

  if (!nom || !email || !motDePasse || !role) {
    return res.status(400).json({ message: "Tous les champs sont obligatoires" });
  }

  const roles_autorises = ["patient", "pharmacien"];
  if (!roles_autorises.includes(role)) {
    return res.status(400).json({ message: "Rôle invalide" });
  }

  try {
    const existe = await pool.query("SELECT id FROM utilisateurs WHERE email = $1", [email]);
    if (existe.rows.length > 0) {
      return res.status(400).json({ message: "Email déjà utilisé" });
    }

    const hash = await bcrypt.hash(motDePasse, 10);
    const result = await pool.query(
      "INSERT INTO utilisateurs (nom, email, mot_de_passe, role, telephone) VALUES ($1, $2, $3, $4, $5) RETURNING id, nom, email, role",
      [nom, email, hash, role, telephone || ""]
    );

    const utilisateur = result.rows[0];
    const token = jwt.sign(
      { id: utilisateur.id, nom: utilisateur.nom, email: utilisateur.email, role: utilisateur.role },
      SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({ message: "Inscription réussie", token, utilisateur });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// CONNEXION
router.post("/connexion", async (req, res) => {
  const { email, motDePasse } = req.body;

  if (!email || !motDePasse) {
    return res.status(400).json({ message: "Email et mot de passe requis" });
  }

  try {
    const result = await pool.query("SELECT * FROM utilisateurs WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }

    const utilisateur = result.rows[0];
    const valide = await bcrypt.compare(motDePasse, utilisateur.mot_de_passe);
    if (!valide) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }

    const token = jwt.sign(
      { id: utilisateur.id, nom: utilisateur.nom, email: utilisateur.email, role: utilisateur.role },
      SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Connexion réussie",
      token,
      utilisateur: { id: utilisateur.id, nom: utilisateur.nom, email: utilisateur.email, role: utilisateur.role }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// MISE À JOUR PROFIL
router.put("/profil", require("../middleware/auth").verifierToken, async (req, res) => {
  const { nom, telephone, ville } = req.body;
  try {
    await pool.query(
      "UPDATE utilisateurs SET nom = $1, telephone = $2 WHERE id = $3",
      [nom, telephone, req.utilisateur.id]
    );
    res.json({ message: "Profil mis à jour" });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// PROFIL
router.get("/profil", require("../middleware/auth").verifierToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, nom, email, role, telephone, created_at FROM utilisateurs WHERE id = $1",
      [req.utilisateur.id]
    );
    res.json({ utilisateur: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;