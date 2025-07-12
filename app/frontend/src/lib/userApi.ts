import { SERVER_URL } from "@/config/config";

export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  role: string;
  evmAddress?: string;
  tiktokHandle?: string;
  score?: {
    currentScore: number;
    weeklyChange: number;
    rank: number;
    totalUsers: number;
    level: string;
    nextLevelScore: number;
  };
}

export interface CreateUserRequest {
  username: string;
  email?: string;
  evmAddress?: string;
  tiktokHandle?: string;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  evmAddress?: string;
  tiktokHandle?: string;
}

export interface UserListResponse {
  users: UserProfile[];
  total: number;
  page: number;
  limit: number;
}

export async function fetchUsers(page: number = 1, limit: number = 10): Promise<UserListResponse> {
  try {
    const response = await fetch(`${SERVER_URL}/api/users?page=${page}&limit=${limit}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Fetch users API error:', error);
    throw error;
  }
}

export async function fetchUser(id: string): Promise<UserProfile> {
  try {
    const response = await fetch(`${SERVER_URL}/api/users/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Fetch user API error:', error);
    throw error;
  }
}

export async function fetchUserByEvmAddress(address: string): Promise<UserProfile> {
  try {
    const response = await fetch(`${SERVER_URL}/api/users/address/${address}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch user by EVM address: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Fetch user by EVM address API error:', error);
    throw error;
  }
}

export async function fetchUserTikTokProfile(id: string): Promise<UserProfile> {
  try {
    const response = await fetch(`${SERVER_URL}/api/users/${id}/tiktok-profile`);
    if (!response.ok) {
      throw new Error(`Failed to fetch user TikTok profile: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Fetch user TikTok profile API error:', error);
    throw error;
  }
}

export async function createUser(user: CreateUserRequest): Promise<UserProfile> {
  try {
    const response = await fetch(`${SERVER_URL}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create user: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Create user API error:', error);
    throw error;
  }
}

export async function updateUser(id: string, user: UpdateUserRequest): Promise<UserProfile> {
  try {
    const response = await fetch(`${SERVER_URL}/api/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update user: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Update user API error:', error);
    throw error;
  }
}

export async function deleteUser(id: string): Promise<void> {
  try {
    const response = await fetch(`${SERVER_URL}/api/users/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete user: ${response.status}`);
    }
  } catch (error) {
    console.error('Delete user API error:', error);
    throw error;
  }
}

export async function updateUserRole(address: string, role: string): Promise<void> {
  try {
    const response = await fetch(`${SERVER_URL}/api/users/${address}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update user role: ${response.status}`);
    }
  } catch (error) {
    console.error('Update user role API error:', error);
    throw error;
  }
}

export async function fetchClubAdmins(): Promise<UserProfile[]> {
  try {
    const response = await fetch(`${SERVER_URL}/api/users/club-admins`);
    if (!response.ok) {
      throw new Error(`Failed to fetch club admins: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Fetch club admins API error:', error);
    throw error;
  }
} 