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
  const [showDemoAlert, setShowDemoAlert] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => {
      setShowFloating(window.scrollY > 640);
    };

    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const counters = useMemo(
    () => [
      { label: "alerts verstuurd deze maand", value: 1247 },
      { label: "actieve deal hunters", value: 200, suffix: "+" },
      { label: "gem. tijdswinst per week", value: 4, suffix: " uur" },
    ],
    []
  );

  const runDemo = () => {
    setShowDemoAlert(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => setShowDemoAlert(false), 3000);
  };

  return (
    <>
      <div className="rounded-2xl bg-white px-6 py-5 shadow-sm ring-1 ring-slate-100">
        <div className="grid gap-6 sm:grid-cols-3 sm:divide-x sm:divide-slate-100">
          {counters.map((counter) => (
            <p key={counter.label} className="text-sm text-slate-500 sm:px-6 first:pl-0 last:pr-0">
              <span className="block text-2xl font-bold text-slate-900">
                <AnimatedCounter target={counter.value} suffix={counter.suffix} />
              </span>
              {counter.label}
            </p>
          ))}
        </div>
      </div>

      <div className="fixed bottom-4 right-4 z-50">
        {showDemoAlert && (
          <div className="mb-3 max-w-xs rounded-xl border border-emerald-300 bg-white p-3 shadow-lg">
            <p className="text-xs text-slate-500">Live demo alert</p>
            <p className="font-semibold text-slate-900">Nu in Eindhoven: IDASEN bureau voor €199.</p>
          </div>
        )}
        <button
          type="button"
          onClick={runDemo}
          className="mb-2 hidden rounded-xl border border-blue-300 bg-white px-4 py-2 text-sm font-semibold text-blue-900 shadow-sm hover:bg-blue-50 md:inline-flex"
        >
          Live demo
        </button>

        {showFloating && (
          <Link
            href="#watch-alerts"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-600 md:hidden"
          >
            <BellRing className="h-4 w-4" />
            Start gratis
          </Link>
        )}
      </div>
    </>
  );
}
