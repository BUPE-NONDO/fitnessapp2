import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  User 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  Timestamp 
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { AdminUser, AdminRole, AdminPermission } from '@fitness-app/shared';
import { AuditLogService } from './auditLogService';

export class AdminAuthService {
  private static adminUser: AdminUser | null = null;

  /**
   * Sign in admin user with email and password
   */
  static async signIn(email: string, password: string): Promise<AdminUser> {
    try {
      // First authenticate with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Check if user is an admin
      const adminUser = await this.getAdminUser(firebaseUser.uid);
      if (!adminUser) {
        await firebaseSignOut(auth);
        throw new Error('Access denied. Admin privileges required.');
      }

      if (!adminUser.isActive) {
        await firebaseSignOut(auth);
        throw new Error('Admin account is deactivated.');
      }

      // Update last login
      await this.updateLastLogin(adminUser.id);
      
      // Store admin user
      this.adminUser = { ...adminUser, lastLogin: new Date() };

      // Log successful login
      await AuditLogService.logAuthAction('login', adminUser.id, {
        email: adminUser.email,
        role: adminUser.role,
      });

      return this.adminUser;
    } catch (error: any) {
      console.error('Admin sign in error:', error);
      throw new Error(error.message || 'Failed to sign in');
    }
  }

  /**
   * Sign out admin user
   */
  static async signOut(): Promise<void> {
    try {
      const currentAdmin = this.adminUser;

      // Log logout before clearing user
      if (currentAdmin) {
        await AuditLogService.logAuthAction('logout', currentAdmin.id);
      }

      await firebaseSignOut(auth);
      this.adminUser = null;
    } catch (error) {
      console.error('Admin sign out error:', error);
      throw new Error('Failed to sign out');
    }
  }

  /**
   * Get current admin user
   */
  static getCurrentAdmin(): AdminUser | null {
    return this.adminUser;
  }

  /**
   * Check if current user has specific permission
   */
  static hasPermission(
    category: keyof AdminPermission,
    action: string
  ): boolean {
    if (!this.adminUser) return false;
    
    const permissions = this.adminUser.permissions[category] as any;
    return permissions?.[action] === true;
  }

  /**
   * Check if current user has specific role
   */
  static hasRole(role: AdminRole): boolean {
    if (!this.adminUser) return false;
    return this.adminUser.role === role;
  }

  /**
   * Check if current user has minimum role level
   */
  static hasMinimumRole(role: AdminRole): boolean {
    if (!this.adminUser) return false;
    
    const roleHierarchy: Record<AdminRole, number> = {
      'support': 1,
      'moderator': 2,
      'admin': 3,
      'super_admin': 4,
    };
    
    const currentLevel = roleHierarchy[this.adminUser.role];
    const requiredLevel = roleHierarchy[role];
    
    return currentLevel >= requiredLevel;
  }

  /**
   * Get admin user from Firestore
   */
  private static async getAdminUser(uid: string): Promise<AdminUser | null> {
    try {
      const adminDoc = await getDoc(doc(db, 'admins', uid));
      if (!adminDoc.exists()) {
        return null;
      }

      const data = adminDoc.data();
      return {
        id: adminDoc.id,
        email: data.email,
        name: data.name,
        role: data.role,
        permissions: data.permissions,
        isActive: data.isActive,
        lastLogin: data.lastLogin?.toDate(),
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
        createdBy: data.createdBy,
      };
    } catch (error) {
      console.error('Error getting admin user:', error);
      return null;
    }
  }

  /**
   * Update last login timestamp
   */
  private static async updateLastLogin(adminId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'admins', adminId), {
        lastLogin: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  }

  /**
   * Get default permissions for role
   */
  static getDefaultPermissions(role: AdminRole): AdminPermission {
    const basePermissions: AdminPermission = {
      users: { view: false, create: false, edit: false, delete: false, suspend: false },
      content: { view: false, create: false, edit: false, delete: false },
      analytics: { view: false, export: false },
      system: { view: false, settings: false, logs: false },
    };

    switch (role) {
      case 'super_admin':
        return {
          users: { view: true, create: true, edit: true, delete: true, suspend: true },
          content: { view: true, create: true, edit: true, delete: true },
          analytics: { view: true, export: true },
          system: { view: true, settings: true, logs: true },
        };
      
      case 'admin':
        return {
          users: { view: true, create: true, edit: true, delete: false, suspend: true },
          content: { view: true, create: true, edit: true, delete: true },
          analytics: { view: true, export: true },
          system: { view: true, settings: false, logs: true },
        };
      
      case 'moderator':
        return {
          users: { view: true, create: false, edit: true, delete: false, suspend: true },
          content: { view: true, create: true, edit: true, delete: false },
          analytics: { view: true, export: false },
          system: { view: false, settings: false, logs: false },
        };
      
      case 'support':
        return {
          users: { view: true, create: false, edit: false, delete: false, suspend: false },
          content: { view: true, create: false, edit: false, delete: false },
          analytics: { view: true, export: false },
          system: { view: false, settings: false, logs: false },
        };
      
      default:
        return basePermissions;
    }
  }

  /**
   * Initialize admin user from current Firebase auth state
   */
  static async initializeFromAuthState(firebaseUser: User): Promise<AdminUser | null> {
    try {
      const adminUser = await this.getAdminUser(firebaseUser.uid);
      if (adminUser && adminUser.isActive) {
        this.adminUser = adminUser;
        return adminUser;
      }
      return null;
    } catch (error) {
      console.error('Error initializing admin from auth state:', error);
      return null;
    }
  }

  /**
   * Check if email is admin
   */
  static async isAdminEmail(email: string): Promise<boolean> {
    try {
      const adminsQuery = query(
        collection(db, 'admins'),
        where('email', '==', email),
        where('isActive', '==', true)
      );
      const snapshot = await getDocs(adminsQuery);
      return !snapshot.empty;
    } catch (error) {
      console.error('Error checking admin email:', error);
      return false;
    }
  }
}

export default AdminAuthService;
