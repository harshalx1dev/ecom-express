import { NextFunction, Request, Response } from "express";
import db from '../libs/prisma-client';
import { getUserIdFromToken, hashPassword, setAccessToken, verifyPassword } from '../libs/utils';

interface UserSchema {
  name: string;
  email: string;
  password: string;
}

export async function usersRouteController(req: Request, res: Response, next: NextFunction) {
  try {
    const allUsers = await db.user.findMany({ select: {
      id: true,
      name: true,
      email: true
    } });
    
    return res.status(200).json({
      status: 'success',
      message: `${allUsers?.length || 0} users found!`,
      data: allUsers
    })
  } catch (error) {
    console.error(`[ERROR_GET] [USERS_CONTROLLER]`, error);
    next(error);
  }
}

export async function registerRouteController(req: Request, res: Response, next: NextFunction) {

  try {
    const { email, name, password }: UserSchema = req.body;

    if (!name || !email || !password) return res.status(400).json({ status: 'error', message: `Bad Request: The following field(s) are mandatory - ${!name && `Name, `}${!email && 'Email, '}${!password && `Password, `}`.trim().replace(/,$/gi, ''), });

    const existingUser = await db.user.findUnique({ where: { email } });

    if (existingUser) return res.status(409).json({ status: 'error', message: `A user with Email ID: ${email} already exists!` });

    const hashedPassword = await hashPassword(password);

    const createdUser = await db.user.create({ 
      data: { 
        name,
        email,
        password: hashedPassword
      } 
    });

    if (!createdUser) return res.status(500).json({ status: 'error', message: 'Error creating user!' });

    setAccessToken(createdUser.id, res);

    return res.status(200).json({ status: 'success', message: `User registered successfully!`, data: { id: createdUser.id, email: createdUser.email, name: createdUser.name } });
  } catch (error) {
    console.error(`[ERROR_POST] [REGISTER_CONTROLLER]`, error);
    next(error);
  }
}

export async function loginRouteController(req: Request, res: Response, next: NextFunction) {

  try {
    const { email, password }: UserSchema = req.body;

    if (!email || !password) return res.status(400).json({ status: 'error', message: `Bad Request: The following field(s) are mandatory - ${!email && 'Email, '}${!password && `Password, `}`.trim().replace(/,$/gi, ''), });

    const existingUser = await db.user.findUnique({ where: { email } });

    if (!existingUser) return res.status(404).json({ status: 'error', message: `User does not exist!` });

    const isValid = verifyPassword(password, existingUser.password);

    if (!isValid) return res.status(401).json({ status: 'error', message: 'Invalid Email ID or Password!' });

    setAccessToken(existingUser.id, res);

    return res.status(200).json({ status: 'success', message: `User logged in successfully!`, data: { id: existingUser.id, email: existingUser.email, name: existingUser.name } });
  } catch (error) {
    console.error(`[ERROR_POST] [LOGIN_CONTROLLER]`, error);
    next(error);
  }
}

export async function sessionRouteController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserIdFromToken(req);

    if (!userId) return res.status(401).json({ status: 'error', message: 'Unauthorized!' })

    const userData = await db.user.findUnique({ 
      where: { id: userId }, 
      select: {
        id: true,
        name: true,
        email: true
      } 
    });
    
    return res.status(200).json({
      status: 'success',
      message: `Session Active!`,
      data: userData
    })
  } catch (error) {
    console.error(`[ERROR_GET] [SESSION_CONTROLLER]`, error);
    next(error);
  }
}