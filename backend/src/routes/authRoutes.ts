import { Router } from 'express';
import * as authController from '../controllers/authController';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema, changePasswordSchema, updateProfileSchema } from '../validators/authValidators';
import { requireAuth } from '../middleware/auth';
import { authRateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', authRateLimiter, validate(registerSchema), authController.register);
router.post('/login', authRateLimiter, validate(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.get('/me', requireAuth, authController.me);
router.put('/change-password', requireAuth, validate(changePasswordSchema), authController.changePassword);
router.put('/profile', requireAuth, validate(updateProfileSchema), authController.updateProfile);

export default router;
