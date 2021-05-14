import axios from "axios";
import * as dotenv from "dotenv";
import { BigNumber } from "ethers";
import { Transaction, GetTransactionByHashJsonRpcResponse } from "../types";
dotenv.config();

export async function fetchBlockTxns(
  txnsHashes: string[],
  defaultChainId?: number,
  blockNumber?: number
): Promise<Transaction[]> {
  const batch: any[] = [];
  txnsHashes.forEach((hash, index) => {
    batch.push({
      jsonrpc: "2.0",
      method: "eth_getTransactionByHash",
      params: [hash],
      id: index,
    });
  });

  if (!batch.length) {
    return [];
  }

  const request = await axios.post(process.env.NODE_HTTP_URL!, batch);
  if (!request || !request.data) {
    throw new Error("Fetching failed");
  }
  const response: GetTransactionByHashJsonRpcResponse[] = request.data;

  if (!response) {
    throw new Error("Fetching failed");
  }

  return response
    .filter(
      (response) =>
        response &&
        response.result &&
        response.result.from &&
        response.result.to &&
        response.result.input
    )
    .map((jsonRpcResponse) => {
      const tx = jsonRpcResponse.result;
      return {
        from: tx.from,
        to: tx.to,
        data: tx.input,
        chainId: tx.chainId
          ? BigNumber.from(tx.chainId).toNumber()
          : defaultChainId
          ? defaultChainId
          : -1,
        hash: tx.hash,
        gasLimit: tx.gas,
        gasPrice: tx.gasPrice,
        nonce: BigNumber.from(tx.nonce).toNumber(),
        value: tx.value,
        blockNumber: BigNumber.from(
          blockNumber ? blockNumber : tx.blockNumber
        ).toNumber(),
        v: BigNumber.from(tx.v).toNumber(),
        r: tx.r,
        s: tx.s,
        confirmations: 1,
      };
    });
}
