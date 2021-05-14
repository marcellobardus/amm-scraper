import * as Amqp from "amqp-ts";

export async function initializeRabbitMq(): Promise<{
  connection: Amqp.Connection;
  queue: Amqp.Queue;
}> {
  const amqpAppId = "NewBlockMessagesBroker";

  const connection = new Amqp.Connection(process.env.RABBIT_MQ_URL);
  const amqpExchange = new Amqp.Exchange(connection, amqpAppId + "Exchange");
  const queue = new Amqp.Queue(connection, amqpAppId + "Queue");
  await connection.completeConfiguration();
  queue.bind(amqpExchange);

  return { queue, connection };
}
