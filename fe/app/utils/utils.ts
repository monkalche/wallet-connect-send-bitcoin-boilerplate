export enum WalletTypes {
  UNISAT = "Unisat",
  XVERSE = "Xverse",
  HIRO = "Hiro",
  OKX = "Okx",
  MAGICEDEN ="Magic eden"
}

export const SIGN_MESSAGE = 'Welcome to RuneX!';
export const TEST_MODE = true;
export type Account = {
  address: string;
  publicKey: string;
  purpose: Purpose;
};
export type Purpose = 'payment' | 'ordinals';