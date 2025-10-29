import { Router } from "express";
import {
  createStoreController,
  deleteStoreController,
  getStoreByIdController,
  getStoresController,
  updateStoreController,
} from "../../controllers/store.controller";
import billboardRouter from "./billboard.routes";
import categoryRouter from "./category.routes";
import colorRouter from "./color.routes";
import orderRouter from "./order.routes";
import productRouter from "./product.routes";
import sizeRouter from "./size.routes";
import {
  optionsCheckoutController,
  stripeCheckoutController,
} from "../../controllers/stripe.controller";

const storeRouter = Router({ mergeParams: true });

storeRouter.use(
  "/:storeId",
  billboardRouter,
  categoryRouter,
  colorRouter,
  orderRouter,
  productRouter,
  sizeRouter
);

storeRouter
  .route("/stores")
  .get(getStoresController)
  .post(createStoreController);

storeRouter
  .route("/stores/:storeId")
  .get(getStoreByIdController)
  .patch(updateStoreController)
  .delete(deleteStoreController);

storeRouter
  .route("/:storeId/checkout")
  .post(stripeCheckoutController)
  .options(optionsCheckoutController);

export default storeRouter;
