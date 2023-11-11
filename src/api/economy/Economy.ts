import { Router } from 'express';
import economyRewards from './Rewards';
import econonmyConfig from './Config';
import {
    createEconomyConfig,
    getEconomyConfig,
} from '../../database/EconomyConfig';

const economy = Router();

economy.use('/', (req, res, next) => {
    if (!req.session.user) {
        res.sendStatus(401);
        return;
    }
    if (!getEconomyConfig(req.session.user.userId)) {
        createEconomyConfig(req.session.user.userId);
    }
    next();
});

economy.use('/rewards', economyRewards);
economy.use('/config', econonmyConfig);

export default economy;
