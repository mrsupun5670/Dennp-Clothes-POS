import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { IJWTPayload } from '../types';

export const generateToken = (payload: IJWTPayload): string => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

export const verifyToken = (token: string): IJWTPayload => {
  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    return decoded as IJWTPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

export const decodeToken = (token: string): IJWTPayload | null => {
  try {
    const decoded = jwt.decode(token);
    return decoded as IJWTPayload;
  } catch (error) {
    return null;
  }
};
