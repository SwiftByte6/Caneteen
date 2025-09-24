'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Auth } from '@supabase/auth-ui-react'
import { supabase } from '@/lib/supabaseClient'
import Login from '@/components/Login'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkSessionAndRedirect() {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          // Fetch role from profile
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single()

          if (!error && profile) {
            if (profile.role === 'admin') {
              router.replace('/admin/dashboard')
            } else {
              router.replace('/user/dashboard')
            }
          } else {
            // If error or no profile, stop loading so user can login or handle error
            setLoading(false)
          }
        } else {
          setLoading(false)
        }
      } catch (error) {
        console.error('Error checking session:', error)
        setLoading(false)
      }
    }

    checkSessionAndRedirect()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()

        if (!error && profile) {
          if (profile.role === 'admin') {
            router.replace('/admin/dashboard')
          } else {
            router.replace('/user/dashboard')
          }
        }
      } else {
        // When logged out, show login form
        setLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-orange-400/50 items-center justify-center ">
      <div className="w-full  rounded  bg-orange-400/50 ">
        
        <Login/>
      </div>
    </div>
  )
}
