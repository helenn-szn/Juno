// Wallets and balances on Stellar testnet. Used by the server and scripts.
import { Asset, BASE_FEE, Horizon, Keypair, Networks, Operation, TransactionBuilder, xdr } from "@stellar/stellar-sdk";

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

// Signs and sends a transaction from `source`. Returns the transaction hash.
export async function submit(source: Keypair, ...ops: xdr.Operation[]) {
  const account = await horizon.loadAccount(source.publicKey());
  const tx = new TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase: Networks.TESTNET }).setTimeout(60);
  ops.forEach((op) => tx.addOperation(op));
  const built = tx.build();
  built.sign(source);
  return (await horizon.submitTransaction(built)).hash;
}

// Gets a wallet ready to use: free test XLM from Friendbot (pays network fees),
// then a USDC trustline (permission to hold USDC). Only does what's missing.
export async function openWallet(keypair: Keypair) {
  const address = keypair.publicKey();
  if (!(await horizon.loadAccount(address).catch(() => null))) {
    const res = await fetch(`https://friendbot.stellar.org?addr=${address}`);
    if (!res.ok) throw new Error(`Friendbot could not fund ${address} (${res.status})`);
  }
  const account = await horizon.loadAccount(address);
  const holdsUsdc = account.balances.some(
    (b) => "asset_code" in b && b.asset_code === USDC.code && b.asset_issuer === USDC.issuer,
  );
  if (!holdsUsdc) await submit(keypair, Operation.changeTrust({ asset: USDC }));
}
