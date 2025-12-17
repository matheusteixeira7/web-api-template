import { Suspense } from "react";
import { IconLoader2 } from "@tabler/icons-react";
import { ProvidersTable } from "./_components/providers-table";

export const metadata = {
  title: "Profissionais | HealthSync",
  description: "Gerencie os profissionais de saude da sua clinica",
};

function ProvidersTableFallback() {
  return (
    <div className="flex h-64 items-center justify-center">
      <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

export default function ProfessionalsPage() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Profissionais</h1>
        <p className="text-muted-foreground">
          Gerencie os profissionais de saude da clinica.
        </p>
      </div>
      <Suspense fallback={<ProvidersTableFallback />}>
        <ProvidersTable />
      </Suspense>
    </div>
  );
}
