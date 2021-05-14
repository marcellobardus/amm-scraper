import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config();

interface EventLog {
  address: string;
  blockHash: string;
  blockNumber: string;
  data: string;
  logIndex: string;
  removed: boolean;
  topics: string[];
  transactionHash: string;
  transactionIndex: string;
  transactionLogIndex: string;
  type: "mined";
}

interface JsonRpcTransactionReceiptResponse {
  blockHash: string;
  blockNumber: string;
  cumulativeGasUsed: string;
  from: string;
  gasUsed: string;
  logs: EventLog[];
  logsBloom: string;
  status: string;
  to: string;
  transactionHash: string;
  transactionIndex: string;
}

interface GetTransactionReceiptJsonRpcResponse {
  jsonrpc: string;
  id: number;
  result: JsonRpcTransactionReceiptResponse;
}

export async function fetchTxnsReceipts(
  txnsHashes: string[]
): Promise<JsonRpcTransactionReceiptResponse[]> {
  const batch: any = [];
  txnsHashes.forEach((hash, index) => {
    batch.push({
      jsonrpc: "2.0",
      method: "eth_getTransactionReceipt",
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
  const response: GetTransactionReceiptJsonRpcResponse[] = request.data;

  if (!response) {
    throw new Error("Fetching failed");
  }

  return response
    .filter((receipt) => receipt !== (null || undefined))
    .map((jsonRpcResponse) => jsonRpcResponse.result);
}
