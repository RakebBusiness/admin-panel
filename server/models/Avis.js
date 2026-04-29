const mongoose = require("mongoose");

const avisSchema = new mongoose.Schema({
  idClient: { type: String, required: true },
  idMotard: { type: String, required: true },
  idCourse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  note: { type: Number, required: true, min: 0, max: 5 },
  avisTextuel: { type: String, maxlength: 1000 },
});

module.exports = mongoose.model("Avis", avisSchema);
