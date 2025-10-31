import { NextFunction, Request, Response } from "express";
import { verify, JwtPayload, TokenExpiredError } from "jsonwebtoken";
import { getCookie } from "../libs/utils";
import db from "../libs/prisma-client";

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {

    console.log('[COOKIES]', req.headers.cookie);

    const authToken = getCookie('Authorization', req.headers.cookie) || '';

    if (!authToken) return res.status(401).json({ status: 'error', message: 'Authentication token missing!' });

    const jwt = verify(authToken, process.env.JWT_SECRET!) as JwtPayload;

    if (jwt && jwt.userId) {
      const existingUser = await db.user.findUnique({ where: { id: jwt.userId } });
      if (!existingUser) return res.status(401).json({ status: 'error', message: 'Invalid Token!' });

      next();
    } else {
      return res.status(401).json({ status: 'error', message: 'Invalid Token!' });
    }
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return res.status(401).json({ status: 'error', message: 'Session Expired! Please login again!' })
    } else {
      console.error('[ERROR] [AUTHENTICATION_ERROR]', error);
      next(error);
    }
  }
}