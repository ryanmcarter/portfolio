import { ArrowLeft, ArrowUpRight, Mail } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { CaseStudyCard } from "@/components/CaseStudyCard";
import { Reveal } from "@/components/Motion";
import { SiteHeader } from "@/components/SiteHeader";
import { TextBlocks } from "@/components/TextBlocks";
import {
  asset,
  caseStudies,
  contactPage,
  experience,
  getCaseStudy,
  homePage,
  mediaForPage,
  profileImage,
  resumeUrl,
} from "@/data/portfolio";

function HomePage() {
  const featured = caseStudies.slice(0, 2);
  const remaining = caseStudies.slice(2);

  return (
    <>
      <SiteHeader active="home" />
      <main>
        <section className="mx-auto grid max-w-[1440px] gap-16 px-4 pb-12 pt-20 sm:px-8 sm:pt-32 lg:grid-cols-2 lg:gap-24">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-[640px]"
          >
            <h1 className="text-4xl font-medium leading-[1.18] text-ink sm:text-5xl sm:leading-[64px]">
              I'm Ryan, a designer with 12+ YOE in Product Design & Design Systems.
            </h1>
            <p className="mt-6 text-xl leading-9 text-muted sm:text-2xl sm:leading-10">
              More recently, I've learned Claude Code & Codex to prototype & implement my designs.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
            className="self-center"
          >
            <div className="grid gap-0">
              {experience.map(([dates, company, role]) => (
                <div
                  className="grid grid-cols-[120px_1fr] gap-4 border-b border-line py-4 text-sm leading-4 sm:grid-cols-[150px_1fr_190px]"
                  key={company}
                >
                  <span className="font-mono text-muted">{dates}</span>
                  <span className="font-medium text-ink">{company}</span>
                  <span className="col-span-2 font-mono text-muted sm:col-span-1 sm:text-right">{role}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        <section className="mx-auto max-w-[1440px] border-t border-line px-4 py-12 sm:px-8">
          <Reveal>
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
              {featured.map((study) => (
                <CaseStudyCard featured key={study.slug} {...study} />
              ))}
            </div>
          </Reveal>
        </section>

        <section className="mx-auto grid max-w-[1440px] gap-8 px-4 py-16 sm:px-8 lg:grid-cols-[360px_1fr]">
          <Reveal>
            <div className="sticky top-32">
              <p className="font-mono text-sm uppercase leading-4 text-accent">Selected work</p>
              <h2 className="mt-4 text-3xl font-medium leading-10 text-ink">Case studies from systems to products.</h2>
            </div>
          </Reveal>
          <div className="grid gap-8">
            {remaining.map((study, index) => (
              <Reveal delay={index * 0.04} key={study.slug}>
                <CaseStudyCard {...study} />
              </Reveal>
            ))}
          </div>
        </section>

        <section className="bg-ink py-20 text-white">
          <div className="mx-auto grid max-w-[1440px] gap-12 px-4 sm:px-8 lg:grid-cols-[1fr_480px]">
            <Reveal>
              <div>
                <p className="font-mono text-sm uppercase leading-4 text-rose-300">About</p>
                <div className="mt-6 max-w-3xl space-y-5 text-lg leading-8 text-neutral-300">
                  {homePage.blocks.slice(-1)[0]?.text
                    .split("\n\n")
                    .filter(Boolean)
                    .map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <img
                alt="Ryan Carter"
                className="aspect-[4/5] w-full rounded-3xl object-cover"
                loading="lazy"
                src={profileImage}
              />
            </Reveal>
          </div>
        </section>
      </main>
    </>
  );
}

function CaseStudyPage({ slug }: { slug: string }) {
  const study = getCaseStudy(slug);

  if (!study) return <NotFound />;

  const media = mediaForPage(study.page);
  const contentBlocks = study.page.blocks.filter((block, index) => !(index === 0 && block.type === "h1"));

  return (
    <>
      <SiteHeader />
      <main>
        <article className="mx-auto max-w-[1440px] px-4 pb-20 sm:px-8">
          <section className="grid gap-10 pb-12 pt-12 sm:pt-20 lg:grid-cols-[1fr_420px]">
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
              <Button asChild className="mb-12" variant="ghost">
                <a href="/">
                  <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                  Back home
                </a>
              </Button>
              <p className="font-mono text-sm uppercase leading-4 text-accent">{study.client}</p>
              <h1 className="mt-4 max-w-4xl text-5xl font-medium leading-[1.08] text-ink sm:text-7xl">{study.title}</h1>
              <p className="mt-6 max-w-3xl text-xl leading-9 text-muted">{study.summary}</p>
            </motion.div>
            <motion.aside
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
              className="self-end border-y border-line py-6"
            >
              <dl className="grid gap-5 font-mono text-sm leading-5">
                <div>
                  <dt className="text-muted">Project</dt>
                  <dd className="mt-1 text-ink">{study.title}</dd>
                </div>
                <div>
                  <dt className="text-muted">Client</dt>
                  <dd className="mt-1 text-ink">{study.client}</dd>
                </div>
                <div>
                  <dt className="text-muted">Toolset</dt>
                  <dd className="mt-1 text-ink">{study.toolset}</dd>
                </div>
              </dl>
            </motion.aside>
          </section>

          <Reveal>
            <img
              alt=""
              className="max-h-[720px] w-full rounded-[24px] border border-soft bg-soft object-cover"
              src={study.image}
            />
          </Reveal>

          <section className="grid gap-12 py-16 lg:grid-cols-[320px_minmax(0,760px)]">
            <Reveal>
              <p className="font-mono text-sm uppercase leading-4 text-accent">Case study</p>
            </Reveal>
            <Reveal delay={0.05}>
              <TextBlocks blocks={contentBlocks} />
            </Reveal>
          </section>

          <section className="border-t border-line pt-12">
            <Reveal>
              <div className="mb-8 flex items-end justify-between gap-4">
                <div>
                  <p className="font-mono text-sm uppercase leading-4 text-accent">Media</p>
                  <h2 className="mt-3 text-3xl font-medium leading-10 text-ink">Scraped project assets</h2>
                </div>
              </div>
            </Reveal>
            <div className="media-grid grid gap-6">
              {media.images.map((image, index) => (
                <Reveal delay={(index % 6) * 0.03} key={`${image.src}-${index}`}>
                  <figure className="overflow-hidden rounded-2xl border border-line bg-soft">
                    <img alt={image.alt || ""} className="h-full min-h-[220px] w-full object-cover" loading="lazy" src={image.src} />
                  </figure>
                </Reveal>
              ))}
              {media.videos.map((video) => (
                <Reveal key={video}>
                  <video className="rounded-2xl border border-line bg-soft" controls muted playsInline preload="metadata" src={video} />
                </Reveal>
              ))}
            </div>
          </section>
        </article>
      </main>
    </>
  );
}

function ContactPage() {
  return (
    <>
      <SiteHeader active="contact" />
      <main className="mx-auto grid min-h-[calc(100svh-88px)] max-w-[1440px] content-center gap-12 px-4 py-20 sm:px-8 lg:grid-cols-[1fr_520px]">
        <motion.section
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="font-mono text-sm uppercase leading-4 text-accent">Contact</p>
          <h1 className="mt-4 max-w-3xl text-5xl font-medium leading-[1.08] text-ink sm:text-7xl">
            {contactPage.blocks[0]?.text ?? "Let's get in touch"}
          </h1>
          <p className="mt-6 max-w-2xl text-xl leading-9 text-muted">
            {contactPage.blocks[1]?.text ??
              "Send an email and I will get back to you as soon as I can."}
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <a href="mailto:hello@ryancarter.io">
                <Mail aria-hidden="true" className="h-4 w-4" />
                hello@ryancarter.io
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href={resumeUrl} rel="noreferrer" target="_blank">
                Resume
                <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </motion.section>
        <motion.aside
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="border-y border-line py-8"
        >
          <h2 className="font-mono text-sm uppercase leading-4 text-accent">Current focus</h2>
          <div className="mt-8 grid gap-6">
            {experience.slice(0, 3).map(([dates, company, role]) => (
              <div className="grid gap-1" key={company}>
                <p className="font-mono text-sm text-muted">{dates}</p>
                <p className="font-medium text-ink">{company}</p>
                <p className="font-mono text-sm text-muted">{role}</p>
              </div>
            ))}
          </div>
        </motion.aside>
      </main>
    </>
  );
}

function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex min-h-[calc(100svh-88px)] max-w-[1440px] flex-col justify-center px-4 py-20 sm:px-8">
        <p className="font-mono text-sm uppercase leading-4 text-accent">404</p>
        <h1 className="mt-4 text-5xl font-medium text-ink">Page not found</h1>
        <Button asChild className="mt-8 w-fit" variant="outline">
          <a href="/">Back home</a>
        </Button>
      </main>
    </>
  );
}

function App() {
  const path = window.location.pathname;

  if (path === "/" || path === "/portfolio/") return <HomePage />;
  if (path === "/contact") return <ContactPage />;
  if (path.startsWith("/case-studies/")) return <CaseStudyPage slug={path.split("/").filter(Boolean).at(-1) ?? ""} />;
  if (path.endsWith(".pdf")) {
    window.location.href = asset(path);
    return null;
  }
  return <NotFound />;
}

export default App;
