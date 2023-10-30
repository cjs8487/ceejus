import { Router } from 'express';
import eventSub from './EventSub';

const twitch = Router();

twitch.use('/eventSub', eventSub);

export default twitch;
