# Juno

A sponsored learning wallet for women. Sponsors fund it, an AI study agent spends it only when real help is needed (paying mentors per use with x402 on Stellar), and every finished skill is recorded on Stellar as proof.

Built solo for **EmpowerHer: Building the Agent Economy** (Nov 2–29, 2026). Demo Day at the end. The builder is a designer and vibe coder: explain technical choices in plain words, keep the code simple, and prefer working end-to-end over clever.

## The demo story (build toward this)

1. A sponsor funds Ada's learning wallet with 20 testnet USDC.
2. Ada tells her study agent: "I'm stuck on my logo design."
3. The agent suggests a free resource first (a video link).
4. Ada is still stuck. The agent offers a mentor review for 0.50 USDC and asks before paying.
5. Ada agrees. The agent pays via x402. The mentor is paid in seconds.
6. The mentor marks the review done. A skill coin (milestone) is recorded on Stellar.
7. When the track is complete, Juno issues a certificate: a PDF with a QR code linking to the Stellar record.
8. A "Find work on Stallion" button appears (link out to https://stallion.so for now).
9. The sponsor view shows every payment, what it bought and the skills earned, each linked to the Stellar testnet explorer.

## MVP scope

In:
- Sponsor funds learner wallet (testnet USDC)
- Agent chat with a budget limit; asks before every payment
- One paid service behind x402: mentor review
- Instant mentor payout
- Skill coin recorded on Stellar (a transaction with a memo is fine; no custom contract needed)
- Certificate PDF + QR verification link
- "Find work on Stallion" link
- Sponsor dashboard
- Explorer links for every transaction

Stretch: resume filled from a Juno-provided template.

Out (fake or skip): logins (use a role switcher: Sponsor / Learner / Mentor), real mentor matching (one demo mentor), multiple skills (one track: logo design), mobile app, personal website builder.

## Tech plan

- Next.js (App Router) + TypeScript + Tailwind, deployed on Vercel
- Stellar **testnet** only. Use `@stellar/stellar-sdk` and Horizon testnet
- x402 on Stellar: follow the official docs at https://developers.stellar.org/docs/build/agentic-payments/x402 and use a facilitator (Coinbase x402 facilitator or the OpenZeppelin Relayer x402 plugin). Do not build verification/settlement ourselves
- The mentor review is an API route protected by x402 (returns 402 with a price, accepts payment proof)
- The agent is an LLM call with tools: `suggestFreeResource`, `offerPaidHelp`, `payForService` (x402 client, only after user confirms), `checkBudget`
- Demo wallets (sponsor, learner, mentor, Juno issuer) are created and funded on testnet by a setup script. Secrets live in `.env.local`, never committed
- Keep state simple (a JSON file or SQLite) — no heavy database

Helpful: Stellar's agentic payments skill for Claude Code:
`npx skills add https://github.com/stellar/stellar-dev-skill --skill agentic-payments`

## Build order

1. Get one x402 payment working on testnet (the scary part first)
2. Wire the flow end to end, ugly is fine
3. Certificates and sponsor dashboard
4. Apply the brand
5. Demo polish, README, 2-minute video

## Brand

Name: **juno** (always lowercase in the wordmark). Tagline: "Where women mint their skills." Supporting line: "Learn. Prove. Rise."

Logo: the coin fan — five 3D coins fanned like a peacock tail on stems from one base coin. The centre coin is the "newest coin" and is always a different colour (purple on dark).

Colours:
| Token | Hex | Use |
| --- | --- | --- |
| dark-green | #183132 | App background |
| green | #004D43 | Cards, surfaces |
| radiant | #D0FF71 | Main accent: logo, primary buttons, key words |
| neon | #27EAA6 | Payment confirmed / success |
| purple | #8F93FF | Newest coin, new skill, proof/explorer |
| mint | #EBFFF5 | Text on dark, light backgrounds |

Rules: no gradients. Dark mode by default. Radiant buttons with dark-green text. Neon only means "paid". Purple only means "new skill / proof".

Font: Geist (Google Fonts) — Medium for headings and wordmark, Regular for body. (Aeonik is the intended final font if licensed.)

Voice: the proud mentor. Warm, plain, celebrating.
- "Done! Mentor paid. Your review is on its way." (not "Transaction confirmed")
- "Your wallet is running low. Ask your sponsor for a top-up?" (not "Insufficient funds")
- "Skill minted. That's yours forever." (not "Milestone achieved")

## Working rules

- Testnet only. Never ask for or use real funds or mainnet keys
- Never commit secrets; keep `.env.example` up to date
- Every on-chain action shows a Stellar explorer link in the UI
- The agent must always ask the learner before spending
- After each step, tell the builder how to run and check it in plain words

## Code map

- `lib/constants.ts`: network, price, explorer links (safe in the browser)
- `lib/stellar.ts`: wallets and balances (server and scripts)
- `lib/x402.ts`: x402 seller, in-app facilitator (juno wallet pays fees; the hosted one timed out and still charged), and the learner's payer (`payForMentorReview`, the future `payForService` tool)
- `app/api/mentor-review`: the paid route (402 until paid)
- `app/api/pay`: the learner's agent pays for a review
- `scripts/setup.ts`, `scripts/pay.ts`: `npm run setup`, `npm run pay`
- `styles/juno.css`: the brand, applied as BoardUI tokens

UI rules for BoardUI: @AGENTS.md
