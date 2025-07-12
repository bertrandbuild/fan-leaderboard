import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { 
  requireAuth, 
  requireAdmin, 
  requireOwnershipOrAdmin,
  optionalAuth 
} from '../middlewares/auth.middleware';

const router = Router();

// Public routes (no authentication required)
router.post('/register', userController.createUser.bind(userController));
router.post('/login', userController.loginUser.bind(userController));

// Protected routes (authentication required)
router.get('/profile', requireAuth, userController.getProfile.bind(userController));
router.put('/profile', requireAuth, userController.updateProfile.bind(userController));

// User-specific routes with ownership or admin check
router.put('/profile/:userId', requireOwnershipOrAdmin, userController.updateProfile.bind(userController));
router.post('/fan-tokens', requireAuth, userController.addFanToken.bind(userController));
router.post('/:userId/fan-tokens', requireOwnershipOrAdmin, userController.addFanToken.bind(userController));
router.delete('/fan-tokens/:tokenEvmAddress', requireAuth, userController.removeFanToken.bind(userController));
router.delete('/:userId/fan-tokens/:tokenEvmAddress', requireOwnershipOrAdmin, userController.removeFanToken.bind(userController));

// Admin-only routes
router.get('/all', requireAdmin, userController.getAllUsers.bind(userController));
router.post('/admin-addresses', requireAdmin, userController.addAdminAddress.bind(userController));
router.delete('/admin-addresses/:evmAddress', requireAdmin, userController.removeAdminAddress.bind(userController));
router.delete('/:userId', requireAdmin, userController.deleteUser.bind(userController));

export default router;