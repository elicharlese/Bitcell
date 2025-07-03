import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Function to create Supabase client with validation
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  // For build-time, return a mock client if env vars are missing
  if (!supabaseUrl || !supabaseServiceKey) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Missing required Supabase environment variables')
    }
    
    // Return a mock for build-time
    return {
      from: () => ({
        select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: { code: 'MOCK' } }) }) }),
        insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: { code: 'MOCK' } }) }) }),
        update: () => ({ eq: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: { code: 'MOCK' } }) }) }) })
      })
    } as any
  }

  return createClient(supabaseUrl, supabaseServiceKey)
}

/**
 * Handle user authentication and profile creation/update
 */
export async function POST(request: NextRequest) {
  try {
    const { walletAddress, email, action } = await request.json()

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'signin':
        return handleSignIn(walletAddress, email)
      case 'signup':
        return handleSignUp(walletAddress, email)
      case 'profile':
        return handleProfileUpdate(walletAddress, email)
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Auth API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handleSignIn(walletAddress: string, email?: string) {
  const supabase = getSupabaseClient()
  
  // Check if user exists
  const { data: existingUser, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('wallet_address', walletAddress)
    .single()

  if (error && error.code !== 'PGRST116') {
    throw error
  }

  if (existingUser) {
    return NextResponse.json({
      success: true,
      user: existingUser,
      message: 'User signed in successfully'
    })
  } else {
    return NextResponse.json(
      { error: 'User not found. Please sign up first.' },
      { status: 404 }
    )
  }
}

async function handleSignUp(walletAddress: string, email?: string) {
  const supabase = getSupabaseClient()
  
  // Check if user already exists
  const { data: existingUser } = await supabase
    .from('user_profiles')
    .select('wallet_address')
    .eq('wallet_address', walletAddress)
    .single()

  if (existingUser) {
    return NextResponse.json(
      { error: 'User already exists. Please sign in.' },
      { status: 409 }
    )
  }

  // Create new user
  const { data: newUser, error } = await supabase
    .from('user_profiles')
    .insert({
      wallet_address: walletAddress,
      email: email || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return NextResponse.json({
    success: true,
    user: newUser,
    message: 'User created successfully'
  })
}

async function handleProfileUpdate(walletAddress: string, email?: string) {
  const supabase = getSupabaseClient()
  
  const { data: updatedUser, error } = await supabase
    .from('user_profiles')
    .update({
      email: email || null,
      updated_at: new Date().toISOString()
    })
    .eq('wallet_address', walletAddress)
    .select()
    .single()

  if (error) {
    throw error
  }

  return NextResponse.json({
    success: true,
    user: updatedUser,
    message: 'Profile updated successfully'
  })
}

/**
 * Get user profile
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('wallet')

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    const { data: user, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }
      throw error
    }

    return NextResponse.json({
      success: true,
      user
    })
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
