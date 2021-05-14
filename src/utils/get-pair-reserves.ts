import { providers, Contract, BigNumber, constants } from "ethers";

const routerAbi = `[{"inputs":[],"name":"factory","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}]`;
const factoryAbi = `[{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"getPair","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"}]`;
const pairAbi = `[{"constant":true,"inputs":[],"name":"getReserves","outputs":[{"internalType":"uint112","name":"_reserve0","type":"uint112"},{"internalType":"uint112","name":"_reserve1","type":"uint112"},{"internalType":"uint32","name":"_blockTimestampLast","type":"uint32"}],"payable":false,"stateMutability":"view","type":"function"}]`;

export async function getPairReserves(
  asset0: string,
  asset1: string,
  provider: providers.Provider,
  blockTag?: string
): Promise<{ reserve0: BigNumber; reserve1: BigNumber }> {
  const router = new Contract(
    process.env.CONTRACT_ADDRESS,
    routerAbi,
    provider
  );
  const factory = new Contract(await router.factory(), factoryAbi, provider);
  const pairAddress = await factory.getPair(asset0, asset1, { blockTag });
  if (pairAddress === constants.AddressZero) {
    return;
  }
  const pair = new Contract(pairAddress, pairAbi, provider);
  const { _reserve0, _reserve1 } = await pair.getReserves({ blockTag });
  return {
    reserve0: BigNumber.from(_reserve0),
    reserve1: BigNumber.from(_reserve1),
  };
}
