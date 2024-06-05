import { default as mongoose, Schema } from "mongoose";

const HistorySchema = new Schema(
  {
    walletType: { type: String, required: true },
    txId: { type: String, required: true },
    paymentAddress: { type: String, required: true },
    amountToTransfer: { type: String, required: true },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

export default mongoose.model("HistorySchema", HistorySchema);
