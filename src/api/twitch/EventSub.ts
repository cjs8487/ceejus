import { Router } from 'express';
import { isAuthenticated } from '../APICore';
import { apiClient } from '../../auth/TwitchAuth';
import { getUser } from '../../database/Users';

const eventSub = Router();

eventSub.get('/subscriptions', isAuthenticated, async (req, res) => {
    if (!req.session.user) {
        res.status(401);
        return;
    }
    const user = getUser(req.session.user.userId);
    if (!user) {
        res.status(401);
        return;
    }
    res.status(200).send(await apiClient.eventSub.getSubscriptions());
});

export default eventSub;
