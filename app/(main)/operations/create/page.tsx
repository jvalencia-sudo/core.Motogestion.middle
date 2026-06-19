import { loadCreateOperationDependencies } from "@/app/(main)/operations/actions";
import OperationForm from "./operation-form";

export default async function OperationPage() {
  const operationDependencies = await loadCreateOperationDependencies();
  return <OperationForm operationDependencies={operationDependencies} />;
}
