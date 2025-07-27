import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  Timestamp 
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { AdminAuthService } from './adminAuthService';
import { AdminUser, AdminRole } from '@fitness-app/shared';

export class AdminSetupService {
  /**
   * Initialize default admin users
   */
  static async initializeAdminUsers(): Promise<void> {
    const defaultAdmins = [
      {
        email: 'admin@fitnessapp.com',
        password: 'admin123',
        name: 'Super Admin',
        role: 'super_admin' as AdminRole,
      },
      {
        email: 'manager@fitnessapp.com',
        password: 'manager123',
        name: 'Admin Manager',
        role: 'admin' as AdminRole,
      },
      {
        email: 'mod@fitnessapp.com',
        password: 'mod123',
        name: 'Content Moderator',
        role: 'moderator' as AdminRole,
      },
      {
        email: 'support@fitnessapp.com',
        password: 'support123',
        name: 'Support Agent',
        role: 'support' as AdminRole,
      },
    ];

    console.log('🔧 Initializing admin users...');

    for (const adminData of defaultAdmins) {
      try {
        // Check if admin already exists
        const exists = await this.adminExists(adminData.email);
        if (exists) {
          console.log(`✅ Admin ${adminData.email} already exists`);
          continue;
        }

        // Create Firebase Auth user
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          adminData.email,
          adminData.password
        );

        // Create admin document in Firestore
        await this.createAdminDocument(userCredential.user.uid, {
          email: adminData.email,
          name: adminData.name,
          role: adminData.role,
        });

        console.log(`✅ Created admin: ${adminData.email} (${adminData.role})`);
      } catch (error: any) {
        console.error(`❌ Failed to create admin ${adminData.email}:`, error.message);
      }
    }

    // Sign out after setup
    try {
      await signOut(auth);
    } catch (error) {
      // Ignore sign out errors during setup
    }

    console.log('🎉 Admin setup complete!');
  }

  /**
   * Check if admin user exists
   */
  private static async adminExists(email: string): Promise<boolean> {
    try {
      const adminsQuery = query(
        collection(db, 'admins'),
        where('email', '==', email)
      );
      const snapshot = await getDocs(adminsQuery);
      return !snapshot.empty;
    } catch (error) {
      console.error('Error checking admin existence:', error);
      return false;
    }
  }

  /**
   * Create admin document in Firestore
   */
  private static async createAdminDocument(
    uid: string,
    adminData: {
      email: string;
      name: string;
      role: AdminRole;
    }
  ): Promise<void> {
    const permissions = AdminAuthService.getDefaultPermissions(adminData.role);
    
    const adminDoc = {
      email: adminData.email,
      name: adminData.name,
      role: adminData.role,
      permissions,
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      createdBy: 'system',
    };

    await setDoc(doc(db, 'admins', uid), adminDoc);
  }

  /**
   * Create a new admin user
   */
  static async createAdminUser(
    email: string,
    password: string,
    name: string,
    role: AdminRole,
    createdBy: string
  ): Promise<AdminUser> {
    try {
      // Check if admin already exists
      const exists = await this.adminExists(email);
      if (exists) {
        throw new Error('Admin user already exists');
      }

      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Create admin document
      await this.createAdminDocument(userCredential.user.uid, {
        email,
        name,
        role,
      });

      // Update with createdBy
      await setDoc(doc(db, 'admins', userCredential.user.uid), {
        createdBy,
      }, { merge: true });

      // Get the created admin user
      const adminDoc = await getDoc(doc(db, 'admins', userCredential.user.uid));
      const data = adminDoc.data()!;

      return {
        id: adminDoc.id,
        email: data.email,
        name: data.name,
        role: data.role,
        permissions: data.permissions,
        isActive: data.isActive,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
        createdBy: data.createdBy,
      };
    } catch (error: any) {
      console.error('Error creating admin user:', error);
      throw new Error(error.message || 'Failed to create admin user');
    }
  }

  /**
   * Update admin user
   */
  static async updateAdminUser(
    adminId: string,
    updates: Partial<{
      name: string;
      role: AdminRole;
      isActive: boolean;
    }>
  ): Promise<void> {
    try {
      const updateData: any = {
        ...updates,
        updatedAt: Timestamp.now(),
      };

      // Update permissions if role changed
      if (updates.role) {
        updateData.permissions = AdminAuthService.getDefaultPermissions(updates.role);
      }

      await setDoc(doc(db, 'admins', adminId), updateData, { merge: true });
    } catch (error: any) {
      console.error('Error updating admin user:', error);
      throw new Error(error.message || 'Failed to update admin user');
    }
  }

  /**
   * Get all admin users
   */
  static async getAllAdminUsers(): Promise<AdminUser[]> {
    try {
      const snapshot = await getDocs(collection(db, 'admins'));
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
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
      });
    } catch (error: any) {
      console.error('Error getting admin users:', error);
      throw new Error(error.message || 'Failed to get admin users');
    }
  }

  /**
   * Delete admin user
   */
  static async deleteAdminUser(adminId: string): Promise<void> {
    try {
      // Note: This only deletes the Firestore document
      // Firebase Auth user deletion requires admin SDK
      await setDoc(doc(db, 'admins', adminId), {
        isActive: false,
        updatedAt: Timestamp.now(),
      }, { merge: true });
    } catch (error: any) {
      console.error('Error deleting admin user:', error);
      throw new Error(error.message || 'Failed to delete admin user');
    }
  }



  /**
   * Check if current user can perform admin setup
   */
  static async canPerformSetup(): Promise<boolean> {
    try {
      // Check if any admin users exist
      const snapshot = await getDocs(collection(db, 'admins'));
      return snapshot.empty; // Only allow setup if no admins exist
    } catch (error) {
      console.error('Error checking setup permissions:', error);
      return false;
    }
  }

  /**
   * Get setup status
   */
  static async getSetupStatus(): Promise<{
    hasAdmins: boolean;
    adminCount: number;
    isSetupComplete: boolean;
  }> {
    try {
      const snapshot = await getDocs(collection(db, 'admins'));
      const adminCount = snapshot.size;
      
      return {
        hasAdmins: adminCount > 0,
        adminCount,
        isSetupComplete: adminCount > 0,
      };
    } catch (error) {
      console.error('Error getting setup status:', error);
      return {
        hasAdmins: false,
        adminCount: 0,
        isSetupComplete: false,
      };
    }
  }
}

export default AdminSetupService;
