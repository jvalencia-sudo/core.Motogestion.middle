import { getTallerName } from "./actions";

export default async function page() {
  const taller = await getTallerName();

  return (
    <div className="flex flex-1 flex-col overflow-hidden p-8">
      <h1 className="text-3xl font-bold mb-2">Bienvenido a Moto.Gestión</h1>
      {taller ? (
        <p className="text-lg font-medium text-primary mb-1">{taller}</p>
      ) : null}
      <p className="text-muted-foreground">
        Sistema de gestión de taller de motos
      </p>
    </div>
  );
}
