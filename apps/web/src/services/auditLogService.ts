import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  getDocs,
  where,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AdminAuthService } from './adminAuthService';
import { AuditLog } from '@fitness-app/shared';

export interface AuditLogEntry {
  adminId: string;
  adminName: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export class AuditLogService {
  private static readonly COLLECTION_NAME = 'audit_logs';

  /**
   * Log an admin action
   */
  static async logAction(
    action: string,
    resource: string,
    resourceId?: string,
    details?: Record<string, any>,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): Promise<void> {
    try {
      const currentAdmin = AdminAuthService.getCurrentAdmin();
      if (!currentAdmin) {
        console.warn('No admin user found for audit logging');
        return;
      }

      const logEntry: Omit<AuditLogEntry, 'timestamp'> = {
        adminId: currentAdmin.id,
        adminName: currentAdmin.name,
        action,
        resource,
        resourceId,
        details,
        ipAddress: await this.getClientIP(),
        userAgent: navigator.userAgent,
        severity,
      };

      await addDoc(collection(db, this.COLLECTION_NAME), {
        ...logEntry,
        timestamp: Timestamp.now(),
      });

      // Log to console for development
      console.log('🔍 Audit Log:', {
        admin: currentAdmin.name,
        action,
        resource,
        resourceId,
        severity,
      });

    } catch (error) {
      console.error('Failed to log audit entry:', error);
      // Don't throw error to avoid breaking the main operation
    }
  }

  /**
   * Get audit logs with filtering and pagination
   */
  static async getAuditLogs(options: {
    adminId?: string;
    action?: string;
    resource?: string;
    severity?: string;
    limit?: number;
    startDate?: Date;
    endDate?: Date;
  } = {}): Promise<AuditLogEntry[]> {
    try {
      let q = query(
        collection(db, this.COLLECTION_NAME),
        orderBy('timestamp', 'desc')
      );

      // Apply filters
      if (options.adminId) {
        q = query(q, where('adminId', '==', options.adminId));
      }
      if (options.action) {
        q = query(q, where('action', '==', options.action));
      }
      if (options.resource) {
        q = query(q, where('resource', '==', options.resource));
      }
      if (options.severity) {
        q = query(q, where('severity', '==', options.severity));
      }
      if (options.startDate) {
        q = query(q, where('timestamp', '>=', Timestamp.fromDate(options.startDate)));
      }
      if (options.endDate) {
        q = query(q, where('timestamp', '<=', Timestamp.fromDate(options.endDate)));
      }

      // Apply limit
      if (options.limit) {
        q = query(q, limit(options.limit));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          timestamp: data.timestamp.toDate(),
        } as AuditLogEntry;
      });

    } catch (error) {
      console.error('Failed to get audit logs:', error);
      return [];
    }
  }

  /**
   * Get recent admin activity
   */
  static async getRecentActivity(limitCount: number = 50): Promise<AuditLogEntry[]> {
    return this.getAuditLogs({ limit: limitCount });
  }

  /**
   * Get admin activity summary
   */
  static async getActivitySummary(adminId?: string): Promise<{
    totalActions: number;
    todayActions: number;
    weekActions: number;
    criticalActions: number;
    topActions: Array<{ action: string; count: number }>;
  }> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      // Get all logs for the admin (or all admins)
      const allLogs = await this.getAuditLogs({ 
        adminId,
        limit: 1000 // Reasonable limit for summary
      });

      const todayLogs = allLogs.filter(log => log.timestamp >= today);
      const weekLogs = allLogs.filter(log => log.timestamp >= weekAgo);
      const criticalLogs = allLogs.filter(log => log.severity === 'critical');

      // Count actions
      const actionCounts: Record<string, number> = {};
      allLogs.forEach(log => {
        actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
      });

      const topActions = Object.entries(actionCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([action, count]) => ({ action, count }));

      return {
        totalActions: allLogs.length,
        todayActions: todayLogs.length,
        weekActions: weekLogs.length,
        criticalActions: criticalLogs.length,
        topActions,
      };

    } catch (error) {
      console.error('Failed to get activity summary:', error);
      return {
        totalActions: 0,
        todayActions: 0,
        weekActions: 0,
        criticalActions: 0,
        topActions: [],
      };
    }
  }

  /**
   * Log user management actions
   */
  static async logUserAction(
    action: 'view' | 'create' | 'edit' | 'delete' | 'suspend' | 'activate',
    userId: string,
    details?: Record<string, any>
  ): Promise<void> {
    const severity = action === 'delete' ? 'high' : 
                    action === 'suspend' ? 'medium' : 'low';
    
    await this.logAction(
      `user_${action}`,
      'user',
      userId,
      details,
      severity
    );
  }

  /**
   * Log content management actions
   */
  static async logContentAction(
    action: 'view' | 'create' | 'edit' | 'delete' | 'activate' | 'deactivate',
    contentType: string,
    contentId: string,
    details?: Record<string, any>
  ): Promise<void> {
    const severity = action === 'delete' ? 'medium' : 'low';
    
    await this.logAction(
      `content_${action}`,
      contentType,
      contentId,
      details,
      severity
    );
  }

  /**
   * Log system actions
   */
  static async logSystemAction(
    action: string,
    details?: Record<string, any>
  ): Promise<void> {
    await this.logAction(
      `system_${action}`,
      'system',
      undefined,
      details,
      'high'
    );
  }

  /**
   * Log authentication events
   */
  static async logAuthAction(
    action: 'login' | 'logout' | 'failed_login' | 'password_change',
    adminId?: string,
    details?: Record<string, any>
  ): Promise<void> {
    const severity = action === 'failed_login' ? 'medium' : 'low';
    
    await this.logAction(
      `auth_${action}`,
      'authentication',
      adminId,
      details,
      severity
    );
  }

  /**
   * Get client IP address (best effort)
   */
  private static async getClientIP(): Promise<string | undefined> {
    try {
      // In a real application, you might use a service to get the IP
      // For now, we'll return undefined and let the server handle it
      return undefined;
    } catch (error) {
      return undefined;
    }
  }

  /**
   * Export audit logs to CSV
   */
  static async exportAuditLogs(options: {
    startDate?: Date;
    endDate?: Date;
    adminId?: string;
  } = {}): Promise<string> {
    try {
      const logs = await this.getAuditLogs({
        ...options,
        limit: 10000, // Large limit for export
      });

      const headers = [
        'Timestamp',
        'Admin',
        'Action',
        'Resource',
        'Resource ID',
        'Severity',
        'IP Address',
        'Details'
      ];

      const csvRows = [
        headers.join(','),
        ...logs.map(log => [
          log.timestamp.toISOString(),
          log.adminName,
          log.action,
          log.resource,
          log.resourceId || '',
          log.severity,
          log.ipAddress || '',
          JSON.stringify(log.details || {}).replace(/"/g, '""')
        ].map(field => `"${field}"`).join(','))
      ];

      return csvRows.join('\n');

    } catch (error) {
      console.error('Failed to export audit logs:', error);
      throw new Error('Failed to export audit logs');
    }
  }

  /**
   * Clean up old audit logs (retention policy)
   */
  static async cleanupOldLogs(retentionDays: number = 90): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const oldLogsQuery = query(
        collection(db, this.COLLECTION_NAME),
        where('timestamp', '<', Timestamp.fromDate(cutoffDate))
      );

      const snapshot = await getDocs(oldLogsQuery);
      
      // In a real implementation, you'd batch delete these
      // For now, just return the count
      console.log(`Found ${snapshot.size} old audit logs to clean up`);
      
      return snapshot.size;

    } catch (error) {
      console.error('Failed to cleanup old logs:', error);
      return 0;
    }
  }
}

export default AuditLogService;
