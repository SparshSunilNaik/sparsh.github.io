import { filesystem, FsNode, profile, projects } from "./portfolioData";

export type LineKind = "cmd" | "error" | "system" | "success";
export interface OutputLine { kind?: LineKind; text: string; }
export interface CommandResult {
  lines: OutputLine[];
  newCwd?: string[];
  clear?: boolean;
  openUrl?: string;
}

export const commands = [
  "help","about","skills","projects","project","experience","education","contact","resume",
  "clear","whoami","ls","cd","cat","pwd","neofetch","socials","secret","hack","matrix","roll","sudo","open",
];
export const projectNames = Object.keys(projects);

const resumeUrl = process.env.NEXT_PUBLIC_RESUME_URL || "/resume.pdf";

export const helpText = `Commands:
  help            show this command list
  about           who Sparsh is
  skills          print skill matrix
  projects        list major projects
  project <name>  show project dossier: egonav | verdantia | raptorgang
  experience      builder timeline and hackathon mode
  education       education summary
  contact         contact details & socials
  resume          resume download details
  socials         social links
  neofetch        system card
  ls [-a]         list directory
  cd <path>       change directory
  cat <file>      read file
  pwd             print current directory
  clear           clear terminal
  secret          ???

Keyboard:
  Tab             autocomplete commands, files, folders, and project names
  ↑ / ↓           command history

Hidden-ish: hack, matrix, roll, sudo, open <project>`;

export function nodeAt(path: string[]): FsNode | undefined {
  let node: FsNode | undefined = filesystem;
  for (const part of path) node = node?.children?.[part];
  return node;
}

