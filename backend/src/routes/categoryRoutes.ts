import { Router } from 'express';
import * as categoryController from '../controllers/categoryController';
import { validate } from '../middleware/validate';
import { createCategorySchema, updateCategorySchema } from '../validators/categoryValidators';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', categoryController.listCategories);
router.get('/:id', categoryController.getCategory);

router.post('/', requireAuth, requireAdmin, validate(createCategorySchema), categoryController.createCategory);
router.put('/:id', requireAuth, requireAdmin, validate(updateCategorySchema), categoryController.updateCategory);
router.delete('/:id', requireAuth, requireAdmin, categoryController.deleteCategory);

export default router;
