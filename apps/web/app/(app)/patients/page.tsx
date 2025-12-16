import { PatientsTable } from "./_components/patients-table";

export const metadata = {
  title: "Pacientes | HealthSync",
  description: "Gerencie os pacientes da sua clinica",
};

export default function PatientsPage() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Pacientes</h1>
        <p className="text-muted-foreground">
          Cadastre e gerencie os pacientes da clinica.
        </p>
      </div>
      <PatientsTable />
    </div>
  );
}
