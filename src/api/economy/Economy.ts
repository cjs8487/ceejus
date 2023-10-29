import { Router } from 'express';
import economyRewards from './Rewards';

const economy = Router();

economy.use('/rewards', economyRewards);

export default economy;
