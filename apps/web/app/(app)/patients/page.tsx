import { Suspense } from "react";
import { IconLoader2 } from "@tabler/icons-react";
import { PatientsTable } from "./_components/patients-table";

export const metadata = {
  title: "Pacientes | HealthSync",
  description: "Gerencie os pacientes da sua clinica",
};

function PatientsTableFallback() {
  return (
    <div className="flex h-64 items-center justify-center">
      <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

export default function PatientsPage() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Pacientes</h1>
        <p className="text-muted-foreground">
          Cadastre e gerencie os pacientes da clinica.
        </p>
      </div>
      <Suspense fallback={<PatientsTableFallback />}>
        <PatientsTable />
      </Suspense>
    </div>
  );
}
