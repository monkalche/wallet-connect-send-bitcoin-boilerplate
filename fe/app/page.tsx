"use client";

import { useContext, useRef, useState } from "react";

import Notiflix from "notiflix";
import { sendBtcTransaction } from 'sats-connect'
import { BitcoinNetworkType } from "sats-connect";

import { validate, Network } from 'bitcoin-address-validation';

import WalletContext from "./contexts/WalletContext";
import { Account, TEST_MODE, WalletTypes } from "./utils/utils";
import { IErr } from "./utils/_type";
import Link from "next/link";

import { useWallet, useWallets } from '@wallet-standard/react';
import type { Wallet, WalletWithFeatures } from '@wallet-standard/base';

import { writeHistory } from "./controller";
import { ConnectionStatusContext } from "./contexts/ConnectContext";

const network = TEST_MODE ? Network.testnet : Network.mainnet;
const SatsConnectNamespace = 'sats-connect:';

function isSatsConnectCompatibleWallet(wallet: Wallet) {
  return SatsConnectNamespace in wallet.features;
}

export default function Page() {

  const destinationRef = useRef(null);
  const amountToTransferRef = useRef(null);
  const feeRateRef = useRef(null);

  const [err, setErr] = useState<IErr>();
  const [transactionID, setTransactionID] = useState('');

  const{ wallets }=useWallets();
  const { wallet, setWallet } = useWallet();

  const connectionStatus = useContext(ConnectionStatusContext);

  const {
    walletType,
    ordinalAddress,
    paymentAddress,
  } = useContext(WalletContext);

  const isConnected = Boolean(ordinalAddress);

  const unisatSendBTC = async (destination: string, amount: number) => {
    try {
      const txId = await (window as any).unisat.sendBitcoin(destination, amount);
      setTransactionID(txId);
      
      const result = await writeHistory(
        paymentAddress,
        amount,
        txId,
        walletType
      )

      Notiflix.Notify.success("Sent successfully");

    } catch (error) {
      console.log(error)
    }
  }

  const xverseSendBTC = async (destination: string, amount: number) => {
    try{
      const sendBtcOptions = {
        payload: {
          network: {
            type: BitcoinNetworkType.Testnet,
          },
          recipients: [
            {
              address: destination,
              amountSats: BigInt(amount),
            },
          ],
          senderAddress: paymentAddress,
        },
        onFinish: (response: any) => {
          Notiflix.Notify.success("Sent successfully");
        },
        onCancel: () => Notiflix.Notify.warning("Canceled"),
      };
  
      await sendBtcTransaction(sendBtcOptions);
    }catch(error){
      console.log(error)
    }
    
  }

  const MEsendBtc = async (destination: string, amount: number) => {
    for (const wallet of wallets.filter(isSatsConnectCompatibleWallet)) {
      setWallet(wallet)
    }
    console.log('ordinals address ==>', ordinalAddress)
    console.log('payment address ==>', paymentAddress)
    console.log('destination address ==>', destination)
    console.log('amount ==>', amount)
    const sendBtcOptions = {
      getProvider: async () =>
          (wallet as unknown as WalletWithFeatures<any>).features[SatsConnectNamespace]?.provider,
      payload: {
        network: {
          type: BitcoinNetworkType.Mainnet,
        },
        recipients: [
          {
            address: destination!,
            amountSats: BigInt(amount),
          },
        ],
        senderAddress: paymentAddress,
      },
      onFinish: (response: any) => {
        connectionStatus?.setAccounts(response.addresses as unknown as Account[]);
      },
      onCancel: () => Notiflix.Notify.warning("Canceled"),
    };

    await sendBtcTransaction(sendBtcOptions);
  }

  const onChangeHandler = () => {
    setErr({
      destination: '',
      amountToTransfer: '',
    });
  }

  const onSubmit = async () => {
    try {
      let errFlag = false;
      let tempError: IErr = {
        destination: '',
        amountToTransfer: '',
      };

      let destinationAddress = '';
      let amountToTransfer = '';

      if (destinationRef.current) {
        destinationAddress = destinationRef.current['value'];
      }

      if (amountToTransferRef.current) {
        amountToTransfer = amountToTransferRef.current['value'];
        console.log("amountToTransfer ==>", amountToTransfer);
        console.log("amountToTransferRef.current['value'] ==>", amountToTransferRef.current['value']);
      }

      if (!amountToTransfer) {
        tempError.amountToTransfer = 'AmountToTransfer is required'; errFlag = true;
      }

      if (amountToTransfer && parseInt(amountToTransfer) < 1000) {
        tempError.amountToTransfer = 'AmountToTransfer should be over 1000 sats'; errFlag = true;
      }

      let feeRate = '';

      if (feeRateRef.current) {
        feeRate = feeRateRef.current['value'];
      }

      // Verify Step

      if (!destinationAddress) {
        tempError.destination = 'Destination address is required';
        errFlag = true;
      } else {
        if (!validate(destinationAddress)) {
          tempError.destination = 'Destination address is invalid';
          errFlag = true;
        } else {
          // if (!validate(destinationAddress, network)) {
          //   tempError.destination = `Destination address is ${TEST_MODE ? 'Mainnet address' : 'Testnet address'}`;
          //   errFlag = true;
          // }
        }
      }

      console.log("tempError ==>", tempError)

      if (errFlag) {
        setErr(tempError);
        return;
      }

      if (walletType == WalletTypes.UNISAT) await unisatSendBTC(destinationAddress, parseInt(amountToTransfer));
      else if (walletType == WalletTypes.XVERSE) await xverseSendBTC(destinationAddress, parseInt(amountToTransfer));
      else if(walletType == WalletTypes.MAGICEDEN) await MEsendBtc(destinationAddress, parseInt(amountToTransfer));

    } catch (error) {
      console.log("submit ==> ", error);
    }
  }

  return (
    <div className="p-2">
      {isConnected ? <></> : (
        <div className="flex flex-col gap-2 justify-center items-center">
          Plz connect wallet first
        </div>
      )}
      {isConnected && (
        <div className="mt-10">
          <div className="flex items-center justify-between pt-4">
            <div className="flex flex-col gap-2 bg-[#191D24] mx-auto border-2 min-[640px]:w-[500px] max-[640px]:w-[450px] border-solid border-[#252B35] rounded-xl p-6 ">
              <div className="flex flex-row justify-center px-4 py-5">
                <h3 className="text-[24px]  font-bold font-manrope text-white leading-8">Send</h3>
              </div>
              <div className="flex flex-col">
                <div className="flex flex-col gap-4">

                  <div className="flex flex-col gap-1">
                    <label className="font-manrope text-[14px] font-normal leading-6 text-[#637592]" >Destination Address</label>
                    <input
                      name="destinationAddress"
                      className="bg-[#16171B] rounded-xl px-4 py-3 gap-2 placeholder:text-gray-600 text-white focus:outline-none "
                      placeholder="ex. 3Eb9zqd..."
                      ref={destinationRef}
                      onChange={() => onChangeHandler()}
                    />
                    {err ? <p className="text-red-600">{err.destination}</p> : <></>}
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-manrope text-[14px] leading-6 font-normal text-[#637592]">
                      Amount to transfer
                    </label>
                    <input
                      className="bg-[#16171B] rounded-xl px-4 py-3 gap-2 text-[#637592] focus:outline-none placeholder:text-gray-600"
                      name="amounttoTransfer"
                      placeholder="3000"
                      ref={amountToTransferRef}
                      onChange={() => onChangeHandler()}
                    />
                    {err ? <p className="text-red-600">{err.amountToTransfer}</p> : <></>}
                  </div>
                </div>

                <button
                  className="bg-[#21262F] rounded-xl px-6 py-3 w-full hover:bg-[#21263E] mt-4"
                  type="submit"
                  onClick={() => onSubmit()}
                >
                  <p className="text-white font-manrope text-[14px] font-semibold leading-6 ">Submit</p>
                </button>
                {
                  transactionID ?
                    <Link href={`https://mempool.space/testnet/tx/${transactionID}`} />
                    : <></>
                }
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
