import { default as mongoose, Schema } from "mongoose";

const WalletSchema = new Schema(
  {
    paymentAddress: { type: String, required: true },
    paymentPublicKey: { type: String, required: true },
    ordinalAddress: { type: String, required: true },
    ordinalPublicKey: { type: String, required: true },
    walletType: { type: String, required: true },
    hash: { type: String, required: true },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

export default mongoose.model("WalletSchema", WalletSchema);
