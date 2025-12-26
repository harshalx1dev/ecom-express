import { Router } from "express";
import { createProductController, deleteProductController, getProductController, getProductsController, getProductsCountController, updateProductController } from "../../controllers/product.controller";
import { authenticate } from "../../middlewares/auth";

const productRouter = Router({ mergeParams: true });

productRouter.get('/products', getProductsController);
productRouter.get('/products/count', getProductsCountController);
productRouter.get('/products/:productId', getProductController);
productRouter.post('/products', createProductController);
productRouter.patch('/products/:productId', updateProductController);
productRouter.delete('/products/:productId', deleteProductController);

export default productRouter;