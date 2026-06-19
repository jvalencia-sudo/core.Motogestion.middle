export type DocumentHistory = {
  documentHistoryId: number;
  createdAt: string;
  versionNumber: number;
  documentKey: string;
  changeReason: string;
  changedBy: number | null;
  documentId: number;
  changeTimestamp: string;
};
