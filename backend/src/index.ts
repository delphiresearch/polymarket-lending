import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { marketRoutes } from './routes/marketRoutes';
import { orderRoutes } from './routes/orderRoutes';
import { indicesRoutes } from './routes/indicesRoutes';
import { adminRoutes } from './routes/adminRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/markets', marketRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/indices', indicesRoutes);
app.use('/api/admin', adminRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
