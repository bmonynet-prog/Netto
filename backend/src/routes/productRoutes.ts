import { Router } from 'express';
import * as productController from '../controllers/productController';
import { validate } from '../middleware/validate';
import {
  createProductSchema,
  updateProductSchema,
  listProductsQuerySchema,
  createReviewSchema,
} from '../validators/productValidators';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();

// Public
router.get('/', validate(listProductsQuerySchema), productController.listProducts);
router.get('/slug/:slug', productController.getProductBySlug);
router.get('/:id', productController.getProduct);

// Customer (auth required)
router.post('/:productId/reviews', requireAuth, validate(createReviewSchema), productController.addReview);
router.delete('/reviews/:reviewId', requireAuth, productController.deleteReview);

// Admin only
router.post('/', requireAuth, requireAdmin, validate(createProductSchema), productController.createProduct);
router.put('/:id', requireAuth, requireAdmin, validate(updateProductSchema), productController.updateProduct);
router.delete('/:id', requireAuth, requireAdmin, productController.deleteProduct);

export default router;
