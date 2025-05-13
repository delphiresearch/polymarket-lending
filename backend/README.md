# Polymarket Lending Backend

This backend service provides API endpoints for interacting with the Polymarket prediction markets using the polynance_sdk.

## Features

- Fetch active markets from Polymarket
- Get detailed market information
- Execute buy/sell orders for prediction market positions
- Check token balances
- Search markets

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file based on `.env.example`:
   ```
   cp .env.example .env
   ```

3. Update the `.env` file with your RPC URL and private key (if needed for signing transactions).

4. Build the project:
   ```
   npm run build
   ```

5. Start the server:
   ```
   npm start
   ```

   For development with auto-reload:
   ```
   npm run dev
   ```

## API Endpoints

### Markets

- `GET /api/markets` - Get active markets
- `GET /api/markets/id/:protocol/:marketId` - Get market by ID
- `GET /api/markets/slug/:slug` - Get market by slug
- `GET /api/markets/search?q=query` - Search markets

### Orders

- `POST /api/orders/execute` - Execute an order (buy/sell)
- `GET /api/orders/balance/usdc?walletAddress=address` - Get USDC balance
- `GET /api/orders/balance/token/:tokenId?walletAddress=address` - Get conditional token balance

## Integration with Frontend

The backend is designed to be integrated with the Polymarket Lending frontend. The frontend can make API calls to this backend service to fetch market data and execute trades.
