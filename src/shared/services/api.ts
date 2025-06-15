// src/shared/services/api.ts

import axios from 'axios'
import { message } from 'antd'

// API instance oluştur
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000, // 10 saniye timeout
})

// Request Interceptor - Token ekleme
api.interceptors.request.use(
  (config) => {
    // Debug için request'i logla
    console.log('🚀 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      data: config.data
    })
    
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  }
)

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    // Debug için response'u logla
    console.log('✅ API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    })
    
    // Laravel API format: { success: true, data: {...}, message: "..." }
    return response.data
  },
  (error) => {
    // Debug için error'u logla
    console.error('❌ API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.response?.data?.message,
      data: error.response?.data
    })
    
    // Error handling
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken')
      message.error('Oturum süreniz doldu!')
    } else if (error.response?.status === 403) {
      message.error('Bu işlemi yapmaya yetkiniz yok!')
    } else if (error.response?.status === 404) {
      message.error('İstenen kaynak bulunamadı!')
    } else if (error.response?.status === 422) {
      // Validation errors
      const errors = error.response.data?.errors
      if (errors) {
        (Object.values(errors).flat() as string[]).forEach((err) => {
          message.error(err)
        })
      } else {
        message.error(error.response.data?.message || 'Validation hatası!')
      }
    } else if (error.response?.status >= 500) {
      message.error('Sunucu hatası! Backend çalışıyor mu kontrol edin.')
    } else if (error.code === 'ECONNABORTED') {
      message.error('İstek zaman aşımına uğradı!')
    } else if (error.code === 'ERR_NETWORK') {
      message.error('Ağ hatası! Backend çalışıyor mu?')
    } else {
      message.error(error.response?.data?.message || error.message || 'Bir hata oluştu!')
    }
    
    return Promise.reject(error)
  }
)

// Default export da ekleyelim
export default api