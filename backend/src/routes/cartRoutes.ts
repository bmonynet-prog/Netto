import { Router } from 'express';
import * as cartController from '../controllers/cartController';
import { validate } from '../middleware/validate';
import { addToCartSchema, updateCartItemSchema } from '../validators/cartValidators';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/', cartController.getCart);
router.post('/', validate(addToCartSchema), cartController.addToCart);
router.put('/:itemId', validate(updateCartItemSchema), cartController.updateCartItem);
router.delete('/:itemId', cartController.removeCartItem);
router.delete('/', cartController.clearCart);

export default router;
