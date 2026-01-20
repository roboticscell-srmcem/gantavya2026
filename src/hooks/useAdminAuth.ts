"use client"

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

interface AdminUser {
  id: string
  username: string
  email: string
  role: string
}

interface UseAdminAuthReturn {
  user: AdminUser | null
  loading: boolean
  error: string | null
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

export function useAdminAuth(): UseAdminAuthReturn {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const fetchAdminUser = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Get current session from Supabase (cookie-based)
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        throw new Error('Failed to get session')
      }

      if (!session?.user) {
        // No session, redirect to login
        router.push('/login')
        return
      }

      // Verify user is an admin
      const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('id, username, email, role')
        .eq('id', session.user.id)
        .eq('is_active', true)
        .single()

      if (adminError || !adminUser) {
        // User is not an admin
        await supabase.auth.signOut()
        router.push('/')
        return
      }

      setUser(adminUser)
    } catch (err: any) {
      console.error('Auth error:', err)
      setError(err.message || 'Authentication failed')
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }, [supabase, router])

  const signOut = useCallback(async () => {
    try {
      // Clear any legacy localStorage
      localStorage.removeItem('admin_user')
      
      // Sign out from Supabase (clears session cookies)
      await supabase.auth.signOut()
      
      router.push('/login')
    } catch (err) {
      console.error('Sign out error:', err)
    }
  }, [supabase, router])

  const refreshUser = useCallback(async () => {
    await fetchAdminUser()
  }, [fetchAdminUser])

  useEffect(() => {
    fetchAdminUser()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          setUser(null)
          router.push('/login')
        } else if (event === 'SIGNED_IN' && session) {
          await fetchAdminUser()
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchAdminUser, router, supabase.auth])

  return { user, loading, error, signOut, refreshUser }
}
