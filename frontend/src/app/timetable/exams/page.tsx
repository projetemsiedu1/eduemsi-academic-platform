import { PlanningExams } from "@/components/timetable/PlanningExams";

export const metadata = {
  title: "Planification des Examens | EMSI Univora",
  description: "Planification des sessions d'examens, affectation des salles et des surveillants.",
};

export default function ExamsPage() {
  return <PlanningExams />;
}
