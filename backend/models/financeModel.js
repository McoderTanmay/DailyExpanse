import mongoose from "mongoose";

const financeSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    enum: ["Food", "Transport", "Entertainment", "Utilities", "Other"],
    default: "Other",
    required: true,
  },
  type: {
    type: String,
    enum: ["income", "expense"],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

const Finance = mongoose.model("Finance", financeSchema);
export default Finance;