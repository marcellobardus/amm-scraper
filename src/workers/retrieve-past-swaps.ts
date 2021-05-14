import { providers } from "ethers";
import { Connection } from "typeorm";
import { fetchBlockTxns } from "../utils/fetch-block-txns";
import { blockMessageHandler } from "../utils/handlers/block-handler";

export async function retrievePastSwaps(
  fromBlock: number,
  provider: providers.Provider,
  connection: Connection
) {
  const currentBlock = await provider.getBlockNumber();
  const network = await provider.getNetwork();

  const promises: Promise<void>[] = [];

  for (let i = currentBlock; i > fromBlock; i--) {
    console.log("Retrieving data from past block n.", i);
    promises.push(
      new Promise(async () => {
        const block = await provider.getBlock(i);
        console.log(
          `Processing past block: ${block.number}, hash: ${block.hash}`
        );
        const transactions = await fetchBlockTxns(
          block.transactions,
          network.chainId,
          i
        );
        await blockMessageHandler(
          {
            blockNumber: block.number,
            blockHash: block.hash,
            transactions,
          },
          provider,
          connection
        );
        console.log(`Data from block: ${i} retrieved`);
      })
    );
  }

  await Promise.allSettled(promises);
}
