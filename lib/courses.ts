// The course catalogue: tech and AI only. Build AI Agents is the full demo
// course; the others have short placeholder lessons. Juno.ai reads this file
// too, so its answers always match real courses.

export type Lesson = {
  title: string;
  minutes?: number; // reviews have no video, so no length
  kind: "video" | "hands-on" | "review";
};

export type Resource = { title: string; url: string; kind: "Docs" | "Article" | "Course" };

// `overview` says what the module is about; `resources` are free reading for it.
export type Module = { title: string; overview: string; resources: Resource[]; lessons: Lesson[] };

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

const docs = (title: string, url: string): Resource => ({ title, url, kind: "Docs" });
const article = (title: string, url: string): Resource => ({ title, url, kind: "Article" });
const course = (title: string, url: string): Resource => ({ title, url, kind: "Course" });

// Two short lessons per module, for the courses that aren't built out yet.
const placeholder = (modules: { title: string; overview: string; resources: Resource[] }[]): Module[] =>
  modules.map(({ title, overview, resources }) => ({
    title,
    overview,
    resources,
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
        overview:
          "An agent is an AI that decides what to do next and uses tools to get it done, instead of only answering a question. You will see how it differs from a chatbot and where agents truly help.",
        resources: [article("Building effective agents", "https://www.anthropic.com/engineering/building-effective-agents"), docs("AI SDK: introduction", "https://ai-sdk.dev/docs/introduction")],
        lessons: [
          { title: "What is an agent", minutes: 5, kind: "video" },
          { title: "Agents and chatbots", minutes: 7, kind: "video" },
          { title: "Where agents help", minutes: 5, kind: "video" },
        ],
      },
      {
        title: "Prompts and tools",
        overview:
          "A good prompt tells an agent who it is, what to do and when to stop. A tool is a small function the agent may call. Together they turn words into actions.",
        resources: [docs("Prompting strategies (Gemini)", "https://ai.google.dev/gemini-api/docs/prompting-strategies"), docs("AI SDK: tools", "https://ai-sdk.dev/docs/foundations/tools")],
        lessons: [
          { title: "Writing a good prompt", minutes: 7, kind: "video" },
          { title: "Giving an agent tools", minutes: 9, kind: "video" },
          { title: "Hands-on: your first tool", minutes: 14, kind: "hands-on" },
        ],
      },
      {
        title: "Giving agents memory",
        overview:
          "Agents forget everything between conversations unless you help them. Learn the difference between short-term and long-term memory, and what is worth remembering.",
        resources: [docs("Long context (Gemini)", "https://ai.google.dev/gemini-api/docs/long-context"), article("Prompt Engineering Guide", "https://www.promptingguide.ai/")],
        lessons: [
          { title: "Short and long memory", minutes: 7, kind: "video" },
          { title: "Storing what matters", minutes: 8, kind: "video" },
          { title: "Hands-on: add memory", minutes: 13, kind: "hands-on" },
        ],
      },
      {
        title: "Agents that pay",
        overview:
          "x402 lets a program pay for a service the moment a server asks, with no sign-up and no card. Your agent will pay a mentor for a review, with your permission.",
        resources: [docs("x402 on Stellar", "https://developers.stellar.org/docs/build/agentic-payments/x402"), docs("x402 protocol", "https://www.x402.org/")],
        lessons: [
          { title: "What is x402", minutes: 6, kind: "video" },
          { title: "Paying from an agent", minutes: 10, kind: "video" },
          { title: "Hands-on: pay for an API", minutes: 13, kind: "hands-on" },
          { title: "Mentor review of your agent", kind: "review" },
        ],
      },
      {
        title: "Build your first agent",
        overview:
          "Plan a small agent on paper first, then build it step by step: one goal, a few tools, a clear stopping point. Run it, watch it, improve it.",
        resources: [docs("Function calling (Gemini)", "https://ai.google.dev/gemini-api/docs/function-calling"), docs("AI SDK: introduction", "https://ai-sdk.dev/docs/introduction")],
        lessons: [
          { title: "Plan the agent", minutes: 7, kind: "video" },
          { title: "Build it step by step", minutes: 18, kind: "hands-on" },
          { title: "Run and improve it", minutes: 10, kind: "video" },
        ],
      },
      {
        title: "Testing and safety",
        overview:
          "An agent that can spend money needs guard rails. Test it with tricky inputs, set spending limits, and make it ask before it acts.",
        resources: [article("OWASP: top 10 risks for LLM apps", "https://owasp.org/www-project-top-10-for-large-language-model-applications/"), article("Building effective agents", "https://www.anthropic.com/engineering/building-effective-agents")],
        lessons: [
          { title: "Test an agent", minutes: 8, kind: "video" },
          { title: "Spending limits and asking first", minutes: 8, kind: "video" },
          { title: "Hands-on: add a safety check", minutes: 12, kind: "hands-on" },
        ],
      },
      {
        title: "Capstone: ship an agent",
        overview:
          "Bring it all together: ship an agent that plans, uses a tool and pays for a service on Stellar, then get a final mentor review of your work.",
        resources: [docs("Stellar developer docs", "https://developers.stellar.org/docs"), docs("x402 on Stellar", "https://developers.stellar.org/docs/build/agentic-payments/x402")],
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
      {
        title: "What is a prompt",
        overview: "A prompt is the message you give an AI. Small changes in how you write it change the answer a lot. Start here to see why.",
        resources: [docs("Prompting intro (Gemini)", "https://ai.google.dev/gemini-api/docs/prompting-intro"), article("Prompt Engineering Guide: basics", "https://www.promptingguide.ai/")],
      },
      {
        title: "Clear instructions",
        overview: "Say who the AI is, what you want, who it is for and how long it should be. Clear beats clever every time.",
        resources: [docs("Prompting strategies (Gemini)", "https://ai.google.dev/gemini-api/docs/prompting-strategies"), docs("Prompt engineering (OpenAI)", "https://platform.openai.com/docs/guides/prompt-engineering")],
      },
      {
        title: "Examples and format",
        overview: "Show the AI one or two examples of what good looks like, and tell it the exact format you want back.",
        resources: [article("Few-shot prompting", "https://www.promptingguide.ai/techniques/fewshot"), docs("Prompting strategies (Gemini)", "https://ai.google.dev/gemini-api/docs/prompting-strategies")],
      },
      {
        title: "Fixing bad answers",
        overview: "When an answer is wrong, do not start over. Learn to ask the AI to think step by step, check its work, and try again.",
        resources: [article("Chain-of-thought prompting", "https://www.promptingguide.ai/techniques/cot"), docs("Prompt engineering (OpenAI)", "https://platform.openai.com/docs/guides/prompt-engineering")],
      },
      {
        title: "Prompts you can reuse",
        overview: "Turn a prompt that worked into a template with blanks, so you can use it again for your next task.",
        resources: [article("Prompt Engineering Guide", "https://www.promptingguide.ai/"), docs("Prompting strategies (Gemini)", "https://ai.google.dev/gemini-api/docs/prompting-strategies")],
      },
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
      {
        title: "What is AI",
        overview: "AI is software that finds patterns in data and uses them to make predictions. No magic, just maths and lots of examples.",
        resources: [course("Elements of AI", "https://www.elementsofai.com/"), course("Machine Learning Crash Course", "https://developers.google.com/machine-learning/crash-course")],
      },
      {
        title: "How models learn",
        overview: "A model improves by seeing many examples and being told when it is wrong. See how training, data and mistakes fit together.",
        resources: [course("Machine Learning Crash Course", "https://developers.google.com/machine-learning/crash-course"), course("Elements of AI", "https://www.elementsofai.com/")],
      },
      {
        title: "Language models",
        overview: "Chat assistants are language models: they predict the next word, over and over. Learn why that is enough to write, explain and code.",
        resources: [docs("Intro to large language models", "https://developers.google.com/machine-learning/resources/intro-llms"), course("Elements of AI", "https://www.elementsofai.com/")],
      },
      {
        title: "Where AI goes wrong",
        overview: "AI can sound sure and still be wrong. Spot made-up facts, bias and blind spots before they cost you.",
        resources: [article("Responsible AI practices", "https://ai.google/responsibility/responsible-ai-practices/"), course("Machine Learning Crash Course", "https://developers.google.com/machine-learning/crash-course")],
      },
      {
        title: "Using AI responsibly",
        overview: "Know what to share, what to check and when to say you used AI. Good habits that keep you and others safe.",
        resources: [article("AI principles", "https://ai.google/responsibility/principles/"), article("Responsible AI practices", "https://ai.google/responsibility/responsible-ai-practices/")],
      },
      {
        title: "AI in your work",
        overview: "Pick one task in your own work where AI could help, try it, and decide what stays human.",
        resources: [course("Elements of AI", "https://www.elementsofai.com/"), article("Prompt Engineering Guide", "https://www.promptingguide.ai/")],
      },
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
      {
        title: "Hello Python",
        overview: "Run your first line of Python, print a message to the screen, and learn how to read an error without panic.",
        resources: [docs("The Python Tutorial", "https://docs.python.org/3/tutorial/"), docs("Getting started with Python", "https://www.python.org/about/gettingstarted/")],
      },
      {
        title: "Variables and types",
        overview: "A variable is a name for a value. Meet numbers, text and true or false, and how Python tells them apart.",
        resources: [docs("An informal introduction to Python", "https://docs.python.org/3/tutorial/introduction.html"), article("Real Python", "https://realpython.com/")],
      },
      {
        title: "Making decisions",
        overview: "Teach your program to choose with if, elif and else, and to compare things.",
        resources: [docs("More control flow tools", "https://docs.python.org/3/tutorial/controlflow.html"), article("Real Python", "https://realpython.com/")],
      },
      {
        title: "Loops",
        overview: "Repeat work without repeating code. Use for and while loops to go through lists and count.",
        resources: [docs("More control flow tools", "https://docs.python.org/3/tutorial/controlflow.html"), article("Real Python", "https://realpython.com/")],
      },
      {
        title: "Functions",
        overview: "Wrap steps you use often in a function with a name, inputs and an output.",
        resources: [docs("Defining functions", "https://docs.python.org/3/tutorial/controlflow.html#defining-functions"), article("Real Python", "https://realpython.com/")],
      },
      {
        title: "Lists and dictionaries",
        overview: "Keep many values together. Lists hold things in order, dictionaries look them up by name.",
        resources: [docs("Data structures", "https://docs.python.org/3/tutorial/datastructures.html"), article("Real Python", "https://realpython.com/")],
      },
      {
        title: "Working with files",
        overview: "Read from and write to files so your program can remember things after it stops.",
        resources: [docs("Reading and writing files", "https://docs.python.org/3/tutorial/inputoutput.html"), article("Real Python", "https://realpython.com/")],
      },
      {
        title: "Your first project",
        overview: "Combine everything into a small program of your own: a to-do list, a quiz or a budget tracker.",
        resources: [docs("The Python Tutorial", "https://docs.python.org/3/tutorial/"), article("Real Python", "https://realpython.com/")],
      },
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
      {
        title: "Questions first",
        overview: "Good analysis starts with a clear question, not with a spreadsheet. Learn to turn a vague worry into something you can measure.",
        resources: [course("Kaggle: Pandas", "https://www.kaggle.com/learn/pandas"), article("Storytelling with Data", "https://www.storytellingwithdata.com/")],
      },
      {
        title: "Cleaning data",
        overview: "Real data is messy: blanks, typos, duplicates. Clean it first or every chart will lie to you.",
        resources: [course("Kaggle: Data Cleaning", "https://www.kaggle.com/learn/data-cleaning"), docs("10 minutes to pandas", "https://pandas.pydata.org/docs/user_guide/10min.html")],
      },
      {
        title: "Exploring with AI",
        overview: "Ask an AI to summarise, group and compare your data, then check what it says against the numbers.",
        resources: [docs("10 minutes to pandas", "https://pandas.pydata.org/docs/user_guide/10min.html"), course("Kaggle: Pandas", "https://www.kaggle.com/learn/pandas")],
      },
      {
        title: "Charts that say something",
        overview: "Pick the right chart for your message and take away everything that does not help it.",
        resources: [course("Kaggle: Data Visualization", "https://www.kaggle.com/learn/data-visualization"), article("From Data to Viz", "https://www.data-to-viz.com/")],
      },
      {
        title: "Spotting mistakes",
        overview: "Check your work: wrong averages, missing groups and charts that mislead. Catch them before anyone else does.",
        resources: [article("Storytelling with Data", "https://www.storytellingwithdata.com/"), article("From Data to Viz", "https://www.data-to-viz.com/")],
      },
      {
        title: "Share your findings",
        overview: "Turn your analysis into a short story with one clear takeaway that people trust and act on.",
        resources: [article("Storytelling with Data", "https://www.storytellingwithdata.com/"), course("Kaggle: Data Visualization", "https://www.kaggle.com/learn/data-visualization")],
      },
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
      {
        title: "What is a blockchain",
        overview: "A blockchain is a shared record book that many computers keep in step, so no one can quietly change the past.",
        resources: [docs("Stellar: fundamentals", "https://developers.stellar.org/docs/learn/fundamentals"), article("Stellar", "https://stellar.org/")],
      },
      {
        title: "Wallets and keys",
        overview: "A wallet holds a public address anyone can pay and a secret only you keep. Learn to guard the secret.",
        resources: [docs("Stellar: fundamentals", "https://developers.stellar.org/docs/learn/fundamentals"), docs("Stellar developer docs", "https://developers.stellar.org/docs")],
      },
      {
        title: "Stellar in plain words",
        overview: "Stellar is a fast, low-cost network for moving money. See accounts, assets and fees without the jargon.",
        resources: [docs("Stellar: fundamentals", "https://developers.stellar.org/docs/learn/fundamentals"), article("Stellar", "https://stellar.org/")],
      },
      {
        title: "Sending and receiving",
        overview: "Send test money between wallets on the practice network and watch it arrive in seconds.",
        resources: [docs("Stellar developer docs", "https://developers.stellar.org/docs"), docs("x402 on Stellar", "https://developers.stellar.org/docs/build/agentic-payments/x402")],
      },
      {
        title: "Proof you can verify",
        overview: "Every payment and skill leaves a public record. Learn to look one up and check it is real.",
        resources: [docs("Stellar developer docs", "https://developers.stellar.org/docs"), docs("Stellar: fundamentals", "https://developers.stellar.org/docs/learn/fundamentals")],
      },
    ]),
  },
];

// A module is finished when every lesson but the optional mentor review is done.
export const requiredLessons = (module: Module) =>
  module.lessons.flatMap((lesson, index) => (lesson.kind === "review" ? [] : [index]));

// A real search on YouTube for a lesson, so every "Watch" link works.
export const watchLink = (course: Course, lesson: Lesson) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(`${lesson.title.replace(/^(Watch|Practice|Hands-on): /, "")} ${course.title} tutorial`)}`;

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
