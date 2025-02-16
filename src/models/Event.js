const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Храним голоса за время проведения. Ключ – время (строка), значение – количество голосов.
    timeVotes: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Виртуальное поле для удобства
eventSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

module.exports = mongoose.model("Event", eventSchema);
