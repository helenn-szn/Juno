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
2. Ada tells her study agent: "I'm stuck on my agent's first tool."
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

Out (fake or skip): mentor and sponsor logins (use a demo role switcher for them), real mentor matching (one demo mentor), full content for every course (only Build AI Agents is complete), mobile app, personal website builder.

## Tech plan

- Next.js (App Router) + TypeScript + Tailwind v4, deployed on Vercel
- UI components: **BoardUI** (React + Tailwind v4 + React Aria, source copied into the repo). Add components with `npx boardui add <component>` or through the BoardUI MCP server. Check BoardUI's docs for exact component names. Use BoardUI for buttons, inputs, cards, chat, tabs and charts before writing custom ones, and restyle them with our brand tokens. Don't add a second component library
- Routes: `/` landing page (built from `Landing.dc.html`), `/app` the app, `/verify/[id]` certificate check
- Stellar **testnet** only. Use `@stellar/stellar-sdk` and Horizon testnet
- x402 on Stellar: follow the official docs at https://developers.stellar.org/docs/build/agentic-payments/x402. We run the official `@x402/stellar` facilitator inside the app, and the juno wallet pays the network fees (the hosted Coinbase facilitator timed out and still charged the learner). Do not write verification/settlement code ourselves
- The mentor review is an API route protected by x402 (returns 402 with a price, accepts payment proof)
- The agent is an LLM call with tools: `suggestFreeResource`, `offerPaidHelp`, `payForService` (x402 client, only after user confirms), `checkBudget`
- Demo wallets (sponsor, learner, mentor, Juno issuer) are created and funded on testnet by a setup script. Secrets live in `.env.local`, never committed
- Keep state simple. Learner accounts: `data/users.json` locally, Upstash Redis on Vercel (`lib/users.ts` picks one from the environment). No heavy database
- AI (Juno.ai and, later, the study agent): Google Gemini on the free tier, through the Vercel AI SDK (`ai` + `@ai-sdk/google`). Use the newest Flash model on the free tier (check the model list and limits in Google AI Studio). Juno.ai gets two tools, `listCourses` and `getCourse`, reading the course file, and shows recommendations as clickable course cards. Stream replies. Key lives server-side in `GOOGLE_GENERATIVE_AI_API_KEY`. Handle rate-limit errors with a friendly "Juno.ai is busy, try again in a moment". Keep the provider in one file so it can be swapped later

Helpful: Stellar's agentic payments skill for Claude Code:
`npx skills add https://github.com/stellar/stellar-dev-skill --skill agentic-payments`

## The app: mobile-first

Design for a 390 px wide phone first, then let it widen gracefully on desktop (centre the app in a max 480 px column on large screens). Touch targets at least 44 px. Bottom tab bar for navigation. A small role switcher in the top bar (Learner / Mentor / Sponsor) replaces logins for the demo.

Every on-chain action shows a loading state, then a success chip with an explorer link, or a friendly error.

## Build order

1. Get one x402 payment working on testnet (the scary part first)
2. Wire the flow end to end, ugly is fine
3. Certificates and sponsor dashboard
4. Apply the brand
5. Demo polish, README, 2-minute video

## Screens (mobile first)

Design for a 390px-wide phone first, then scale up. On phones: a bottom tab bar per role. On desktop: the same screens in a centred column (max-width ~480px for learner/mentor, wider for the sponsor dashboard). Every tap target at least 44px. No horizontal scrolling.

App shell: header with the juno logo. Learners sign in; mentors and sponsors use a demo role switcher for now.

Routes: `/` landing, `/signup`, `/login`, `/app` dashboard, `/app/courses` all courses, `/app/courses/[slug]` details, `/app/courses/[slug]/learn`, `/app/learning` my learning. Planned: `/app/certificates`, `/app/wallet`, `/app/settings`, `/mentor`, `/sponsor`, public `/verify/[id]`.

**Learner flow (build this first):** Landing page → "Get started" → Create account → Dashboard → Course details → Start course. Returning learners: Landing page → Log in → Dashboard.

- **Create account**: name, email and password (or one simple auth provider), nothing else. On sign-up, create her Stellar testnet wallet automatically in the background; she never sees keys or blockchain words
- **Log in**: email and password
Build these from the designs `AppDashboard.dc.html` and `AppCourse.dc.html`.

