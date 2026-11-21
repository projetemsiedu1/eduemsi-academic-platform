import type { Metadata } from "next";
import type { ReactNode } from "react";
import { TimetableShell } from "@/components/timetable/TimetableShell";
export const metadata: Metadata = {
  title: "Responsable planning",
  robots: { index: false, follow: false },
};
export default function TimetableLayout({ children }: { children: ReactNode }) {
  return <TimetableShell>{children}</TimetableShell>;
}
