'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function AdminDashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUserAccess = async () => {
      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !user) {
          router.push('/')
          return
        }

        setUser(user)

        // Check user profile and role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (profileError || !profile) {
          console.error('Profile not found or error:', profileError)
          router.push('/user/dashboard')
          return
        }

        // Verify user has admin role
        const userRole = profile.role?.trim().toLowerCase()
        if (userRole !== 'admin') {
          console.log('User role is not admin:', userRole)
          router.push('/user/dashboard')
          return
        }

        setLoading(false)
      } catch (error) {
        console.error('Error checking user access:', error)
        router.push('/')
      }
    }

    checkUserAccess()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="mb-4 text-3xl font-bold">Admin Dashboard</h1>
      <p>Welcome, {user?.email}</p>
      <p className="text-sm text-gray-600 mt-2">Role: Admin</p>
      <button
        onClick={handleLogout}
        className="mt-6 rounded bg-red-600 px-4 py-2 text-white"
      >
        Logout
      </button>
    </div>
  )
}
