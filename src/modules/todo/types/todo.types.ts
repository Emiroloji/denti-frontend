export interface Todo {
    id: number
    title: string
    description?: string
    completed: boolean
    completed_at?: string
    category_id?: number
    category?: {
      id: number
      name: string
      color?: string
    }
    created_at: string
    updated_at: string
  }
  
  export interface CreateTodoRequest {
    title: string
    description?: string
    category_id?: number
  }
  
  export interface UpdateTodoRequest {
    title?: string
    description?: string
    category_id?: number
    completed?: boolean
  }