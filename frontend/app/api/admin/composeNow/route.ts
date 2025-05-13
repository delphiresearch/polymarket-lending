import { NextRequest, NextResponse } from 'next/server';
import { PolynanceSDK } from 'polynance_sdk';
import { Wallet, providers } from 'ethers';
import { IndexComposer } from '../../../../../packages/index-composer/src/composer';
import { config } from '../../../../../packages/index-composer/src/config';
import { indices } from '../../indices/route';

export async function POST(request: NextRequest) {
  try {
    const isDev = process.env.NODE_ENV !== 'production';
    
    if (!isDev) {
      const authHeader = request.headers.get('authorization');
      if (!authHeader) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      if (authHeader !== `Bearer ${process.env.ADMIN_API_KEY}`) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }
    
    const options: any = {};
    
    if (process.env.PRIVATE_KEY) {
      const provider = new providers.JsonRpcProvider(process.env.RPC_URL);
      const wallet = new Wallet(process.env.PRIVATE_KEY, provider);
      options.wallet = wallet;
    }
    
    const sdk = new PolynanceSDK(options);
    const composer = new IndexComposer(sdk, {
      ...config,
      dryRun: false // Force actual execution
    });
    
    const indexProduct = await composer.composeIndex();
    
    if (!indexProduct) {
      throw new Error('Index composition failed');
    }
    
    indices.push(indexProduct);
    
    return NextResponse.json({
      success: true,
      message: 'Index composition triggered successfully',
      indexId: indexProduct.id
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
