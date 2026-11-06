// The learner's dashboard: her courses, and Juno.ai.
import { Suspense } from "react";
import { CourseCard } from "@/components/course-card";
import { JunoAi } from "@/components/juno-ai";
import { courses } from "@/lib/courses";
import { currentUser } from "@/lib/session";

export default function Dashboard() {
  return (
    <main className="flex flex-col gap-8">
      <Suspense fallback={<Heading name="" />}>
        <Greeting />
      </Suspense>
      <JunoAi />
      <section aria-labelledby="courses" className="flex flex-col gap-4">
        <h2 id="courses" className="text-headline-medium">Courses</h2>
        <Suspense fallback={<CourseGrid started={[]} />}>
          <Courses />
        </Suspense>
      </section>
    </main>
  );
}

async function Greeting() {
  const user = await currentUser();
  return <Heading name={user?.name.split(" ")[0] ?? ""} />;
}

function Heading({ name }: { name: string }) {
  return <h1 className="min-h-9 text-title-1-medium">{name ? `Hi, ${name}` : ""}</h1>;
}

async function Courses() {
  const user = await currentUser();
  return <CourseGrid started={user?.startedCourses ?? []} />;
}

function CourseGrid({ started }: { started: string[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {courses.map((course) => (
        <li key={course.slug} className="flex">
          <CourseCard course={course} started={started.includes(course.slug)} className="flex-1" />
        </li>
      ))}
    </ul>
  );
}
