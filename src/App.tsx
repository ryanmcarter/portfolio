import { useState } from "react";
import { ArrowLeft, ArrowUpRight, Mail } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { ArticleItems } from "@/components/ArticleItems";
import { CaseStudyCard } from "@/components/CaseStudyCard";
import { Reveal } from "@/components/Motion";
import { SiteHeader } from "@/components/SiteHeader";
import SplitText from "@/components/SplitText";
import {
  asset,
  aboutText,
  caseStudies,
  contactPage,
  experience,
  getCaseStudy,
  homePage,
  itemsForPage,
  profileImage,
  resumeUrl,
} from "@/data/portfolio";

function HomePage() {
  const [introComplete, setIntroComplete] = useState(false);

  return (
    <>
      <motion.div
        initial={false}
        animate={introComplete ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{ pointerEvents: introComplete ? "auto" : "none" }}
      >
        <SiteHeader active="home" />
      </motion.div>
      <main>
        <section className="mx-auto grid max-w-[1440px] gap-16 px-4 pb-12 pt-20 sm:px-8 sm:pt-32 lg:grid-cols-2 lg:gap-24">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-[640px]"
          >
            <SplitText
              tag="h1"
              text="I'm Ryan, a designer with 12+ YOE in Product Design & Design Systems."
              className="text-4xl font-medium leading-[1.18] text-ink sm:text-5xl sm:leading-[64px]"
              delay={12}
              duration={0.65}
              ease="power3.out"
              splitType="words, chars"
              from={{ opacity: 0, y: 36 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.1}
              rootMargin="0px"
              textAlign="left"
              onLetterAnimationComplete={() => setIntroComplete(true)}
            />
            {introComplete && (
              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="mt-6 text-xl leading-9 text-muted sm:text-2xl sm:leading-10"
              >
                More recently, I've learned Claude Code & Codex to prototype & implement my designs.
              </motion.p>
            )}
          </motion.div>

          {introComplete && (
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
          )}
        </section>

        {introComplete && (
          <>
            <section className="mx-auto max-w-[1440px] border-t border-line px-4 py-12 sm:px-8">
              <Reveal>
                <div className="grid gap-x-20 gap-y-12 lg:grid-cols-2">
                  {caseStudies.map((study) => (
                    <CaseStudyCard key={study.slug} {...study} />
                  ))}
                </div>
              </Reveal>
            </section>

            <section className="bg-ink py-20 text-white">
              <div className="mx-auto grid max-w-[1440px] gap-12 px-4 sm:px-8 lg:grid-cols-[1fr_480px]">
                <Reveal>
                  <div>
                    <p className="font-mono text-sm uppercase leading-4 text-rose-300">About</p>
                    <div className="mt-6 max-w-3xl space-y-5 text-lg leading-8 text-neutral-300">
                      {aboutText
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
          </>
        )}
      </main>
    </>
  );
}

function CaseStudyPage({ slug }: { slug: string }) {
  const study = getCaseStudy(slug);

  if (!study) return <NotFound />;

  const orderedItems = itemsForPage(study.page);
  const clientLogo = orderedItems.find((item) => item.type === "image" && /logo/i.test(item.alt));
  const contentItems = orderedItems.filter((item) => item.type !== "h1" && item !== clientLogo);

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
              {clientLogo?.type === "image" && (
                <img alt={clientLogo.alt} className="mt-6 max-h-12 w-auto object-contain" src={clientLogo.src} />
              )}
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

          <section className="grid gap-12 py-16 lg:grid-cols-[320px_minmax(0,900px)]">
            <Reveal>
              <p className="font-mono text-sm uppercase leading-4 text-accent">Case study</p>
            </Reveal>
            <Reveal delay={0.05}>
              <ArticleItems items={contentItems} />
            </Reveal>
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
                Send me an email
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="https://www.linkedin.com/in/ryan-carter-b8902144/?skipRedirect=true" rel="noreferrer" target="_blank">
                LinkedIn
                <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
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
