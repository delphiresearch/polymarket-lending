import { PolynanceSDK, PredictionProvider, Market, ExecuteOrderParams } from 'polynance_sdk';
import { Wallet, providers } from 'ethers';
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

let sdkInstance: PolynanceSDK | null = null;

export const getSDK = (): PolynanceSDK => {
  if (!sdkInstance) {
    sdkInstance = initializeSDK();
  }
  return sdkInstance;
};

export const getActiveMarkets = async (protocol: PredictionProvider = 'polymarket', page = 1, limit = 10): Promise<Market[]> => {
  const sdk = getSDK();
  return await sdk.getActiveMarkets(protocol, page, limit);
};

export const getMarketById = async (protocol: PredictionProvider, marketId: string): Promise<Market> => {
  const sdk = getSDK();
  return await sdk.getMarket(protocol, marketId);
};

export const getMarketBySlug = async (slug: string): Promise<Market[]> => {
  const sdk = getSDK();
  return await sdk.getMarketBySlug(slug);
};

export const executeOrder = async (orderParams: ExecuteOrderParams, walletPrivateKey?: string) => {
  const sdk = getSDK();
  
  let wallet;
  if (walletPrivateKey) {
    const provider = new providers.JsonRpcProvider(process.env.RPC_URL);
    wallet = new Wallet(walletPrivateKey, provider);
  }
  
  const signedOrder = await sdk.buildOrder(orderParams, wallet);
  
  return await sdk.executeOrder(signedOrder);
};

export const getUSDCBalance = async (walletAddress?: string): Promise<number> => {
  const sdk = getSDK();
  return await sdk.getUSDCBalance(walletAddress);
};

export const getConditionalTokensBalance = async (tokenId: string, walletAddress?: string): Promise<number> => {
  const sdk = getSDK();
  return await sdk.getConditionalTokensBalance(tokenId, walletAddress);
};

export const searchMarkets = async (query: string) => {
  const sdk = getSDK();
  return await sdk.search(query);
};
