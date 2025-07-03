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
              range: () => Promise.resolve({ data: [], error: null }) 
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
        }),
        delete: () => ({ 
          eq: () => Promise.resolve({ error: null }) 
        })
      })
    } as any;
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

/**
 * Create a new BitCell
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const cellData = await request.json();

    // Validate required fields
    if (!cellData.user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!cellData.wallet_address) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    if (!cellData.name) {
      return NextResponse.json(
        { error: 'Cell name is required' },
        { status: 400 }
      );
    }

    // Prepare cell data
    const newCell = {
      user_id: cellData.user_id,
      wallet_address: cellData.wallet_address,
      name: cellData.name,
      cell_type: cellData.cell_type || 'standard',
      settings: cellData.settings || {},
      statistics: cellData.statistics || {
        total_energy: 0,
        growth_level: 0
      },
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: cell, error } = await supabase
      .from('cell_metadata')
      .insert(newCell)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      cell,
      message: 'Cell created successfully'
    });
  } catch (error) {
    console.error('Cell creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Get cells for a user
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const walletAddress = searchParams.get('wallet');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!userId && !walletAddress) {
      return NextResponse.json(
        { error: 'User ID or wallet address is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('cell_metadata')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (userId) {
      query = query.eq('user_id', userId);
    } else if (walletAddress) {
      query = query.eq('wallet_address', walletAddress);
    }

    const { data: cells, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      cells: cells || [],
      total: cells?.length || 0
    });
  } catch (error) {
    console.error('Get cells error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Update a cell
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { cell_id, settings, statistics } = await request.json();

    if (!cell_id) {
      return NextResponse.json(
        { error: 'Cell ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (settings) {
      updateData.settings = settings;
    }

    if (statistics) {
      updateData.statistics = statistics;
    }

    const { data: updatedCell, error } = await supabase
      .from('cell_metadata')
      .update(updateData)
      .eq('id', cell_id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      cell: updatedCell,
      message: 'Cell updated successfully'
    });
  } catch (error) {
    console.error('Cell update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Delete a cell
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { cell_id } = await request.json();

    if (!cell_id) {
      return NextResponse.json(
        { error: 'Cell ID is required' },
        { status: 400 }
      );
    }

    // Soft delete by setting is_active to false
    const { error } = await supabase
      .from('cell_metadata')
      .update({ 
        is_active: false, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', cell_id);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Cell deleted successfully'
    });
  } catch (error) {
    console.error('Cell deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
