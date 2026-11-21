import { TeacherPortalView } from "@/components/timetable/TeacherPortalView";

export const metadata = {
  title: "Espace Enseignant | EMSI Univora",
  description: "Planning des cours, surveillances d'examens et contrôle anti-triche des salles.",
};

export default function TeacherPage() {
  return <TeacherPortalView />;
}
