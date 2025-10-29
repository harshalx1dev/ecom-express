import { Request, Response, NextFunction } from "express";
import { getUserIdFromToken } from "../libs/utils";
import db from "../libs/prisma-client";

export async function createCategoryController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserIdFromToken(req);
    const { storeId } = req.params;
    const { name, billboardId } = req.body;

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

    if (!billboardId) {
      return res.status(400).json({ status: 'error', message: 'Billboard is required' });
    }

    const newCategory = await db.category.create({
      data: {
        name,
        billboardId,
        storeId,
      },
    });

    return res.status(200).json({
      status: 'success',
      message: 'Category created successfully',
      data: newCategory,
    });
  } catch (error) {
    console.error(`[ERROR_POST] [CREATE_CATEGORY_CONTROLLER]`, error);
    next(error);
  }
}

export async function getCategoriesController(req: Request, res: Response, next: NextFunction) {
  try {
    const { storeId } = req.params;

    const currentStore = await db.store.findUnique({
      where: { id: storeId },
    });

    if (!currentStore) {
      return res.status(404).json({ status: 'error', message: 'Store does not exist!' });
    }

    const categories = await db.category.findMany({
      where: { storeId },
      include: { billboard: true }
    });

    return res.status(200).json({
      status: 'success',
      message: 'Categories fetched successfully',
      data: categories,
    });
  } catch (error) {
    console.error(`[ERROR_GET] [GET_CATEGORIES_CONTROLLER]`, error);
    next(error);
  }
}

export async function getCategoryController(req: Request, res: Response, next: NextFunction) {
  try {
    const { categoryId } = req.params;

    if (!categoryId) {
      return res.status(400).json({ status: 'error', message: 'Category ID is required!' });
    }

    const category = await db.category.findUnique({
      where: { id: categoryId },
      include: { billboard: true },
    });

    if (category) {
      return res.status(200).json({
        status: 'success',
        message: 'Category found!',
        data: category,
      });
    } else {
      return res.status(404).json({
        status: 'error',
        message: 'Category does not exist!',
      });
    }
  } catch (error) {
    console.error(`[ERROR_GET] [GET_CATEGORY_CONTROLLER]`, error);
    next(error);
  }
}

export async function updateCategoryController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserIdFromToken(req);
    const { categoryId, storeId } = req.params;
    const { name, billboardId } = req.body;

    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    const currentStore = await db.store.findFirst({
      where: { id: storeId, userId },
    });

    if (!currentStore) {
      return res.status(403).json({ status: 'error', message: 'Access denied' });
    }

    const currentCategory = await db.category.findUnique({
      where: { id: categoryId, storeId },
    });

    if (!currentCategory) {
      return res.status(404).json({ status: 'error', message: 'Category does not exist!' });
    }

    if (!name && !billboardId) {
      return res.status(400).json({ status: 'error', message: 'Either name or billboard id is required' });
    }

    const updatedCategory = await db.category.update({
      where: { id: categoryId },
      data: {
        name: name || currentCategory.name,
        billboardId: billboardId || currentCategory.billboardId,
      },
    });

    return res.status(200).json({
      status: 'success',
      message: 'Category updated successfully!',
      data: updatedCategory,
    });
  } catch (error) {
    console.error(`[ERROR_PATCH] [UPDATE_CATEGORY_CONTROLLER]`, error);
    next(error);
  }
}

export async function deleteCategoryController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserIdFromToken(req);
    const { categoryId, storeId } = req.params;

    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    const currentStore = await db.store.findFirst({
      where: { id: storeId, userId },
    });

    if (!currentStore) {
      return res.status(403).json({ status: 'error', message: 'Access denied' });
    }

    const currentCategory = await db.category.findUnique({
      where: { id: categoryId, storeId },
    });

    if (!currentCategory) {
      return res.status(404).json({ status: 'error', message: 'Category does not exist!' });
    }

    const deletedCategory = await db.category.delete({
      where: { id: categoryId, storeId },
    });

    return res.status(200).json({
      status: 'success',
      message: 'Category deleted successfully!',
      data: deletedCategory,
    });
  } catch (error) {
    console.error(`[ERROR_DELETE] [DELETE_CATEGORY_CONTROLLER]`, error);
    next(error);
  }
}
