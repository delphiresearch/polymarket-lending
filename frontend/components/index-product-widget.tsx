'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { useToast } from './ui/use-toast';
import { useWeb3 } from './web3-provider';
import { IndexProduct, IndexStatus, IndexComponent } from '../../packages/index-composer/src/types';
import { AreaChart, Area, ChartContainer, Tooltip, XAxis, YAxis } from './ui/chart';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

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
  const [selectedIndexDetails, setSelectedIndexDetails] = useState<IndexProduct | null>(null);
  const [performanceData, setPerformanceData] = useState<any[]>([]);

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
          
          if (!selectedIndexId && data.length > 0) {
            setSelectedIndexId(data[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching live indices:', error);
      }
    };

    fetchLiveIndices();
  }, []);
  
  useEffect(() => {
    const fetchIndexDetails = async () => {
      if (!selectedIndexId) return;
      
      try {
        const response = await fetch(`/api/indices/${selectedIndexId}`);
        if (response.ok) {
          const data = await response.json();
          setSelectedIndexDetails(data);
          
          const startDate = new Date(data.startDate);
          const endDate = new Date(data.endDate);
          const today = new Date();
          
          const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
          const elapsedDays = Math.min(
            totalDays,
            Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
          );
          
          const chartData = [];
          const initialValue = data.initialValue || 1.0;
          const currentValue = data.currentValue || initialValue * 1.05;
          
          for (let i = 0; i <= elapsedDays; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            
            const progress = i / elapsedDays;
            const value = initialValue + (currentValue - initialValue) * progress;
            
            const randomFactor = 1 + (Math.random() * 0.02 - 0.01); // ±1% random variation
            
            chartData.push({
              date: date.toISOString().split('T')[0],
              value: i === elapsedDays ? currentValue : value * randomFactor
            });
          }
          
          setPerformanceData(chartData);
        }
      } catch (error) {
        console.error('Error fetching index details:', error);
      }
    };
    
    fetchIndexDetails();
  }, [selectedIndexId]);

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

  const estimatedReturn = selectedIndexDetails && selectedIndexDetails.currentValue && selectedIndexDetails.initialValue ? 
    ((selectedIndexDetails.currentValue / selectedIndexDetails.initialValue - 1) * 100).toFixed(2) : 
    null;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Index Product</CardTitle>
        <CardDescription>Buy or redeem index tokens</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
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
          
          {selectedIndexDetails && (
            <div className="rounded-lg border p-4 space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{selectedIndexDetails.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedIndexDetails.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Current Value</p>
                  <p className="text-lg font-medium">${selectedIndexDetails.currentValue?.toFixed(2) || '0.00'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estimated Return</p>
                  <p className={`text-lg font-medium ${parseFloat(estimatedReturn || '0') >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {estimatedReturn}%
                  </p>
                </div>
              </div>
              
              {performanceData.length > 0 && (
                <div className="h-48">
                  <ChartContainer
                    config={{
                      value: { theme: { light: 'hsl(var(--primary))', dark: 'hsl(var(--primary))' } },
                    }}
                  >
                    <AreaChart data={performanceData}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="hsl(var(--primary))" 
                        fillOpacity={1} 
                        fill="url(#colorValue)" 
                      />
                    </AreaChart>
                  </ChartContainer>
                </div>
              )}
              
              {selectedIndexDetails.components && selectedIndexDetails.components.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Components</h4>
                  <div className="space-y-2">
                    {selectedIndexDetails.components.map((component, index) => (
                      <div key={index} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                        <div className="flex items-center gap-2">
                          <Badge variant={component.position === 'YES' ? 'default' : 'secondary'}>
                            {component.position}
                          </Badge>
                          <span className="text-sm">{component.title}</span>
                        </div>
                        <span className="text-sm font-medium">{(component.weight * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <Separator />
          
          <Tabs defaultValue="buy" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="buy">Buy</TabsTrigger>
              <TabsTrigger value="redeem">Redeem</TabsTrigger>
            </TabsList>
            <TabsContent value="buy" className="space-y-4">
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
                disabled={loading || !isWalletConnected || !selectedIndexId}
              >
                {!isWalletConnected ? 'Connect Wallet' : loading ? 'Processing...' : 'Buy Index'}
              </Button>
            </TabsContent>
            <TabsContent value="redeem" className="space-y-4">
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
                disabled={loading || !isWalletConnected || !selectedIndexId}
              >
                {!isWalletConnected ? 'Connect Wallet' : loading ? 'Processing...' : 'Redeem Index'}
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}
