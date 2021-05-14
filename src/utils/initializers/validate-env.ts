export function validateEnvs() {
  if (!process.env.CONTRACT_ADDRESS) {
    throw new Error("Contract address was not provided");
  }
  if (!process.env.NODE_HTTP_URL) {
    throw new Error("Http node url was not provided");
  }
  if (!process.env.RABBIT_MQ_URL)
    throw new Error("RABBIT_MQ_URL env is required");
  if (!process.env.RETRIEVE_PAST_SWAPS_SINCE_BLOCK)
    throw new Error("RETRIEVE_PAST_SWAPS_SINCE_BLOCK env is required");
  if (!process.env.DB_CONNECTION_URL)
    throw new Error("DB_CONNECTION_URL env is required");
}
