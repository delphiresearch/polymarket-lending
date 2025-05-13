import { NextRequest, NextResponse } from 'next/server';
import { PolynanceSDK } from 'polynance_sdk';
import { Wallet, providers } from 'ethers';
import { IndexProduct, IndexStatus } from '../../../../packages/index-composer/src/types';

export let indices: IndexProduct[] = [];

export const initializeSDK = () => {
  const options: any = {};
  
  if (process.env.PRIVATE_KEY) {
    const provider = new providers.JsonRpcProvider(process.env.RPC_URL);
    const wallet = new Wallet(process.env.PRIVATE_KEY, provider);
    options.wallet = wallet;
  }
  
  return new PolynanceSDK(options);
};

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(indices);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { indexProduct } = body;
    
    if (!indexProduct) {
      return NextResponse.json({ error: 'Missing index product data' }, { status: 400 });
    }
    
    indices.push(indexProduct);
    
    return NextResponse.json(indexProduct);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
