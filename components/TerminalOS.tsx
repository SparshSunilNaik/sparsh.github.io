"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { projects } from "@/lib/portfolioData";
import type { OutputLine } from "@/lib/commandEngine";
import {
  commands,
  executeCommand,
  longestCommonPrefix,
  pathMatches,
  projectNames,
  promptPath,
} from "@/lib/commandEngine";

type Line = { id: number; kind?: "cmd" | "error" | "system" | "success"; text: string };

const bootLines = [
  "SparshOS v1.0 // personal operating system",
  "checking memory ............ OK",
  "loading robotics.module ..... OK",
  "loading vlm_nav.driver ...... OK",
  "mounting /projects .......... OK",
  "warming up story engine ..... OK",
  "starting terminal shell ..... READY",
];


function ProjectCard({ name }: { name: keyof typeof projects }) {
  const p = projects[name];
  return (
    <div className="mt-2 rounded border border-green-400/25 bg-green-400/[0.03] p-3 text-sm">
      <div className="text-green-200">{p.name}</div>
      <p className="mt-1 text-zinc-300">{p.oneLine}</p>
      <div className="mt-2 grid gap-2 md:grid-cols-2">
        <p><span className="text-green-300">Problem:</span> {p.problem}</p>
        <p><span className="text-green-300">Solution:</span> {p.solution}</p>
      </div>
      <div className="mt-2 text-zinc-400">Tech: {p.tech.join(" · ")}</div>
      <ul className="mt-2 list-inside list-disc text-zinc-300">
        {p.highlights.map((h) => <li key={h}>{h}</li>)}
      </ul>
    </div>
  );
}

