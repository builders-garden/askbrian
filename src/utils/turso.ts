import { createClient } from "@libsql/client";
import { env } from "../env.js";
import { TransactionResult } from "@brian-ai/sdk";
import { TransactionsDataType } from "./types.js";

export const turso = createClient({
  url: env.TURSO_DATABASE_URL,
  authToken: env.TURSO_AUTH_TOKEN,
});

type BrianRequest = {
  status: string;
  errorMessage?: string;
  cast?: {
    hash: string;
    text: string;
    author: {
      custody_address: string;
      verified_addresses: {
        eth_addresses: string[];
      };
    };
  };
  brianInput?: {
    originWallet: string;
    prompt: string;
  };
  brianResponse?: TransactionResult[];
  frameData?: TransactionsDataType;
  redisOperationId?: string;
};

export const createBrianRequestsTable = async () => {
  await turso.execute({
    sql: `CREATE TABLE IF NOT EXISTS askbrian_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      status TEXT NOT NULL,
      error_message TEXT,
      cast_hash TEXT,
      cast_text TEXT,
      cast_author_custody_address TEXT,
      cast_author_verified_eth_addresses TEXT,
      brian_input_origin_wallet TEXT,
      brian_input_prompt TEXT,
      brian_response TEXT,
      frame_data TEXT,
      redis_operation_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    args: [],
  });
};

export const saveBrianRequest = async (brianRequest: BrianRequest) => {
  // create the table if it doesn't exist
  await createBrianRequestsTable();

  // insert the request into the table
  await turso.execute({
    sql: `INSERT INTO askbrian_requests (
      status,
      error_message,
      cast_hash,
      cast_text,
      cast_author_custody_address,
      cast_author_verified_eth_addresses,
      brian_input_origin_wallet,
      brian_input_prompt,
      brian_response,
      frame_data,
      redis_operation_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      brianRequest.status,
      brianRequest.errorMessage || null,
      brianRequest.cast?.hash || null,
      brianRequest.cast?.text || null,
      brianRequest.cast?.author?.custody_address || null,
      JSON.stringify(
        brianRequest.cast?.author?.verified_addresses?.eth_addresses || []
      ),
      brianRequest.brianInput?.originWallet || null,
      brianRequest.brianInput?.prompt || null,
      JSON.stringify(brianRequest.brianResponse || null),
      JSON.stringify(brianRequest.frameData || null),
      brianRequest.redisOperationId || null,
    ],
  });
};
