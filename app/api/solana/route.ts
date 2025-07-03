import { NextRequest, NextResponse } from 'next/server';

/**
 * Solana Program Integration API
 */
export async function POST(request: NextRequest) {
  try {
    const { instruction, params } = await request.json();

    if (!instruction) {
      return NextResponse.json(
        { error: 'Instruction is required' },
        { status: 400 }
      );
    }

    // Mock implementation for build-time
    const mockResult = {
      success: true,
      transaction_hash: 'mock_tx_' + Date.now(),
      result: {
        cell_account: params?.cell_account || 'mock_account',
        energy: params?.energy || 100,
        status: 'simulated'
      },
      message: 'Solana program integration not implemented yet'
    };

    return NextResponse.json(mockResult);
  } catch (error) {
    console.error('Solana API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}