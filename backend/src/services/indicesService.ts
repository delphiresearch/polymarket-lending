import { PolynanceSDK } from 'polynance_sdk';
import { Wallet, providers } from 'ethers';
import { IndexProduct, IndexStatus } from '../../../packages/index-composer/src/types';
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

let indices: IndexProduct[] = [];

export const getAllIndices = async (): Promise<IndexProduct[]> => {
  return indices;
};

export const getLiveIndices = async (): Promise<IndexProduct[]> => {
  return indices.filter(index => index.status === IndexStatus.OPEN);
};

export const getIndexById = async (id: string): Promise<IndexProduct | null> => {
  const index = indices.find(index => index.id === id);
  return index || null;
};

export const addIndex = async (indexProduct: IndexProduct): Promise<IndexProduct> => {
  indices.push(indexProduct);
  return indexProduct;
};

export const updateIndex = async (id: string, updates: Partial<IndexProduct>): Promise<IndexProduct | null> => {
  const index = indices.find(index => index.id === id);
  
  if (!index) {
    return null;
  }
  
  Object.assign(index, updates);
  
  return index;
};

export const buyIndex = async (indexId: string, amount: number, walletAddress: string): Promise<any> => {
  const sdk = initializeSDK();
  const index = await getIndexById(indexId);
  
  if (!index) {
    throw new Error('Index not found');
  }
  
  if (index.status !== IndexStatus.OPEN) {
    throw new Error('Index is not available for purchase');
  }
  
  return {
    success: true,
    indexId,
    amount,
    walletAddress,
    transactionHash: `0x${Math.random().toString(16).substring(2, 42)}`,
    timestamp: new Date().toISOString()
  };
};

export const redeemIndex = async (indexId: string, amount: number, walletAddress: string): Promise<any> => {
  const sdk = initializeSDK();
  const index = await getIndexById(indexId);
  
  if (!index) {
    throw new Error('Index not found');
  }
  
  if (index.status !== IndexStatus.SETTLED) {
    throw new Error('Index is not settled yet');
  }
  
  return {
    success: true,
    indexId,
    amount,
    walletAddress,
    usdcAmount: amount * (index.finalValue || 0),
    transactionHash: `0x${Math.random().toString(16).substring(2, 42)}`,
    timestamp: new Date().toISOString()
  };
};