- **Layout (both screens)**: left sidebar (logo; Dashboard, Courses, My learning, Certificates, Wallet, Settings; a purple "Find work on Stallion" card at the bottom), a top bar, a main column and a right column. On phones the sidebar becomes a bottom tab bar and the right column moves under the main column
- **Dashboard**: "Continue learning" cards with progress bars and "Resume course"; "Recommended for you" grid of course cards (coloured cover with an icon, title, level and module count). Right column: her name, learning wallet balance, her coin fan of skills minted, and two stat tiles (courses in progress, certificates)
- **Course details**: a large lesson player at the top (lesson title, module and lesson number, progress bar, play button), "About this course", and the current module's lessons (duration, title, status chip: Done / Watching / Hands-on / mentor review price). Right column: progress ring, "Continue learning" (or "Start course" if not started), the module list with done / current / not started / locked icons, and what she earns (skill coins, certificate)
- **Juno.ai**: a floating rectangle in the bottom-right corner on every app screen: bot avatar, "Juno.ai", close button, the greeting "Hello there, what can I help you with?", two suggestion chips, and a message input with a send button. Closed, it shrinks to a round bot button in the same corner. On phones it opens as a full-screen sheet. It answers questions about Juno and the courses and recommends courses; each recommendation is a course card that opens Course details. It only recommends real courses from the course file

Courses: **tech and AI only**, stored in a typed local file. Start with these six:
| Course | Level | Modules |
| --- | --- | --- |
| Build AI Agents (full demo course) | Intermediate | 7 |
| Prompt Engineering | Beginner | 5 |
| AI Foundations | Beginner | 6 |
| Python for Beginners | Beginner | 8 |
| Data Analysis with AI | Intermediate | 6 |
| Blockchain and Stellar Basics | Beginner | 5 |

Build AI Agents modules: What is an AI agent, Prompts and tools, Giving agents memory, Agents that pay (x402), Build your first agent, Testing and safety, Capstone: ship an agent. The other courses can have short placeholder lessons.

Later in the learner flow (after the above works):
- **Course in progress**: chat with the study agent. Suggests free resources first. Paid help appears as a card with the price and "Book review" / "Not now". After paying: a neon "Done! Mentor paid" chip with an explorer link
- **Skills**: the course's milestones; finished ones show their skill coin + explorer link
- **Profile**: wallet balance, certificates (view PDF, copy verify link), "Find work on Stallion" button, resume (stretch)

Mentor (tabs: Inbox, Earnings)
- **Inbox**: paid review requests; open one, write feedback, "Mark review done" (this records the skill coin)
- **Earnings**: payments received, each with an explorer link

Sponsor (tabs: Overview, Fund)
- **Overview**: learner's balance, total spent, what each payment bought, skills earned, certificates; every row links to the explorer
- **Fund**: top up the learner's wallet with testnet USDC

Public
- **/verify/[id]**: certificate verification page (the QR code points here): learner name, skill, date, mentor, and the Stellar record

Every screen needs: a loading state, an empty state, and a friendly error state (never a bare "—").

## Motion

Landing page scroll animation, kept subtle:
- Each section fades in and rises about 16px as it scrolls into view (≈500ms, ease-out), once only
- Cards inside a section stagger by about 80ms
- The hero coin fan's coins rise in one after another on page load, the purple centre coin last
- Use CSS plus a small IntersectionObserver hook (or CSS scroll-driven animations); no animation library
- Respect `prefers-reduced-motion`: show everything instantly
- Content must be visible without JavaScript (animate from a class added by JS, never hide by default in CSS)

- Nav links (header, mobile menu, footer) scroll smoothly to their section: `scroll-behavior: smooth` on `html`, plus `scroll-margin-top` on sections so headings aren't hidden. Off under `prefers-reduced-motion`

Landing page header on phones (under 760px): the links collapse into a three-line menu button (44px+ tap target, `aria-expanded`, `aria-controls`). Tapping it opens a full-width menu under the header with the three links and a full-width "Get started" button; the icon turns into an X. Tapping a link scrolls to its section and closes the menu. Escape also closes it.

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

