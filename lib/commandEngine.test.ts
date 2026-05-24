import { describe, it, expect } from "vitest";
import {
  executeCommand,
  resolvePath,
  longestCommonPrefix,
  pathMatches,
  promptPath,
} from "./commandEngine";

describe("SparshOS Command Engine", () => {
  describe("path helpers", () => {
    it("resolves relative and absolute paths", () => {
      const cwd = ["home", "sparsh"];
      expect(resolvePath(cwd, ".")).toEqual(["home", "sparsh"]);
      expect(resolvePath(cwd, "..")).toEqual(["home"]);
      expect(resolvePath(cwd, "/projects")).toEqual(["projects"]);
      expect(resolvePath(cwd, "~")).toEqual(["home", "sparsh"]);
    });

    it("formats prompt paths correctly", () => {
      expect(promptPath(["home", "sparsh"])).toBe("~");
      expect(promptPath(["projects"])).toBe("/projects");
      expect(promptPath([])).toBe("/");
    });

    it("calculates longest common prefix", () => {
      expect(longestCommonPrefix(["project", "projects", "projection"])).toBe("project");
      expect(longestCommonPrefix(["cd", "clear"])).toBe("c");
      expect(longestCommonPrefix(["help", "about"])).toBe("");
    });

    it("finds matching paths for autocomplete", () => {
      const matches = pathMatches(["home", "sparsh"], "ab", "file");
      expect(matches).toEqual(["about.txt"]);
    });
  });

  describe("executeCommand", () => {
    it("handles help", () => {
      const res = executeCommand("help", ["home", "sparsh"]);
      expect(res.lines.length).toBe(2);
      expect(res.lines[0].kind).toBe("cmd");
      expect(res.lines[1].text).toContain("Commands:");
    });

    it("handles clear", () => {
      const res = executeCommand("clear", ["home", "sparsh"]);
      expect(res.clear).toBe(true);
      expect(res.lines.length).toBe(0);
    });

    it("handles about", () => {
      const res = executeCommand("about", ["home", "sparsh"]);
      expect(res.lines[1].text).toContain("Sparsh");
    });

    it("handles skills", () => {
      const res = executeCommand("skills", ["home", "sparsh"]);
      expect(res.lines[1].text).toContain("Python");
    });

    it("handles projects listing", () => {
      const res = executeCommand("projects", ["home", "sparsh"]);
      expect(res.lines[1].text).toContain("egonav");
      expect(res.lines[1].text).toContain("verdantia");
    });

    it("handles project dossier", () => {
      const res = executeCommand("project egonav", ["home", "sparsh"]);
      expect(res.lines[1].text).toBe("__PROJECT_CARD__egonav");
    });

    it("returns error for invalid project", () => {
      const res = executeCommand("project fake", ["home", "sparsh"]);
      expect(res.lines[1].kind).toBe("error");
    });

    it("handles pwd", () => {
      const res = executeCommand("pwd", ["home", "sparsh"]);
      expect(res.lines[1].text).toBe("~");
    });

    it("handles ls", () => {
      const res = executeCommand("ls", ["home", "sparsh"]);
      expect(res.lines[1].text).toContain("about.txt");
      expect(res.lines[1].text).toContain("skills.json");
    });

    it("handles cd", () => {
      const res = executeCommand("cd /projects", ["home", "sparsh"]);
      expect(res.newCwd).toEqual(["projects"]);
    });

    it("errors on invalid cd", () => {
      const res = executeCommand("cd /nope", ["home", "sparsh"]);
      expect(res.lines[1].kind).toBe("error");
    });

    it("handles cat", () => {
      const res = executeCommand("cat about.txt", ["home", "sparsh"]);
      expect(res.lines[1].text).toContain("intersection of AI");
    });

    it("errors on invalid cat", () => {
      const res = executeCommand("cat nope.txt", ["home", "sparsh"]);
      expect(res.lines[1].kind).toBe("error");
    });

    it("handles open resume", () => {
      const prev = process.env.NEXT_PUBLIC_RESUME_URL;
      process.env.NEXT_PUBLIC_RESUME_URL = "https://drive.google.com/file/d/test/view";
      const res = executeCommand("open resume", ["home", "sparsh"]);
      expect(res.openUrl).toBe("https://drive.google.com/file/d/test/view");
      if (prev === undefined) delete process.env.NEXT_PUBLIC_RESUME_URL;
      else process.env.NEXT_PUBLIC_RESUME_URL = prev;
    });

    it("handles open URL", () => {
      const res = executeCommand("open https://github.com", ["home", "sparsh"]);
      expect(res.openUrl).toBe("https://github.com");
    });

    it("errors on unknown command", () => {
      const res = executeCommand("foobar", ["home", "sparsh"]);
      expect(res.lines[1].kind).toBe("error");
      expect(res.lines[1].text).toContain("command not found");
    });
  });
});
