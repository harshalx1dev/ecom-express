import { Request, Response, NextFunction } from "express";
import { getUserIdFromToken } from "../libs/utils";
import db from "../libs/prisma-client";

export async function createColorController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserIdFromToken(req);
    const { storeId } = req.params;
    const { name, value } = req.body;

    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    const currentStore = await db.store.findUnique({
      where: { id: storeId, userId },
    });

    if (!currentStore) {
      return res.status(404).json({ status: 'error', message: 'Store does not exist!' });
    }

    if (!name) {
      return res.status(400).json({ status: 'error', message: 'Name is required' });
    }

    if (!value) {
      return res.status(400).json({ status: 'error', message: 'Value is required' });
    }

    const newColor = await db.color.create({
      data: {
        name,
        value,
        storeId,
      },
    });

    return res.status(200).json({
      status: 'success',
      message: 'Color created successfully',
      data: newColor,
    });
  } catch (error) {
    console.error(`[ERROR_POST] [CREATE_COLOR_CONTROLLER]`, error);
    next(error);
  }
}

export async function getColorsController(req: Request, res: Response, next: NextFunction) {
  try {
    const { storeId } = req.params;

    const currentStore = await db.store.findUnique({
      where: { id: storeId },
    });

    if (!currentStore) {
      return res.status(404).json({ status: 'error', message: 'Store does not exist!' });
    }

    const colors = await db.color.findMany({
      where: { storeId },
    });

    return res.status(200).json({
      status: 'success',
      message: 'Colors fetched successfully',
      data: colors,
    });
  } catch (error) {
    console.error(`[ERROR_GET] [GET_COLORS_CONTROLLER]`, error);
    next(error);
  }
}

export async function getColorController(req: Request, res: Response, next: NextFunction) {
  try {
    const { colorId } = req.params;

    if (!colorId) {
      return res.status(400).json({ status: 'error', message: 'Color ID is required!' });
    }

    const color = await db.color.findUnique({
      where: { id: colorId },
    });

    if (color) {
      return res.status(200).json({
        status: 'success',
        message: 'Color found!',
        data: color,
      });
    } else {
      return res.status(404).json({
        status: 'error',
        message: 'Color does not exist!',
      });
    }
  } catch (error) {
    console.error(`[ERROR_GET] [GET_COLOR_CONTROLLER]`, error);
    next(error);
  }
}

export async function updateColorController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserIdFromToken(req);
    const { colorId, storeId } = req.params;
    const { name, value } = req.body;

    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    const currentStore = await db.store.findFirst({
      where: { id: storeId, userId },
    });

    if (!currentStore) {
      return res.status(403).json({ status: 'error', message: 'Access denied' });
    }

    const currentColor = await db.color.findUnique({
      where: { id: colorId, storeId },
    });

    if (!currentColor) {
      return res.status(404).json({ status: 'error', message: 'Color does not exist!' });
    }

    if (!name && !value) {
      return res.status(400).json({ status: 'error', message: 'Either name or value is required' });
    }

    const updatedColor = await db.color.update({
      where: { id: colorId },
      data: {
        name: name || currentColor.name,
        value: value || currentColor.value,
      },
    });

    return res.status(200).json({
      status: 'success',
      message: 'Color updated successfully!',
      data: updatedColor,
    });
  } catch (error) {
    console.error(`[ERROR_PATCH] [UPDATE_COLOR_CONTROLLER]`, error);
    next(error);
  }
}

export async function deleteColorController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserIdFromToken(req);
    const { colorId, storeId } = req.params;

    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    const currentStore = await db.store.findFirst({
      where: { id: storeId, userId },
    });

    if (!currentStore) {
      return res.status(403).json({ status: 'error', message: 'Access denied' });
    }

    const currentColor = await db.color.findUnique({
      where: { id: colorId, storeId },
    });

    if (!currentColor) {
      return res.status(404).json({ status: 'error', message: 'Color does not exist!' });
    }

    const deletedColor = await db.color.delete({
      where: { id: colorId, storeId },
    });

    return res.status(200).json({
      status: 'success',
      message: 'Color deleted successfully!',
      data: deletedColor,
    });
  } catch (error) {
    console.error(`[ERROR_DELETE] [DELETE_COLOR_CONTROLLER]`, error);
    next(error);
  }
}
