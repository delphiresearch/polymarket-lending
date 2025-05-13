import { Market } from 'polynance_sdk';
import { IndexComponent, IndexProduct, IndexStatus, MarketWithMetrics } from './types';

export function generateIndexId(): string {
  const now = new Date();
  const year = now.getUTCFullYear().toString().slice(2); // YY
  const month = (now.getUTCMonth() + 1).toString().padStart(2, '0'); // MM
  const day = now.getUTCDate().toString().padStart(2, '0'); // DD
  
  const baseId = `${year}${month}${day}`;
  
  return `${baseId}-1`;
}

export function daysBetween(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  const diffDays = Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDay));
  return diffDays;
}

export function filterMarkets(markets: Market[], minTVL: number, maxDaysToExpiry: number): MarketWithMetrics[] {
  const now = new Date();
  
  return markets
    .map(market => {
      const endDate = new Date(market.endDate);
      const daysToExpiry = daysBetween(now, endDate);
      
      const tvl = market.liquidity || 0;
      
      const score = tvl / (daysToExpiry + 1);
      
      return {
        ...market,
        tvl,
        daysToExpiry,
        score
      };
    })
    .filter(market => 
      market.tvl >= minTVL && 
      market.daysToExpiry <= maxDaysToExpiry &&
      market.daysToExpiry > 0 // Ensure market hasn't expired
    )
    .sort((a, b) => (b.score || 0) - (a.score || 0)); // Sort by score descending
}

export function createIndexProduct(selectedMarkets: MarketWithMetrics[]): IndexProduct {
  const indexId = generateIndexId();
  const now = new Date();
  
  const endDates = selectedMarkets.map(market => new Date(market.endDate));
  const earliestEndDate = new Date(Math.min(...endDates.map(date => date.getTime())));
  
  const weight = 1 / selectedMarkets.length;
  const components: IndexComponent[] = selectedMarkets.map(market => ({
    marketId: market.id,
    protocol: market.protocol,
    title: market.title,
    weight,
    position: 'YES', // Default position, could be more sophisticated
    endDate: market.endDate
  }));
  
  return {
    id: indexId,
    name: `Polymarket Index ${indexId}`,
    description: `Index of top ${selectedMarkets.length} Polymarket prediction markets by TVL and expiry`,
    components,
    creationDate: now.toISOString(),
    startDate: now.toISOString(),
    endDate: earliestEndDate.toISOString(),
    status: IndexStatus.PENDING,
    initialValue: 100, // Default initial value in USD
  };
}
