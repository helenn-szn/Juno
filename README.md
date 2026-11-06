# juno

A sponsored learning wallet. Ada's agent pays mentors per use with x402 on Stellar testnet.

## Run it

```bash
npm install
npm run setup   # creates 4 testnet wallets and gives Ada 20 USDC
npm run dev     # http://localhost:3000
```

The landing page is at `/`. Press **Get started** and create an account. Her testnet wallet is made for her in the background. Pick a course, or tap **Ask Juno.ai**.

Juno.ai needs an Anthropic key in `.env.local` (`ANTHROPIC_API_KEY=...`). Without one it says it can't answer.

The 0.50 USDC mentor payment from step 1 still works from the terminal (below). Its button returns inside a course.

## Check it from the terminal

```bash
curl -i http://localhost:3000/api/mentor-review   # 402 Payment Required: the price tag
npm run pay                                        # pays it, prints balances and the explorer link
```

`npm run setup` is safe to re-run. It keeps the same wallets and tops Ada back up to 20 USDC.

## How a payment works

1. Ada's agent asks `/api/mentor-review`. It answers **402** with the price and the mentor's address.
2. The agent signs a 0.50 USDC payment from Ada's wallet.
3. The official x402 facilitator (running inside Juno) checks it and puts it on Stellar. The juno wallet pays the network fee.
4. The route answers **200** and the mentor already has the money.
