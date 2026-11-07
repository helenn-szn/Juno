"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Form } from "react-aria-components";
import { RiCheckLine, RiWalletLine } from "@remixicon/react";
import { applyAsMentor } from "@/app/mentors/actions";
import type { FormState } from "@/app/actions";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { CoinFan } from "@/components/coin-fan";
import { PriceRows, tints } from "@/components/price-rows";
import { touchInput } from "@/components/touch-input";
import { courses } from "@/lib/courses";
import { FORMATS, FORMAT_KEYS, priceProblem, type Format } from "@/lib/mentors-shared";
import { cx } from "@/utils/cx";

const showErrors = ({ validationErrors }: { validationErrors: string[] }) => validationErrors.join(" ");
const card = "flex flex-col gap-4 rounded-2xl border border-line p-5";
const steps = [
  { id: "about", label: "About you" },
  { id: "skills", label: "Your skills" },
  { id: "prices", label: "Your prices" },
  { id: "review", label: "Agree and submit" },
] as const;

export type ApplyInitial = {
  signedIn: boolean;
  name: string;
  email: string;
  country: string;
  bio: string;
  link: string;
  courses: string[];
  prices: Partial<Record<Format, number>>;
  note?: string;
};

const blank: ApplyInitial = { signedIn: false, name: "", email: "", country: "", bio: "", link: "", courses: [], prices: {} };

