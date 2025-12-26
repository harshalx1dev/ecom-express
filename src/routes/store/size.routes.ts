import { Router } from "express";
import { createSizeController, deleteSizeController, getSizeController, getSizesController, updateSizeController } from "../../controllers/size.controller";
import { authenticate } from "../../middlewares/auth";

const sizeRouter = Router({ mergeParams: true });

sizeRouter.get('/sizes', getSizesController);
sizeRouter.get('/sizes/:sizeId', getSizeController);
sizeRouter.post('/sizes', createSizeController);
sizeRouter.patch('/sizes/:sizeId', updateSizeController);
sizeRouter.delete('/sizes/:sizeId', deleteSizeController);

export default sizeRouter;