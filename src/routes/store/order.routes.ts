import { Router } from "express";
import { getOrdersController, getOrdersCountController } from "../../controllers/order.controller";

const orderRouter = Router({ mergeParams: true });

orderRouter.get('/orders', getOrdersController);
orderRouter.get('/orders/count', getOrdersCountController);

export default orderRouter;