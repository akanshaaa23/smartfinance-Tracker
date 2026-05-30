import mongoose from "mongoose";

const txSchema = new mongoose.Schema({
  username: { type: String, required: true },
  date: String,
  desc: String,
  amount: Number,
  type: { type: String, enum: ["income", "expense"] },
  category: String,
  recurring: Boolean
});

export default mongoose.model("Transaction", txSchema);
