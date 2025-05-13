import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IndexComposer } from '../src/composer';
import { IndexComposerConfig, IndexStatus } from '../src/types';

vi.mock('polynance_sdk', () => {
  return {
    PolynanceSDK: vi.fn().mockImplementation(() => ({
      getActiveMarkets: vi.fn().mockResolvedValue([
        {
          id: '1',
          protocol: 'polymarket',
          region: 'global',
          slug: 'market-1',
          title: 'Market 1',
          description: 'Description 1',
          startDate: new Date().toISOString(),
          creationDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days later
          image: '',
          icon: '',
          active: true,
          liquidity: 30000,
          markets: []
        },
        {
          id: '2',
          protocol: 'polymarket',
          region: 'global',
          slug: 'market-2',
          title: 'Market 2',
          description: 'Description 2',
          startDate: new Date().toISOString(),
          creationDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days later
          image: '',
          icon: '',
          active: true,
          liquidity: 40000,
          markets: []
        },
        {
          id: '3',
          protocol: 'polymarket',
          region: 'global',
          slug: 'market-3',
          title: 'Market 3',
          description: 'Description 3',
          startDate: new Date().toISOString(),
          creationDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days later
          image: '',
          icon: '',
          active: true,
          liquidity: 10000, // Below min TVL
          markets: []
        }
      ])
    }))
  };
});

describe('IndexComposer', () => {
  let mockSdk: any;
  let config: IndexComposerConfig;
  let composer: IndexComposer;
  
  beforeEach(() => {
    mockSdk = {
      getActiveMarkets: vi.fn().mockResolvedValue([
        {
          id: '1',
          protocol: 'polymarket',
          region: 'global',
          slug: 'market-1',
          title: 'Market 1',
          description: 'Description 1',
          startDate: new Date().toISOString(),
          creationDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days later
          image: '',
          icon: '',
          active: true,
          liquidity: 30000,
          markets: []
        },
        {
          id: '2',
          protocol: 'polymarket',
          region: 'global',
          slug: 'market-2',
          title: 'Market 2',
          description: 'Description 2',
          startDate: new Date().toISOString(),
          creationDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days later
          image: '',
          icon: '',
          active: true,
          liquidity: 40000,
          markets: []
        },
        {
          id: '3',
          protocol: 'polymarket',
          region: 'global',
          slug: 'market-3',
          title: 'Market 3',
          description: 'Description 3',
          startDate: new Date().toISOString(),
          creationDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days later
          image: '',
          icon: '',
          active: true,
          liquidity: 10000, // Below min TVL
          markets: []
        }
      ])
    };
    
    config = {
      minTVL: 20000,
      maxDaysToExpiry: 7,
      maxComponents: 5,
      dryRun: true,
      intervalHours: 72
    };
    
    composer = new IndexComposer(mockSdk, config);
  });
  
  describe('fetchActiveMarkets', () => {
    it('should fetch active markets from the SDK', async () => {
      const markets = await composer.fetchActiveMarkets();
      
      expect(mockSdk.getActiveMarkets).toHaveBeenCalledWith('polymarket', 1, 100);
      expect(markets.length).toBe(3);
    });
  });
  
  describe('selectMarketsForIndex', () => {
    it('should select markets based on TVL and days to expiry', async () => {
      const markets = await composer.fetchActiveMarkets();
      const selectedMarkets = composer.selectMarketsForIndex(markets);
      
      expect(selectedMarkets.length).toBe(2);
      expect(selectedMarkets[0].id).toBe('2'); // Higher TVL should be first
      expect(selectedMarkets[1].id).toBe('1');
    });
    
    it('should limit the number of selected markets', async () => {
      config.maxComponents = 1;
      composer = new IndexComposer(mockSdk, config);
      
      const markets = await composer.fetchActiveMarkets();
      const selectedMarkets = composer.selectMarketsForIndex(markets);
      
      expect(selectedMarkets.length).toBe(1);
      expect(selectedMarkets[0].id).toBe('2'); // Highest TVL
    });
  });
  
  describe('composeIndex', () => {
    it('should create an index product from selected markets', async () => {
      const indexProduct = await composer.composeIndex();
      
      expect(indexProduct).not.toBeNull();
      if (indexProduct) {
        expect(indexProduct.components.length).toBe(2);
        expect(indexProduct.status).toBe(IndexStatus.PENDING);
        expect(indexProduct.initialValue).toBe(100);
        
        const earliestEndDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
        expect(indexProduct.endDate).toBe(earliestEndDate);
      }
    });
    
    it('should return null if no suitable markets are found', async () => {
      config.minTVL = 100000;
      composer = new IndexComposer(mockSdk, config);
      
      const indexProduct = await composer.composeIndex();
      
      expect(indexProduct).toBeNull();
    });
  });
});
