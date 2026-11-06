// The course catalogue. Logo design is the full demo course; the rest are shorter.
// Juno.ai is seeded with this list, so its answers always match real courses.

export type Course = {
  slug: string;
  title: string;
  level: "Beginner" | "Intermediate";
  length: string;
  summary: string;
  outcomes: string[];
  milestones: string[];
};

export const courses: Course[] = [
  {
    slug: "logo-design",
    title: "Logo design",
    level: "Beginner",
    length: "4 weeks",
    summary:
      "Design a logo a real client can use: from the brief to a finished mark, with a mentor reviewing your work along the way.",
    outcomes: [
      "Turn a client brief into a clear design direction",
      "Sketch and test many ideas quickly",
      "Build a clean logo in vector software",
      "Choose colour and type that fit the brand",
      "Present your logo with confidence",
    ],
    milestones: [
      "Read the brief and research the brand",
      "Sketch ten logo ideas",
      "Build your best idea in vector",
      "Choose colour and type",
      "Final logo, reviewed by a mentor",
    ],
  },
  {
    slug: "bookkeeping-basics",
    title: "Bookkeeping basics",
    level: "Beginner",
    length: "2 weeks",
    summary: "Keep clean books for a small business, so you always know what came in, what went out and what's left.",
    outcomes: [
      "Record income and expenses correctly",
      "Reconcile a bank statement",
      "Read a simple profit and loss report",
    ],
    milestones: ["Set up your books", "Record a month of transactions", "Close the month"],
  },
  {
    slug: "intro-to-coding",
    title: "Intro to coding",
    level: "Beginner",
    length: "3 weeks",
    summary: "Write your first real programs in JavaScript and build a small web page that does something useful.",
    outcomes: [
      "Understand variables, functions and loops",
      "Make a web page respond to clicks",
      "Find and fix bugs on your own",
    ],
    milestones: ["Your first program", "Make a page interactive", "Build a tip calculator"],
  },
  {
    slug: "digital-marketing",
    title: "Digital marketing",
    level: "Intermediate",
    length: "3 weeks",
    summary: "Grow a small brand online: plan content, run a simple campaign and learn what actually works from the numbers.",
    outcomes: [
      "Plan a month of social content",
      "Run and measure a small ad campaign",
      "Turn results into your next decision",
    ],
    milestones: ["Plan your content", "Launch a campaign", "Read the results"],
  },
];

export function findCourse(slug: string) {
  return courses.find((course) => course.slug === slug);
}
