import { api } from '@/shared/services/api'
import { Todo, CreateTodoRequest, UpdateTodoRequest } from '../types/todo.types'
import { ApiResponse } from '@/shared/types/common.types'

export const todoApi = {
  getAll: (): Promise<ApiResponse<Todo[]>> => 
    api.get('/todos'),
  
  create: (data: CreateTodoRequest): Promise<ApiResponse<Todo>> => 
    api.post('/todos', data),
  
  update: (id: number, data: UpdateTodoRequest): Promise<ApiResponse<Todo>> => 
    api.put(`/todos/${id}`, data),
  
  delete: (id: number): Promise<ApiResponse<null>> => 
    api.delete(`/todos/${id}`),
  
  toggle: (id: number): Promise<ApiResponse<Todo>> => 
    api.patch(`/todos/${id}/toggle`)
}