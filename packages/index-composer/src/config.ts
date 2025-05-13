import { z } from 'zod';
import dotenv from 'dotenv';
import { IndexComposerConfig } from './types';

dotenv.config();

const envSchema = z.object({
  COMPOSER_MIN_TVL: z.string().default('20000'),
  COMPOSER_MAX_DAYS_TO_EXPIRY: z.string().default('7'),
  COMPOSER_MAX_COMPONENTS: z.string().default('5'),
  COMPOSER_INTERVAL_HRS: z.string().default('72'),
  RPC_URL: z.string().optional(),
  PRIVATE_KEY: z.string().optional(),
});

const env = envSchema.parse(process.env);

export const config: IndexComposerConfig = {
  minTVL: parseInt(env.COMPOSER_MIN_TVL),
  maxDaysToExpiry: parseInt(env.COMPOSER_MAX_DAYS_TO_EXPIRY),
  maxComponents: parseInt(env.COMPOSER_MAX_COMPONENTS),
  dryRun: process.argv.includes('--dry-run'),
  intervalHours: parseFloat(env.COMPOSER_INTERVAL_HRS),
};

export default config;
