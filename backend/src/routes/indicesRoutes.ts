import { Router } from 'express';
import { getAllIndices, getLiveIndices, getIndexById, buyIndex, redeemIndex } from '../services/indicesService';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const indices = await getAllIndices();
    res.json(indices);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/live', async (req, res) => {
  try {
    const indices = await getLiveIndices();
    res.json(indices);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const index = await getIndexById(id);
    
    if (!index) {
      return res.status(404).json({ error: 'Index not found' });
    }
    
    res.json(index);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/buy', async (req, res) => {
  try {
    const { indexId, amount, walletAddress } = req.body;
    
    if (!indexId || !amount || !walletAddress) {
      return res.status(400).json({ 
        error: 'Missing required fields. Required: indexId, amount, walletAddress' 
      });
    }
    
    const result = await buyIndex(indexId, amount, walletAddress);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/redeem', async (req, res) => {
  try {
    const { indexId, amount, walletAddress } = req.body;
    
    if (!indexId || !amount || !walletAddress) {
      return res.status(400).json({ 
        error: 'Missing required fields. Required: indexId, amount, walletAddress' 
      });
    }
    
    const result = await redeemIndex(indexId, amount, walletAddress);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export const indicesRoutes = router;
