'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { useToast } from './ui/use-toast';
import { useWeb3 } from './web3-provider';
import { IndexProduct, IndexStatus } from '../../packages/index-composer/src/types';

interface IndexProductWidgetProps {
  selectedIndex?: IndexProduct;
}

export function IndexProductWidget({ selectedIndex }: IndexProductWidgetProps) {
  const { toast } = useToast();
  const { isWalletConnected, walletAddress, connectWallet } = useWeb3();
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [liveIndices, setLiveIndices] = useState<IndexProduct[]>([]);
  const [selectedIndexId, setSelectedIndexId] = useState<string | undefined>(selectedIndex?.id);

  useEffect(() => {
    if (selectedIndex) {
      setSelectedIndexId(selectedIndex.id);
    }
  }, [selectedIndex]);

  useEffect(() => {
    const fetchLiveIndices = async () => {
      try {
        const response = await fetch('/api/indices/live');
        if (response.ok) {
          const data = await response.json();
          setLiveIndices(data);
        }
      } catch (error) {
        console.error('Error fetching live indices:', error);
      }
    };

    fetchLiveIndices();
  }, []);

  const handleBuy = async () => {
    if (!isWalletConnected) {
      connectWallet();
      return;
    }

    if (!selectedIndexId) {
      toast({
        title: 'No index selected',
        description: 'Please select an index to buy',
        variant: 'destructive',
      });
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

    setLoading(true);

    try {
      const response = await fetch('/api/indices/buy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          indexId: selectedIndexId,
          amount: parseFloat(amount),
          walletAddress,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Purchase successful',
          description: `You have successfully purchased ${amount} of index ${selectedIndexId}`,
        });
        setAmount('');
      } else {
        toast({
          title: 'Purchase failed',
          description: data.error || 'An error occurred during purchase',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Purchase failed',
        description: 'An error occurred during purchase',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    if (!isWalletConnected) {
      connectWallet();
      return;
    }

    if (!selectedIndexId) {
      toast({
        title: 'No index selected',
        description: 'Please select an index to redeem',
        variant: 'destructive',
      });
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

    setLoading(true);

    try {
      const response = await fetch('/api/indices/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          indexId: selectedIndexId,
          amount: parseFloat(amount),
          walletAddress,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Redemption successful',
          description: `You have successfully redeemed ${amount} of index ${selectedIndexId} for ${data.usdcAmount} USDC`,
        });
        setAmount('');
      } else {
        toast({
          title: 'Redemption failed',
          description: data.error || 'An error occurred during redemption',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Redemption failed',
        description: 'An error occurred during redemption',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Index Product</CardTitle>
        <CardDescription>Buy or redeem index tokens</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="buy" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="buy">Buy</TabsTrigger>
            <TabsTrigger value="redeem">Redeem</TabsTrigger>
          </TabsList>
          <TabsContent value="buy" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Index</label>
              <select
                className="w-full p-2 border rounded-md"
                value={selectedIndexId}
                onChange={(e) => setSelectedIndexId(e.target.value)}
              >
                <option value="">Select an index</option>
                {liveIndices.map((index) => (
                  <option key={index.id} value={index.id}>
                    {index.name} - {index.id}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount</label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <Button
              className="w-full"
              onClick={handleBuy}
              disabled={loading || !isWalletConnected}
            >
              {!isWalletConnected ? 'Connect Wallet' : loading ? 'Processing...' : 'Buy Index'}
            </Button>
          </TabsContent>
          <TabsContent value="redeem" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Index</label>
              <select
                className="w-full p-2 border rounded-md"
                value={selectedIndexId}
                onChange={(e) => setSelectedIndexId(e.target.value)}
              >
                <option value="">Select an index</option>
                {liveIndices.map((index) => (
                  <option key={index.id} value={index.id}>
                    {index.name} - {index.id}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount</label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <Button
              className="w-full"
              onClick={handleRedeem}
              disabled={loading || !isWalletConnected}
            >
              {!isWalletConnected ? 'Connect Wallet' : loading ? 'Processing...' : 'Redeem Index'}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
