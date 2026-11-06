// npm run setup
//
// Creates the demo wallets on Stellar testnet and gets Ada's wallet ready:
//   1. Sponsor, learner (Ada), mentor and juno wallets, saved to .env.local
//   2. Free test XLM from Friendbot (pays the tiny network fees)
//   3. A USDC trustline on each wallet (permission to hold USDC)
//   4. The sponsor buys test USDC on the testnet exchange and sends Ada 20
//
// Safe to run again: it keeps existing wallets and only does what's missing.
import fs from "node:fs";
import { Asset, BASE_FEE, Keypair, Networks, Operation, TransactionBuilder, xdr } from "@stellar/stellar-sdk";
import { explorer } from "../lib/constants";
import { ROLES, USDC, horizon, usdcBalance, type Role } from "../lib/stellar";

const ENV_FILE = ".env.local";
const LEARNER_START_BALANCE = 20;

if (fs.existsSync(ENV_FILE)) process.loadEnvFile(ENV_FILE);

async function exists(address: string) {
  try {
    await horizon.loadAccount(address);
    return true;
  } catch {
    return false;
  }
}

async function submit(source: Keypair, ...ops: xdr.Operation[]) {
  const account = await horizon.loadAccount(source.publicKey());
  const tx = new TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase: Networks.TESTNET })
    .setTimeout(60);
  ops.forEach((op) => tx.addOperation(op));
  const built = tx.build();
  built.sign(source);
  const result = await horizon.submitTransaction(built);
  return result.hash;
}

async function hasTrustline(address: string) {
  const account = await horizon.loadAccount(address);
  return account.balances.some((b) => "asset_code" in b && b.asset_code === USDC.code && b.asset_issuer === USDC.issuer);
}

async function main() {
  // 1. Wallets
  const wallets = {} as Record<Role, Keypair>;
  for (const role of ROLES) {
    const secret = process.env[`${role.toUpperCase()}_SECRET`];
    wallets[role] = secret ? Keypair.fromSecret(secret) : Keypair.random();
  }
  fs.writeFileSync(
    ENV_FILE,
    ROLES.map((r) => `${r.toUpperCase()}_SECRET=${wallets[r].secret()}`).join("\n") + "\n",
  );

  // 2 + 3. Friendbot and trustlines
  for (const role of ROLES) {
    const kp = wallets[role];
    if (!(await exists(kp.publicKey()))) {
      const res = await fetch(`https://friendbot.stellar.org?addr=${kp.publicKey()}`);
      if (!res.ok) throw new Error(`Friendbot could not fund the ${role} wallet (${res.status})`);
    }
    if (!(await hasTrustline(kp.publicKey()))) {
      await submit(kp, Operation.changeTrust({ asset: USDC }));
    }
  }

  // 4. Fund Ada up to 20 USDC
  const { sponsor, learner } = wallets;
  const missing = +(LEARNER_START_BALANCE - (await usdcBalance(learner.publicKey()))).toFixed(7);
  if (missing > 0) {
    const sponsorHas = await usdcBalance(sponsor.publicKey());
    if (sponsorHas < missing) {
      const buy = (missing - sponsorHas).toFixed(7);
      const quote = await horizon.strictReceivePaths([Asset.native()], USDC, buy).call();
      if (!quote.records.length) throw new Error("No one is selling test USDC right now. Try https://faucet.circle.com");
      const sendMax = (Number(quote.records[0].source_amount) * 1.1).toFixed(7);
      const hash = await submit(
        sponsor,
        Operation.pathPaymentStrictReceive({
          sendAsset: Asset.native(), sendMax, destination: sponsor.publicKey(), destAsset: USDC, destAmount: buy, path: [],
        }),
      );
      console.log(`Sponsor bought ${Number(buy).toFixed(2)} USDC   ${explorer.tx(hash)}`);
    }
    const hash = await submit(
      sponsor,
      Operation.payment({ destination: learner.publicKey(), asset: USDC, amount: missing.toFixed(7) }),
    );
    console.log(`Sponsor sent Ada ${missing.toFixed(2)} USDC ${explorer.tx(hash)}`);
  }

  console.log("");
  for (const role of ROLES) {
    const address = wallets[role].publicKey();
    console.log(`${role.padEnd(8)} ${(await usdcBalance(address)).toFixed(2).padStart(6)} USDC   ${explorer.account(address)}`);
  }
  console.log(`\nSaved to ${ENV_FILE}. Next: npm run dev`);
}

main().catch((err) => {
  console.error(err?.response?.data?.extras?.result_codes ?? err.message ?? err);
  process.exit(1);
});
