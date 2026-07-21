import { apiClient } from '@/api/apiClient';
import type { ApiSuccess } from '@/types/api';
import type { AuthResult, LoginPayload, RegisterPayload, User } from '@/types/auth';

export const authApi = {
  register: async (payload: RegisterPayload): Promise<AuthResult> => {
    const { data } = await apiClient.post<ApiSuccess<AuthResult>>('/auth/register', payload);
    return data.data;
  },

  login: async (payload: LoginPayload): Promise<AuthResult> => {
    const { data } = await apiClient.post<ApiSuccess<AuthResult>>('/auth/login', payload);
    return data.data;
  },

  me: async (): Promise<User> => {
    const { data } = await apiClient.get<ApiSuccess<User>>('/auth/me');
    return data.data;
  },
};