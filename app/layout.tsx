import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SparshOS — Portfolio",
  description: "An interactive retro terminal portfolio for Sparsh: AI, robotics, autonomous systems, and experiments.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
