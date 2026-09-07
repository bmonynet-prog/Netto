import { Router } from 'express';
import * as orderController from '../controllers/orderController';
import { validate } from '../middleware/validate';
import { createOrderSchema, updateOrderStatusSchema } from '../validators/orderValidators';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.post('/', validate(createOrderSchema), orderController.createOrder);
router.get('/', orderController.listMyOrders);
router.get('/:id', orderController.getOrder);
router.put('/:id/status', requireAdmin, validate(updateOrderStatusSchema), orderController.updateOrderStatus);

export default router;
