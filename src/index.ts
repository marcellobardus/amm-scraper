import * as dotenv from "dotenv";
import { providers } from "ethers";
import * as Amqp from "amqp-ts";
import { createConnection } from "typeorm";

import { Account } from "./entities/Account";
import { Trade } from "./entities/Trade";
import { Price } from "./entities/Price";

import { NewBlockMessage } from "./types";
import { newBlockHandler } from "./workers/new-block-handler";
import { initializeRabbitMq } from "./utils/initializers/initialize-rabbitmq";
import { retrievePastSwaps } from "./workers/retrieve-past-swaps";
import { validateEnvs } from "./utils/initializers/validate-env";

var amqpConnection: Amqp.Connection;

async function main() {
  dotenv.config();
  validateEnvs();
  const connection = await createConnection({
    type: "postgres",
    url: process.env.DB_CONNECTION_URL,
    entities: [Account, Price, Trade],
    synchronize: true,
  });

  const { queue, connection: rabbitMqConnection } = await initializeRabbitMq();
  amqpConnection = rabbitMqConnection;

  const provider = new providers.JsonRpcProvider(process.env.NODE_HTTP_URL);

  queue.activateConsumer(async (message) => {
    const blockMessage: NewBlockMessage = JSON.parse(message.getContent());
    newBlockHandler(blockMessage, provider, connection);
    message.ack();
  });

  retrievePastSwaps(
    Number(process.env.RETRIEVE_PAST_SWAPS_SINCE_BLOCK!),
    provider,
    connection
  );
}

main().catch((err) => {
  amqpConnection.close();
  console.log(err);
});
