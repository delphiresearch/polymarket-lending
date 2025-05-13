import { PolynanceSDK } from 'polynance_sdk';
import { Wallet, providers } from 'ethers';
import { IndexComposer } from '../../../packages/index-composer/src/composer';
import { config } from '../../../packages/index-composer/src/config';
import { addIndex } from './indicesService';
import dotenv from 'dotenv';

dotenv.config();

const initializeSDK = () => {
  const options: any = {};
  
  if (process.env.PRIVATE_KEY) {
    const provider = new providers.JsonRpcProvider(process.env.RPC_URL);
    const wallet = new Wallet(process.env.PRIVATE_KEY, provider);
    options.wallet = wallet;
  }
  
  return new PolynanceSDK(options);
};

export const composeNow = async (): Promise<any> => {
  try {
    console.log('Manually triggering index composition...');
    
    const sdk = initializeSDK();
    const composer = new IndexComposer(sdk, {
      ...config,
      dryRun: false // Force actual execution
    });
    
    const indexProduct = await composer.composeIndex();
    
    if (!indexProduct) {
      throw new Error('Index composition failed');
    }
    
    await addIndex(indexProduct);
    
    return {
      success: true,
      message: 'Index composition triggered successfully',
      indexId: indexProduct.id
    };
  } catch (error: any) {
    console.error('Error triggering index composition:', error);
    throw error;
  }
};
