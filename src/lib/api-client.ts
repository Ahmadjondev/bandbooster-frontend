const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface RequestConfig extends Omit<RequestInit, 'method' | 'body'> {
  params?: Record<string, string | number | boolean | undefined>
}

interface ApiError extends Error {
  status: number
  data?: unknown
}

function createApiError(message: string, status: number, data?: unknown): ApiError {
  const error = new Error(message) as ApiError
  error.status = status
  error.data = data
  return error
}

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('access_token')
}

function buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
  const url = new URL(`${API_BASE_URL}${endpoint}`)
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value))
      }
    })
  }
  
  return url.toString()
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorData: unknown
    
    try {
      errorData = await response.json()
    } catch {
      errorData = await response.text()
    }
    
    const message = typeof errorData === 'object' && errorData !== null && 'message' in errorData
      ? String((errorData as { message: unknown }).message)
      : `HTTP Error: ${response.status}`
    
    throw createApiError(message, response.status, errorData)
  }
  
  // Handle empty responses
  const contentType = response.headers.get('content-type')
  if (!contentType || !contentType.includes('application/json')) {
    return {} as T
  }
  
  return response.json()
}

async function request<T>(
  method: RequestMethod,
  endpoint: string,
  data?: unknown,
  config?: RequestConfig
): Promise<T> {
  const { params, headers: customHeaders, ...restConfig } = config || {}
  
  const url = buildUrl(endpoint, params)
  const token = getAuthToken()
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...customHeaders,
  }
  
  if (token) {
    ;(headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  }
  
  const fetchConfig: RequestInit = {
    method,
    headers,
    ...restConfig,
  }
  
  if (data && method !== 'GET') {
    fetchConfig.body = JSON.stringify(data)
  }
  
  const response = await fetch(url, fetchConfig)
  return handleResponse<T>(response)
}

export const apiClient = {
  get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return request<T>('GET', endpoint, undefined, config)
  },
  
  post<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return request<T>('POST', endpoint, data, config)
  },
  
  put<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return request<T>('PUT', endpoint, data, config)
  },
  
  patch<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return request<T>('PATCH', endpoint, data, config)
  },
  
  delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return request<T>('DELETE', endpoint, undefined, config)
  },
}

export type { ApiError, RequestConfig }
