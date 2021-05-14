import { NewBlockMessage } from "../../types";
import { BigNumber as BigNumberEthers, providers } from "ethers";
import { METHOD_IDENTIFERS } from "../../constants";
import { fetchTxnsReceipts } from "../fetch-txns-receipts";
import { decodeSwap } from "../decode-swap";
import { Trade } from "../../entities/Trade";
import { Price } from "../../entities/Price";
import { getPairReserves } from "../get-pair-reserves";
import BigNumber from "bignumber.js";
import { Account } from "../../entities/Account";
import { Connection } from "typeorm";

export async function blockMessageHandler(
  blockMessage: NewBlockMessage,
  provider: providers.Provider,
  connection: Connection
) {
  console.log(`Processing block n. ${blockMessage.blockNumber}`);

  const txns = blockMessage.transactions;

  const routerInteractionTxns = txns.filter(
    (tx) =>
      tx.to?.toLocaleLowerCase() ===
      process.env.CONTRACT_ADDRESS.toLocaleLowerCase()
  );

  const tokenPerTokenSwapTxns = routerInteractionTxns.filter((tx) => {
    const identifier = tx.data.slice(0, 10);
    return (
      identifier.toLocaleLowerCase() ===
      METHOD_IDENTIFERS.SWAP_EXACT_TOKENS_FOR_TOKENS
    );
  });

  // Reject reverted txns.
  const txnsReceipts = await fetchTxnsReceipts(
    tokenPerTokenSwapTxns.map((tx) => tx.hash)
  );

  const tokenPerTokenSwapTxnsWithNoReverts = tokenPerTokenSwapTxns.filter(
    (tx) => {
      const txReceipt = txnsReceipts.find(
        (receipt) => receipt?.transactionHash.toLocaleLowerCase() === tx.hash
      );
      return BigNumberEthers.from(txReceipt?.status).eq(1);
    }
  );

  const swapsTxns = tokenPerTokenSwapTxnsWithNoReverts.map((tx) => ({
    swap: decodeSwap(tx.data),
    txHash: tx.hash,
    blockNumber: tx.blockNumber,
  }));

  const tradesEntities: Trade[] = [];

  // asset0 + asset1 => Price
  const prices: Record<string, Price> = {};

  for (const swapTx of swapsTxns) {
    const assetIn = swapTx.swap.path[0].toLocaleLowerCase();
    const assetOut = swapTx.swap.path[
      swapTx.swap.path.length - 1
    ].toLocaleLowerCase();
    if (!prices[assetIn + assetOut]) {
      const price = new Price();
      price.asset0 = assetIn;
      price.asset1 = assetOut;
      price.blockNumber = blockMessage.blockNumber;

      const reserves = await getPairReserves(
        price.asset0,
        price.asset1,
        provider,
        blockMessage.blockHash
      );

      if (!reserves) continue;

      const { reserve0, reserve1 } = reserves;

      price.price = new BigNumber(reserve1.toString())
        .div(new BigNumber(reserve0.toString()))
        .toString();

      prices[price.asset0 + price.asset1] = price;
      // Populate in inverside side
      prices[price.asset1 + price.asset0] = price;
    }

    const trade = new Trade();
    trade.assetIn = swapTx.swap.path[0].toLocaleLowerCase();
    trade.assetOut = swapTx.swap.path[
      swapTx.swap.path.length - 1
    ].toLocaleLowerCase();
    trade.amountIn = BigNumberEthers.from(swapTx.swap.amountIn).toHexString();
    trade.amountOut = BigNumberEthers.from(
      swapTx.swap.amountOutMin
    ).toHexString();
    trade.txHash = swapTx.txHash.toLocaleLowerCase();
    trade.blockNumber = swapTx.blockNumber;
    trade.price = prices[assetIn + assetOut];
    trade.account = (() => {
      const account = new Account();
      account.address = swapTx.swap.to.toLocaleLowerCase();
      return account;
    })();
    if (
      swapTx.swap.path.length < 2 ||
      swapTx.swap.path[0] === swapTx.swap.path[swapTx.swap.path.length - 1]
    ) {
      // console.error("Skipping invalid path");
    } else tradesEntities.push(trade);
  }

  await connection.manager.save(Trade, tradesEntities);
  console.log(
    `Saved ${tradesEntities.length} pancakeswap trades during block n. ${blockMessage.blockNumber}`
  );
}
