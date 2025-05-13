import { Market } from 'polynance_sdk';

export enum IndexStatus {
  PENDING = 'pending',
  OPEN = 'open',
  SETTLED = 'settled'
}

export interface IndexComponent {
  marketId: string;
  protocol: string;
  title: string;
  weight: number;
  position: 'YES' | 'NO';
  endDate: string;
}

export interface IndexProduct {
  id: string;
  name: string;
  description: string;
  components: IndexComponent[];
  creationDate: string;
  startDate: string;
  endDate: string;
  status: IndexStatus;
  initialValue: number;
  currentValue?: number;
  finalValue?: number;
}

export interface IndexComposerConfig {
  minTVL: number;
  maxDaysToExpiry: number;
  maxComponents: number;
  dryRun: boolean;
  intervalHours: number;
}

export interface MarketWithMetrics extends Market {
  tvl?: number;
  daysToExpiry?: number;
  score?: number;
}
