import { PolynanceSDK } from 'polynance_sdk';
import { Wallet, providers } from 'ethers';
import cron from 'node-cron';
import dotenv from 'dotenv';
import { IndexComposer } from './composer';
import config from './config';

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

async function runComposerJob() {
  console.log('Running Index Composer job...');
  
  try {
    const sdk = initializeSDK();
    const composer = new IndexComposer(sdk, config);
    
    const indexProduct = await composer.composeIndex();
    
    if (indexProduct) {
      console.log('Index composition successful!');
      console.log('Index Product:', JSON.stringify(indexProduct, null, 2));
    } else {
      console.log('Index composition did not produce a valid index');
    }
  } catch (error) {
    console.error('Error running composer job:', error);
  }
}

async function main() {
  await runComposerJob();
  
  if (config.intervalHours > 0) {
    let cronExpression;
    
    if (config.intervalHours < 1) {
      const minutes = Math.round(config.intervalHours * 60);
      cronExpression = `*/${minutes} * * * *`;
      console.log(`Scheduling composer job to run every ${minutes} minutes`);
    } else {
      cronExpression = `0 */${Math.round(config.intervalHours)} * * *`;
      console.log(`Scheduling composer job to run every ${config.intervalHours} hours`);
    }
    
    cron.schedule(cronExpression, runComposerJob);
    console.log(`Composer job scheduled with cron: ${cronExpression}`);
  } else {
    console.log('No recurring schedule set. Exiting after initial run.');
    process.exit(0);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
