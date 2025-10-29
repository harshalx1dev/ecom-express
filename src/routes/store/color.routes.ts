import { Router } from "express";
import { createColorController, deleteColorController, getColorController, getColorsController, updateColorController } from "../../controllers/color.controller";
import { authenticate } from "../../middlewares/auth";

const colorRouter = Router({ mergeParams: true });

colorRouter.get('/colors', getColorsController);
colorRouter.get('/colors/:colorId', getColorController);
colorRouter.post('/colors', authenticate, createColorController);
colorRouter.patch('/colors/:colorId', authenticate, updateColorController);
colorRouter.delete('/colors/:colorId', authenticate, deleteColorController);

export default colorRouter;