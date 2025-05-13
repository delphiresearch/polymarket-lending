import { describe, it, expect } from 'vitest';
import { generateIndexId, daysBetween, filterMarkets, createIndexProduct } from '../src/utils';
import { Market } from 'polynance_sdk';
import { IndexStatus } from '../src/types';

describe('Utils', () => {
  describe('generateIndexId', () => {
    it('should generate an ID in the format YYMMDD-1', () => {
      const id = generateIndexId();
      expect(id).toMatch(/^\d{6}-\d+$/);
      
      const [datePart, numberPart] = id.split('-');
      
      expect(datePart.length).toBe(6);
      
      expect(parseInt(numberPart)).toBeGreaterThan(0);
    });
  });
  
  describe('daysBetween', () => {
    it('should calculate days between two dates', () => {
      const date1 = new Date('2023-01-01');
      const date2 = new Date('2023-01-10');
      
      expect(daysBetween(date1, date2)).toBe(9);
    });
    
    it('should handle same day', () => {
      const date1 = new Date('2023-01-01');
      const date2 = new Date('2023-01-01');
      
      expect(daysBetween(date1, date2)).toBe(0);
    });
  });
  
  describe('filterMarkets', () => {
    it('should filter markets based on TVL and days to expiry', () => {
      const now = new Date();
      const threeDaysLater = new Date(now);
      threeDaysLater.setDate(now.getDate() + 3);
      
      const tenDaysLater = new Date(now);
      tenDaysLater.setDate(now.getDate() + 10);
      
      const mockMarkets: Market[] = [
        {
          id: '1',
          protocol: 'polymarket',
          region: 'global',
          slug: 'market-1',
          title: 'Market 1',
          description: 'Description 1',
          startDate: now.toISOString(),
          creationDate: now.toISOString(),
          endDate: threeDaysLater.toISOString(),
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
          startDate: now.toISOString(),
          creationDate: now.toISOString(),
          endDate: threeDaysLater.toISOString(),
          image: '',
          icon: '',
          active: true,
          liquidity: 10000, // Below min TVL
          markets: []
        },
        {
          id: '3',
          protocol: 'polymarket',
          region: 'global',
          slug: 'market-3',
          title: 'Market 3',
          description: 'Description 3',
          startDate: now.toISOString(),
          creationDate: now.toISOString(),
          endDate: tenDaysLater.toISOString(), // Beyond max days
          image: '',
          icon: '',
          active: true,
          liquidity: 50000,
          markets: []
        }
      ];
      
      const filtered = filterMarkets(mockMarkets, 20000, 7);
      
      expect(filtered.length).toBe(1);
      expect(filtered[0].id).toBe('1');
      expect(filtered[0].tvl).toBe(30000);
      expect(filtered[0].daysToExpiry).toBeLessThanOrEqual(7);
    });
  });
  
  describe('createIndexProduct', () => {
    it('should create an index product from selected markets', () => {
      const now = new Date();
      const threeDaysLater = new Date(now);
      threeDaysLater.setDate(now.getDate() + 3);
      
      const fiveDaysLater = new Date(now);
      fiveDaysLater.setDate(now.getDate() + 5);
      
      const mockMarkets = [
        {
          id: '1',
          protocol: 'polymarket',
          region: 'global',
          slug: 'market-1',
          title: 'Market 1',
          description: 'Description 1',
          startDate: now.toISOString(),
          creationDate: now.toISOString(),
          endDate: threeDaysLater.toISOString(),
          image: '',
          icon: '',
          active: true,
          liquidity: 30000,
          tvl: 30000,
          daysToExpiry: 3,
          score: 10000,
          markets: []
        },
        {
          id: '2',
          protocol: 'polymarket',
          region: 'global',
          slug: 'market-2',
          title: 'Market 2',
          description: 'Description 2',
          startDate: now.toISOString(),
          creationDate: now.toISOString(),
          endDate: fiveDaysLater.toISOString(),
          image: '',
          icon: '',
          active: true,
          liquidity: 40000,
          tvl: 40000,
          daysToExpiry: 5,
          score: 8000,
          markets: []
        }
      ];
      
      const indexProduct = createIndexProduct(mockMarkets);
      
      expect(indexProduct.id).toMatch(/^\d{6}-\d+$/);
      expect(indexProduct.components.length).toBe(2);
      expect(indexProduct.status).toBe(IndexStatus.PENDING);
      expect(indexProduct.initialValue).toBe(100);
      
      expect(indexProduct.endDate).toBe(threeDaysLater.toISOString());
      
      expect(indexProduct.components[0].weight).toBe(0.5);
      expect(indexProduct.components[1].weight).toBe(0.5);
    });
  });
});
