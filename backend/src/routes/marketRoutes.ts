import { Router } from 'express';
import { getActiveMarkets, getMarketById, getMarketBySlug, searchMarkets } from '../services/polynanceService';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const protocol = req.query.protocol as string || 'polymarket';
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const markets = await getActiveMarkets(protocol as any, page, limit);
    res.json(markets);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/id/:protocol/:marketId', async (req, res) => {
  try {
    const { protocol, marketId } = req.params;
    const market = await getMarketById(protocol as any, marketId);
    res.json(market);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const markets = await getMarketBySlug(slug);
    res.json(markets);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/search', async (req, res) => {
  try {
    const query = req.query.q as string;
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const results = await searchMarkets(query);
    res.json(results);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export const marketRoutes = router;
