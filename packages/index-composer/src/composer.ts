import { PolynanceSDK, Market } from 'polynance_sdk';
import { IndexComposerConfig, IndexProduct, MarketWithMetrics } from './types';
import { filterMarkets, createIndexProduct } from './utils';

export class IndexComposer {
  private sdk: PolynanceSDK;
  private config: IndexComposerConfig;
  
  constructor(sdk: PolynanceSDK, config: IndexComposerConfig) {
    this.sdk = sdk;
    this.config = config;
  }
  
  async fetchActiveMarkets(): Promise<Market[]> {
    try {
      const markets = await this.sdk.getActiveMarkets('polymarket', 1, 100);
      console.log(`Fetched ${markets.length} active markets from Polymarket`);
      return markets;
    } catch (error) {
      console.error('Error fetching active markets:', error);
      throw error;
    }
  }
  
  selectMarketsForIndex(markets: Market[]): MarketWithMetrics[] {
    const filteredMarkets = filterMarkets(
      markets,
      this.config.minTVL,
      this.config.maxDaysToExpiry
    );
    
    return filteredMarkets.slice(0, this.config.maxComponents);
  }
  
  async composeIndex(): Promise<IndexProduct | null> {
    try {
      console.log('Starting index composition process...');
      
      const markets = await this.fetchActiveMarkets();
      
      const selectedMarkets = this.selectMarketsForIndex(markets);
      
      if (selectedMarkets.length === 0) {
        console.log('No suitable markets found for index composition');
        return null;
      }
      
      console.log(`Selected ${selectedMarkets.length} markets for the index`);
      
      const indexProduct = createIndexProduct(selectedMarkets);
      
      console.log(`Created index product with ID: ${indexProduct.id}`);
      
      if (!this.config.dryRun) {
        console.log('Executing on-chain transactions for index composition...');
      } else {
        console.log('Dry run mode - skipping on-chain transactions');
      }
      
      return indexProduct;
    } catch (error) {
      console.error('Error composing index:', error);
      throw error;
    }
  }
}
