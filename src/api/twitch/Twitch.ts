import { Router } from 'express';
import eventSub from './EventSub';
import { isAuthenticated } from '../APICore';
import { apiClient } from '../../auth/TwitchAuth';
import { deactivateUser, getUser } from '../../database/Users';
import { leaveChat } from '../../twitch/TwitchBot';

const twitch = Router();

twitch.use('/eventSub', eventSub);

twitch.post('/part', isAuthenticated, async (req, res) => {
    if (!req.session.user) {
        res.sendStatus(401);
        return;
    }
    const user = getUser(req.session.user.userId);
    if (!user) {
        res.sendStatus(403);
        return;
    }
    const twitchUser = await apiClient.users.getUserById(user?.twitchId);
    if (!twitchUser) {
        res.sendStatus(404);
        return;
    }
    leaveChat(twitchUser.name);
    deactivateUser(user.userId);
});

export default twitch;
