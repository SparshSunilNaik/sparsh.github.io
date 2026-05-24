export type NodeKind = "file" | "dir";

export type FsNode = {
  type: NodeKind;
  content?: string;
  children?: Record<string, FsNode>;
};

export const profile = {
  name: "Sparsh",
  os: "SparshOS v1.0",
  role: "Computer Science Engineering student · AI/robotics builder",
  location: "India / Asia-Calcutta",
  focus: ["robotics", "VLA/autonomous systems", "VLM navigation", "embedded AI", "ML experiments", "smart cities"],
  contact: {
    email: "your.email@example.com",
    github: "https://github.com/your-handle",
    linkedin: "https://linkedin.com/in/your-handle",
    x: "https://x.com/your-handle",
    resume: "/resume.pdf",
  },
};

export const projects = {
  egonav: {
    name: "EgoNav",
    oneLine: "Robot navigation with Raspberry Pi, VLM reasoning, and multi-camera perception.",
    problem: "Low-cost robots need better spatial reasoning without relying on heavy stacks or perfect maps.",
    solution: "Prototype an embodied navigation loop using camera feeds, VLM interpretation, and pragmatic control logic.",
    tech: ["Raspberry Pi", "Python", "VLMs", "multi-camera", "robotics", "navigation"],
    highlights: ["sensor-to-decision pipeline", "camera placement experiments", "edge constraints", "autonomous behavior loops"],
    images: ["/placeholders/egonav-1.svg"],
  },
  verdantia: {
    name: "Verdantia",
    oneLine: "Smart city concept focused on greener, more intelligent urban systems.",
    problem: "Cities leak efficiency through disconnected data, traffic, energy, and civic feedback loops.",
    solution: "A modular smart-city proposal mixing AI, dashboards, IoT-style sensing, and sustainability-first planning.",
    tech: ["AI", "IoT concepts", "dashboards", "urban tech", "sustainability"],
    highlights: ["systems thinking", "civic UX", "environmental metrics", "hackathon-ready storytelling"],
    images: ["/placeholders/verdantia-1.svg"],
  },
  raptorgang: {
    name: "Raptor Gang",
    oneLine: "Autonomous delivery bot concept with a playful identity and serious builder energy.",
    problem: "Campus/local delivery bots need robust autonomy, simple UX, and memorable product character.",
    solution: "A compact delivery robot concept exploring navigation, dispatch, and field constraints.",
    tech: ["embedded systems", "robotics", "autonomy", "path planning", "product thinking"],
    highlights: ["delivery workflow", "bot personality", "practical hardware constraints", "startup curiosity"],
    images: ["/placeholders/raptorgang-1.svg"],
  },
};

const projectFiles = Object.fromEntries(
  Object.entries(projects).map(([key, p]) => [
    key,
    {
      type: "dir" as const,
      children: {
        "README.md": {
          type: "file" as const,
          content: `# ${p.name}\n\n${p.oneLine}\n\nProblem: ${p.problem}\n\nSolution: ${p.solution}\n\nTech: ${p.tech.join(", ")}\n\nHighlights:\n${p.highlights.map((h) => `- ${h}`).join("\n")}\n\nImages: add real assets in /public and edit lib/portfolioData.ts`,
        },
        "stack.json": { type: "file" as const, content: JSON.stringify(p.tech, null, 2) },
      },
    },
  ])
);

export const filesystem: FsNode = {
  type: "dir",
  children: {
    home: {
      type: "dir",
      children: {
        sparsh: {
          type: "dir",
          children: {
            "about.txt": {
              type: "file",
              content:
                "Sparsh is a Computer Science Engineering student building at the intersection of AI, robotics, and autonomous systems. He likes projects with a story: robots that move, cities that think, tools that feel alive, and experiments that teach something even when they fail.",
            },
            "skills.json": {
              type: "file",
              content: JSON.stringify(
                {
                  languages: ["Python", "JavaScript/TypeScript", "C/C++ basics"],
                  ai_ml: ["ML fundamentals", "VLM experiments", "prompt/system design", "agentic workflows"],
                  robotics: ["Raspberry Pi", "multi-camera perception", "navigation", "embedded constraints"],
                  web: ["React", "Next.js", "Tailwind", "interactive UI"],
                  traits: ["builder", "experimenter", "hackathon mode", "startup curious", "story-driven gamer"],
                },
                null,
                2
              ),
            },
            "achievements.log": {
              type: "file",
              content:
                "[hackathons] ships fast, learns faster\n[robotics] EgoNav navigation stack in progress\n[smart-city] Verdantia concept/system design\n[autonomy] Raptor Gang delivery bot exploration\n[meta] turns vague ideas into buildable prototypes",
            },
            "currently_building.md": {
              type: "file",
              content:
                "# Currently Building\n\n- EgoNav: embodied navigation with Raspberry Pi + VLM + multiple cameras\n- A portfolio that behaves like a personal operating system\n- Better taste for AI products that are useful, not just shiny",
            },
          },
        },
      },
    },
    projects: { type: "dir", children: projectFiles },
    games: {
      type: "dir",
      children: {
        "README.txt": { type: "file", content: "Try: hack, roll, sudo, matrix, open raptorgang" },
        ".savefile": { type: "file", content: "player_class=story-driven_gamer\nachievement=checked_hidden_directory" },
      },
    },
    logs: {
      type: "dir",
      children: {
        "timeline.log": { type: "file", content: "T-∞: liked computers\nT-1: found robotics\nT+0: building systems that move, see, and decide\nT+1: probably debugging something at 2 AM" },
        "exam_survival.log": { type: "file", content: "coffee=optional\npanic=contained\nsyllabus=eventually\noutcome=we ship anyway" },
      },
    },
    ".classified": {
      type: "dir",
      children: {
        "gremlin_protocol.txt": { type: "file", content: "Build small. Test fast. Add lore. Never become a boring dashboard." },
      },
    },
  },
};
