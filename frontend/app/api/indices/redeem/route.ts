import { NextRequest, NextResponse } from 'next/server';
import { indices, initializeSDK } from '../route';
import { IndexStatus } from '../../../../../packages/index-composer/src/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { indexId, amount, walletAddress } = body;
    
    if (!indexId || !amount || !walletAddress) {
      return NextResponse.json({ 
        error: 'Missing required fields. Required: indexId, amount, walletAddress' 
      }, { status: 400 });
    }
    
    const index = indices.find(index => index.id === indexId);
    
    if (!index) {
      return NextResponse.json({ error: 'Index not found' }, { status: 404 });
    }
    
    if (index.status !== IndexStatus.SETTLED) {
      return NextResponse.json({ error: 'Index is not settled yet' }, { status: 400 });
    }
    
    const sdk = initializeSDK();
    
    const result = {
      success: true,
      indexId,
      amount,
      walletAddress,
      usdcAmount: amount * (index.finalValue || 0),
      transactionHash: `0x${Math.random().toString(16).substring(2, 42)}`,
      timestamp: new Date().toISOString()
    };
    
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
