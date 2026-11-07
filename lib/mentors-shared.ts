// What mentors and review requests look like, plus the price rules. No secrets in here,
// so the browser can use it too (the application form checks prices as she types).

export const FORMATS = {
  written: { label: "Written feedback", short: "Written", min: 0.25, max: 2, start: "0.50" },
  voice: { label: "Voice note", short: "Voice", min: 0.5, max: 3, start: "1.00" },
  call: { label: "15-minute video call", short: "Call", min: 1, max: 5, start: "5.00" },
} as const;

export type Format = keyof typeof FORMATS;
export const FORMAT_KEYS = Object.keys(FORMATS) as Format[];

/** The message under a price field, or undefined when the price is fine. */
export function priceProblem(format: Format, text: string): string | undefined {
  const { min, max } = FORMATS[format];
  const value = Number(text.replace(",", "."));
  if (!text.trim() || !Number.isFinite(value)) return "Enter a price, like 0.50";
  if (value > max) return `${value.toFixed(2)} is above the ${max} USDC limit`;
  if (value < min) return `${value.toFixed(2)} is below the ${min} USDC minimum`;
}

export type MentorProfile = {
  mentorId: string; // like MN-4F8R2
  country: string;
  bio: string;
  link: string; // her work: Stallion, LinkedIn, GitHub or a site
  courses: string[]; // course slugs she can review
  prices: Partial<Record<Format, number>>; // only the formats she offers
  status: "review" | "approved" | "changes"; // changes = "Not yet": reopen the form with the note
  note?: string; // what the team asked her to add
  takingRequests: boolean;
  welcomed?: boolean; // she has seen the "You're approved" banner
  submittedAt: string;
  withdrawals?: { at: string; amount: number; tx: string }[];
};

export type RequestStatus = "requested" | "accepted" | "delivered" | "declined" | "expired" | "refunded";

export type ReviewRequest = {
  id: string;
  learnerId: string;
  learnerName: string; // first name only: this is what a mentor sees
  mentorUserId: string;
  courseSlug: string;
  courseTitle: string;
  lesson: string; // where she is stuck, e.g. the module title
  format: Format;
  price: number;
  message: string; // "Her agent says: …"
  status: RequestStatus;
  createdAt: string;
  expiresAt: string; // 24 h to accept or decline
  acceptedAt?: string;
  dueAt?: string; // 48 h after accepting
  payTx?: string;
  deliveredAt?: string;
  delivery?: { text: string; link?: string; when?: string };
  skillTx?: string; // the skill coin on Stellar
  refundTx?: string;
};

export const HOURS = 3_600_000;

/** "21 h left", "45 min left", or "Past due". */
export function timeLeft(until: string, now: number) {
  const ms = new Date(until).getTime() - now;
  if (ms <= 0) return { text: "Time's up", urgent: true };
  const hours = Math.floor(ms / HOURS);
  return { text: hours >= 1 ? `${hours} h left` : `${Math.max(1, Math.round(ms / 60_000))} min left`, urgent: ms < 6 * HOURS };
}

/** The time right now, in milliseconds. A function of its own so pages read it only when they render for a request. */
export const rightNow = () => Date.now();
