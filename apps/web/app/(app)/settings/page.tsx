export default function SettingsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
        <h1 className="text-2xl font-semibold">Configurações</h1>
        <p className="text-muted-foreground">
          Configure horários, durações de consulta e preferências da clínica.
        </p>
      </div>
    </div>
  );
}
