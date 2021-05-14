import { NewBlockMessage } from "../types";
import { providers } from "ethers";
import { blockMessageHandler } from "../utils/handlers/block-handler";
import { Connection } from "typeorm";

export async function newBlockHandler(
  blockMessage: NewBlockMessage,
  provider: providers.Provider,
  connection: Connection
) {
  await blockMessageHandler(blockMessage, provider, connection);
}
