export type ToolMode = "passive" | "active" | "offline";

export interface Tool {
  id: string;
  name: string;
  category: string;
  tags: string[];
  mode: ToolMode;
  template: "";
}

export interface Project {
  domain: string;
  verified: boolean;
  createdAt: string;
  notes?: string;
}

export interface WorkflowStep {
  toolId: string;
  transforms: string[];
}

export interface WorkflowPlan {
  id: string;
  name: string;
  steps: WorkflowStep[];
}

export interface AuditLog {
  ts: string;
  action: string;
  domainHash: string;
  metadata?: Record<string, string | number | boolean | null>;
}
