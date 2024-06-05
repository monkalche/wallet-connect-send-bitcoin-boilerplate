"use client";
import React, { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar, NavbarContent, NavbarItem, Button, Modal, ModalContent, ModalHeader, ModalBody, useDisclosure } from "@nextui-org/react";
import {
  AddressPurpose,
  BitcoinNetworkType,
  getAddress,
  signMessage,
} from "sats-connect";
import { verifyMessage } from "@unisat/wallet-utils";
import { type BtcAddress } from "@btckit/types";
import Notiflix from "notiflix";
import WalletConnectIcon from "./Icon/WalletConnectIcon";
import WalletContext from "../contexts/WalletContext";
import { WalletTypes, Account, SIGN_MESSAGE } from "../utils/utils";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as bitcoin from 'bitcoinjs-lib';
import type { Wallet, WalletWithFeatures } from '@wallet-standard/base';
import { useWallet, useWallets } from '@wallet-standard/react';
import { ConnectionStatusContext } from '../contexts/ConnectContext';
import { walletConnect } from "../controller";
const SatsConnectNamespace = 'sats-connect:';


function isSatsConnectCompatibleWallet(wallet: Wallet) {
  return SatsConnectNamespace in wallet.features;
}
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [pageIndex, setPageIndex] = React.useState(-1);
  const router = useRouter();
  const gotoPage = (route: string, index: number) => {
    console.log('pageIndex ==> ', index);
    setPageIndex(index);
    router.push(route);
  };

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [open, setOpen] = useState(false);
  const onCloseModal = () => setOpen(false);
  // const { wallet, setWallet } = useWallet();
  const { wallets } = useWallets();
  const [hash, setHash] = useState('');

  const connectionStatus = useContext(ConnectionStatusContext);
  const nativeSegwitAddress = connectionStatus?.accounts[1]?.address;

  const [wallet, setWallet] = useState<any | null>(null);
  const [triggerFetch, setTriggerFetch] = useState(0);

  const {
    walletType,
    ordinalAddress,
    paymentAddress,
    ordinalPublicKey,
    paymentPublicKey,
    setWalletType,
    setOrdinalAddress,
    setPaymentAddress,
    setPaymentPublicKey,
    setOrdinalPublicKey,
  } = useContext(WalletContext);

  const isConnected = Boolean(ordinalAddress);

  const unisatConnectWallet = async () => {
    const currentWindow: any = window;
    if (typeof currentWindow?.unisat !== "undefined") {
      const unisat: any = currentWindow?.unisat;
      try {
        let accounts: string[] = await unisat.requestAccounts();
        let pubkey = await unisat.getPublicKey();

        let res = await unisat.signMessage(SIGN_MESSAGE);
        setHash(res);
        console.log("res ==> ", res);

        const tempWalletType = WalletTypes.UNISAT;
        const tempOrdinalAddress = accounts[0];
        const tempPaymentAddress = accounts[0];
        const tempOrdinalPublicKey = pubkey;
        const tempPaymentPublicKey = pubkey;

        const savedHash = await walletConnect(
          tempPaymentAddress,
          tempPaymentPublicKey,
          tempOrdinalAddress,
          tempOrdinalPublicKey,
          tempWalletType,
          res
        )

        if (savedHash.success) {
          Notiflix.Notify.success("Connect succes!");
          setWalletType(WalletTypes.UNISAT);
          setOrdinalAddress(accounts[0] || "");
          setPaymentAddress(accounts[0] || "");
          setOrdinalPublicKey(pubkey);
          setPaymentPublicKey(pubkey);

          onClose();
        } else {
          Notiflix.Notify.failure("No match hash!");
        }

        console.log("savedHash ==> ", savedHash);

        // const message = "abcdefghijk123456789";
        // const signature = "G+LrYa7T5dUMDgQduAErw+i6ebK4GqTXYVWIDM+snYk7Yc6LdPitmaqM6j+iJOeID1CsMXOJFpVopvPiHBdulkE=";

        // const result = verifyMessage(pubkey, message, signature);
        // console.log("result ==> ", result);


      } catch (e) {
        Notiflix.Notify.failure("Connect failed!");
      }
    }
  };

  const xverseConnectWallet = async () => {
    await getAddress({
      payload: {
        purposes: [
          AddressPurpose.Ordinals,
          AddressPurpose.Payment,
          AddressPurpose.Stacks,
        ],
        message: "Welcome RuneX",
        network: {
          type: BitcoinNetworkType.Testnet,
        },
      },
      onFinish: async (response) => {
        const paymentAddressItem = response.addresses.find(
          (address) => address.purpose === AddressPurpose.Payment
        );
        const ordinalsAddressItem = response.addresses.find(
          (address) => address.purpose === AddressPurpose.Ordinals
        );

        let tempWalletType = WalletTypes.XVERSE;
        let tempOrdinalAddress = ordinalsAddressItem?.address as string;
        let tempPaymentAddress = paymentAddressItem?.address as string;
        let tempOrdinalPublicKey = ordinalsAddressItem?.publicKey as string;
        let tempPaymentPublicKey = paymentAddressItem?.publicKey as string;

        let res = ''
        await signMessage({
          payload: {
            network: {
              type: BitcoinNetworkType.Testnet,
            },
            address: paymentAddressItem?.address as string,
            message: "Sign in RuneX",
          },
          onFinish: (response: any) => {
            // signature
            res = response;
            return response;
          },
          onCancel: () => alert("Canceled"),
        });
        console.log("savedHash ==>", res);

        const savedHash = await walletConnect(
          tempPaymentAddress,
          tempPaymentPublicKey,
          tempOrdinalAddress,
          tempOrdinalPublicKey,
          tempWalletType,
          res
        )

        if (savedHash.success) {
          Notiflix.Notify.success("Connect succes!");
          setWalletType(WalletTypes.XVERSE);
          setPaymentAddress(paymentAddressItem?.address as string);
          setPaymentPublicKey(paymentAddressItem?.publicKey as string);
          setOrdinalAddress(ordinalsAddressItem?.address as string);
          setOrdinalPublicKey(ordinalsAddressItem?.publicKey as string);

          onClose();
        } else {
          Notiflix.Notify.failure("No match hash!");
        }


      },
      onCancel: () => alert("Request canceled"),
    });
  };

  const meconnect = () => {
    const compatibleWallet = wallets.find(isSatsConnectCompatibleWallet);
    if (compatibleWallet) {
      setWallet(compatibleWallet);
      setTriggerFetch(prev => prev + 1);
    } else {
      console.error("No compatible wallet found.");
      toast.error("No compatible wallet found.");
    }
  };
  useEffect(() => {
    if (wallet && triggerFetch) {
      console.log("Wallet has been set, now doing something with it...");
      // Perform actions that depend on the wallet being set
      try {
        getAddress({
          getProvider: async () => (wallet as unknown as WalletWithFeatures<any>).features[SatsConnectNamespace]?.provider,
          payload: {
            purposes: [AddressPurpose.Ordinals, AddressPurpose.Payment],
            message: 'Address for receiving Ordinals and payments',
            network: {
              type: BitcoinNetworkType.Mainnet,
            },
          },
          onFinish: async (response) => {
            console.log("Operation successful:", response);
            connectionStatus?.setAccounts(response.addresses as unknown as Account[]);

            let tempWalletType = WalletTypes.MAGICEDEN;
            let tempOrdinalAddress = response.addresses[0].address as string;
            let tempPaymentAddress = response.addresses[1].address as string;
            let tempOrdinalPublicKey = response.addresses[0].publicKey as string;
            let tempPaymentPublicKey = response.addresses[1].publicKey as string;

            let res = '';

            await signMessage({
              getProvider: async () => (wallet as unknown as WalletWithFeatures<any>).features[SatsConnectNamespace]?.provider,
              payload: {
                network: {
                  type: BitcoinNetworkType.Mainnet,
                },
                address: tempPaymentAddress!,
                message: "Welcome to RuneX",
              },
              onFinish: (response) => {
                res = response;
              },
              onCancel: () => {
                alert("Request canceled");
              },
            });

            const savedHash = await walletConnect(
              tempPaymentAddress,
              tempPaymentPublicKey,
              tempOrdinalAddress,
              tempOrdinalPublicKey,
              tempWalletType,
              res
            )

            console.log("savedHash.success ==> ", savedHash)

            if (savedHash.success) {
              Notiflix.Notify.success("Connect success with ME!");
              setOrdinalAddress(response.addresses[0].address);
              setOrdinalPublicKey(response.addresses[0].publicKey);
              setPaymentAddress(response.addresses[1].address);
              setPaymentPublicKey(response.addresses[1].publicKey);
              setWalletType(WalletTypes.MAGICEDEN);
              onClose();
            } else {
              Notiflix.Notify.info("Not match hash");
            }
          },
          onCancel: () => {
            toast.error("You cancelled the operation");
          },
        });
      } catch (err) {
        console.error("Error while trying to use wallet:", err);
        Notiflix.Notify.success("Connect failure!");
      }
    }
  }, [wallet, triggerFetch])

  useEffect(() => {
    if (ordinalAddress) {
      onClose();
    }
  }, [ordinalAddress])

  return (
    <div className="p-3 flex gap-3">
      <Navbar
        isMenuOpen={isMenuOpen}
        onMenuOpenChange={setIsMenuOpen}
        maxWidth="full"
      >
        <NavbarContent justify="end" className="gap-10">
          <NavbarItem>
            <Button
              color="warning"
              variant="flat"
              onPress={() => onOpen()}
              className="capitalize"
            >
              <WalletConnectIcon />
              {paymentAddress ? <p className="truncate w-28">{paymentAddress}</p> : 'Connect Wallet'}
            </Button>
          </NavbarItem>
        </NavbarContent>
      </Navbar>
      <Modal
        backdrop='blur'
        isOpen={isOpen}
        onClose={onClose}
        motionProps={{
          variants: {
            enter: {
              y: 0,
              opacity: 1,
              transition: {
                duration: 0.3,
                ease: "easeOut",
              },
            },
            exit: {
              y: -20,
              opacity: 0,
              transition: {
                duration: 0.2,
                ease: "easeIn",
              },
            }
          }
        }}
        classNames={{
          body: "py-6",
          backdrop: "bg-[#292f46]/50 backdrop-opacity-40",
          base: "border-[#292f46] bg-[#19172c] dark:bg-[#19172c] text-[#a8b0d3]",
          header: "border-b-[1px] border-[#292f46]",
          footer: "border-t-[1px] border-[#292f46]",
          closeButton: "hover:bg-white/5 active:bg-white/10",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-center">Connect Wallet</ModalHeader>
              <ModalBody>
                <div className="p-2 pb-10">
                  <div className="flex flex-col gap-5 justify-center items-center">
                    <Button onClick={() => unisatConnectWallet()} color="primary" variant="bordered" className="w-[200px]">
                      Unisat Wallet Connect
                    </Button>
                    <Button onClick={() => xverseConnectWallet()} color="secondary" variant="bordered" className="w-[200px]">
                      XVerse Wallet Connect
                    </Button>
                    <Button onClick={() => meconnect()} color="danger" variant="bordered" className="w-[200px]">
                      ME Wallet Connect
                    </Button>
                  </div>
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </div >
  );
};

export default Header;
