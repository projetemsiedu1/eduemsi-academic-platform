import { PvSoutenance } from "@/components/timetable/PvSoutenance";

export const metadata = {
  title: "PV de Soutenance PFE | EMSI Univora",
  description: "Procès-verbal officiel de soutenance PFE avec grille d'évaluation EMSI /20 et mention.",
};

export default async function PfePvPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PvSoutenance pfeId={id} />;
}
