import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Function to create Supabase client with validation
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // For build-time, return a mock client if env vars are missing
  if (!supabaseUrl || !supabaseServiceKey) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Missing required Supabase environment variables');
    }
    
    // Return a mock for build-time
    return {
      from: () => ({
        select: () => ({ 
          eq: () => ({ 
            order: () => ({ 
              limit: () => ({ 
                range: () => Promise.resolve({ data: [], error: null }) 
              }) 
            }) 
          }) 
        }),
        insert: () => ({ 
          select: () => ({ 
            single: () => Promise.resolve({ data: null, error: { code: 'MOCK' } }) 
          }) 
        }),
        update: () => ({ 
          eq: () => ({ 
            select: () => ({ 
              single: () => Promise.resolve({ data: null, error: { code: 'MOCK' } }) 
            }) 
          }) 
        })
      })
    } as any;
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

/**
 * Get transaction history for a user
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const transactionType = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('transaction_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (transactionType) {
      query = query.eq('type', transactionType);
    }

    const { data: transactions, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      transactions: transactions || [],
      total: transactions?.length || 0
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Log a new transaction
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const transactionData = await request.json();

    // Validate required fields
    if (!transactionData.user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!transactionData.type) {
      return NextResponse.json(
        { error: 'Transaction type is required' },
        { status: 400 }
      );
    }

    // Prepare transaction data
    const newTransaction = {
      user_id: transactionData.user_id,
      cell_id: transactionData.cell_id || null,
      transaction_hash: transactionData.transaction_hash || null,
      type: transactionData.type,
      amount: transactionData.amount || 0,
      status: transactionData.status || 'pending',
      metadata: transactionData.metadata || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: transaction, error } = await supabase
      .from('transaction_logs')
      .insert(newTransaction)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      transaction,
      message: 'Transaction logged successfully'
    });
  } catch (error) {
    console.error('Transaction logging error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Update transaction status
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { transaction_id, status, metadata } = await request.json();

    if (!transaction_id) {
      return NextResponse.json(
        { error: 'Transaction ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (status) {
      updateData.status = status;
    }

    if (metadata) {
      updateData.metadata = metadata;
    }

    const { data: updatedTransaction, error } = await supabase
      .from('transaction_logs')
      .update(updateData)
      .eq('id', transaction_id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      transaction: updatedTransaction,
      message: 'Transaction updated successfully'
    });
  } catch (error) {
    console.error('Transaction update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}