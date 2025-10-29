import { NextFunction, Request, Response } from "express";
import db from "../libs/prisma-client";
import { getUserIdFromToken } from "../libs/utils";

export async function getOrdersController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserIdFromToken(req);
    let { isPaid } = req.query;
    const { storeId } = req.params;
    const parsedIsPaid = isPaid ? String(isPaid) : undefined;

    if (!userId)
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });

    const currentStore = await db.store.findUnique({
      where: { id: storeId, userId: userId },
    });

    if (!currentStore)
      return res.status(404).json({ status: 'error', message: 'Store does not exist!' });

    const orders = await db.order.findMany({
      where: { storeId, isPaid: parsedIsPaid == 'true' ? true : parsedIsPaid == 'false' ? false : undefined },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                category: true,
                color: true,
                images: true,
                size: true,
              },
            },
          },
        },
      },
    });

    if (orders) {
      return res.status(200).json({
        status: 'success',
        message: 'Orders fetched successfully',
        data: orders,
      });
    }
  } catch (error) {
    console.error(`[ERROR_GET] [GET_ORDERS_CONTROLLER]`, error);
    next(error);
  }
}

export async function getOrdersCountController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserIdFromToken(req);
    let { isPaid } = req.query;
    const { storeId } = req.params;
    const parsedIsPaid = isPaid ? String(isPaid) : undefined;

    if (!userId)
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });

    const currentStore = await db.store.findUnique({
      where: { id: storeId, userId: userId },
    });

    if (!currentStore)
      return res.status(404).json({ status: 'error', message: 'Store does not exist!' });

    const orders = await db.order.count({
      where: { storeId, isPaid: parsedIsPaid == 'true' ? true : parsedIsPaid == 'false' ? false : undefined },
    });

    return res.status(200).json({
      status: 'success',
      message: 'Orders fetched successfully',
      data: orders,
    });
  } catch (error) {
    console.error(`[ERROR_GET] [GET_ORDERS_CONTROLLER]`, error);
    next(error);
  }
}
