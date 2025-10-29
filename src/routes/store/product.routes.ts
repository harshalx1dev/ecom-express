import { Router } from "express";
import { createProductController, deleteProductController, getProductController, getProductsController, getProductsCountController, updateProductController } from "../../controllers/product.controller";
import { authenticate } from "../../middlewares/auth";

const productRouter = Router({ mergeParams: true });

productRouter.get('/products', authenticate, getProductsController);
productRouter.get('/products/count', authenticate, getProductsCountController);
productRouter.get('/products/:productId', authenticate, getProductController);
productRouter.post('/products', createProductController);
productRouter.patch('/products/:productId', updateProductController);
productRouter.delete('/products/:productId', deleteProductController);

export default productRouter;