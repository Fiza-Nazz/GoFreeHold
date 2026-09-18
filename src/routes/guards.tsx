import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore, getRoleDashboardPath } from '../store/authStore'
import { useEffect, useState } from 'react'
import type { UserRole } from '../types'

function useVerifiedSession() {
 const token = useAuthStore(s=>s.token)
 const [verified, setVerified] = useState<string|null|undefined>(undefined)
 useEffect(()=>{
  let current=true
  if (!token) { setVerified(null); return }
  useAuthStore.getState().hydrateUser().finally(()=>{if(current)setVerified(token)})
  return()=>{current=false}
 },[token])
 return !token || verified===token
}
function Loading(){return <div role="status" style={{padding:40,color:'#08674e'}}>Loading GoFreeHold…</div>}
export function ProtectedRoute({allowedRoles}:{allowedRoles?:UserRole[]}) {
 const {isAuthenticated,user,token}=useAuthStore()
 const verified=useVerifiedSession()
 if(!verified)return <Loading/>
 if(!token||!isAuthenticated||!user)return <Navigate to="/login" replace/>
 if(allowedRoles&&!allowedRoles.includes(user.role))return <Navigate to="/unauthorized" replace/>
 return <Outlet key={user.id}/>
}
export function GuestRoute(){
 const {isAuthenticated,user,token}=useAuthStore()
 const verified=useVerifiedSession()
 if(!verified)return <Loading/>
 if(token&&isAuthenticated&&user)return <Navigate to={getRoleDashboardPath(user.role)} replace/>
 return <Outlet/>
}
