# Polymarket Lending Platform

A web application that enables users to interact with prediction markets, specifically focusing on lending and borrowing activities on Polymarket.

## Project Structure

The project consists of two main parts:

1. **Frontend**: A Next.js application with React components for the user interface
2. **Backend**: An Express.js API that integrates with the polynance_sdk to interact with Polymarket

## Setup

### Prerequisites

- Node.js (v16+)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```
   cp .env.example .env
   ```

4. Update the `.env` file with your RPC URL and private key (if needed for signing transactions).

5. Build the project:
   ```
   npm run build
   ```

6. Start the server:
   ```
   npm start
   ```

   For development with auto-reload:
   ```
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env.local` file with the backend API URL:
   ```
   NEXT_PUBLIC_BACKEND_API_URL=http://localhost:3001/api
   ```

4. Start the development server:
   ```
   npm run dev
   ```

## Features

- Browse prediction market indices
- View detailed market information
- Execute supply (lending) and withdrawal transactions
- Connect cryptocurrency wallets
- Track market trends and analyze potential yields

## Integration with Polymarket

This platform integrates with Polymarket using the polynance_sdk, which provides a unified interface for interacting with prediction markets. The backend handles the communication with the Polymarket blockchain, while the frontend provides a user-friendly interface for users to interact with the markets.

## Blockchain

The platform operates on the same blockchain as Polymarket, which is Ethereum-compatible (using ethers.js for integration).
