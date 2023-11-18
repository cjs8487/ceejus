import { Router } from 'express';
import { isAuthenticated } from './APICore';
import { getAvailableModules, getUserConfig } from '../database/Config';
import { getUser } from '../database/Users';

const config = Router();

config.get('/', isAuthenticated, (req, res) => {
    if (!req.session.user) {
        res.sendStatus(401);
        return;
    }
    res.status(200).send(getUserConfig(req.session.user.userId));
});

config.get('/modules', (req, res) => {
    res.status(200).send(getAvailableModules());
});

export default config;
