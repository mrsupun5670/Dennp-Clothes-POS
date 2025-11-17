import { createClient } from 'redis';
import { logger } from '../utils/logger';

const client = createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
});

client.on('connect', () => {
  logger.info('Redis client connected');
});

client.on('error', (err) => {
  logger.error('Redis client error:', err);
});

export const connectRedis = async () => {
  try {
    if (!client.isOpen) {
      await client.connect();
    }
    logger.info('Redis connected successfully');
  } catch (error) {
    logger.error('Redis connection failed:', error);
    throw error;
  }
};

export default client;
