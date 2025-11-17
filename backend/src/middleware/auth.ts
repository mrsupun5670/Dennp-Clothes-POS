import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { logger } from '../utils/logger';

export interface AuthRequest extends Request {
  user?: any;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Missing or invalid authorization header',
        timestamp: new Date().toISOString(),
      });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      timestamp: new Date().toISOString(),
    });
  }
};

export const shopAuthMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
        timestamp: new Date().toISOString(),
      });
    }

    const shopIdFromUrl = parseInt(req.params.shopId || req.query.shop_id as string);
    const userShopId = req.user.shop_id;

    // Allow admin to access all shops, others only their own
    if (req.user.role !== 'admin' && shopIdFromUrl && shopIdFromUrl !== userShopId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Cannot access other shop data',
        timestamp: new Date().toISOString(),
      });
    }

    next();
  } catch (error) {
    logger.error('Shop auth middleware error:', error);
    return res.status(403).json({
      success: false,
      message: 'Authorization failed',
      timestamp: new Date().toISOString(),
    });
  }
};

export const roleMiddleware = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        timestamp: new Date().toISOString(),
      });
    }
    next();
  };
};
