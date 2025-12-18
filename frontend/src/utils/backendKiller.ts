/**
 * Backend Process Killer Utility
 * Force kills hung backend processes
 */

import { Command } from '@tauri-apps/api/shell';

/**
 * Force kill all Node.js processes (backend)
 * Uses Windows taskkill with /F (force) flag
 */
export async function killBackend(): Promise<boolean> {
  try {
    console.log('Force killing backend processes...');
    
    // Kill all node.exe processes
    const command = new Command('kill-backend', [
      'taskkill',
      '/F',           // Force termination
      '/IM',          // Image name
      'node.exe',     // Process name
      '/T'            // Terminate child processes too
    ]);
    
    const result = await command.execute();
    
    // Wait for processes to fully terminate
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Backend processes killed:', result);
    return true;
  } catch (error) {
    console.error('Failed to kill backend:', error);
    // Even if taskkill fails, return true (process might not exist)
    return true;
  }
}

/**
 * Check if Node.js process is running
 */
export async function isBackendProcessRunning(): Promise<boolean> {
  try {
    const command = new Command('check-process', [
      'tasklist',
      '/FI',
      'IMAGENAME eq node.exe'
    ]);
    
    const result = await command.execute();
    
    // If output contains "node.exe", process is running
    return result.stdout.toLowerCase().includes('node.exe');
  } catch {
    return false;
  }
}