export function resolvePath(cwd: string[], raw = ""): string[] {
  const next = raw.startsWith("/") || raw.startsWith("~") ? [] : [...cwd];
  const cleaned = raw.replace(/^~\/?/, "home/sparsh/").replace(/^\//, "");
  for (const part of cleaned.split("/").filter(Boolean)) {
    if (part === ".") continue;
    if (part === "..") next.pop();
    else next.push(part);
  }
  return next;
}

export function promptPath(cwd: string[]): string {
  const p = "/" + cwd.join("/");
  return p.replace("/home/sparsh", "~") || "/";
}

export function longestCommonPrefix(values: string[]): string {
  if (!values.length) return "";
  return values.reduce((prefix, value) => {
    let i = 0;
    while (i < prefix.length && prefix[i] === value[i]) i++;
    return prefix.slice(0, i);
  });
}

export function splitPathInput(raw: string) {
  const slash = raw.lastIndexOf("/");
  if (slash === -1) return { base: "", leaf: raw };
  return { base: raw.slice(0, slash + 1), leaf: raw.slice(slash + 1) };
}

export function pathMatches(cwd: string[], rawPath: string, mode: "any" | "dir" | "file"): string[] {
  const { base, leaf } = splitPathInput(rawPath);
  const dirPath = resolvePath(cwd, base || ".");
  const dir = nodeAt(dirPath);
  if (dir?.type !== "dir" || !dir.children) return [];
  return Object.entries(dir.children)
    .filter(([name, node]) => name.startsWith(leaf) && (mode === "any" || node.type === mode))
    .map(([name, node]) => `${base}${name}${node.type === "dir" ? "/" : ""}`);
}

export function executeCommand(command: string, cwd: string[]): CommandResult {
  const trimmed = command.trim();
  const outLines: OutputLine[] = [{ kind: "cmd", text: `${promptPath(cwd)} $ ${trimmed}` }];
  if (!trimmed) return { lines: outLines };

  const [cmd, ...args] = trimmed.split(/\s+/);
  const arg = args.join(" ");

  if (cmd === "clear") return { lines: [], clear: true };

  if (cmd === "help") {
    outLines.push({ text: helpText });
  } else if (cmd === "about" || cmd === "whoami") {
    outLines.push({ text: "Sparsh — CSE student, AI/robotics builder, autonomous systems tinkerer. Current arc: making robots perceive, reason, and move with practical edge constraints." });
  } else if (cmd === "skills") {
    outLines.push({ text: nodeAt(["home", "sparsh"])?.children?.["skills.json"].content || "" });
  } else if (cmd === "projects") {
    outLines.push({ text: Object.entries(projects).map(([k, p]) => `${k.padEnd(11)} ${p.oneLine}`).join("\n") + "\n\nUse: project egonav" });
  } else if (cmd === "project") {
    const key = args[0] as keyof typeof projects;
    if (projects[key]) outLines.push({ text: `__PROJECT_CARD__${key}` });
    else outLines.push({ kind: "error", text: "Project not found. Try: egonav, verdantia, raptorgang" });
  } else if (cmd === "experience") {
    outLines.push({ text: "Experience mode: prototype → test → break → learn → ship. Hackathons, robotics builds, AI experiments, smart-city product thinking, and enough debugging lore to qualify as a side quest." });
  } else if (cmd === "education") {
    outLines.push({ text: "Computer Science Engineering student. Edit exact college/year/CGPA in lib/portfolioData.ts when ready." });
  } else if (cmd === "contact") {
    outLines.push({ kind: "success", text: `Email: ${profile.contact.email}\nGitHub: ${profile.contact.github}\nLinkedIn: ${profile.contact.linkedin}\nX/Twitter: ${profile.contact.x}` });
  } else if (cmd === "socials") {
    outLines.push({ text: `${profile.contact.github}\n${profile.contact.linkedin}\n${profile.contact.x}` });
  } else if (cmd === "resume") {
    outLines.push({ text: `Resume: ${resumeUrl}\nType 'open resume' to view/download.` });
  } else if (cmd === "pwd") {
    outLines.push({ text: promptPath(cwd) });
  } else if (cmd === "ls") {
    const showAll = args.includes("-a");
    const pathArg = args.find((item) => !item.startsWith("-"));
    const node = nodeAt(pathArg ? resolvePath(cwd, pathArg) : cwd);
    if (node?.type !== "dir") outLines.push({ kind: "error", text: `ls: no such directory: ${pathArg || ""}` });
    else {
      const names = Object.keys(node.children || {}).filter((n) => showAll || !n.startsWith("."));
      outLines.push({ text: names.map((n) => `${node.children?.[n].type === "dir" ? "drwx" : "-rw-"}  ${n}`).join("\n") || "empty" });
    }
  } else if (cmd === "cd") {
    const target = resolvePath(cwd, arg || "~");
    const node = nodeAt(target);
    if (node?.type === "dir") return { lines: outLines, newCwd: target };
    else outLines.push({ kind: "error", text: `cd: no such directory: ${arg}` });
  } else if (cmd === "cat") {
    if (!arg) outLines.push({ kind: "error", text: "cat: missing file operand" });
    else {
      const node = nodeAt(resolvePath(cwd, arg));
      if (node?.type === "file") outLines.push({ text: node.content || "" });
      else outLines.push({ kind: "error", text: `cat: no such file: ${arg}` });
    }
  } else if (cmd === "neofetch") {
    outLines.push({ text: `      ███████╗  ${profile.os}\n      ██╔════╝  ------------------\n      ███████╗  user: Sparsh\n      ╚════██║  role: CSE Student & Builder\n      ███████║  focus: ${profile.focus.join(" · ")}\n      ╚══════╝  shell: curiosity.exe\n                uptime: always building\n                palette: █ █ █ █ █ █ █ █` });
  } else if (cmd === "secret") {
    outLines.push({ kind: "success", text: "Achievement unlocked: asked directly. Try `ls -a /` and inspect the classified gremlin protocol." });
  } else if (cmd === "sudo") {
    outLines.push({ kind: "error", text: "sparsh is not in the boring-portfolioers file. This incident will be logged." });
  } else if (cmd === "matrix") {
    outLines.push({ text: "Wake up, builder... follow the green cursor." });
  } else if (cmd === "roll") {
    outLines.push({ text: `You rolled a ${Math.ceil(Math.random() * 20)}. ${Math.random() > 0.5 ? "Prototype survives." : "Prototype explodes usefully."}` });
  } else if (cmd === "hack") {
    const roll = Math.ceil(Math.random() * 20);
    outLines.push({ kind: "success", text: "Mini-game: beat 14+ to crack the firewall." });
    outLines.push({ text: `Firewall roll: ${roll} — ${roll >= 15 ? "ACCESS GRANTED: /games/.savefile" : "ACCESS DENIED: add more coffee"}` });
  } else if (cmd === "open") {
    const target = args[0];
    if (!target) {
      outLines.push({ kind: "error", text: "open: what do you want to open? Try: resume, <project_name>, or a URL" });
    } else if (target === "resume" || target === "resume.pdf" || target === "/resume.pdf") {
      return { lines: [...outLines, { kind: "success", text: "Opening resume in new tab..." }], openUrl: resumeUrl };
    } else if (projects[target as keyof typeof projects]) {
      outLines.push({ text: `__PROJECT_CARD__${target}` });
    } else if (target.startsWith("http://") || target.startsWith("https://")) {
      return { lines: [...outLines, { kind: "success", text: `Opening ${target} in new tab...` }], openUrl: target };
    } else {
      const fileNode = nodeAt(resolvePath(cwd, target));
      if (fileNode?.type === "file") outLines.push({ text: fileNode.content || "" });
      else outLines.push({ kind: "error", text: `open: cannot open '${target}'. Try: resume, egonav, verdantia, raptorgang` });
    }
  } else {
    outLines.push({ kind: "error", text: `${cmd}: command not found. Type 'help'.` });
  }

  return { lines: outLines };
}
