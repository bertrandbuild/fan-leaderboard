export type IAgentName = `${string}_${string}_${string}`;

export type AgentStatus = 'enabled' | 'disabled' | 'pending' | 'error';

export type IAgentDetails = {
  name: string;
  description: string;
  systemPrompt: string;
  persona?: string;
  model: string;
};

export type IAgent = {
  id?: string;
  version: number;
  details: IAgentDetails;
  status: AgentStatus;
};

export interface IApiErrorResponse {
  /** The status of the error (e.g. 'error', 'success') */
  status: string;
  /** The code of the error (e.g. 400, 401, 403, 404, 500) */
  code: number;
  /** The message of the error */
  message: string;
  /** The details of the error */
  details?: any;
}
