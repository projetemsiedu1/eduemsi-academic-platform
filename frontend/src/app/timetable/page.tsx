import { PlanningOverview } from "@/components/timetable/PlanningOverview";

// Session checks and planning data load in the client-side shell and context.
// This segment therefore does not promise instant navigation.
export const instant = false;

export default function TimetablePage() {
  return <PlanningOverview />;
}
