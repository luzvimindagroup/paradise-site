import type { Metadata } from "next";
import Home from "../page";

// Temporary preview of the dark theme. Delete once Alan decides.
export const metadata: Metadata = { title: "Dark preview" };

export default function DarkHome() {
  return (
    <div className="theme-dark min-h-dvh">
      <Home />
    </div>
  );
}
