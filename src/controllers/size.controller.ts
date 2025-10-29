import { NextFunction, Request, Response } from "express";
import { getUserIdFromToken } from "../libs/utils";
import db from "../libs/prisma-client";

export async function createSizeController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserIdFromToken(req);
    const { storeId } = req.params;
    const { name, value, categoryId } = req.body;

    if (!userId)
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });

    const currentStore = await db.store.findUnique({
      where: { id: storeId, userId },
    });

    if (!currentStore)
      return res.status(404).json({ status: 'error', message: 'Store does not exist!' });

    if (!name)
      return res.status(400).json({ status: 'error', message: 'Name is required' });

    if (!value)
      return res.status(400).json({ status: 'error', message: 'Value is required' });

    if (!categoryId)
      return res.status(400).json({ status: 'error', message: 'Category is required' });

    const newSize = await db.size.create({
      data: {
        name,
        value,
        storeId,
        categoryId,
      },
    });

    return res.status(200).json({ status: 'success', message: 'Size created successfully', data: newSize });
  } catch (error) {
    console.error('[ERROR_POST] [CREATE_SIZE_CONTROLLER]', error);
    next(error);
  }
}

export async function getSizesController(req: Request, res: Response, next: NextFunction) {
  try {
    const { storeId } = req.params;
    const { categoryId } = req.query;

    const currentStore = await db.store.findUnique({
      where: { id: storeId },
    });

    if (!currentStore)
      return res.status(404).json({ status: 'error', message: 'Store does not exist!' });

    const sizes = await db.size.findMany({
      where: { storeId, ...(categoryId ? { categoryId: String(categoryId) } : {}) },
    });

    return res.status(200).json({ status: 'success', message: 'Sizes fetched successfully', data: sizes });
  } catch (error) {
    console.error('[ERROR_GET] [GET_SIZES_CONTROLLER]', error);
    next(error);
  }
}

export async function getSizeController(req: Request, res: Response, next: NextFunction) {
  try {
    const { sizeId } = req.params;

    if (!sizeId)
      return res.status(400).json({ status: 'error', message: 'Size ID is required!' });

    const size = await db.size.findUnique({
      where: { id: sizeId },
    });

    if (size) {
      return res.status(200).json({ status: 'success', message: 'Size found!', data: size });
    } else {
      return res.status(404).json({ status: 'error', message: 'Size does not exist!' });
    }
  } catch (error) {
    console.error('[ERROR_GET] [GET_SIZE_CONTROLLER]', error);
    next(error);
  }
}

export async function updateSizeController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserIdFromToken(req);
    const { sizeId, storeId } = req.params;
    const { name, value, categoryId } = req.body;

    if (!userId)
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });

    const currentStore = await db.store.findFirst({
      where: { id: storeId, userId },
    });

    if (!currentStore)
      return res.status(403).json({ status: 'error', message: 'Access denied' });

    const currentSize = await db.size.findUnique({
      where: { id: sizeId, storeId },
    });

    if (!currentSize)
      return res.status(404).json({ status: 'error', message: 'Size does not exist!' });

    if (!name && !value && !categoryId)
      return res.status(400).json({ status: 'error', message: 'Either name, value, or categoryId is required' });

    const updatedSize = await db.size.update({
      where: { id: sizeId },
      data: {
        name: name || currentSize.name,
        value: value || currentSize.value,
        categoryId: categoryId || currentSize.categoryId,
      },
    });

    return res.status(200).json({ status: 'success', message: 'Size updated successfully!', data: updatedSize });
  } catch (error) {
    console.error('[ERROR_PATCH] [UPDATE_SIZE_CONTROLLER]', error);
    next(error);
  }
}

export async function deleteSizeController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserIdFromToken(req);
    const { sizeId, storeId } = req.params;

    if (!userId)
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });

    const currentStore = await db.store.findFirst({
      where: { id: storeId, userId },
    });

    if (!currentStore)
      return res.status(403).json({ status: 'error', message: 'Access denied' });

    const currentSize = await db.size.findUnique({
      where: { id: sizeId, storeId },
    });

    if (!currentSize)
      return res.status(404).json({ status: 'error', message: 'Size does not exist!' });

    const deletedSize = await db.size.delete({
      where: { id: sizeId, storeId },
    });

    return res.status(200).json({ status: 'success', message: 'Size deleted successfully!', data: deletedSize });
  } catch (error) {
    console.error('[ERROR_DELETE] [DELETE_SIZE_CONTROLLER]', error);
    next(error);
  }
}
