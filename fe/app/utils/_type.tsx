export type OrdinalProps = {
  id: number;
  owner: string;
  inscriptionId: string;
  name: string;
  img?: string;
  tickets: number;
  leftTickets: number;
};

export type RaffleProps = {
  _id: string;
  createTime: number;
  created_at: string;
  creatorOrdinalAddress: string;
  creatorPaymentAddress: string;
  endTime: number;
  ordinalInscription: string;
  status: number;
  ticketAmounts: number;
  ticketList: string[];
  ticketPrice: number;
  updated_at: string;
  walletType: string;
  winner: string;
};

export interface IErr {
  destination: string,
  amountToTransfer: string,
}
