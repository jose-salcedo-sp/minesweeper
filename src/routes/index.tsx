import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'


export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()

  useEffect(()=>{
    navigate({to:'/join-room'})
  },[navigate])
  
  return <div>Hello "/"!</div>
}
