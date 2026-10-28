// API configuration
export const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3000';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  [key: string]: any;
}

export async function apiRequest<T = any>(
  method: string,
  endpoint: string,
  data?: any,
  token?: string
): Promise<ApiResponse<T>> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    const bearerToken = 'Bearer ' + token;
    headers['Authorization'] = bearerToken;
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (data && (method === 'POST' || method === 'PUT')) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const result = await response.json();

    if (!response.ok) {
      return {
        error: result.error || 'An error occurred',
      };
    }

    return { data: result };
  } catch (error) {
    return {
      error: 'Network error',
    };
  }
}

export async function get<T = any>(endpoint: string, token?: string): Promise<ApiResponse<T>> {
  return apiRequest<T>('GET', endpoint, undefined, token);
}

export async function post<T = any>(
  endpoint: string,
  data: any,
  token?: string
): Promise<ApiResponse<T>> {
  return apiRequest<T>('POST', endpoint, data, token);
}

export async function put<T = any>(
  endpoint: string,
  data: any,
  token?: string
): Promise<ApiResponse<T>> {
  return apiRequest<T>('PUT', endpoint, data, token);
}

export async function del<T = any>(endpoint: string, token?: string): Promise<ApiResponse<T>> {
  return apiRequest<T>('DELETE', endpoint, undefined, token);
}
