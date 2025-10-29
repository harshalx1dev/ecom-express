import { hash, compare } from 'bcrypt';
import { Request, Response } from 'express';
import { decode, JsonWebTokenError, JwtPayload, sign } from 'jsonwebtoken';

export const getAccessToken = async (userId: string) => {
  const token = sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '1m' });
  return token;
}

export const setAccessToken = async (userId: string, res: Response) => {
  const token = sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '30m' });
  res.cookie('Authorization', token, { maxAge: 1000 * 60 * 30 })
  return res;
}

export const hashPassword = async (password: string) => {
  const hashedPassword = await hash(password, 10);
  return hashedPassword;
}

export const verifyPassword = async (inputPass: string, storedPass: string) => {
  const isValid = await compare(inputPass, storedPass);
  return isValid;
}

export const getCookie = (cookieName: string, cookies: string | undefined) => {
  if (!cookies) return null;
  
  const allCookies = cookies.split(';');
  let mainCookie = null;
  allCookies.forEach(cook => {
    const [name, val] = cook.trim().split('=');
    if (name === cookieName) mainCookie = val; 
  })

  return mainCookie;
}

export const getUserIdFromToken = (req: Request) => {
  const token = getCookie('Authorization', req.headers.cookie);
  const decodedToken = decode(token || '') as JwtPayload;

  if (decodedToken && decodedToken.userId) return decodedToken.userId as string;
  else return null;
}