import { Router } from "express";
import { createBillboardController, deleteBillboardController, getBillboardByIdController, getBillboardsController, updateBillboardController } from "../../controllers/billboard.controller";
import { authenticate } from "../../middlewares/auth";

const billboardRouter = Router({ mergeParams: true });

billboardRouter.get('/billboards', getBillboardsController);
billboardRouter.get('/billboards/:billboardId', getBillboardByIdController);
billboardRouter.post('/billboards', authenticate, createBillboardController);
billboardRouter.patch('/billboards/:billboardId', authenticate, updateBillboardController);
billboardRouter.delete('/billboards/:billboardId', authenticate, deleteBillboardController);

export default billboardRouter;