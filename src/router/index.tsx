import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AppLayout } from '@/shared/components/layout/AppLayout'
import { TodosPage } from '@/modules/todo/pages/TodosPage'
import { CategoriesPage } from '@/modules/category/pages/CategoriesPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <TodosPage />
      },
      {
        path: 'todos',
        element: <TodosPage />
      },
      {
        path: 'categories',
        element: <CategoriesPage />
      }
    ]
  }
])

export const AppRouter = () => <RouterProvider router={router} />