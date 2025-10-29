import { NextFunction, Request, Response } from "express";
import db from "../libs/prisma-client";
import { getUserIdFromToken } from "../libs/utils";

export async function createProductController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserIdFromToken(req);
    const { storeId } = req.params;
    const { name, images, price, categoryId, colorId, sizeId, isFeatured, isArchived } = req.body;

    if (!userId)
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });

    const currentStore = await db.store.findUnique({
      where: { id: storeId, userId },
    });

    if (!currentStore)
      return res.status(404).json({ status: 'error', message: 'Store does not exist!' });

    if (!name) return res.status(400).json({ status: 'error', message: 'Name is required' });
    if (!price) return res.status(400).json({ status: 'error', message: 'Price is required' });
    if (!categoryId) return res.status(400).json({ status: 'error', message: 'Category ID is required' });
    if (!colorId) return res.status(400).json({ status: 'error', message: 'Color ID is required' });
    if (!sizeId) return res.status(400).json({ status: 'error', message: 'Size ID is required' });
    if (!images || !images.length) return res.status(400).json({ status: 'error', message: 'Images are required' });

    const newProduct = await db.product.create({
      data: {
        name,
        images: {
          createMany: { data: images.map((image: { url: string }) => image) },
        },
        price,
        categoryId,
        colorId,
        sizeId,
        isFeatured,
        isArchived,
        storeId,
      },
    });

    return res.status(200).json({ status: 'success', message: 'Product created successfully', data: newProduct });

  } catch (error) {
    console.error(`[ERROR_POST] [CREATE_PRODUCT_CONTROLLER]`, error);
    next(error);
  }
}

export async function getProductsController(req: Request, res: Response, next: NextFunction) {
  try {
    const { storeId } = req.params;
    const { categoryId, sizeId, colorId, isFeatured } = req.query;

    const currentStore = await db.store.findUnique({ where: { id: storeId } });

    if (!currentStore) {
      return res.status(404).json({ status: 'error', message: 'Store does not exist!' });
    }

    const parsedCategoryId = categoryId ? String(categoryId) : undefined;
    const parsedSizeId = sizeId ? String(sizeId) : undefined;
    const parsedColorId = colorId ? String(colorId) : undefined;
    const parsedIsFeatured = isFeatured === 'true' ? true : isFeatured === 'false' ? false : undefined;

    const products = await db.product.findMany({
      where: {
        storeId,
        categoryId: parsedCategoryId,
        sizeId: parsedSizeId,
        colorId: parsedColorId,
        isFeatured: parsedIsFeatured,
        isArchived: false,
      },
      include: {
        category: true,
        color: true,
        size: true,
        images: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Return successful response
    return res.status(200).json({
      status: 'success',
      message: 'Products fetched successfully',
      data: products,
    });

  } catch (error) {
    console.error(`[ERROR_GET] [GET_PRODUCTS_CONTROLLER]`, error);
    next(error);
  }
}

export async function getProductsCountController(req: Request, res: Response, next: NextFunction) {
  try {
    const { storeId } = req.params;
    const { categoryId, sizeId, colorId, isFeatured, isArchived } = req.query;

    const currentStore = await db.store.findUnique({ where: { id: storeId } });

    if (!currentStore) {
      return res.status(404).json({ status: 'error', message: 'Store does not exist!' });
    }

    const parsedCategoryId = categoryId ? String(categoryId) : undefined;
    const parsedSizeId = sizeId ? String(sizeId) : undefined;
    const parsedColorId = colorId ? String(colorId) : undefined;
    const parsedIsFeatured = isFeatured === 'true' ? true : isFeatured === 'false' ? false : undefined;
    const parsedIsArchived = isArchived === 'true' ? true : isArchived === 'false' ? false : undefined;

    const products = await db.product.count({
      where: {
        storeId,
        categoryId: parsedCategoryId,
        sizeId: parsedSizeId,
        colorId: parsedColorId,
        isFeatured: parsedIsFeatured,
        isArchived: parsedIsArchived,
      }
    });

    // Return successful response
    return res.status(200).json({
      status: 'success',
      message: 'Products fetched successfully',
      data: products,
    });

  } catch (error) {
    console.error(`[ERROR_GET] [GET_PRODUCTS_CONTROLLER]`, error);
    next(error);
  }
}

export async function getProductController(req: Request, res: Response, next: NextFunction) {
  try {
    const { productId } = req.params;

    if (!productId)
      return res.status(400).json({ status: 'error', message: 'Product ID is required!' });

    const product = await db.product.findUnique({
      where: { id: productId },
      include: { category: true, color: true, size: true, images: true },
    });

    if (product) {
      return res.status(200).json({
        status: 'success',
        message: 'Product found!',
        data: product,
      });
    } else {
      return res.status(404).json({
        status: 'error',
        message: 'Product does not exist!',
      });
    }

  } catch (error) {
    console.error(`[ERROR_GET] [GET_PRODUCT_CONTROLLER]`, error);
    next(error);
  }
}

export async function updateProductController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserIdFromToken(req);
    const { storeId, productId } = req.params;
    const { name, images, price, categoryId, colorId, sizeId, isFeatured, isArchived } = req.body;

    if (!userId)
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });

    const currentStore = await db.store.findUnique({ where: { id: storeId, userId } });

    if (!currentStore)
      return res.status(404).json({ status: 'error', message: 'Store does not exist!' });

    const currentProduct = await db.product.findUnique({ where: { id: productId, storeId } });

    if (!currentProduct)
      return res.status(404).json({ status: 'error', message: 'Product does not exist!' });

    await db.product.update({
      where: { id: productId },
      data: {
        name,
        price: price || currentProduct.price,
        categoryId: categoryId || currentProduct.categoryId,
        colorId: colorId || currentProduct.colorId,
        sizeId: sizeId || currentProduct.sizeId,
        isFeatured: isFeatured || currentProduct.isFeatured,
        isArchived: isArchived || currentProduct.isArchived,
      },
    });

    const updatedProduct = await db.product.update({
      where: { id: productId },
      data: { images: { createMany: { data: images.map((image: { url: string }) => image) } } },
    });

    return res.status(200).json({
      status: 'success',
      message: 'Product updated successfully',
      data: updatedProduct,
    });

  } catch (error) {
    console.error(`[ERROR_PATCH] [UPDATE_PRODUCT_CONTROLLER]`, error);
    next(error);
  }
}

export async function deleteProductController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserIdFromToken(req);
    const { productId, storeId } = req.params;

    if (!userId)
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });

    const currentStore = await db.store.findUnique({ where: { id: storeId, userId } });

    if (!currentStore)
      return res.status(403).json({ status: 'error', message: 'Access denied' });

    const currentProduct = await db.product.findUnique({
      where: { id: productId, storeId },
    });

    if (!currentProduct)
      return res.status(404).json({ status: 'error', message: 'Product does not exist!' });

    const deletedProduct = await db.product.delete({
      where: { id: productId, storeId },
    });

    return res.status(200).json({
      status: 'success',
      message: 'Product deleted successfully!',
      data: deletedProduct,
    });

  } catch (error) {
    console.error(`[ERROR_DELETE] [DELETE_PRODUCT_CONTROLLER]`, error);
    next(error);
  }
}
