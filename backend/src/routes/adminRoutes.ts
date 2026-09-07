import { Router } from 'express';
import * as adminController from '../controllers/adminController';
import { requireAuth, requireAdmin, requireRole } from '../middleware/auth';

const router = Router();

// All admin routes require authentication AND admin/super-admin role,
// enforced here on the backend (never rely on frontend routing for this).
router.use(requireAuth, requireAdmin);

router.get('/dashboard', adminController.getDashboard);

router.get('/users', adminController.listUsers);
router.get('/users/:id', adminController.getUserDetail);
router.put('/users/:id/status', adminController.setUserStatus);
router.put('/users/:id/role', requireRole('SUPER_ADMIN'), adminController.setUserRole);

router.get('/orders', adminController.listAllOrders);
router.get('/products', adminController.listAllProducts);

router.get('/reviews', adminController.listAllReviews);
router.delete('/reviews/:reviewId', adminController.deleteReviewAdmin);

export default router;
