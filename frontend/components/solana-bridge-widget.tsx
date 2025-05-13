'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useToast } from './ui/use-toast';
import { useWeb3 } from './web3-provider';
import { Connection, PublicKey } from '@solana/web3.js';

interface SolanaBridgeWidgetProps {
  onSuccess?: () => void;
}

export function SolanaBridgeWidget({ onSuccess }: SolanaBridgeWidgetProps) {
  const { toast } = useToast();
  const { isWalletConnected, connectWallet } = useWeb3();
  const [amount, setAmount] = useState<string>('');
  const [solanaAddress, setSolanaAddress] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const validateSolanaAddress = (address: string): boolean => {
    try {
      new PublicKey(address);
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleDeposit = async () => {
    if (!isWalletConnected) {
      connectWallet();
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid amount',
        variant: 'destructive',
      });
      return;
    }

    if (!solanaAddress || !validateSolanaAddress(solanaAddress)) {
      toast({
        title: 'Invalid Solana address',
        description: 'Please enter a valid Solana address',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      
      const response = await fetch('/api/bridge/solana-deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          solanaAddress,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Deposit initiated',
          description: `Cross-chain deposit of ${amount} USDC from Solana initiated successfully`,
        });
        setAmount('');
        setSolanaAddress('');
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast({
          title: 'Deposit failed',
          description: data.error || 'An error occurred during the cross-chain deposit',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Deposit failed',
        description: 'An error occurred during the cross-chain deposit',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Solana Bridge</CardTitle>
        <CardDescription>Deposit USDC from Solana to buy index products</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Solana Address</label>
          <Input
            type="text"
            placeholder="Enter your Solana address"
            value={solanaAddress}
            onChange={(e) => setSolanaAddress(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Amount (USDC)</label>
          <Input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <Button
          className="w-full"
          onClick={handleDeposit}
          disabled={loading || !isWalletConnected}
        >
          {!isWalletConnected ? 'Connect Wallet' : loading ? 'Processing...' : 'Deposit from Solana'}
        </Button>
      </CardContent>
    </Card>
  );
}
