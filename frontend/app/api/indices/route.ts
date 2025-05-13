import { NextRequest, NextResponse } from 'next/server';
import { PolynanceSDK } from 'polynance_sdk';
import { Wallet, providers } from 'ethers';
import { IndexProduct, IndexStatus, IndexComponent, MarketWithMetrics } from '../../../../packages/index-composer/src/types';

export let indices: IndexProduct[] = [];

if (indices.length === 0) {
  const currentDate = new Date();
  const twoWeeksFromNow = new Date(currentDate);
  twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);
  
  const formatDate = (date: Date) => {
    const year = date.getFullYear().toString().slice(2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}${month}${day}`;
  };
  
  indices.push({
    id: `${formatDate(currentDate)}-1`,
    name: 'Top 5 Markets Index',
    description: 'Index of top 5 markets by TVL',
    components: [],
    creationDate: currentDate.toISOString(),
    startDate: currentDate.toISOString(),
    endDate: twoWeeksFromNow.toISOString(),
    status: IndexStatus.OPEN,
    initialValue: 1.0,
    currentValue: 1.0,
    finalValue: undefined
  });
}

export const initializeSDK = () => {
  const options: any = {};
  
  if (process.env.PRIVATE_KEY) {
    const provider = new providers.JsonRpcProvider(process.env.RPC_URL || 'https://polygon-mainnet.g.alchemy.com/v2/demo');
    const wallet = new Wallet(process.env.PRIVATE_KEY || '0x0000000000000000000000000000000000000000000000000000000000000001');
    options.wallet = wallet;
  }
  
  return new PolynanceSDK(options);
};

export async function GET(request: NextRequest) {
  try {
    const sdk = initializeSDK();
    
    let markets: MarketWithMetrics[] = [];
    
    try {
      const realMarkets = [];
      
      try {
        console.log('Attempting to fetch active markets using polynance_sdk...');
        const activeMarkets = await sdk.getActiveMarkets('polymarket', 1, 10);
        
        if (activeMarkets && Array.isArray(activeMarkets) && activeMarkets.length > 0) {
          console.log(`Successfully fetched ${activeMarkets.length} active markets from polynance_sdk`);
          realMarkets.push(...activeMarkets);
        } else {
          console.log('No active markets returned from polynance_sdk');
        }
      } catch (err) {
        console.log('Error fetching active markets from polynance_sdk:', err);
      }
      
      if (realMarkets.length === 0) {
        try {
          console.log('Attempting to fetch markets from Polymarket API...');
          const response = await fetch('https://strapi-matic.poly.market/markets?active=true&limit=10');
          
          if (response.ok) {
            const data = await response.json();
            if (data && Array.isArray(data) && data.length > 0) {
              console.log(`Successfully fetched ${data.length} markets from Polymarket API`);
              realMarkets.push(...data);
            } else {
              console.log('No markets returned from Polymarket API');
            }
          } else {
            console.log('Failed to fetch markets from Polymarket API:', response.statusText);
          }
        } catch (err) {
          console.log('Error fetching markets from Polymarket API:', err);
        }
      }
      
      if (realMarkets.length === 0) {
        try {
          console.log('Attempting to fetch individual markets by ID...');
          const marketIds = [
            'will-btc-exceed-100k-by-end-of-2025',
            'will-eth-exceed-10k-by-end-of-2025',
            'will-the-fed-cut-rates-in-june-2025',
            'will-spacex-reach-mars-by-2026',
            'will-ai-regulation-pass-in-the-us-by-end-of-2025'
          ];
          
          for (const id of marketIds) {
            try {
              const market = await sdk.getMarket('polymarket', id);
              if (market) {
                console.log(`Successfully fetched market: ${id}`);
                realMarkets.push(market);
              }
            } catch (e) {
              console.log(`Error fetching market ${id}:`, e);
            }
          }
        } catch (err) {
          console.log('Error using SDK methods for individual markets:', err);
        }
      }
      
      if (realMarkets && realMarkets.length > 0) {
        markets = realMarkets.map(market => {
          const endDate = new Date(market.endDate);
          const now = new Date();
          const daysToExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          const tvlValue = typeof market.volume === 'number' 
            ? market.volume 
            : (Array.isArray(market.volume) 
                ? market.volume.reduce((sum: number, vol: number) => sum + vol, 0) 
                : 0);
          
          return {
            ...market,
            tvl: tvlValue,
            daysToExpiry,
            score: 100 - daysToExpiry // Simple scoring based on time to expiry
          } as unknown as MarketWithMetrics;
        });
      }
    } catch (error) {
      console.error('Error fetching real markets from SDK:', error);
    }
    
    if (markets.length === 0) {
      console.log('Using mock market data as fallback');
      
      const mockMarkets = [
        {
          id: 'market-1',
          title: 'Will BTC exceed $100k by end of 2025?',
          description: 'Bitcoin price prediction market',
          protocol: 'polymarket', // Use lowercase to match PredictionProvider type
          region: 'global',
          slug: 'btc-100k-2025',
          startDate: new Date(2023, 0, 1).toISOString(),
          creationDate: new Date(2023, 0, 1).toISOString(),
          endDate: new Date(2025, 11, 31).toISOString(),
          image: '',
          icon: '',
          active: true,
          volume: 500000,
          markets: [],
          tvl: 500000,
          daysToExpiry: 230,
          score: 85
        },
        {
          id: 'market-2',
          title: 'Will ETH exceed $10k by end of 2025?',
          description: 'Ethereum price prediction market',
          protocol: 'polymarket',
          region: 'global',
          slug: 'eth-10k-2025',
          startDate: new Date(2023, 0, 1).toISOString(),
          creationDate: new Date(2023, 0, 1).toISOString(),
          endDate: new Date(2025, 11, 31).toISOString(),
          image: '',
          icon: '',
          active: true,
          volume: 350000,
          markets: [],
          tvl: 350000,
          daysToExpiry: 230,
          score: 80
        },
        {
          id: 'market-3',
          title: 'Will the Fed cut rates in June 2025?',
          description: 'Federal Reserve interest rate prediction',
          protocol: 'polymarket',
          region: 'us',
          slug: 'fed-rate-cut-june-2025',
          startDate: new Date(2023, 0, 1).toISOString(),
          creationDate: new Date(2023, 0, 1).toISOString(),
          endDate: new Date(2025, 5, 15).toISOString(),
          image: '',
          icon: '',
          active: true,
          volume: 250000,
          markets: [],
          tvl: 250000,
          daysToExpiry: 32,
          score: 75
        },
        {
          id: 'market-4',
          title: 'Will SpaceX reach Mars by 2026?',
          description: 'SpaceX Mars mission prediction',
          protocol: 'polymarket',
          region: 'global',
          slug: 'spacex-mars-2026',
          startDate: new Date(2023, 0, 1).toISOString(),
          creationDate: new Date(2023, 0, 1).toISOString(),
          endDate: new Date(2026, 11, 31).toISOString(),
          image: '',
          icon: '',
          active: true,
          volume: 200000,
          markets: [],
          tvl: 200000,
          daysToExpiry: 595,
          score: 70
        },
        {
          id: 'market-5',
          title: 'Will AI regulation pass in the US by end of 2025?',
          description: 'US AI regulation prediction',
          protocol: 'polymarket',
          region: 'us',
          slug: 'ai-regulation-us-2025',
          startDate: new Date(2023, 0, 1).toISOString(),
          creationDate: new Date(2023, 0, 1).toISOString(),
          endDate: new Date(2025, 11, 31).toISOString(),
          image: '',
          icon: '',
          active: true,
          volume: 180000,
          markets: [],
          tvl: 180000,
          daysToExpiry: 230,
          score: 65
        }
      ] as MarketWithMetrics[];
      
      markets = mockMarkets;
    }
    
    indices.forEach(index => {
      if (index.components.length === 0 && markets && markets.length > 0) {
        const topMarkets = markets
          .sort((a, b) => (b.tvl || 0) - (a.tvl || 0))
          .slice(0, 5);
        
        index.components = topMarkets.map(market => ({
          marketId: market.id,
          protocol: market.protocol,
          title: market.title,
          weight: 0.2, // Equal weight for each market
          position: Math.random() > 0.5 ? 'YES' : 'NO', // Randomly assign position
          endDate: market.endDate
        }));
        
        const performanceFactor = 1 + (Math.random() * 0.2 - 0.1); // Random performance between -10% and +10%
        index.currentValue = index.initialValue * performanceFactor;
      }
    });
    
    return NextResponse.json(indices);
  } catch (error: any) {
    console.error('Error fetching indices:', error);
    return NextResponse.json(indices);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { indexProduct } = body;
    
    if (!indexProduct) {
      return NextResponse.json({ error: 'Missing index product data' }, { status: 400 });
    }
    
    const sdk = initializeSDK();
    
    indices.push(indexProduct);
    
    return NextResponse.json(indexProduct);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
