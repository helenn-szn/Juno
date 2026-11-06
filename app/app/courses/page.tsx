// Every course, filtered by the search box in the top bar (?q=).
import { Suspense } from "react";
import type { Metadata } from "next";
import { CourseCard } from "@/components/course-card";
import { Empty } from "@/components/page-grid";
import { PageSpinner } from "@/components/page-spinner";
import { TopBar } from "@/components/top-bar";
import { courses } from "@/lib/courses";

export const metadata: Metadata = { title: "Courses · juno" };

export default function Courses(props: PageProps<"/app/courses">) {
  return (
    <>
      <TopBar title="Courses" search />
      <Suspense fallback={<PageSpinner />}>
        <Results searchParams={props.searchParams} />
      </Suspense>
    </>
  );
}

async function Results({ searchParams }: Pick<PageProps<"/app/courses">, "searchParams">) {
  const { q } = await searchParams;
  const query = (Array.isArray(q) ? q[0] : q)?.trim() ?? "";
  const words = query.toLowerCase();
  const found = courses.filter((course) =>
    [course.title, course.topic, course.level, course.summary].some((field) => field.toLowerCase().includes(words)),
  );

  return (
    <div className="flex flex-col gap-4 p-6 lg:p-7">
      {query && <p className="text-body-regular text-text-secondary">{found.length} for “{query}”</p>}
      {found.length ? (
        <ul className="grid gap-3.5 sm:grid-cols-[repeat(auto-fill,minmax(15rem,1fr))]">
          {found.map((course) => (
            <li key={course.slug}>
              <CourseCard course={course} />
            </li>
          ))}
        </ul>
      ) : (
        <Empty>No course matches “{query}”. Try another word, or ask Juno.ai.</Empty>
      )}
    </div>
  );
}
