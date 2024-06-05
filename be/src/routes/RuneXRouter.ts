import express, { Request, Response, NextFunction, Router } from "express";
import jwt, { JwtPayload } from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { walletConnect, writeHistory } from "../controller/Controller";

const router: Router = express.Router();

interface ExtendedRequest extends Request {
  user?: JwtPayload;
}

const generateToken = (payload: string | object | Buffer): string => {
  const jwtSecretKey: string = process.env.JWT_SECRET_KEY || 'default_secret_key'; // Ensure to set environment variable
  return jwt.sign(payload, jwtSecretKey, { expiresIn: '1h' });
};

const verifyToken = (token: string): JwtPayload | null => {
  const jwtSecretKey: string = process.env.JWT_SECRET_KEY || 'default_secret_key';
  try {
    return jwt.verify(token, jwtSecretKey) as JwtPayload;
  } catch (error) {
    return null;
  }
};

const authenticateToken = (req: ExtendedRequest, res: Response, next: NextFunction): void => {
  const authHeader: string | undefined = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Authorization header is missing or malformed' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded) {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
    return;
  }

  req.user = decoded; // Attach user information to the request object
  next();
};

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

router.use(apiLimiter);

router.post("/history", apiLimiter, authenticateToken, async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  try {
    console.log('Authenticated user ID:', req.user?.userId);
    await writeHistory(req, res);
  } catch (error) {
    next(error);
  }
});

router.post("/walletConnect", apiLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await walletConnect(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