export default function TerminalOS() {
  const [booting, setBooting] = useState(true);
  const [bootIndex, setBootIndex] = useState(0);
  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState("");
  const [cwd, setCwd] = useState(["home", "sparsh"]);
  const [history, setHistory] = useState<string[]>([]);
  const [histIndex, setHistIndex] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!booting) return;
    if (bootIndex >= bootLines.length) {
      const t = setTimeout(() => {
        setBooting(false);
        setLines([
          { id: 1, kind: "system", text: "Welcome to SparshOS. Type 'help' to explore." },
          { id: 2, kind: "system", text: "Tip: this portfolio is a filesystem. Try: ls, cat about.txt, cd /projects" },
        ]);
      }, 450);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setBootIndex((i) => i + 1), bootIndex === 0 ? 300 : 220);
    return () => clearTimeout(t);
  }, [bootIndex, booting]);

  useEffect(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), [lines]);

  const pushLines = (items: OutputLine[]) => {
    setLines((prev) => [...prev, ...items.map((item, i) => ({ ...item, id: Date.now() + i }))]);
  };

  const autocomplete = () => {
    const hasTrailingSpace = /\s$/.test(input);
    const parts = input.split(/\s+/);
    const cmd = parts[0] || "";

    if (!input.includes(" ") && !hasTrailingSpace) {
      const matches = commands.filter((candidate) => candidate.startsWith(cmd));
      if (matches.length === 1) setInput(`${matches[0]} `);
      else if (matches.length > 1) {
        const prefix = longestCommonPrefix(matches);
        if (prefix.length > cmd.length) setInput(prefix);
        else pushLines([{ kind: "system", text: matches.join("  ") }]);
      }
      return;
    }

    const targetIndex = hasTrailingSpace ? parts.length : parts.length - 1;
    const currentArg = hasTrailingSpace ? "" : parts[targetIndex] || "";
    let matches: string[] = [];

    if (cmd === "project" || cmd === "open") matches = projectNames.filter((name) => name.startsWith(currentArg));
    else if (cmd === "cd") matches = pathMatches(cwd, currentArg, "dir");
    else if (cmd === "cat") matches = pathMatches(cwd, currentArg, "file");
    else if (cmd === "ls") matches = pathMatches(cwd, currentArg, "any");

    if (matches.length === 1) {
      const nextParts = hasTrailingSpace ? [...parts.filter(Boolean), matches[0]] : [...parts.slice(0, targetIndex), matches[0]];
      setInput(`${nextParts.join(" ")}${matches[0].endsWith("/") ? "" : " "}`);
    } else if (matches.length > 1) {
      const prefix = longestCommonPrefix(matches);
      if (prefix.length > currentArg.length) {
        const nextParts = hasTrailingSpace ? [...parts.filter(Boolean), prefix] : [...parts.slice(0, targetIndex), prefix];
        setInput(nextParts.join(" "));
      } else {
        pushLines([{ kind: "system", text: matches.join("  ") }]);
      }
    }
  };

  const run = (raw: string) => {
    const result = executeCommand(raw, cwd);
    if (result.clear) {
      setLines([]);
    } else {
      pushLines(result.lines);
    }
    if (result.newCwd) setCwd(result.newCwd);
    if (result.openUrl) window.open(result.openUrl, "_blank", "noopener,noreferrer");
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    run(input);
    if (input.trim()) setHistory((h) => [input, ...h].slice(0, 40));
    setHistIndex(null);
    setInput("");
  };

  const particles = useMemo(() => Array.from({ length: 22 }, (_, i) => i), []);

  return (
    <main className="min-h-screen overflow-hidden bg-[#030604] text-green-100 selection:bg-green-300 selection:text-black" onClick={() => inputRef.current?.focus()}>
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(74,222,128,.16),transparent_35%),linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px)] bg-[length:100%_100%,100%_4px]" />
      <div className="pointer-events-none fixed inset-0 shadow-[inset_0_0_140px_rgba(0,0,0,.9)]" />
      {particles.map((p) => <span key={p} className="pointer-events-none fixed h-1 w-1 animate-pulse rounded-full bg-green-300/20" style={{ left: `${(p * 47) % 100}%`, top: `${(p * 31) % 100}%`, animationDelay: `${p * 120}ms` }} />)}

      <section className="relative mx-auto flex min-h-screen max-w-6xl items-center p-3 sm:p-6">
        <div className="w-full rounded-xl border border-green-400/25 bg-black/72 shadow-2xl shadow-green-950/40 backdrop-blur">
          <header className="flex items-center justify-between border-b border-green-400/20 px-4 py-3 text-xs text-green-300/80">
            <div className="flex gap-2"><span className="h-3 w-3 rounded-full bg-red-500/70" /><span className="h-3 w-3 rounded-full bg-yellow-400/70" /><span className="h-3 w-3 rounded-full bg-green-400/70" /></div>
            <span>SPARSHOS://terminal</span><span className="hidden sm:inline">tab autocomplete enabled</span>
          </header>

          <div className="h-[78vh] overflow-y-auto p-4 font-mono text-[13px] leading-relaxed sm:text-sm">
            {booting ? (
              <div className="space-y-2">
                {bootLines.slice(0, bootIndex).map((l) => <p key={l} className="animate-fadeIn">{l}</p>)}
                <span className="inline-block h-4 w-2 animate-pulse bg-green-300" />
              </div>
            ) : (
              <>
                {lines.map((line) => line.text.startsWith("__PROJECT_CARD__") ? (
                  <ProjectCard key={line.id} name={line.text.replace("__PROJECT_CARD__", "") as keyof typeof projects} />
                ) : (
                  <pre key={line.id} className={`whitespace-pre-wrap break-words ${line.kind === "cmd" ? "text-green-300" : line.kind === "error" ? "text-red-300" : line.kind === "success" ? "text-emerald-200" : line.kind === "system" ? "text-zinc-300" : "text-green-100/90"}`}>{line.text}</pre>
                ))}
                <form onSubmit={submit} className="mt-2 flex gap-2">
                  <label className="shrink-0 text-green-300">{promptPath(cwd)} $</label>
                  <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => {
                    if (e.key === "Tab") { e.preventDefault(); autocomplete(); }
                    if (e.key === "ArrowUp") { e.preventDefault(); const next = histIndex === null ? 0 : Math.min(histIndex + 1, history.length - 1); setHistIndex(next); setInput(history[next] || ""); }
                    if (e.key === "ArrowDown") { e.preventDefault(); const next = histIndex === null ? null : histIndex - 1; setHistIndex(next !== null && next >= 0 ? next : null); setInput(next !== null && next >= 0 ? history[next] || "" : ""); }
                  }} className="min-w-0 flex-1 bg-transparent text-green-100 outline-none" autoFocus aria-label="Terminal input" spellCheck={false} autoCapitalize="none" autoComplete="off" />
                </form>
                <div ref={bottomRef} />
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
