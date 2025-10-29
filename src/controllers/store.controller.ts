import { NextFunction, Request, Response } from "express";
import { getUserIdFromToken } from "../libs/utils";
import db from "../libs/prisma-client";

export async function getStoresController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserIdFromToken(req);

    if (!userId)
      return res.status(401).json({ status: 'error', message: `Unauthorized` });

    const allStoresById = await db.store.findMany({ where: { userId } });

    return res.status(200).json({ status: 'success', message: `${allStoresById?.length} stores found!`, data: allStoresById })
  } catch (error) {
    console.error(`[ERROR_GET] [STORES_CONTROLLER]`, error);
    next(error);
  }
}

export async function getStoreByIdController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserIdFromToken(req);

    if (!userId)
      return res.status(401).json({ status: 'error', message: `Unauthorized` });

    const { storeId } = req.params;

    const store = await db.store.findUnique({ where: { userId, id: storeId } });

    return res.status(200).json({ status: 'success', message: `Store Found!`, data: store })
  } catch (error) {
    console.error(`[ERROR_GET] [STORES_BY_ID_CONTROLLER]`, error);
    next(error);
  }
}

export async function createStoreController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserIdFromToken(req);

    if (!userId)
      return res.status(401).json({ status: 'error', message: `Unauthorized` });

    const { name } = req.body;

    if (!name)
      return res.status(400).json({ status: 'error', message: `Store name is required!` });

    const newStore = await db.store.create({
      data: {
        name,
        userId
      }
    });

    return res.status(200).json({ status: 'success', message: `Store created successfully!`, data: newStore })
  } catch (error) {
    console.error(`[ERROR_POST] [CREATE_STORE_CONTROLLER]`, error);
    next(error);
  }
}

export async function updateStoreController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserIdFromToken(req);
    const { storeId } = req.params;

    if (!userId)
      return res.status(401).json({ status: 'error', message: `Unauthorized` });

    const currentStore = await db.store.findUnique({ where: { id: storeId, userId: userId } });

    if (!currentStore)
      return res.status(404).json({ status: 'error', message: `Store not found!` });

    const { name } = req.body;

    if (!name)
      return res.status(400).json({ status: 'error', message: `Store name is required!` });

    const newStore = await db.store.update({
      where: { id: storeId, userId },
      data: {
        name
      }
    });

    return res.status(200).json({ status: 'success', message: `Store updated successfully!`, data: newStore })
  } catch (error) {
    console.error(`[ERROR_PATCH] [UPDATE_STORE_CONTROLLER]`, error);
    next(error);
  }
}

export async function deleteStoreController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserIdFromToken(req);
    const { storeId } = req.params;

    if (!userId)
      return res.status(401).json({ status: 'error', message: `Unauthorized` });

    const currentStore = await db.store.findUnique({ where: { id: storeId, userId: userId } });

    if (!currentStore)
      return res.status(404).json({ status: 'error', message: `Store not found!` });

    const deletedStore = await db.store.delete({
      where: { id: storeId, userId }
    });

    return res.status(200).json({ status: 'success', message: `Store deleted successfully!`, data: deletedStore })
  } catch (error) {
    console.error(`[ERROR_DELETE] [DELETE_STORE_CONTROLLER]`, error);
    next(error);
  }
}
