import Link from "next/link";
import {
  Users,
  CalendarDays,
  BookOpen,
  Rocket,
  MessagesSquare,
  Coffee,
} from "lucide-react";
import { MarketingNav } from "@/components/layout/MarketingNav";
import { IdCardHero } from "@/components/shared/IdCardHero";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: BookOpen,
    title: "Study partners, not group chats",
    body: "Post what you're stuck on — DSA, GATE, ML — and match with someone at your own college already working on it.",
  },
  {
    icon: Rocket,
    title: "Build real project teams",
    body: "Need a frontend dev or an ML engineer for a hackathon? Post the role, review requests, pick your team.",
  },
  {
    icon: CalendarDays,
    title: "Never miss what's on campus",
    body: "Workshops, hackathons, cultural fests — organized by category, with a map of where everything actually is.",
  },
  {
    icon: Coffee,
    title: "Spontaneous plans, not just profiles",
    body: "Coffee in 30 minutes. Football at 6. Post a hangout, let people nearby jump in.",
  },
  {
    icon: Users,
    title: "Communities that aren't dead",
    body: "Coding, AI, Photography, Gym — join the ones that match how you actually spend your time.",
  },
  {
    icon: MessagesSquare,
    title: "Chat that feels instant",
    body: "Realtime messaging with typing indicators and read receipts, once you've actually connected.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <MarketingNav />

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pb-24 pt-20">
        <div className="mx-auto grid max-w-6xl items-center gap-16 md:grid-cols-2">
          <div>
            <span className="inline-block rounded-full border border-border bg-bg-surface/60 px-3 py-1 font-mono text-xs tracking-wide text-ink-muted">
              FOR .EDU / .AC.IN EMAILS ONLY
            </span>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.1] md:text-5xl">
              Your campus, <span className="text-primary">verified</span>.
              <br />
              Not another feed.
            </h1>
            <p className="mt-5 max-w-md text-lg text-ink-muted">
              InCampus connects you with real students from your college and nearby
              campuses — for study partners, project teams, events, and the plans
              that actually fill your week.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <Link href="/signup">
                <Button size="lg">Get your student ID</Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="glass">I already have one</Button>
              </Link>
            </div>
          </div>
          <IdCardHero />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-3xl font-semibold">
            Built for what campus life actually is
          </h2>
          <p className="mt-3 max-w-xl text-ink-muted">
            Not a dating app. Not another Instagram clone. Real coordination between
            real, verified students.
          </p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Card key={f.title} className="p-6">
                <f.icon className="text-primary" size={22} />
                <h3 className="mt-4 font-display text-base font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-ink-muted">{f.body}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24">
        <div className="glass mx-auto max-w-4xl rounded-3xl p-12 text-center">
          <h2 className="font-display text-3xl font-semibold">
            Your college email gets you in the door.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-ink-muted">
            Everyone here is verified with a college email — no strangers, no bots,
            just your actual campus.
          </p>
          <Link href="/signup">
            <Button size="lg" className="mt-7">Create your account</Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border/60 px-6 py-10 text-center text-sm text-ink-faint">
        © {new Date().getFullYear()} InCampus. Built for students, by students.
      </footer>
    </div>
  );
}
