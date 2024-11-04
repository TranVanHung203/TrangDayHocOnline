import express from 'express';
import {
    
    getTimelineTest,
} from '../controllers/notifyController.js';

const router = express.Router();

router.get('/timeline/:day', getTimelineTest);



export default router;
