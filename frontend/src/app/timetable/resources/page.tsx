import { PlanningResources } from "@/components/timetable/PlanningResources";
import { Suspense } from "react";

// Session checks and planning data load in the client-side shell and context.
export const instant = false;

export default function ResourcesManagementPage() {
  return (
    <Suspense
      fallback={
        <main className="planning-access" role="status">
          Chargement des ressources…
        </main>
      }
    >
      <PlanningResources />
    </Suspense>
  );
}
