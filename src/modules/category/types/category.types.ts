export interface Category {
    id: number
    name: string
    color: string
    is_active: boolean
    todos_count?: number
    created_at: string
    updated_at: string
  }
  
  export interface CreateCategoryRequest {
    name: string
    color?: string
    is_active?: boolean
  }
  
  export interface UpdateCategoryRequest {
    name?: string
    color?: string
    is_active?: boolean
  }