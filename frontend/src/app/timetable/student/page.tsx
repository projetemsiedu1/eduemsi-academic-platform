import { StudentPortalView } from "@/components/timetable/StudentPortalView";

export const metadata = {
  title: "Espace Étudiant | EMSI Univora",
  description: "Consultation de l'emploi du temps, convocations d'examens et assiduité.",
};

export default function StudentPage() {
  return <StudentPortalView />;
}
