const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  idClient: { type: String, required: true },
  idMotard: { type: String, required: true },
  pointDepart: { type: String, required: true },
  pointArrivee: { type: String, required: true },
  dateHeure: { type: Date, required: true },
  etat: {
    type: String,
    enum: ["réservée", "annulée", "en_cours", "completée"],
    required: true,
  },
  prix: { type: Number, required: true },
});

module.exports = mongoose.model("Course", courseSchema);
