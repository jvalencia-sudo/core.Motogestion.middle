import PageHeader from "@/components/page-header";
import TallerForm from "../taller-form";

export default function CrearTallerPage() {
  return (
    <>
      <PageHeader
        title="Crear taller"
        subtitle="El dueño recibe la invitación por correo, igual que en el registro público."
      />
      <TallerForm />
    </>
  );
}
