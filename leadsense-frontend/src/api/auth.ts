import { apiClient } from './client';

export interface LoginRequest {
  email:    string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export const authApi = {
  login: async (req: LoginRequest): Promise<LoginResponse> => {
    const { data } = await apiClient.post<LoginResponse>('/api/auth/login', req);
    return data;
  },
};
