# Juno

A sponsored learning wallet for women. Sponsors fund it, an AI study agent spends it only when real help is needed (paying mentors per use with x402 on Stellar), and every finished skill is recorded on Stellar as proof.

Built solo for **EmpowerHer: Building the Agent Economy** (Nov 2–29, 2026). Demo Day at the end. The builder is a designer and vibe coder: explain technical choices in plain words, keep the code simple, and prefer working end-to-end over clever.

## Principles (apply to every decision)

The bar is Linear's website and Apple Notes: simple purpose, simple architecture, simple design, simple implementation.

- Show the product. A real balance, a real chat card, a real coin explain more than a sentence.
- Build the landing page exactly from `Landing.dc.html`, keeping its copy as written.
- Every decision must improve the user experience (UX), developer experience (DX) and agent experience (AX) at once, without breaking anything.
  - UX: one primary action per screen, obvious next step, fast, responsive at every width.
  - DX: few files, plain names, no clever abstractions, one way to do each thing.
  - AX: semantic HTML, real buttons and links, accessible names, stable IDs and routes, clean JSON APIs, so AI agents can read and use Juno too.
- Primary button label everywhere: "Get started" (not "Launch app").

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

- Next.js (App Router) + TypeScript + Tailwind v4, deployed on Vercel
- UI components: **BoardUI** (React + Tailwind v4 + React Aria, source copied into the repo). Add components with `npx boardui add <component>` or through the BoardUI MCP server. Check BoardUI's docs for exact component names. Use BoardUI for buttons, inputs, cards, chat, tabs and charts before writing custom ones, and restyle them with our brand tokens. Don't add a second component library
- Routes: `/` landing page (built from `Landing.dc.html`), `/app` the app, `/verify/[id]` certificate check
- Stellar **testnet** only. Use `@stellar/stellar-sdk` and Horizon testnet
- x402 on Stellar: follow the official docs at https://developers.stellar.org/docs/build/agentic-payments/x402 and use a facilitator (Coinbase x402 facilitator or the OpenZeppelin Relayer x402 plugin). Do not build verification/settlement ourselves
- The mentor review is an API route protected by x402 (returns 402 with a price, accepts payment proof)
- The agent is an LLM call with tools: `suggestFreeResource`, `offerPaidHelp`, `payForService` (x402 client, only after user confirms), `checkBudget`
- Demo wallets (sponsor, learner, mentor, Juno issuer) are created and funded on testnet by a setup script. Secrets live in `.env.local`, never committed
- Keep state simple (a JSON file or SQLite) — no heavy database

Helpful: Stellar's agentic payments skill for Claude Code:
`npx skills add https://github.com/stellar/stellar-dev-skill --skill agentic-payments`

## The app: mobile-first

Design for a 390 px wide phone first, then let it widen gracefully on desktop (centre the app in a max 480 px column on large screens). Touch targets at least 44 px. Bottom tab bar for navigation. A small role switcher in the top bar (Learner / Mentor / Sponsor) replaces logins for the demo.

Screens:

Learner (default role)
- **Home** `/`: greeting, learning wallet card (balance in USDC, "funded by your sponsor"), "Ask your study agent" button, skill fan progress (coins earned out of 5), recent activity chips
- **Agent** `/agent`: chat with the study agent. Flow: free resource first → if still stuck, an offer card ("A mentor review costs 0.50 USDC. Book it?" with Book / Not now) → x402 payment → neon "Done! Mentor paid." chip with explorer link
- **Skills** `/skills`: the fan with earned coins, each coin opens its milestone and explorer link; certificate card when the track is done; "Find work on Stallion" button
- **Certificate** `/certificate/[id]`: printable certificate with name, skill, mentor, date, QR code; download as PDF
- **Verify** `/verify/[id]`: public page anyone can open from the QR to check the certificate against Stellar

Mentor
- **Inbox** `/mentor`: review requests (paid ones only), earnings total, "Mark review done" → records the skill coin on Stellar

Sponsor
- **Dashboard** `/sponsor`: "Fund Ada's wallet" button, learner balance, list of payments (what, amount, explorer link), skills earned

Every on-chain action shows a loading state, then a success chip with an explorer link, or a friendly error.

## Build order

1. Get one x402 payment working on testnet (the scary part first)
2. Wire the flow end to end, ugly is fine
3. Certificates and sponsor dashboard
4. Apply the brand
5. Demo polish, README, 2-minute video

## Screens (mobile first)

Design for a 390px-wide phone first, then scale up. On phones: a bottom tab bar per role. On desktop: the same screens in a centred column (max-width ~480px for learner/mentor, wider for the sponsor dashboard). Every tap target at least 44px. No horizontal scrolling.

App shell: header with the juno logo + a role switcher (Learner / Mentor / Sponsor) instead of logins.

Learner (tabs: Home, Agent, Skills, Profile)
- **Home**: learning wallet balance, "Ask your study agent" button, her fan progress (coins earned out of 5), recent activity chips
- **Agent**: chat with the study agent. Suggests free resources first. Paid help appears as a card with the price and "Book review" / "Not now". After paying: a neon "Done! Mentor paid" chip with an explorer link
- **Skills**: the logo design track as 5 milestones; finished ones show their skill coin + explorer link
- **Profile**: certificates (view PDF, copy verify link), "Find work on Stallion" button, resume (stretch)

Mentor (tabs: Inbox, Earnings)
- **Inbox**: paid review requests; open one, write feedback, "Mark review done" (this records the skill coin)
- **Earnings**: payments received, each with an explorer link

Sponsor (tabs: Overview, Fund)
- **Overview**: learner's balance, total spent, what each payment bought, skills earned, certificates; every row links to the explorer
- **Fund**: top up the learner's wallet with testnet USDC

Public
- **/verify/[id]**: certificate verification page (the QR code points here): learner name, skill, date, mentor, and the Stellar record

Every screen needs: a loading state, an empty state, and a friendly error state (never a bare "—").

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
