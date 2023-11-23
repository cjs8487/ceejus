import { Router } from 'express';
import { isAuthenticated } from './APICore';
import {
    disableModule,
    enableModule,
    getAvailableModules,
    getUserConfig,
} from '../database/Config';

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

config.post('/:module/enable', (req, res) => {
    if (!req.session.user) {
        res.sendStatus(401);
        return;
    }
    const { module } = req.params;
    const modNum = Number(module);
    if (Number.isNaN(modNum)) {
        res.status(400).send('Invalid module');
        return;
    }
    enableModule(req.session.user.userId, modNum);
});

config.post('/:module/disable', (req, res) => {
    if (!req.session.user) {
        res.sendStatus(401);
        return;
    }
    const { module } = req.params;
    const modNum = Number(module);
    if (Number.isNaN(modNum)) {
        res.status(400).send('Invalid module');
        return;
    }
    disableModule(req.session.user.userId, modNum);
});

export default config;
