// npm run setup
//
// Creates the demo wallets on Stellar testnet and gets Ada's wallet ready:
//   1. Sponsor, learner (Ada), mentor and juno wallets, plus a session secret, saved to .env.local
//   2. Free test XLM from Friendbot (pays the tiny network fees)
//   3. A USDC trustline on each wallet (permission to hold USDC)
//   4. The sponsor buys test USDC on the testnet exchange and sends Ada 20
//
// Safe to run again: it keeps existing wallets and only does what's missing.
import fs from "node:fs";
import crypto from "node:crypto";
import { Asset, Keypair, Operation } from "@stellar/stellar-sdk";
import { explorer } from "../lib/constants";
import { ROLES, USDC, horizon, openWallet, submit, usdcBalance, type Role } from "../lib/stellar";

const ENV_FILE = ".env.local";
const LEARNER_START_BALANCE = 20;

if (fs.existsSync(ENV_FILE)) process.loadEnvFile(ENV_FILE);

async function main() {
  // 1. Wallets
  const wallets = {} as Record<Role, Keypair>;
  for (const role of ROLES) {
    const secret = process.env[`${role.toUpperCase()}_SECRET`];
    wallets[role] = secret ? Keypair.fromSecret(secret) : Keypair.random();
  }
  // Keep anything else already in .env.local (e.g. GOOGLE_GENERATIVE_AI_API_KEY).
  const env = new Map(
    (fs.existsSync(ENV_FILE) ? fs.readFileSync(ENV_FILE, "utf8") : "")
      .split("\n").filter((line) => line.includes("=")).map((line) => [line.slice(0, line.indexOf("=")), line.slice(line.indexOf("=") + 1)]),
  );
  for (const role of ROLES) env.set(`${role.toUpperCase()}_SECRET`, wallets[role].secret());
  if (!env.get("SESSION_SECRET")) env.set("SESSION_SECRET", crypto.randomBytes(32).toString("hex"));
  fs.writeFileSync(ENV_FILE, [...env].map(([key, value]) => `${key}=${value}`).join("\n") + "\n");

  // 2 + 3. Friendbot and trustlines
  for (const role of ROLES) await openWallet(wallets[role]);

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
