import { Router } from "express";
import { createCategoryController, deleteCategoryController, getCategoriesController, getCategoryController, updateCategoryController } from "../../controllers/category.controller";
import { authenticate } from "../../middlewares/auth";

const categoryRouter = Router({ mergeParams: true });

categoryRouter.get('/categories', getCategoriesController);
categoryRouter.get('/categories/:categoryId', getCategoryController);
categoryRouter.post('/categories', authenticate, createCategoryController);
categoryRouter.patch('/categories/:categoryId', authenticate, updateCategoryController);
categoryRouter.delete('/categories/:categoryId', authenticate, deleteCategoryController);

export default categoryRouter;