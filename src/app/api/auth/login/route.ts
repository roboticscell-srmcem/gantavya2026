import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  accessCode: z.string().min(1, 'Access code is required'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const validation = loginSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    const { username, password, accessCode } = validation.data
    const supabase = createServiceClient()

    const { data: adminUser, error: userError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('username', username)
      .eq('is_active', true)
      .single()

    if (userError || !adminUser) {
      return NextResponse.json(
        { error: 'User Not Found' },
        { status: 401 }
      )
    }

    const passwordValid = await bcrypt.compare(password, adminUser.password_hash)
    if (!passwordValid) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
    }

    if (!adminUser.access_code || adminUser.access_code !== accessCode) {
      return NextResponse.json(
        { error: 'Invalid access code' },
        { status: 401 }
      )
    }

    // Create a cookie-based client for auth (to properly set session cookies)
    const cookieStore = await cookies()
    const cookiesToSet: { name: string; value: string; options: any }[] = []
    
    const authClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookies) {
            cookiesToSet.push(...cookies)
          },
        },
      }
    )

    const { data: authData, error: authError } = await authClient.auth.signInWithPassword({
      email: adminUser.email,
      password: password,
    })

    if (authError) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      )
    }

    await supabase
      .from('admin_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', adminUser.id)

    // Create response and set cookies
    const response = NextResponse.json({
      success: true,
      user: {
        id: adminUser.id,
        username: adminUser.username,
        email: adminUser.email,
        role: adminUser.role,
      }
    })

    // Apply all auth cookies to the response
    cookiesToSet.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options)
    })

    return response

  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
