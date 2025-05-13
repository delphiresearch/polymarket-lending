'use client';

import React from 'react';
import { IndexProductWidget } from '../../components/index-product-widget';
import { SolanaBridgeWidget } from '../../components/solana-bridge-widget';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';

export default function IndicesPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Index Products</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <IndexProductWidget />
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Cross-Chain Deposits</CardTitle>
              <CardDescription>Deposit funds from other chains to buy index products</CardDescription>
            </CardHeader>
            <CardContent>
              <SolanaBridgeWidget />
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>About Index Products</CardTitle>
            <CardDescription>Learn more about our index products</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Our index products bundle multiple Polymarket prediction markets into a single token, 
              allowing you to gain exposure to a diversified portfolio of markets.
            </p>
            <p className="mb-4">
              Each index is composed of the top-performing markets based on TVL and other metrics, 
              and is automatically rebalanced every 72 hours.
            </p>
            <p>
              You can buy index tokens with USDC and redeem them for USDC once all the underlying 
              markets have settled.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
