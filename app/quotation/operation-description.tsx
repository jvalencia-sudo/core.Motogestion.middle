import React from "react";
import { VwOperationWithDetail } from "@/lib/types/operation/operation";

type Props = {
  dataOperation: VwOperationWithDetail | null;
  language: "en" | "es";
};

const OperationDetails: React.FC<Props> = ({ dataOperation, language }) => {
  if (!dataOperation) return null;

  const translations = {
    en: {
      type: "Type",
      origin: "Origin",
      service: "Service",
      status: "Status",
      incoterms: "Incoterms",
      hazardTypes: "Hazard Types",
      vehicleTypes: "Vehicle Types",
      requiresEscort: "Requires Escort",
      loadDate: "Load Date",
      createdAt: "Created At",
      observation: "Observation",
      yes: "Yes",
      no: "No",
    },
    es: {
      type: "Tipo",
      origin: "Origen",
      service: "Servicio",
      status: "Estado",
      incoterms: "Incoterms",
      hazardTypes: "Tipos de Peligro",
      vehicleTypes: "Tipos de Vehículo",
      requiresEscort: "Requiere Escolta",
      loadDate: "Fecha de Carga",
      createdAt: "Creado el",
      observation: "Observación",
      yes: "Sí",
      no: "No",
    },
  };

  const t = translations[language];

  const formatDate = (dateString?: string, showTime: boolean = false) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString(language === "es" ? "es-ES" : "en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      ...(showTime && { hour: "2-digit", minute: "2-digit" }),
    });
  };

  return (
    <div className="grid grid-cols-3 grid-row gap-2">
      {dataOperation.isLocal && dataOperation.operationTypeName && (
        <div>
          <strong>{t.type}:</strong> {dataOperation.operationTypeName}
        </div>
      )}
      {dataOperation.locationOriginName && (
        <div>
          <strong>{t.origin}:</strong> {dataOperation.locationOriginName}
        </div>
      )}
      {dataOperation.serviceTypeName && (
        <div>
          <strong>{t.service}:</strong> {dataOperation.serviceTypeName}
        </div>
      )}
      {dataOperation.incoterms.length > 0 && (
        <div>
          <strong>{t.incoterms}:</strong> {dataOperation.incoterms.join(", ")}
        </div>
      )}
      {dataOperation.hazardTypes.length > 0 && (
        <div>
          <strong>{t.hazardTypes}:</strong>{" "}
          {dataOperation.hazardTypes.join(", ")}
        </div>
      )}
      {dataOperation.vehicleTypes.length > 0 && (
        <div>
          <strong>{t.vehicleTypes}:</strong>{" "}
          {dataOperation.vehicleTypes.join(", ")}
        </div>
      )}
      {dataOperation.isLocal && dataOperation.requiresEscort !== null && (
        <div>
          <strong>{t.requiresEscort}:</strong>{" "}
          {dataOperation.requiresEscort ? t.yes : t.no}
        </div>
      )}
      {dataOperation.loadDate && (
        <div>
          <strong>{t.loadDate}:</strong>{" "}
          {formatDate(dataOperation.loadDate, dataOperation.isLocal)}
        </div>
      )}
      {dataOperation.observation && (
        <div>
          <strong>{t.observation}:</strong> {dataOperation.observation}
        </div>
      )}
    </div>
  );
};

export default OperationDetails;
