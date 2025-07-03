import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse, UpdateSettingsRequest } from '@/lib/types'

export async function PUT(
  request: NextRequest,
  { params }: { params: { address: string } }
): Promise<NextResponse<ApiResponse<{ signature: string }>>> {
  try {
    const { address } = params
    const body: UpdateSettingsRequest = await request.json()
    
    const { riskTolerance, maxDrawdown, tradingFrequency } = body
    
    if (!address || riskTolerance === undefined || maxDrawdown === undefined || tradingFrequency === undefined) {
      return NextResponse.json({
        success: false,
        error: 'Missing required settings parameters'
      }, { status: 400 })
    }

    // Validate ranges
    if (riskTolerance < 0 || riskTolerance > 100) {
      return NextResponse.json({
        success: false,
        error: 'Risk tolerance must be between 0 and 100'
      }, { status: 400 })
    }

    if (maxDrawdown < 0 || maxDrawdown > 100) {
      return NextResponse.json({
        success: false,
        error: 'Max drawdown must be between 0 and 100'
      }, { status: 400 })
    }

    // TODO: Replace with actual Solana program call
    // const signature = await updateSettings(
    //   connection, 
    //   programId, 
    //   wallet, 
    //   riskTolerance, 
    //   maxDrawdown, 
    //   tradingFrequency
    // )
    
    // For now, return mock signature
    const mockSignature = `settings_${Date.now()}`
    
    return NextResponse.json({
      success: true,
      data: { signature: mockSignature },
      message: 'Settings updated successfully'
    })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update settings'
    }, { status: 500 })
  }
}
