import { Router } from 'express';
import { isAuthenticated } from '../APICore';
import {
    getEconomyConfig,
    updateEconomyConfig,
} from '../../database/EconomyConfig';

const econonmyConfig = Router();

econonmyConfig.get('/', isAuthenticated, (req, res) => {
    if (!req.session.user) {
        res.sendStatus(401);
        return;
    }
    const config = getEconomyConfig(req.session.user.userId);
    if (!config) {
        res.sendStatus(404);
        return;
    }
    res.status(200).send(config);
});

econonmyConfig.post('/', isAuthenticated, (req, res) => {
    if (!req.session.user) {
        res.sendStatus(401);
        return;
    }
    const { currencyName, passiveRate, requireActive, minimumGamble } =
        req.body;
    updateEconomyConfig(
        req.session.user.userId,
        currencyName,
        passiveRate,
        requireActive,
        minimumGamble,
    );
});

export default econonmyConfig;
