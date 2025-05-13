import { Router } from 'express';
import { executeOrder, getUSDCBalance, getConditionalTokensBalance } from '../services/polynanceService';
import { ExecuteOrderParams } from 'polynance_sdk';

const router = Router();

router.post('/execute', async (req, res) => {
  try {
    const orderParams: ExecuteOrderParams = req.body;
    
    if (!orderParams.marketIdOrSlug || !orderParams.positionIdOrName || 
        !orderParams.buyOrSell || !orderParams.usdcFlowAbs || !orderParams.provider) {
      return res.status(400).json({ 
        error: 'Missing required fields. Required: marketIdOrSlug, positionIdOrName, buyOrSell, usdcFlowAbs, provider' 
      });
    }
    
    const result = await executeOrder(orderParams);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/balance/usdc', async (req, res) => {
  try {
    const walletAddress = req.query.walletAddress as string;
    const balance = await getUSDCBalance(walletAddress);
    res.json({ balance });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/balance/token/:tokenId', async (req, res) => {
  try {
    const { tokenId } = req.params;
    const walletAddress = req.query.walletAddress as string;
    const balance = await getConditionalTokensBalance(tokenId, walletAddress);
    res.json({ balance });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export const orderRoutes = router;
