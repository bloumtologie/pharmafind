const bcrypt = require("bcryptjs");
const pool = require("./db");

async function hasherMotsDePasse() {
  const utilisateurs = [
    { email: "admin@pharmafind.com", motDePasse: "admin123" },
    { email: "centrale@pharmafind.com", motDePasse: "pharma123" },
    { email: "patient@pharmafind.com", motDePasse: "patient123" },
  ];

  for (const u of utilisateurs) {
    const hash = await bcrypt.hash(u.motDePasse, 10);
    await pool.query(
      "UPDATE utilisateurs SET mot_de_passe = $1 WHERE email = $2",
      [hash, u.email]
    );
    console.log("✅ Mot de passe hashé pour : " + u.email);
  }

  console.log("🎉 Tous les mots de passe sont hashés !");
  process.exit();
}

hasherMotsDePasse();