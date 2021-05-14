import { BigNumberish, providers } from "ethers";

export interface DecodedSwap {
  amountIn: BigNumberish;
  amountOutMin: BigNumberish;
  path: string[];
  to: string;
  deadline: BigNumberish;
}

export interface TradeMatch {
  traderAddress: string;
  asset: string;
  positionOpeningDate: PositionStatusDetails;
  positionClosedDate: PositionStatusDetails;
  /**
   * (profit|loss) / amountIn.  Expressed in percents.
   */
  profitLossRatio: number;
  PNL: string;
}

export interface PositionStatusDetails {
  date: Date;
  txHash: string;
  blockNumber: number;
}

type PrimitiveKeys<T> = {
  [P in keyof T]: Exclude<T[P], undefined> extends object ? never : P;
}[keyof T];

type OnlyPrimitives<T> = Pick<T, PrimitiveKeys<T>>;

export type Transaction = OnlyPrimitives<providers.TransactionResponse>;

export interface NewBlockMessage {
  blockNumber: number;
  blockHash: string;
  transactions: Transaction[];
}

export interface JsonRpcReponseTransactionObject {
  blockHash: string;
  blockNumber: string;
  chainId: string;
  from: string;
  gas: string;
  gasPrice: string;
  hash: string;
  input: string;
  nonce: string;
  publicKey: string;
  r: string;
  raw: string;
  s: string;
  transactionIndex: string;
  v: string;
  value: string;
  to?: string;
}

export interface GetTransactionByHashJsonRpcResponse {
  jsonrpc: string;
  id: number;
  result: JsonRpcReponseTransactionObject;
}
