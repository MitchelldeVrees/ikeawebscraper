"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { BellRing } from "lucide-react";

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        const duration = 1200;
        const start = performance.now();

        const step = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          setValue(Math.floor(target * progress));
          if (progress < 1) {
            requestAnimationFrame(step);
          }
        };

        requestAnimationFrame(step);
        observer.disconnect();
      },
      { threshold: 0.35 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {new Intl.NumberFormat("nl-NL").format(value)}
      {suffix}
    </span>
  );
}

export function HomeDynamic() {
  const [showFloating, setShowFloating] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShowFloating(window.scrollY > 640);
    };

    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const counters = useMemo(
    () => [
      { label: "alerts verstuurd deze maand", value: 1247 },
      { label: "actieve deal hunters", value: 200, suffix: "+" },
      { label: "gem. tijdswinst per week", value: 4, suffix: " uur" },
    ],
    []
  );

  return (
    <>
      <div className="rounded-2xl bg-card px-6 py-5 shadow-sm ring-1 ring-border">
        <div className="grid gap-6 sm:grid-cols-3 sm:divide-x sm:divide-border">
          {counters.map((counter) => (
            <p key={counter.label} className="text-sm text-muted-foreground sm:px-6 first:pl-0 last:pr-0">
              <span className="block text-2xl font-bold text-foreground">
                <AnimatedCounter target={counter.value} suffix={counter.suffix} />
              </span>
              {counter.label}
            </p>
          ))}
        </div>
      </div>

      <div className="fixed bottom-4 right-4 z-50">
        {showFloating && (
          <Link
            href="#watch-alerts"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition hover:bg-primary/90 md:hidden"
          >
            <BellRing className="h-4 w-4" />
            Start gratis
          </Link>
        )}
      </div>
    </>
  );
}
