import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';

interface ContentItem {
  id: string;
  type: 'goal_template' | 'badge_definition' | 'workout_template';
  name: string;
  description: string;
  category: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

interface ContentManagementProps {
  className?: string;
}

export function ContentManagement({ className = '' }: ContentManagementProps) {
  const { hasPermission } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<'goals' | 'badges' | 'workouts'>('goals');
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const mockContent: ContentItem[] = [
      {
        id: '1',
        type: 'goal_template',
        name: 'Weight Loss Beginner',
        description: 'A gentle start to your weight loss journey',
        category: 'weight_loss',
        isActive: true,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-07-20'),
        metadata: { difficulty: 'beginner', duration: '4 weeks' }
      },
      {
        id: '2',
        type: 'badge_definition',
        name: 'First Workout',
        description: 'Complete your first workout',
        category: 'onboarding',
        isActive: true,
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-07-15'),
        metadata: { points: 10, rarity: 'common' }
      },
      {
        id: '3',
        type: 'workout_template',
        name: 'Morning Cardio',
        description: '30-minute morning cardio routine',
        category: 'cardio',
        isActive: true,
        createdAt: new Date('2024-03-10'),
        updatedAt: new Date('2024-07-18'),
        metadata: { duration: 30, equipment: 'none' }
      },
    ];

    setTimeout(() => {
      setContent(mockContent);
      setLoading(false);
    }, 1000);
  }, []);

  const tabs = [
    { id: 'goals', name: 'Goal Templates', icon: 'target', count: content.filter(c => c.type === 'goal_template').length },
    { id: 'badges', name: 'Badge Definitions', icon: 'trophy', count: content.filter(c => c.type === 'badge_definition').length },
    { id: 'workouts', name: 'Workout Templates', icon: 'dumbbell', count: content.filter(c => c.type === 'workout_template').length },
  ];

  const getTypeFilter = () => {
    switch (activeTab) {
      case 'goals': return 'goal_template';
      case 'badges': return 'badge_definition';
      case 'workouts': return 'workout_template';
      default: return 'goal_template';
    }
  };

  const filteredContent = content.filter(item => {
    const matchesType = item.type === getTypeFilter();
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === filteredContent.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredContent.map(item => item.id));
    }
  };

  const handleContentAction = (action: string, itemId?: string) => {
    console.log(`Action: ${action}`, itemId ? `Item: ${itemId}` : `Items: ${selectedItems}`);
    // Implement content actions here
  };

  const canCreate = hasPermission('content', 'create');
  const canEdit = hasPermission('content', 'edit');
  const canDelete = hasPermission('content', 'delete');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading content...</span>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Content Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage goals, badges, and workout templates</p>
        </div>
        
        {canCreate && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Icon name="plus" size={20} />
            <span>Create {activeTab.slice(0, -1)}</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              )}
            >
              <Icon name={tab.icon as any} size={18} />
              <span>{tab.name}</span>
              <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
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
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={`Search ${activeTab}...`}
            />
          </div>

          {/* Bulk Actions */}
          {selectedItems.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedItems.length} selected
              </span>
              {canEdit && (
                <button
                  onClick={() => handleContentAction('activate')}
                  className="px-3 py-1 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors text-sm"
                >
                  Activate
                </button>
              )}
              {canEdit && (
                <button
                  onClick={() => handleContentAction('deactivate')}
                  className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors text-sm"
                >
                  Deactivate
                </button>
              )}
              {canDelete && (
                <button
                  onClick={() => handleContentAction('delete')}
                  className="px-3 py-1 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors text-sm"
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContent.map((item) => (
          <div
            key={item.id}
            className={cn(
              'bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 transition-all duration-200 hover:shadow-md',
              selectedItems.includes(item.id)
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700'
            )}
          >
            {/* Card Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => handleSelectItem(item.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    item.type === 'goal_template' && 'bg-blue-100 dark:bg-blue-900/30',
                    item.type === 'badge_definition' && 'bg-yellow-100 dark:bg-yellow-900/30',
                    item.type === 'workout_template' && 'bg-green-100 dark:bg-green-900/30'
                  )}>
                    <Icon 
                      name={
                        item.type === 'goal_template' ? 'target' :
                        item.type === 'badge_definition' ? 'trophy' : 'dumbbell'
                      } 
                      size={20} 
                      className={cn(
                        item.type === 'goal_template' && 'text-blue-600',
                        item.type === 'badge_definition' && 'text-yellow-600',
                        item.type === 'workout_template' && 'text-green-600'
                      )}
                    />
                  </div>
                </div>
                
                <span className={cn(
                  'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                  item.isActive 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                )}>
                  {item.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{item.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{item.description}</p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">Category</span>
                  <span className="font-medium text-gray-900 dark:text-white capitalize">
                    {item.category.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">Updated</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {item.updatedAt.toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Card Actions */}
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-b-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleContentAction('view', item.id)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View
                  </button>
                  {canEdit && (
                    <button
                      onClick={() => handleContentAction('edit', item.id)}
                      className="text-green-600 hover:text-green-800 text-sm font-medium"
                    >
                      Edit
                    </button>
                  )}
                  {canEdit && (
                    <button
                      onClick={() => handleContentAction('duplicate', item.id)}
                      className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                    >
                      Duplicate
                    </button>
                  )}
                </div>
                
                {canDelete && (
                  <button
                    onClick={() => handleContentAction('delete', item.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredContent.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <Icon name="target" size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No {activeTab} found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchTerm ? 'Try adjusting your search terms' : `Create your first ${activeTab.slice(0, -1)} to get started`}
          </p>
          {canCreate && !searchTerm && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create {activeTab.slice(0, -1)}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default ContentManagement;
