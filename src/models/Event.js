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
    imageUrl: { type: String }, // Путь к изображению
    template: { type: String, default: "default" }, // Новое поле для выбранного шаблона
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
