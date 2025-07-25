import React, { useState } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';

interface BulkOperationsProps {
  className?: string;
}

interface BulkJob {
  id: string;
  type: 'user_import' | 'user_export' | 'content_import' | 'content_export' | 'data_cleanup';
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  total: number;
  processed: number;
  createdAt: Date;
  completedAt?: Date;
  error?: string;
}

export function BulkOperations({ className = '' }: BulkOperationsProps) {
  const { hasPermission } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<'import' | 'export' | 'cleanup' | 'jobs'>('import');
  const [jobs, setJobs] = useState<BulkJob[]>([
    {
      id: '1',
      type: 'user_export',
      status: 'completed',
      progress: 100,
      total: 1234,
      processed: 1234,
      createdAt: new Date(Date.now() - 1000 * 60 * 30),
      completedAt: new Date(Date.now() - 1000 * 60 * 25),
    },
    {
      id: '2',
      type: 'content_import',
      status: 'running',
      progress: 65,
      total: 150,
      processed: 98,
      createdAt: new Date(Date.now() - 1000 * 60 * 10),
    },
  ]);

  const [dragOver, setDragOver] = useState(false);

  const handleFileUpload = (file: File, type: 'users' | 'content') => {
    console.log(`Uploading ${type} file:`, file.name);
    
    // Mock job creation
    const newJob: BulkJob = {
      id: Date.now().toString(),
      type: type === 'users' ? 'user_import' : 'content_import',
      status: 'pending',
      progress: 0,
      total: 0,
      processed: 0,
      createdAt: new Date(),
    };

    setJobs(prev => [newJob, ...prev]);

    // Simulate processing
    setTimeout(() => {
      setJobs(prev => prev.map(job => 
        job.id === newJob.id 
          ? { ...job, status: 'running', total: 100 }
          : job
      ));

      // Simulate progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setJobs(prev => prev.map(job => 
            job.id === newJob.id 
              ? { ...job, status: 'completed', progress: 100, processed: 100, completedAt: new Date() }
              : job
          ));
        } else {
          setJobs(prev => prev.map(job => 
            job.id === newJob.id 
              ? { ...job, progress, processed: Math.floor(progress) }
              : job
          ));
        }
      }, 1000);
    }, 2000);
  };

  const handleExport = (type: 'users' | 'content' | 'analytics') => {
    console.log(`Exporting ${type} data`);
    
    const newJob: BulkJob = {
      id: Date.now().toString(),
      type: type === 'users' ? 'user_export' : 'content_export',
      status: 'running',
      progress: 0,
      total: type === 'users' ? 1234 : 456,
      processed: 0,
      createdAt: new Date(),
    };

    setJobs(prev => [newJob, ...prev]);

    // Simulate export progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setJobs(prev => prev.map(job => 
          job.id === newJob.id 
            ? { ...job, status: 'completed', progress: 100, processed: job.total, completedAt: new Date() }
            : job
        ));
      } else {
        setJobs(prev => prev.map(job => 
          job.id === newJob.id 
            ? { ...job, progress, processed: Math.floor((progress / 100) * job.total) }
            : job
        ));
      }
    }, 800);
  };

  const handleCleanup = (type: 'old_logs' | 'inactive_users' | 'orphaned_data') => {
    console.log(`Starting cleanup: ${type}`);
    
    const newJob: BulkJob = {
      id: Date.now().toString(),
      type: 'data_cleanup',
      status: 'running',
      progress: 0,
      total: 500,
      processed: 0,
      createdAt: new Date(),
    };

    setJobs(prev => [newJob, ...prev]);

    // Simulate cleanup progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setJobs(prev => prev.map(job => 
          job.id === newJob.id 
            ? { ...job, status: 'completed', progress: 100, processed: job.total, completedAt: new Date() }
            : job
        ));
      } else {
        setJobs(prev => prev.map(job => 
          job.id === newJob.id 
            ? { ...job, progress, processed: Math.floor((progress / 100) * job.total) }
            : job
        ));
      }
    }, 1200);
  };

  const getJobStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'running': return 'text-blue-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getJobStatusBg = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 dark:bg-green-900/30';
      case 'running': return 'bg-blue-100 dark:bg-blue-900/30';
      case 'failed': return 'bg-red-100 dark:bg-red-900/30';
      default: return 'bg-gray-100 dark:bg-gray-700';
    }
  };

  if (!hasPermission('users', 'edit') && !hasPermission('content', 'edit')) {
    return (
      <div className="text-center py-12">
        <Icon name="shield" size={48} className="text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Access Denied</h3>
        <p className="text-gray-600 dark:text-gray-400">You don't have permission to perform bulk operations</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Bulk Operations</h2>
          <p className="text-gray-600 dark:text-gray-400">Import, export, and manage data in bulk</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'import', name: 'Import', icon: 'upload' },
            { id: 'export', name: 'Export', icon: 'download' },
            { id: 'cleanup', name: 'Cleanup', icon: 'trash' },
            { id: 'jobs', name: 'Jobs', icon: 'clock', count: jobs.filter(j => j.status === 'running').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
              )}
            >
              <Icon name={tab.icon as any} size={18} />
              <span>{tab.name}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'import' && (
        <div className="space-y-6">
          {/* File Upload Areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User Import */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Import Users</h3>
              <div
                className={cn(
                  'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
                  dragOver ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600'
                )}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const files = Array.from(e.dataTransfer.files);
                  if (files[0]) handleFileUpload(files[0], 'users');
                }}
              >
                <Icon name="upload" size={48} className="text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">Drop CSV file here or</p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleFileUpload(e.target.files[0], 'users');
                  }}
                  className="hidden"
                  id="user-upload"
                />
                <label
                  htmlFor="user-upload"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer inline-block"
                >
                  Choose File
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  CSV format: email, name, role
                </p>
              </div>
            </div>

            {/* Content Import */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Import Content</h3>
              <div
                className={cn(
                  'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
                  'border-gray-300 dark:border-gray-600'
                )}
              >
                <Icon name="upload" size={48} className="text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">Drop JSON file here or</p>
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleFileUpload(e.target.files[0], 'content');
                  }}
                  className="hidden"
                  id="content-upload"
                />
                <label
                  htmlFor="content-upload"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer inline-block"
                >
                  Choose File
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  JSON format: goals, badges, templates
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'export' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { type: 'users', title: 'Export Users', description: 'Download all user data as CSV', icon: 'user', color: 'blue' },
            { type: 'content', title: 'Export Content', description: 'Download goals, badges, templates', icon: 'settings', color: 'green' },
            { type: 'analytics', title: 'Export Analytics', description: 'Download analytics and reports', icon: 'bar_chart', color: 'purple' },
          ].map((item) => (
            <div key={item.type} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-center space-y-4">
                <div className={cn(
                  'w-16 h-16 rounded-full flex items-center justify-center mx-auto',
                  item.color === 'blue' && 'bg-blue-100 dark:bg-blue-900/30',
                  item.color === 'green' && 'bg-green-100 dark:bg-green-900/30',
                  item.color === 'purple' && 'bg-purple-100 dark:bg-purple-900/30'
                )}>
                  <Icon 
                    name={item.icon as any} 
                    size={32} 
                    className={cn(
                      item.color === 'blue' && 'text-blue-600',
                      item.color === 'green' && 'text-green-600',
                      item.color === 'purple' && 'text-purple-600'
                    )}
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.description}</p>
                </div>
                <button
                  onClick={() => handleExport(item.type as any)}
                  className={cn(
                    'w-full px-4 py-2 rounded-lg font-medium transition-colors',
                    item.color === 'blue' && 'bg-blue-600 hover:bg-blue-700 text-white',
                    item.color === 'green' && 'bg-green-600 hover:bg-green-700 text-white',
                    item.color === 'purple' && 'bg-purple-600 hover:bg-purple-700 text-white'
                  )}
                >
                  Export {item.type}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'cleanup' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { type: 'old_logs', title: 'Clean Old Logs', description: 'Remove audit logs older than 90 days', icon: 'trash', danger: false },
            { type: 'inactive_users', title: 'Remove Inactive Users', description: 'Delete users inactive for 1+ year', icon: 'user_x', danger: true },
            { type: 'orphaned_data', title: 'Clean Orphaned Data', description: 'Remove data without valid references', icon: 'database', danger: false },
          ].map((item) => (
            <div key={item.type} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-center space-y-4">
                <div className={cn(
                  'w-16 h-16 rounded-full flex items-center justify-center mx-auto',
                  item.danger ? 'bg-red-100 dark:bg-red-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'
                )}>
                  <Icon 
                    name={item.icon as any} 
                    size={32} 
                    className={item.danger ? 'text-red-600' : 'text-yellow-600'}
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.description}</p>
                </div>
                <button
                  onClick={() => handleCleanup(item.type as any)}
                  className={cn(
                    'w-full px-4 py-2 rounded-lg font-medium transition-colors',
                    item.danger 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                  )}
                >
                  Start Cleanup
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'jobs' && (
        <div className="space-y-4">
          {jobs.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <Icon name="clock" size={48} className="text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Jobs</h3>
              <p className="text-gray-600 dark:text-gray-400">No bulk operations have been run yet</p>
            </div>
          ) : (
            jobs.map((job) => (
              <div key={job.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center',
                      getJobStatusBg(job.status)
                    )}>
                      <Icon 
                        name={
                          job.type.includes('import') ? 'upload' :
                          job.type.includes('export') ? 'download' : 'trash'
                        } 
                        size={24} 
                        className={getJobStatusColor(job.status)}
                      />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white capitalize">
                        {job.type.replace('_', ' ')}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {job.processed} / {job.total} processed
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className={cn(
                      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize',
                      getJobStatusBg(job.status),
                      getJobStatusColor(job.status)
                    )}>
                      {job.status}
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {job.completedAt ? job.completedAt.toLocaleString() : job.createdAt.toLocaleString()}
                    </p>
                  </div>
                </div>
                
                {job.status === 'running' && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">Progress</span>
                      <span className="font-medium text-gray-900 dark:text-white">{Math.round(job.progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default BulkOperations;
