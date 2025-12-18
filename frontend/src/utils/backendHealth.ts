/**
 * Backend Health Check Utility
 * Smart health detection that tests actual functionality, not just process existence
 */

const BACKEND_URL = 'http://localhost:3000';
const HEALTH_TIMEOUT = 5000; // 5 seconds

export interface BackendHealthStatus {
  isHealthy: boolean;
  isRunning: boolean;
  needsRestart: boolean;
  message?: string;
}

/**
 * Check if backend is healthy
 * Tests both server response and database connectivity
 */
export async function checkBackendHealth(): Promise<BackendHealthStatus> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), HEALTH_TIMEOUT);
    
    const response = await fetch(`${BACKEND_URL}/api/health`, {
      method: 'GET',
      signal: controller.signal,
    });
    
    clearTimeout(timeout);
    
    if (response.ok) {
      const data = await response.json();
      
      // Check if backend reports healthy status
      if (data.status === 'healthy' && data.database === 'connected') {
        return {
          isHealthy: true,
          isRunning: true,
          needsRestart: false,
          message: 'Backend is healthy'
        };
      }
      
      // Backend running but unhealthy (e.g., database disconnected)
      return {
        isHealthy: false,
        isRunning: true,
        needsRestart: true,
        message: 'Backend unhealthy: ' + (data.error || 'Unknown error')
      };
    }
    
    // Backend returned error status
    return {
      isHealthy: false,
      isRunning: true,
      needsRestart: true,
      message: `Backend error: ${response.status}`
    };
    
  } catch (error) {
    // Backend not responding (could be down or hung)
    if (error instanceof Error && error.name === 'AbortError') {
      // Timeout - backend is hung
      return {
        isHealthy: false,
        isRunning: true, // Process might exist but hung
        needsRestart: true,
        message: 'Backend timeout - likely hung'
      };
    }
    
    // Connection refused - backend not running
    return {
      isHealthy: false,
      isRunning: false,
      needsRestart: true,
      message: 'Backend not running'
    };
  }
}

/**
 * Quick check if backend is reachable (lighter than full health check)
 */
export async function pingBackend(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    
    const response = await fetch(`${BACKEND_URL}/api/health`, {
      method: 'GET',
      signal: controller.signal,
    });
    
    clearTimeout(timeout);
    return response.ok;
  } catch {
    return false;
  }
}
