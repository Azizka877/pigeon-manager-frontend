// lib/api/client.ts
import axios, { AxiosResponse } from 'axios'
import type { TokenResponse, User, Cage, PaginatedResponse, Pigeon, Couple,
   Reproduction, Sortie , ColombierConfig, Plan, Invoice } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
console.log('API_URL:', API_URL)
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const refreshToken = localStorage.getItem('refresh_token')
      
      if (!refreshToken) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
      
      try {
        const { data } = await axios.post<TokenResponse>(
          `${API_URL}/token/refresh/`,
          { refresh: refreshToken }
        )
        
        localStorage.setItem('access_token', data.access)
        originalRequest.headers.Authorization = `Bearer ${data.access}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
        return Promise.reject(refreshError)
      }
    }
    return Promise.reject(error)
  }
)

// lib/api/client.ts — AJOUTER ces endpoints

// Auth API — COMPLET
export const authApi = {
  login: (username: string, password: string): Promise<AxiosResponse<TokenResponse>> =>
    apiClient.post('/token/', { username, password }),
  
  refresh: (refresh: string): Promise<AxiosResponse<TokenResponse>> =>
    apiClient.post('/token/refresh/', { refresh }),
  
  verify: (token: string): Promise<AxiosResponse> =>
    apiClient.post('/token/verify/', { token }),
  
  getMe: (): Promise<AxiosResponse<User>> => 
    apiClient.get('/users/me/'),
  
  updateMe: (id: number, data: Partial<User>): Promise<AxiosResponse<User>> =>
    apiClient.patch(`/users/${id}/`, data),
  
  //  Changer le mot de passe
  changePassword: (id: number, data: { old_password: string; new_password: string }): Promise<AxiosResponse> =>
    apiClient.post(`/users/${id}/change_password/`, data),
  
  deleteAccount: (id: number): Promise<AxiosResponse<void>> =>
    apiClient.delete(`/users/${id}/`),
}

export const colombierApi = {
  getConfig: (): Promise<AxiosResponse<ColombierConfig>> => 
    apiClient.get('/colombier/config/'),
  
  updateConfig: (data: Partial<ColombierConfig>): Promise<AxiosResponse<ColombierConfig>> =>
    apiClient.patch('/colombier/config/', data),
}

// : Facturation API
export const billingApi = {
  getPlan: (): Promise<AxiosResponse<Plan>> => 
    apiClient.get('/billing/plan/'),
  
  getInvoices: (): Promise<AxiosResponse<PaginatedResponse<Invoice>>> =>
    apiClient.get('/billing/invoices/'),
}

// Pigeons API
export const pigeonsApi = {
  list: (): Promise<AxiosResponse<PaginatedResponse<Pigeon>>> => apiClient.get('/pigeons/'),
  create: (data: Partial<Pigeon>): Promise<AxiosResponse<Pigeon>> => apiClient.post('/pigeons/', data),
  get: (id: string): Promise<AxiosResponse<Pigeon>> => apiClient.get(`/pigeons/${id}/`),
  update: (id: string, data: Partial<Pigeon>): Promise<AxiosResponse<Pigeon>> => apiClient.put(`/pigeons/${id}/`, data),
  partialUpdate: (id: string, data: Partial<Pigeon>): Promise<AxiosResponse<Pigeon>> => apiClient.patch(`/pigeons/${id}/`, data),
  delete: (id: string): Promise<AxiosResponse<void>> => apiClient.delete(`/pigeons/${id}/`),
}

// Cages API
export const cagesApi = {
  list: (): Promise<AxiosResponse<PaginatedResponse<Cage>>> => {
    console.log('📡 [cagesApi.list] Appel API...')
    return apiClient.get('/cages/')
  },
  create: (data: Partial<Cage>): Promise<AxiosResponse<Cage>> => apiClient.post('/cages/', data),
  get: (id: string): Promise<AxiosResponse<Cage>> => apiClient.get(`/cages/${id}/`),
  update: (id: string, data: Partial<Cage>): Promise<AxiosResponse<Cage>> => apiClient.put(`/cages/${id}/`, data),
  delete: (id: string): Promise<AxiosResponse<void>> => apiClient.delete(`/cages/${id}/`),
  occuper: (id: string, data: { pigeon?: string; couple?: string; type_occupation: 'seul' | 'couple' }): Promise<AxiosResponse> => 
    apiClient.post(`/cages/${id}/occuper/`, data),
  liberer: (id: string): Promise<AxiosResponse<void>> => apiClient.delete(`/cages/${id}/liberer/`),
}

// Couples API
export const couplesApi = {
  list: (): Promise<AxiosResponse<PaginatedResponse<Couple>>> => apiClient.get('/couples/'),
  create: (data: Partial<Couple>): Promise<AxiosResponse<Couple>> => apiClient.post('/couples/', data),
  get: (id: string): Promise<AxiosResponse<Couple>> => apiClient.get(`/couples/${id}/`),
  update: (id: string, data: Partial<Couple>): Promise<AxiosResponse<Couple>> => apiClient.put(`/couples/${id}/`, data),
  delete: (id: string): Promise<AxiosResponse<void>> => apiClient.delete(`/couples/${id}/`),
}

// ✅ AJOUTER SORTIES API
export const sortiesApi = {
  list: (): Promise<AxiosResponse<PaginatedResponse<Sortie>>> => apiClient.get('/sorties/'),
  create: (data: Partial<Sortie>): Promise<AxiosResponse<Sortie>> => apiClient.post('/sorties/', data),
  get: (id: string): Promise<AxiosResponse<Sortie>> => apiClient.get(`/sorties/${id}/`),
  update: (id: string, data: Partial<Sortie>): Promise<AxiosResponse<Sortie>> => apiClient.put(`/sorties/${id}/`, data),
  delete: (id: string): Promise<AxiosResponse<void>> => apiClient.delete(`/sorties/${id}/`),
}

// ✅ AJOUTER REPRODUCTIONS API
export const reproductionsApi = {
  list: (): Promise<AxiosResponse<PaginatedResponse<Reproduction>>> => apiClient.get('/reproductions/'),
  create: (data: Partial<Reproduction>): Promise<AxiosResponse<Reproduction>> => apiClient.post('/reproductions/', data),
  get: (id: string): Promise<AxiosResponse<Reproduction>> => apiClient.get(`/reproductions/${id}/`),
  update: (id: string, data: Partial<Reproduction>): Promise<AxiosResponse<Reproduction>> => apiClient.put(`/reproductions/${id}/`, data),
  delete: (id: string): Promise<AxiosResponse<void>> => apiClient.delete(`/reproductions/${id}/`),
}

export default apiClient