import express, { Request } from 'express';
import { auth } from '../middleware/auth';
import { IUser } from '../models/User';

interface AuthRequest extends Request {
    user?: IUser;
}

const router = express.Router();

router.use(auth);

router.get('/profile', (req: AuthRequest, res) => {
    res.json(req.user);
});

export default router; 