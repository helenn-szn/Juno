// npm run pay
//
// Pays for one mentor review from the terminal, no browser needed.
// Start the app first (npm run dev), then run this in a second terminal.
import { explorer } from "../lib/constants";
import { usdcBalance, wallet } from "../lib/stellar";

process.loadEnvFile(".env.local");
const url = process.argv[2] ?? "http://localhost:3000/api/pay";

async function balances() {
  const [ada, mentor] = await Promise.all(
    (["learner", "mentor"] as const).map((r) => usdcBalance(wallet(r)!.publicKey())),
  );
  return `Ada ${ada.toFixed(2)} USDC · Mentor ${mentor.toFixed(2)} USDC`;
}

async function main() {
  console.log(`Before  ${await balances()}`);
  const payment = await (await fetch(url, { method: "POST" })).json();
  if (!payment.ok) throw new Error(`Payment didn't go through (${payment.reason})`);
  console.log(`After   ${await balances()}`);
  console.log(`\n${payment.review.message}\n${explorer.tx(payment.transaction)}`);
}

main().catch((err) => {
  console.error(err.cause?.code === "ECONNREFUSED" ? "Start the app first: npm run dev" : err.message);
  process.exit(1);
});
