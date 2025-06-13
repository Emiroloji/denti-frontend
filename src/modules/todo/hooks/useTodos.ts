import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { message } from 'antd'
import { todoApi } from '../services/todoApi'
import { UpdateTodoRequest } from '../types/todo.types'

export const useTodos = () => {
  const queryClient = useQueryClient()

  const {
    data: todos,
    isLoading,
    error
  } = useQuery({
    queryKey: ['todos'],
    queryFn: todoApi.getAll,
    select: (data) => data.data
  })

  const createMutation = useMutation({
    mutationFn: todoApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
      message.success('Todo başarıyla oluşturuldu!')
    },
    onError: (error: import('axios').AxiosError) => {
      message.error((error.response?.data as { message?: string })?.message || 'Hata oluştu!')
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTodoRequest }) =>
      todoApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
      message.success('Todo güncellendi!')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: todoApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
      message.success('Todo silindi!')
    }
  })

  const toggleMutation = useMutation({
    mutationFn: todoApi.toggle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    }
  })

  return {
    todos,
    isLoading,
    error,
    createTodo: createMutation.mutateAsync,
    updateTodo: updateMutation.mutateAsync,
    deleteTodo: deleteMutation.mutateAsync,
    toggleTodo: toggleMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  }
}