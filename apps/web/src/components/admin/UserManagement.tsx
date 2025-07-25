import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  lastLogin?: Date;
  isActive: boolean;
  onboardingCompleted: boolean;
  totalGoals: number;
  totalWorkouts: number;
  currentStreak: number;
}

interface UserManagementProps {
  className?: string;
}

export function UserManagement({ className = '' }: UserManagementProps) {
  const { hasPermission } = useAdminAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: '1',
        email: 'john.doe@example.com',
        name: 'John Doe',
        createdAt: new Date('2024-01-15'),
        lastLogin: new Date('2024-07-23'),
        isActive: true,
        onboardingCompleted: true,
        totalGoals: 5,
        totalWorkouts: 23,
        currentStreak: 7,
      },
      {
        id: '2',
        email: 'jane.smith@example.com',
        name: 'Jane Smith',
        createdAt: new Date('2024-02-20'),
        lastLogin: new Date('2024-07-24'),
        isActive: true,
        onboardingCompleted: true,
        totalGoals: 8,
        totalWorkouts: 45,
        currentStreak: 12,
      },
      {
        id: '3',
        email: 'mike.johnson@example.com',
        name: 'Mike Johnson',
        createdAt: new Date('2024-03-10'),
        lastLogin: new Date('2024-07-20'),
        isActive: false,
        onboardingCompleted: false,
        totalGoals: 2,
        totalWorkouts: 5,
        currentStreak: 0,
      },
      {
        id: '4',
        email: 'sarah.wilson@example.com',
        name: 'Sarah Wilson',
        createdAt: new Date('2024-04-05'),
        lastLogin: new Date('2024-07-24'),
        isActive: true,
        onboardingCompleted: true,
        totalGoals: 12,
        totalWorkouts: 67,
        currentStreak: 15,
      },
      {
        id: '5',
        email: 'alex.brown@example.com',
        name: 'Alex Brown',
        createdAt: new Date('2024-05-12'),
        isActive: true,
        onboardingCompleted: false,
        totalGoals: 1,
        totalWorkouts: 2,
        currentStreak: 1,
      },
    ];

    setTimeout(() => {
      setUsers(mockUsers);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter and search users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && user.isActive) ||
                         (filterStatus === 'inactive' && !user.isActive);
    
    return matchesSearch && matchesFilter;
  });

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === currentUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(currentUsers.map(user => user.id));
    }
  };

  const handleUserAction = (action: string, userId?: string) => {
    console.log(`Action: ${action}`, userId ? `User: ${userId}` : `Users: ${selectedUsers}`);
    // Implement user actions here
  };

  const canEdit = hasPermission('users', 'edit');
  const canDelete = hasPermission('users', 'delete');
  const canSuspend = hasPermission('users', 'suspend');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading users...</span>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600">Manage and monitor user accounts</p>
        </div>
        
        {hasPermission('users', 'create') && (
          <button
            onClick={() => handleUserAction('create')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Icon name="user_plus" size={20} />
            <span>Add User</span>
          </button>
        )}
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon name="search" size={20} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Search users..."
            />
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Users</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            {selectedUsers.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {selectedUsers.length} selected
                </span>
                {canSuspend && (
                  <button
                    onClick={() => handleUserAction('suspend')}
                    className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors text-sm"
                  >
                    Suspend
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={() => handleUserAction('delete')}
                    className="px-3 py-1 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors text-sm"
                  >
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === currentUsers.length && currentUsers.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <Icon name="user" size={20} className="text-gray-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <span className={cn(
                        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                        user.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      )}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {!user.onboardingCompleted && (
                        <div className="text-xs text-yellow-600">Onboarding incomplete</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="space-y-1">
                      <div>{user.totalWorkouts} workouts</div>
                      <div>{user.currentStreak} day streak</div>
                      <div className="text-xs text-gray-500">
                        {user.lastLogin ? `Last: ${user.lastLogin.toLocaleDateString()}` : 'Never'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {user.createdAt.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleUserAction('view', user.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                      {canEdit && (
                        <button
                          onClick={() => handleUserAction('edit', user.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Edit
                        </button>
                      )}
                      {canSuspend && (
                        <button
                          onClick={() => handleUserAction('suspend', user.id)}
                          className="text-yellow-600 hover:text-yellow-900"
                        >
                          {user.isActive ? 'Suspend' : 'Activate'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserManagement;
