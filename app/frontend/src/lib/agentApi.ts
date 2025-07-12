import { SERVER_URL } from "@/config/config";

export interface Agent {
  id: string;
  name: string;
  description: string;
  status: string;
  // Add other agent properties as needed
}

export interface CreateAgentRequest {
  name: string;
  description: string;
  // Add other required fields
}

export interface UpdateAgentRequest {
  name?: string;
  description?: string;
  // Add other updatable fields
}

export async function fetchAgents(): Promise<Agent[]> {
  try {
    const response = await fetch(`${SERVER_URL}/api/agents`);
    if (!response.ok) {
      throw new Error(`Failed to fetch agents: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Fetch agents API error:', error);
    throw error;
  }
}

export async function fetchAgent(id: string): Promise<Agent> {
  try {
    const response = await fetch(`${SERVER_URL}/api/agents/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch agent: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Fetch agent API error:', error);
    throw error;
  }
}

export async function createAgent(agent: CreateAgentRequest): Promise<Agent> {
  try {
    const response = await fetch(`${SERVER_URL}/api/agents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(agent),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create agent: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Create agent API error:', error);
    throw error;
  }
}

export async function updateAgent(id: string, agent: UpdateAgentRequest): Promise<Agent> {
  try {
    const response = await fetch(`${SERVER_URL}/api/agents/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(agent),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update agent: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Update agent API error:', error);
    throw error;
  }
}

export async function deleteAgent(id: string): Promise<void> {
  try {
    const response = await fetch(`${SERVER_URL}/api/agents/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete agent: ${response.status}`);
    }
  } catch (error) {
    console.error('Delete agent API error:', error);
    throw error;
  }
} 