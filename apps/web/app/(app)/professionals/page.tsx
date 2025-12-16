import { ProvidersTable } from "./_components/providers-table";

export const metadata = {
  title: "Profissionais | HealthSync",
  description: "Gerencie os profissionais de saude da sua clinica",
};

export default function ProfessionalsPage() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Profissionais</h1>
        <p className="text-muted-foreground">
          Gerencie os profissionais de saude da clinica.
        </p>
      </div>
      <ProvidersTable />
    </div>
  );
}
