// Wallets and balances on Stellar testnet. Used by the server and scripts.
import { Asset, Horizon, Keypair } from "@stellar/stellar-sdk";

export const horizon = new Horizon.Server("https://horizon-testnet.stellar.org");

// Circle's testnet USDC. Each wallet needs a "trustline" (permission to hold it).
export const USDC = new Asset("USDC", "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5");

// juno is the app's own wallet: it pays the network fees when settling payments.
export type Role = "sponsor" | "learner" | "mentor" | "juno";
export const ROLES: Role[] = ["sponsor", "learner", "mentor", "juno"];

// Secrets live in .env.local (written by `npm run setup`), e.g. LEARNER_SECRET=S...
export function wallet(role: Role): Keypair | null {
  const secret = process.env[`${role.toUpperCase()}_SECRET`];
  return secret ? Keypair.fromSecret(secret) : null;
}

export async function usdcBalance(address: string): Promise<number> {
  const account = await horizon.loadAccount(address);
  const line = account.balances.find(
    (b) => "asset_code" in b && b.asset_code === USDC.code && b.asset_issuer === USDC.issuer,
  );
  return line ? Number(line.balance) : 0;
}