/** The four-section application, with a step tracker and a live preview of how learners will see her. */
export function MentorApplyForm({ initial = blank }: { initial?: ApplyInitial }) {
  const [state, action, pending] = useActionState<FormState, FormData>(applyAsMentor, {});

  const [name, setName] = useState(initial.name);
  const [email, setEmail] = useState(initial.email);
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState(initial.country);
  const [picked, setPicked] = useState<string[]>(initial.courses);
  const [bio, setBio] = useState(initial.bio);
  const [link, setLink] = useState(initial.link);
  const [offer, setOffer] = useState<Record<Format, boolean>>({
    written: initial.signedIn ? initial.prices.written !== undefined : true,
    voice: initial.signedIn ? initial.prices.voice !== undefined : true,
    call: initial.signedIn ? initial.prices.call !== undefined : false,
  });
  const [price, setPrice] = useState<Record<Format, string>>({
    written: initial.prices.written?.toFixed(2) ?? FORMATS.written.start,
    voice: initial.prices.voice?.toFixed(2) ?? FORMATS.voice.start,
    call: initial.prices.call?.toFixed(2) ?? FORMATS.call.start,
  });
  const [promises, setPromises] = useState({ reply: false, teach: false });

  const problems = Object.fromEntries(FORMAT_KEYS.map((f) => [f, offer[f] ? (priceProblem(f, price[f]) ?? state.errors?.[`price_${f}`]) : undefined]));
  const anyOffer = FORMAT_KEYS.some((f) => offer[f]);
  const done = [
    initial.signedIn || Boolean(name.trim() && /^\S+@\S+\.\S+$/.test(email) && password.length >= 8 && country.trim()),
    picked.length > 0 && bio.trim().length >= 20 && /^https?:\/\//.test(link),
    anyOffer && FORMAT_KEYS.every((f) => !problems[f]),
    promises.reply && promises.teach,
  ];
  const current = done.indexOf(false);
  const shown = names(picked);

  return (
    <div className="flex flex-wrap items-start justify-center gap-6 px-6 pt-8 pb-12">
      {/* On a phone the tracker is a slim bar; from a laptop up it is the dark column. */}
      <div className="flex w-full flex-col gap-2 lg:hidden" role="status">
        <span className="text-body-medium">Step {current === -1 ? 4 : current + 1} of 4 · {steps[current === -1 ? 3 : current].label}</span>
        <div className="h-1.5 rounded-full bg-line"><div className="h-1.5 rounded-full bg-green" style={{ width: `${(done.filter(Boolean).length / 4) * 100}%` }} /></div>
      </div>

      <nav aria-label="Application steps" className="on-dark sticky top-6 hidden w-72 shrink-0 flex-col gap-4 rounded-2xl bg-green p-5 text-mint lg:flex">
        <span className="text-body-regular text-text-tertiary">Apply to mentor · about 5 minutes</span>
        <ol className="m-0 flex list-none flex-col gap-1 p-0 text-copy-sm">
          {steps.map((step, i) => (
            <li key={step.id}>
              <a
                href={`#${step.id}`}
                aria-current={i === current ? "step" : undefined}
                className={cx(
                  "flex min-h-11 items-center gap-3 outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring",
                  i === current ? "-mx-2.5 rounded-xl bg-dark-green px-2.5 font-medium text-radiant" : done[i] ? "text-mint" : "text-text-tertiary",
                )}
              >
                {done[i] ? (
                  <span className="flex size-7 items-center justify-center rounded-full bg-neon text-dark-green"><RiCheckLine className="size-4" aria-hidden /></span>
                ) : (
                  <span className={cx("flex size-7 items-center justify-center rounded-full text-body-regular", i === current ? "bg-radiant text-dark-green" : "border border-text-tertiary")}>{i + 1}</span>
                )}
                {step.label}
                {done[i] && <span className="sr-only"> (done)</span>}
              </a>
            </li>
          ))}
        </ol>
        <div className="h-1.5 rounded-full bg-dark-green"><div className="h-1.5 rounded-full bg-radiant" style={{ width: `${(done.filter(Boolean).length / 4) * 100}%` }} /></div>
      </nav>

      <Form action={action} validationBehavior="aria" validationErrors={state.errors} className="flex min-w-0 max-w-190 grow-999 basis-130 flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-title-1-medium tracking-[-0.03em]">Become a Juno mentor</h1>
          <p className="text-copy text-text-secondary">Anyone can apply. We check every application, usually within two days.</p>
        </div>

        {initial.note && (
          <p role="status" className="rounded-2xl border border-line bg-mint px-5 py-4 text-copy-sm">
            <b className="font-medium">Not yet. </b>
            {initial.note}
          </p>
        )}

        <section id="about" className={cx(card, "scroll-mt-6")}>
          <h2 className="text-title-3-medium">1. About you</h2>
          {initial.signedIn ? (
            <p className="text-copy-sm text-text-secondary">{name} · {email}</p>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(14rem,1fr))] gap-4">
              <Input name="name" label="Full name" autoComplete="name" isRequired value={name} onChange={setName} errorMessage={showErrors} {...touchInput} />
              <Input name="email" type="email" label="Email" autoComplete="email" isRequired value={email} onChange={setEmail} errorMessage={showErrors} {...touchInput} />
              <Input name="password" type="password" label="Password" autoComplete="new-password" isRequired value={password} onChange={setPassword} errorMessage={showErrors} {...touchInput} />
              <Input name="country" label="Country" autoComplete="country-name" isRequired value={country} onChange={setCountry} errorMessage={showErrors} {...touchInput} />
            </div>
          )}
          {initial.signedIn && <Input name="country" label="Country" autoComplete="country-name" isRequired value={country} onChange={setCountry} errorMessage={showErrors} {...touchInput} />}
        </section>

        <section id="skills" className={cx(card, "scroll-mt-6")}>
          <h2 className="text-title-3-medium">2. Your skills</h2>
          <fieldset className="m-0 flex flex-col gap-2.5 border-none p-0">
            <legend className="mb-2.5 text-body-medium">Courses you can review</legend>
            <div className="flex flex-wrap gap-2">
              {courses.map((course) => {
                const on = picked.includes(course.slug);
                return (
                  <label
                    key={course.slug}
                    className={cx(
                      "inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full px-4 text-body-regular has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-border-focus-ring",
                      on ? "bg-green font-medium text-mint" : "border border-field-border",
                    )}
                  >
                    <input
                      type="checkbox"
                      name="courses"
                      value={course.slug}
                      checked={on}
                      onChange={() => setPicked((list) => (on ? list.filter((s) => s !== course.slug) : [...list, course.slug]))}
                      className="size-4 accent-radiant outline-none"
                    />
                    {course.title}
                  </label>
                );
              })}
            </div>
            {state.errors?.courses && <p role="alert" className="text-body-regular text-text-error-primary">{state.errors.courses}</p>}
          </fieldset>
          <label className="flex flex-col gap-1.5 text-body-medium">
            Short bio
            <textarea name="bio" rows={3} value={bio} onChange={(event) => setBio(event.target.value)} aria-invalid={state.errors?.bio ? true : undefined} aria-describedby="bio-hint" />
            <span id="bio-hint" className={cx("text-body-2-regular font-normal", state.errors?.bio ? "text-text-error-primary" : "text-text-secondary")}>{state.errors?.bio ?? "Learners see this on your profile."}</span>
          </label>
          <Input name="link" type="url" label="Link to your work" placeholder="https://" value={link} onChange={setLink} hint="Stallion, LinkedIn, GitHub or your own site." isInvalid={Boolean(state.errors?.link)} errorMessage={state.errors?.link} {...touchInput} />
        </section>

        <section id="prices" className={cx(card, "scroll-mt-6 border-2 border-green")}>
          <div className="flex flex-col gap-1">
            <h2 className="text-title-3-medium">3. Your prices</h2>
            <p className="text-copy-sm text-text-secondary">Turn on the formats you offer. You&apos;re paid this amount, in USDC, the moment you accept.</p>
          </div>
          <PriceRows offer={offer} setOffer={setOffer} price={price} setPrice={setPrice} problems={problems} />
          {state.errors?.prices && <p role="alert" className="text-body-regular text-text-error-primary">{state.errors.prices}</p>}
          <p className="flex items-center gap-3 rounded-xl bg-mint px-3.5 py-3 text-copy-sm">
            <RiWalletLine className="size-5 shrink-0 text-green" aria-hidden />
            We&apos;ll create your Stellar wallet when you submit. You can connect your own wallet later to withdraw.
          </p>
        </section>

        <section id="review" className={cx(card, "scroll-mt-6")}>
          <h2 className="text-title-3-medium">4. Agree and submit</h2>
          <label className="flex cursor-pointer items-start gap-3 text-copy-sm">
            <input type="checkbox" name="promise_reply" checked={promises.reply} onChange={(e) => setPromises((p) => ({ ...p, reply: e.target.checked }))} className="mt-0.5 size-5 shrink-0 accent-green" />
            I&apos;ll reply to requests within 24 hours and deliver paid reviews within 48 hours. If I don&apos;t, the learner gets her money back.
          </label>
          <label className="flex cursor-pointer items-start gap-3 text-copy-sm">
            <input type="checkbox" name="promise_teach" checked={promises.teach} onChange={(e) => setPromises((p) => ({ ...p, teach: e.target.checked }))} className="mt-0.5 size-5 shrink-0 accent-green" />
            I&apos;ll teach, not do the work for her, and keep every conversation on Juno.
          </label>
          {state.errors?.agree && <p role="alert" className="text-body-regular text-text-error-primary">{state.errors.agree}</p>}
          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={pending} className="h-12 rounded-full px-7 shadow-none">{pending ? "Sending your application…" : "Submit application"}</Button>
            <Link href="/mentors" className="flex min-h-12 items-center px-3 text-body-medium text-green underline">Back</Link>
          </div>
        </section>
      </Form>

      <aside className="flex w-full max-w-72 min-w-0 shrink grow basis-64 flex-col gap-4 max-[1100px]:max-w-190">
        <div className={card}>
          <h2 className="text-body-medium">After you submit</h2>
          <ol className="m-0 flex list-none flex-col gap-3 p-0 text-copy-sm">
            {[
              ["bg-green", "Your status shows “Under review”."],
              ["bg-green", "The Juno team checks your link and skills, usually within two days."],
              ["bg-neon", "Approved: your dashboard opens and requests start coming in."],
              ["border border-field-border", "Not yet: we'll tell you what to add, and you can apply again."],
            ].map(([dot, text]) => (
              <li key={text} className="flex gap-2.5"><span className={cx("mt-2 size-2 shrink-0 rounded-full", dot)} aria-hidden />{text}</li>
            ))}
          </ol>
        </div>
        <div role="img" aria-label="Preview of your mentor profile" className="on-dark flex flex-col gap-3 rounded-2xl bg-green p-5 text-mint">
          <span className="text-body-regular text-text-tertiary">How learners see you</span>
          <div className="flex items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-purple text-title-3-medium text-dark-green">{(name.trim()[0] ?? "?").toUpperCase()}</span>
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="truncate text-body-medium">{name.trim() || "Your name"}</span>
              <span className="text-body-2-regular text-text-secondary">{shown || "Pick your courses"}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {FORMAT_KEYS.filter((f) => offer[f] && !priceProblem(f, price[f])).map((f) => (
              <span key={f} className={cx("rounded-full px-2.5 py-1 text-body-2-medium text-dark-green", tints[f])}>{FORMATS[f].short} {Number(price[f].replace(",", ".")).toFixed(2)}</span>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

// "AI agents · Prompting · Stellar" style short names for the preview.
function names(slugs: string[]) {
  const short = (title: string) => title.replace(/^Build /, "").replace(/ for Beginners$/, "").replace(/ with AI$/, "").replace(/ and Stellar Basics$/, " · Stellar").replace(/ Engineering$/, "");
  return courses.filter((c) => slugs.includes(c.slug)).map((c) => short(c.title)).join(" · ");
}

export function ApplyHeader() {
  return (
    <header className="flex flex-wrap items-center gap-3 border-b border-line px-6 py-4">
      <Link href="/mentors" aria-label="Juno for mentors" className="me-auto flex min-h-11 items-center gap-2 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring">
        <CoinFan theme="light" className="h-6 w-9" />
        <span className="text-wordmark-sm text-text-accent">juno</span>
        <span className="rounded-full bg-purple px-2.5 py-1 text-body-2-medium text-dark-green">Mentors</span>
      </Link>
      <span className="text-copy-sm text-text-secondary">Already applied?</span>
      <Link href="/login" className="flex min-h-11 items-center rounded-full border border-separator-border px-4 text-copy-sm font-medium outline-none hover:border-text-tertiary focus-visible:ring-2 focus-visible:ring-border-focus-ring">Log in</Link>
    </header>
  );
}
