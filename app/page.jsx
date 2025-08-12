'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Auth } from '@supabase/auth-ui-react'
import { supabase } from '@/lib/supabaseClient'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user already logged in on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
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
        }
      } else {
        setLoading(false) // Not logged in, show login form
      }
    })

    // Also listen for login event (optional, you can keep your onAuthStateChange listener if you want)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
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
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <div className="w-full max-w-md rounded bg-gray-800 p-6">
        <Auth
          supabaseClient={supabase}
          socialLayout="horizontal"
        />
      </div>
    </div>
  )
}
