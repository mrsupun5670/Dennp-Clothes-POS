/**
 * Backend Starter Utility
 * Auto-starts backend with force restart capability
 */

import { Command } from '@tauri-apps/api/shell';
import { checkBackendHealth } from './backendHealth';
import { killBackend } from './backendKiller';

const BACKEND_PATH = 'C:\\Program Files\\Dennp-POS\\backend';
const STARTUP_WAIT = 6000; // 6 seconds for backend to initialize
const MAX_RETRIES = 2;

/**
 * Start backend server
 * @param forceRestart - If true, kills existing processes before starting
 */
export async function startBackend(forceRestart: boolean = false): Promise<boolean> {
  try {
    // Step 1: Force kill if requested
    if (forceRestart) {
      console.log('Force restarting backend...');
      await killBackend();
    }
    
    // Step 2: Start backend process
    console.log('Starting backend server...');
    
    const command = new Command('start-backend', [
      'cmd',
      '/c',
      `cd /d "${BACKEND_PATH}" && start /B npm run start`
    ]);
    
    await command.execute();
    
    // Step 3: Wait for backend to initialize
    console.log(`Waiting ${STARTUP_WAIT}ms for backend to start...`);
    await new Promise(resolve => setTimeout(resolve, STARTUP_WAIT));
    
    // Step 4: Verify backend is healthy
    const health = await checkBackendHealth();
    
    if (health.isHealthy) {
      console.log('✅ Backend started successfully');
      return true;
    }
    
    console.warn('⚠️ Backend started but not healthy:', health.message);
    return false;
    
  } catch (error) {
    console.error('❌ Failed to start backend:', error);
    return false;
  }
}

/**
 * Smart backend recovery
 * Tries multiple strategies to get backend running
 */
export async function recoverBackend(): Promise<boolean> {
  console.log('🔄 Starting backend recovery process...');
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    console.log(`Attempt ${attempt}/${MAX_RETRIES}`);
    
    // Always force restart on recovery attempts
    const success = await startBackend(true);
    
    if (success) {
      console.log('✅ Backend recovered successfully');
      return true;
    }
    
    if (attempt < MAX_RETRIES) {
      console.log(`Retry in 3 seconds...`);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  console.error('❌ Backend recovery failed after all attempts');
  return false;
}
