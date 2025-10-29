import { NextFunction, Request, Response } from "express";
import { getUserIdFromToken } from "../libs/utils";
import db from "../libs/prisma-client";

export async function createBillboardController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserIdFromToken(req);
    const { storeId } = req.params;
    const { label, imageUrl, labelColor = '#000000' } = req.body;

    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    const currentStore = await db.store.findUnique({ where: { id: storeId, userId } });

    if (!currentStore) {
      return res.status(404).json({ status: 'error', message: 'Store does not exist!' });
    }

    if (!label) {
      return res.status(400).json({ status: 'error', message: 'Label is required' });
    }

    if (!imageUrl) {
      return res.status(400).json({ status: 'error', message: 'Image URL is required' });
    }

    const newBillboard = await db.billboard.create({
      data: { label, imageUrl, labelColor, storeId },
    });

    return res.status(200).json({
      status: 'success',
      message: 'Billboard created successfully',
      data: newBillboard,
    });
  } catch (error) {
    console.error('[ERROR_POST] [CREATE_BILLBOARD_CONTROLLER]', error);
    next(error);
  }
}

export async function getBillboardsController(req: Request, res: Response, next: NextFunction) {
  try {
    const { storeId } = req.params;

    const currentStore = await db.store.findUnique({ where: { id: storeId } });

    if (!currentStore) {
      return res.status(404).json({ status: 'error', message: 'Store does not exist!' });
    }

    const billboards = await db.billboard.findMany({ where: { storeId } });

    return res.status(200).json({
      status: 'success',
      message: 'Billboards fetched successfully',
      data: billboards,
    });
  } catch (error) {
    console.error('[ERROR_GET] [GET_BILLBOARDS_CONTROLLER]', error);
    next(error);
  }
}

export async function getBillboardByIdController(req: Request, res: Response, next: NextFunction) {
  try {
    const { billboardId } = req.params;

    if (!billboardId) {
      return res.status(400).json({ status: 'error', message: 'Billboard ID is required!' });
    }

    const billboard = await db.billboard.findUnique({ where: { id: billboardId } });

    if (billboard) {
      return res.status(200).json({
        status: 'success',
        message: 'Billboard found!',
        data: billboard,
      });
    } else {
      return res.status(404).json({
        status: 'error',
        message: 'Billboard does not exist!',
      });
    }
  } catch (error) {
    console.error('[ERROR_GET] [GET_BILLBOARD_BY_ID_CONTROLLER]', error);
    next(error);
  }
}

export async function updateBillboardController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserIdFromToken(req);
    const { billboardId, storeId } = req.params;
    const { label, imageUrl, labelColor } = req.body;

    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    const currentStore = await db.store.findFirst({ where: { id: storeId, userId } });

    if (!currentStore) {
      return res.status(403).json({ status: 'error', message: 'Access denied' });
    }

    const currentBillboard = await db.billboard.findUnique({ where: { id: billboardId, storeId } });

    if (!currentBillboard) {
      return res.status(404).json({ status: 'error', message: 'Billboard does not exist!' });
    }

    if (!label && !imageUrl && !labelColor) {
      return res.status(400).json({
        status: 'error',
        message: 'Either label, image url or label color is required',
      });
    }

    const updatedBillboard = await db.billboard.update({
      where: { id: billboardId },
      data: {
        label: label || currentBillboard.label,
        imageUrl: imageUrl || currentBillboard.imageUrl,
        labelColor: labelColor || currentBillboard.labelColor,
      },
    });

    return res.status(200).json({
      status: 'success',
      message: 'Billboard updated successfully!',
      data: updatedBillboard,
    });
  } catch (error) {
    console.error('[ERROR_PATCH] [UPDATE_BILLBOARD_CONTROLLER]', error);
    next(error);
  }
}

export async function deleteBillboardController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserIdFromToken(req);
    const { billboardId, storeId } = req.params;

    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    const currentStore = await db.store.findFirst({ where: { id: storeId, userId } });

    if (!currentStore) {
      return res.status(403).json({ status: 'error', message: 'Access denied' });
    }

    const currentBillboard = await db.billboard.findUnique({ where: { id: billboardId, storeId } });

    if (!currentBillboard) {
      return res.status(404).json({ status: 'error', message: 'Billboard does not exist!' });
    }

    const deletedBillboard = await db.billboard.delete({ where: { id: billboardId, storeId } });

    return res.status(200).json({
      status: 'success',
      message: 'Billboard deleted successfully!',
      data: deletedBillboard,
    });
  } catch (error) {
    console.error('[ERROR_DELETE] [DELETE_BILLBOARD_CONTROLLER]', error);
    next(error);
  }
}
