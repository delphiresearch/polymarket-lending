import { Router } from 'express';
import { composeNow } from '../services/adminService';

const router = Router();

router.post('/composeNow', async (req, res) => {
  try {
    const isDev = process.env.NODE_ENV !== 'production';
    
    if (!isDev) {
      const signature = req.headers.authorization;
      if (!signature) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      if (signature !== `Bearer ${process.env.ADMIN_API_KEY}`) {
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }
    
    const result = await composeNow();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export const adminRoutes = router;
