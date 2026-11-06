// The course catalogue: tech and AI only. Build AI Agents is the full demo
// course; the others have short placeholder lessons. Juno.ai reads this file
// too, so its answers always match real courses.

export type Lesson = {
  title: string;
  minutes?: number; // reviews have no video, so no length
  kind: "video" | "hands-on" | "review";
};

export type Module = { title: string; lessons: Lesson[] };

export type CourseIcon = "robot" | "chat" | "nodes" | "python" | "chart" | "blocks";
export type CourseCover = "purple" | "radiant" | "neon" | "green" | "mint" | "forest";

export type Course = {
  slug: string;
  title: string;
  level: "Beginner" | "Intermediate";
  topic: string;
  summary: string;
  icon: CourseIcon;
  cover: CourseCover;
  isNew?: boolean;
  modules: Module[];
};

export const MENTOR_REVIEW_PRICE_LABEL = "0.50 USDC";

// Two short lessons per module, for the courses that aren't built out yet.
const placeholder = (titles: string[]): Module[] =>
  titles.map((title) => ({
    title,
    lessons: [
      { title: `Watch: ${title}`, minutes: 8, kind: "video" },
      { title: `Practice: ${title}`, minutes: 10, kind: "hands-on" },
    ],
  }));

export const courses: Course[] = [
  {
    slug: "build-ai-agents",
    title: "Build AI Agents",
    level: "Intermediate",
    topic: "AI",
    summary:
      "Build an AI agent that plans, uses tools and pays for services on its own with x402 on Stellar. You finish with a working agent and a mentor review of your code.",
    icon: "robot",
    cover: "purple",
    isNew: true,
    modules: [
      {
        title: "What is an AI agent",
        lessons: [
          { title: "What is an agent", minutes: 5, kind: "video" },
          { title: "Agents and chatbots", minutes: 7, kind: "video" },
          { title: "Where agents help", minutes: 5, kind: "video" },
        ],
      },
      {
        title: "Prompts and tools",
        lessons: [
          { title: "Writing a good prompt", minutes: 7, kind: "video" },
          { title: "Giving an agent tools", minutes: 9, kind: "video" },
          { title: "Hands-on: your first tool", minutes: 14, kind: "hands-on" },
        ],
      },
      {
        title: "Giving agents memory",
        lessons: [
          { title: "Short and long memory", minutes: 7, kind: "video" },
          { title: "Storing what matters", minutes: 8, kind: "video" },
          { title: "Hands-on: add memory", minutes: 13, kind: "hands-on" },
        ],
      },
      {
        title: "Agents that pay",
        lessons: [
          { title: "What is x402", minutes: 6, kind: "video" },
          { title: "Paying from an agent", minutes: 10, kind: "video" },
          { title: "Hands-on: pay for an API", minutes: 13, kind: "hands-on" },
          { title: "Mentor review of your agent", kind: "review" },
        ],
      },
      {
        title: "Build your first agent",
        lessons: [
          { title: "Plan the agent", minutes: 7, kind: "video" },
          { title: "Build it step by step", minutes: 18, kind: "hands-on" },
          { title: "Run and improve it", minutes: 10, kind: "video" },
        ],
      },
      {
        title: "Testing and safety",
        lessons: [
          { title: "Test an agent", minutes: 8, kind: "video" },
          { title: "Spending limits and asking first", minutes: 8, kind: "video" },
          { title: "Hands-on: add a safety check", minutes: 12, kind: "hands-on" },
        ],
      },
      {
        title: "Capstone: ship an agent",
        lessons: [
          { title: "Capstone brief", minutes: 4, kind: "video" },
          { title: "Ship it", minutes: 25, kind: "hands-on" },
          { title: "Final mentor review", kind: "review" },
        ],
      },
    ],
  },
  {
    slug: "prompt-engineering",
    title: "Prompt Engineering",
    level: "Beginner",
    topic: "AI",
    summary: "Learn to ask AI for exactly what you need: clear instructions, good examples and prompts you can reuse.",
    icon: "chat",
    cover: "radiant",
    modules: placeholder([
      "What is a prompt",
      "Clear instructions",
      "Examples and format",
      "Fixing bad answers",
      "Prompts you can reuse",
    ]),
  },
  {
    slug: "ai-foundations",
    title: "AI Foundations",
    level: "Beginner",
    topic: "AI",
    summary: "Understand how AI works in plain words, where it goes wrong, and how to use it responsibly.",
    icon: "nodes",
    cover: "neon",
    modules: placeholder([
      "What is AI",
      "How models learn",
      "Language models",
      "Where AI goes wrong",
      "Using AI responsibly",
      "AI in your work",
    ]),
  },
  {
    slug: "python-for-beginners",
    title: "Python for Beginners",
    level: "Beginner",
    topic: "Development",
    summary: "Write your first real programs in Python, from a hello world to a small project of your own.",
    icon: "python",
    cover: "green",
    modules: placeholder([
      "Hello Python",
      "Variables and types",
      "Making decisions",
      "Loops",
      "Functions",
      "Lists and dictionaries",
      "Working with files",
      "Your first project",
    ]),
  },
  {
    slug: "data-analysis-with-ai",
    title: "Data Analysis with AI",
    level: "Intermediate",
    topic: "Data",
    summary: "Ask better questions of your data, clean it, explore it with AI, and share findings people trust.",
    icon: "chart",
    cover: "mint",
    modules: placeholder([
      "Questions first",
      "Cleaning data",
      "Exploring with AI",
      "Charts that say something",
      "Spotting mistakes",
      "Share your findings",
    ]),
  },
  {
    slug: "blockchain-and-stellar-basics",
    title: "Blockchain and Stellar Basics",
    level: "Beginner",
    topic: "Blockchain",
    summary: "What a blockchain is, how wallets work, and how to send money and check proof on Stellar.",
    icon: "blocks",
    cover: "forest",
    modules: placeholder([
      "What is a blockchain",
      "Wallets and keys",
      "Stellar in plain words",
      "Sending and receiving",
      "Proof you can verify",
    ]),
  },
];

export const findCourse = (slug: string) => courses.find((course) => course.slug === slug);

export const moduleCount = (course: Course) => `${course.modules.length} modules`;

// How far along she is. `done` is the number of finished modules; the learning
// flow will keep it up to date. Until then everyone starts at 0.
export type Progress = {
  done: number;
  percent: number;
  minutesLeft: number;
  currentModule: Module | undefined;
};

export function progressFor(course: Course, done = 0): Progress {
  const finished = Math.min(done, course.modules.length);
  const minutesLeft = course.modules
    .slice(finished)
    .flatMap((module) => module.lessons)
    .reduce((total, lesson) => total + (lesson.minutes ?? 0), 0);
  return {
    done: finished,
    percent: Math.round((finished / course.modules.length) * 100),
    minutesLeft,
    currentModule: course.modules[finished],
  };
}

export const timeLeft = (minutes: number) => (minutes < 60 ? `${Math.max(minutes, 1)} min left` : `${Math.ceil(minutes / 60)} h left`);

export type ModuleState = "done" | "current" | "todo" | "locked";

// The capstone (last module) stays locked until every module before it is done.
export function moduleState(course: Course, index: number, done: number): ModuleState {
  if (index < done) return "done";
  if (index === done) return "current";
  return index === course.modules.length - 1 ? "locked" : "todo";
}
