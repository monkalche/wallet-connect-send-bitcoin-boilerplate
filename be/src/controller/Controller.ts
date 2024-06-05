import * as Bitcoin from "bitcoinjs-lib";
import * as ecc from "tiny-secp256k1";
import { Request, Response } from "express";
import historyModel from "../model/historyModel";
import walletModel from "../model/walletModel";
import Joi from 'joi';
import mongoose from "mongoose";

Bitcoin.initEccLib(ecc);

const historySchema = Joi.object({
  walletType: Joi.string().required(),
  txId: Joi.string().required(),
  paymentAddress: Joi.string().required(),
  amountToTransfer: Joi.string().required()
});
const walletSchema = Joi.object({
  paymentAddress: Joi.string().required(),
  paymentPublicKey: Joi.string().required(),
  ordinalAddress: Joi.string().required(),
  ordinalPublicKey: Joi.string().required(),
  walletType: Joi.string().required(),
  hash: Joi.string().required(),
});


export const writeHistory = async (req: Request, res: Response) => {
  const { error, value } = historySchema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, error: error.details[0].message });
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { walletType, txId, paymentAddress, amountToTransfer } = value;

    console.log("writeHistory req.body ==>", req.body);

    const existingHistory = await historyModel.findOne({
      walletType,
      txId,
      paymentAddress,
      amountToTransfer,
    }, { session: session });

    if (existingHistory) {
      return res.status(409).json({
        success: false,
        error: 'This history entry already exists',
      });
    }

    const newHistory = new historyModel(value);
    await newHistory.save({ session });
    await session.commitTransaction();
    return res.status(200).json({ success: true, payload: newHistory });
  } catch (error) {
    console.error("Write History Error: ", error);
    await session.abortTransaction();
    return res.status(500).json({ success: false, error: 'Internal server error' });
  } finally {
    session.endSession();
  }
};



export const walletConnect = async (req: Request, res: Response) => {
  const { error, value } = walletSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, error: error.details[0].message });
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const {
      paymentAddress,
      paymentPublicKey,
      ordinalAddress,
      ordinalPublicKey,
      walletType,
      hash
    } = value;

    console.log("walletConnect req.body ==>", req.body);

    const walletExist = await walletModel.findOne({
      paymentAddress,
      paymentPublicKey,
      ordinalAddress,
      ordinalPublicKey,
      walletType,
    });

    if (walletExist) {
      const message = walletExist.hash === hash ? "Signed successfully." : "Hash mismatch.";
      const status = walletExist.hash === hash ? 200 : 422;
      return res.status(status).json({
        success: walletExist.hash === hash,
        payload: walletExist,
        message
      });
    }

    const newWallet = new walletModel(value);
    await newWallet.save({ session });
    await session.commitTransaction();
    return res.status(201).json({
      success: true,
      payload: newWallet,
      message: "New user is stored successfully!"
    });
  } catch (error) {
    console.error("Wallet Connect Error: ", error);
    await session.abortTransaction();
    return res.status(500).json({ success: false });
  } finally {
    session.endSession();
  }
};
