// Wallets and balances on Stellar testnet. Used by the server and scripts.
import { Asset, BASE_FEE, Horizon, Keypair, Memo, Networks, Operation, TransactionBuilder, xdr } from "@stellar/stellar-sdk";

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
export const submit = (source: Keypair, ...ops: xdr.Operation[]) => submitWithMemo(source, undefined, ...ops);

// The same, with a short text note (a memo, at most 28 characters) stored with the transaction.
export async function submitWithMemo(source: Keypair, memo: string | undefined, ...ops: xdr.Operation[]) {
  const account = await horizon.loadAccount(source.publicKey());
  const tx = new TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase: Networks.TESTNET }).setTimeout(60);
  if (memo) tx.addMemo(Memo.text(memo));
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

// A brand-new wallet may not exist on the network yet; that counts as 0.
export async function usdcBalanceOrZero(address: string): Promise<number> {
  try {
    return await usdcBalance(address);
  } catch {
    return 0;
  }
}

// Sends USDC from one wallet to another. Returns the transaction hash.
export const sendUsdc = (from: Keypair, to: string, amount: number) =>
  submit(from, Operation.payment({ destination: to, asset: USDC, amount: amount.toFixed(7) }));

// Buys testnet USDC with the wallet's free test XLM on Stellar's built-in exchange.
// This is how a sponsor "tops up" on the test network. Returns the transaction hash.
export async function buyUsdc(wallet: Keypair, amount: number) {
  const quote = await horizon.strictReceivePaths([Asset.native()], USDC, amount.toFixed(7)).call();
  if (!quote.records.length) throw new Error("no-liquidity");
  const sendMax = (Number(quote.records[0].source_amount) * 1.1).toFixed(7);
  return submit(
    wallet,
    Operation.pathPaymentStrictReceive({
      sendAsset: Asset.native(),
      sendMax,
      destination: wallet.publicKey(),
      destAsset: USDC,
      destAmount: amount.toFixed(7),
      path: [],
    }),
  );
}
