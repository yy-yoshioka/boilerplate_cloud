/** Winston child‑logger が持つ共通キー定義 */
export type LogContext = {
  correlationId: string;
  userId?: string;
  orgId?: string;
  projectId?: string;
};
