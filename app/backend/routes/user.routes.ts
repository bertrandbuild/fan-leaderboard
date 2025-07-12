import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import {
  authenticate,
  authorizeProfileUpdate,
  authorizeUserDeletion,
  optionalAuthenticate,
} from '../middlewares/auth.middleware';

const router = Router();

/**
 * @route GET /api/users
 * @description List users with pagination
 */
router.get('/', authenticate, userController.listUsers);

/**
 * @route POST /api/users
 * @description Create a new user profile
 * @access Public
 */
router.post('/', userController.createUser);

/**
 * @route GET /api/users/club-admins
 * @description List club admins
 */
router.get('/club-admins', authenticate, userController.listClubAdmins);

/**
 * @route PUT /api/users/:address/role
 * @description Update user role
 */
router.put('/:address/role', authenticate, userController.updateUserRole);

/**
 * @route GET /api/users/address/:address
 * @description Get user profile by EVM address
 * @access Public (with optional authentication for enhanced data)
 */
router.get('/address/:address', optionalAuthenticate, userController.getUserByEvmAddress);

/**
 * @route GET /api/users/:id
 * @description Get user profile by ID
 * @access Public (with optional authentication for enhanced data)
 */
router.get('/:id', optionalAuthenticate, userController.getUserById);

/**
 * @route GET /api/users/:id/tiktok-profile
 * @description Get user profile with TikTok profile data
 * @access Public (with optional authentication for enhanced data)
 */
router.get('/:id/tiktok-profile', optionalAuthenticate, userController.getUserTikTokProfile);

/**
 * @route PUT /api/users/:id
 * @description Update user profile
 * @access Private (requires authentication and authorization)
 */
router.put('/:id', authenticate, authorizeProfileUpdate, userController.updateUser);

/**
 * @route DELETE /api/users/:id
 * @description Delete user profile
 * @access Private (requires authentication and authorization)
 */
router.delete('/:id', authenticate, authorizeUserDeletion, userController.deleteUser);

export default router; 