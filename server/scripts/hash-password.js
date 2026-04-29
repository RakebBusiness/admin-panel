const bcrypt = require("bcryptjs");

// Script pour générer un mot de passe haché
const password = "mehdi123";
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error("Error hashing password:", err);
  } else {
    console.log("Password:", password);
    console.log("Hashed password:", hash);
  }
});
