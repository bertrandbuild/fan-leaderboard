import { Router } from 'express';
import { authController } from '../controllers/auth.controller';

const router = Router();

// POST /api/login
router.post('/login', authController.login);

export default router;
