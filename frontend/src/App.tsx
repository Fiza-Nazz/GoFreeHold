import { useEffect } from 'react'
import AppRouter from './routes/AppRouter'
import { useAuthStore } from './store/authStore'

export default function App() {
  const hydrateUser = useAuthStore((s) => s.hydrateUser)

  useEffect(() => {
    void hydrateUser()
  }, [hydrateUser])

  return <AppRouter />
}
