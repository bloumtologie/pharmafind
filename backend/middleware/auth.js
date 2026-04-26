const jwt = require("jsonwebtoken");

const SECRET = "pharmafind_secret_2026";

// Vérifie le token JWT
const verifierToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token manquant ou invalide" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET);
    req.utilisateur = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token expiré ou invalide" });
  }
};

// Vérifie le rôle de l'utilisateur
const verifierRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.utilisateur.role)) {
      return res.status(403).json({
        message: "Accès refusé — rôle insuffisant"
      });
    }
    next();
  };
};

module.exports = { verifierToken, verifierRole, SECRET };