Rules: no gradients. App screens use a white background with dark green (#004D43) cards as accents; text #183132, borders #E3EDE8, muted text #4A615E. The landing page stays dark. Radiant buttons with dark-green text. Neon only means "paid". Purple only means "new skill / proof".

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

- `app/page.tsx`: the landing page, built from `Landing.dc.html` (copy as written). `components/landing-header.tsx` is its header with the phone menu; `components/landing-motion.tsx` the scroll reveal
- `app/signup`, `app/login`, `app/actions.ts`: Create account, Log in, Log out, Start course (server actions). Signing up opens her testnet wallet in the background (`setUpWallet`)
- `app/app/layout.tsx`: the app frame (sidebar on desktop, tab bar on phones, Juno.ai in the corner). Screens: `page.tsx` Dashboard, `courses/` all courses with `?q=` search, `courses/[slug]` Course details, `courses/[slug]/learn` (where the study agent lands next), `learning/`, `certificates/`, `wallet/`, `settings/`
- `components/`: `top-bar` (title, search, account menu), `app-nav` (sidebar + tab bar), `course-card`, `continue-card`, `lesson-list`, `module-list`, `progress` (bar and ring), `coin-fan` (the logo, and her coins), `juno-chat` (the floating Juno.ai). `components/base/` is BoardUI
- `lib/courses.ts`: the six courses, typed (modules with an overview and free reading, lessons, progress helpers). `modulesDone` on a learner is how far she is; `lessonsDone` is the lessons ticked off in her current module. `completeLesson` (in `app/actions.ts`) updates both, and finishing the last module issues her certificate
- `lib/certificates.ts` (+ `certificate-pdf`, `certificate-qr`, `components/certificate-card.tsx`): certificates in Redis or `data/certificates.json` with a short random id, drawn as the Certificate.dc.html design on screen and as an A4 PDF (Geist fonts in `assets/fonts`, a real QR code to `/verify/[id]`). Issuing one sends a tiny Stellar transaction from the juno wallet with the id as its memo. Pages: `app/app/certificates`, `app/verify/[id]` (public), `app/api/certificates/[id]/pdf`
- `components/study-panel.tsx`: the study agent beside the lesson, foldable (a button on phones, a column on wide screens)
- `lib/profile.ts` + `lib/plan.ts` + `components/onboarding-form.tsx` + `app/app/onboarding`: before her first course she tells us what she knows, her goal and when she can study (a short form, or the same questions in Juno.ai, which saves them with its `saveProfile` tool). `startCourse` and the learn page send her there until she has. The answers order what we recommend, set a study plan with a finish date (`buildPlan`, shown by `components/plan-card.tsx`), and are passed to Juno.ai and the study agent
- `proxy.ts`: signed out → /app goes to Log in; signed in → Log in/Create account go to /app
- `lib/session.ts`: signed cookie. `lib/users.ts`: learners, in Redis when `UPSTASH_REDIS_REST_URL`/`KV_REST_API_URL` is set, else `data/users.json` (never committed)
- `lib/ai.ts`: the AI provider (Gemini, one line to swap). `lib/juno-ai.ts` + `app/api/juno-ai`: Juno.ai (streams; tools `listCourses` and `getCourse`; marks a recommendation as `[course:slug]`). Needs `GOOGLE_GENERATIVE_AI_API_KEY`
- `lib/study-agent.ts` + `app/api/study-agent` + `components/study-agent.tsx`: the study agent on `courses/[slug]/learn` (streams; tools `suggestFreeResource`, `offerPaidHelp`, `checkBudget`). It never pays: the offer card's Book review button calls `app/api/pay`
- `components/mentor-review.tsx`: step 1's pay button, unused now that the study agent has its own offer card
- `lib/constants.ts`: network, price, explorer links (safe in the browser)
- `lib/stellar.ts`: wallets and balances (server and scripts)
- `lib/x402.ts`: x402 seller, in-app facilitator (juno wallet pays fees; the hosted one timed out and still charged), and the learner's payer (`payForMentorReview`, the future `payForService` tool)
- `app/api/mentor-review`: the paid route (402 until paid)
- `app/api/pay`: the learner's agent pays for a review
- `scripts/setup.ts`, `scripts/pay.ts`: `npm run setup`, `npm run pay`
- `styles/juno.css`: the brand, applied as BoardUI tokens, plus the landing type styles (mirror new ones in `utils/cx.ts`). The only file with hex colours. App screens sit in `.app-light` (white page); the dark-green cards and the Juno.ai panel inside them carry `.on-dark` to get light text back. The landing page and the sign-up/log-in pages stay dark

UI rules for BoardUI: @AGENTS.md
