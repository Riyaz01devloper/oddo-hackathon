const mongoose = require("mongoose");

const maintenanceSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
      index: true,
    },

    issue: {
      type: String,
      required: true,
      trim: true,
    },

    cost: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["InShop", "Closed"],
      default: "InShop",
      required: true,
      index: true,
    },

    openedAt: {
      type: Date,
      default: Date.now,
    },

    closedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

maintenanceSchema.index({ vehicle: 1, status: 1 });
maintenanceSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Maintenance", maintenanceSchema);