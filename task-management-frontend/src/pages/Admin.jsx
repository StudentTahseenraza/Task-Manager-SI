import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService, taskService } from '../services/api';
import { 
  Shield, Trash2, UserCog, Mail, Calendar, Award, TrendingUp, 
  Users, ChevronDown, ChevronUp, CheckSquare, Filter, Search,
  Edit2, Eye, Clock, Flag, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import TaskForm from '../components/Tasks/TaskForm';
import { format } from 'date-fns';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'tasks'
  const [filters, setFilters] = useState({ page: 1, limit: 10 });
  const [expandedUser, setExpandedUser] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskFilters, setTaskFilters] = useState({
    status: '',
    priority: '',
    search: '',
    page: 1,
    limit: 10,
  });
  
  const queryClient = useQueryClient();

  // Users Query
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['users', filters],
    queryFn: () => adminService.getAllUsers(filters),
    enabled: activeTab === 'users',
  });

  // All Tasks Query (Admin sees all tasks)
  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['admin-tasks', taskFilters],
    queryFn: () => taskService.getTasks({ ...taskFilters, view: 'all' }),
    enabled: activeTab === 'tasks',
  });

  // Update User Role Mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }) => adminService.updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      toast.success('User role updated successfully');
    },
  });

  // Delete User Mutation
  const deleteUserMutation = useMutation({
    mutationFn: (userId) => adminService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      toast.success('User deleted successfully');
    },
  });

  // Update Task Mutation (Admin can edit any task)
  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }) => {
      const cleanData = { ...data };
      if (cleanData.assignedTo === '') cleanData.assignedTo = null;
      if (cleanData.dueDate === '') cleanData.dueDate = null;
      return taskService.updateTask(id, cleanData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-tasks']);
      queryClient.invalidateQueries(['tasks']);
      queryClient.invalidateQueries(['analytics']);
      toast.success('Task updated successfully');
      setShowTaskForm(false);
      setEditingTask(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to update task');
    },
  });

  // Delete Task Mutation
  const deleteTaskMutation = useMutation({
    mutationFn: (id) => taskService.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-tasks']);
      queryClient.invalidateQueries(['tasks']);
      queryClient.invalidateQueries(['analytics']);
      toast.success('Task deleted successfully');
    },
  });

  const users = usersData?.data?.users || [];
  const pagination = usersData?.data?.pagination;
  const tasks = tasksData?.data?.tasks || [];
  const tasksPagination = tasksData?.data?.pagination;

  const getRoleColor = (role) => {
    const colors = {
      admin: 'bg-gradient-to-r from-red-500 to-pink-500',
      manager: 'bg-gradient-to-r from-blue-500 to-cyan-500',
      user: 'bg-gradient-to-r from-green-500 to-emerald-500',
      viewer: 'bg-gradient-to-r from-gray-500 to-gray-600',
    };
    return colors[role] || colors.user;
  };

  const handleTaskSubmit = (data) => {
    if (editingTask) {
      updateTaskMutation.mutate({ id: editingTask._id, data });
    }
  };

  const clearTaskFilters = () => {
    setTaskFilters({
      status: '',
      priority: '',
      search: '',
      page: 1,
      limit: 10,
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-r from-red-600 via-red-500 to-pink-600 rounded-3xl shadow-xl"
      >
        <div className="relative p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-red-100 mt-2">Manage users, tasks, and system settings</p>
            </div>
            <Shield className="h-12 w-12 text-white/20" />
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 bg-white/80 dark:bg-dark-200/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 ${
            activeTab === 'users'
              ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-300'
          }`}
        >
          <Users className="h-5 w-5" />
          <span className="font-semibold">User Management</span>
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 ${
            activeTab === 'tasks'
              ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-300'
          }`}
        >
          <CheckSquare className="h-5 w-5" />
          <span className="font-semibold">All Tasks</span>
        </button>
      </div>

      {/* User Management Tab */}
      {activeTab === 'users' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-dark-200/80 backdrop-blur-sm rounded-3xl shadow-lg overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200 dark:border-dark-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary-600" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">User Management</h2>
              </div>
              <div className="text-sm text-gray-500">
                Total Users: {pagination?.total || 0}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-dark-300">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-dark-300">
                {usersLoading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex justify-center">
                        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <React.Fragment key={user._id}>
                      <tr className="hover:bg-gray-50 dark:hover:bg-dark-300 transition-colors cursor-pointer">
                        <td className="px-6 py-4" onClick={() => setExpandedUser(expandedUser === user._id ? null : user._id)}>
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${getRoleColor(user.role)}`}>
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                              <div className="text-sm text-gray-500 flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={user.role}
                            onChange={(e) => updateRoleMutation.mutate({ userId: user._id, role: e.target.value })}
                            className="text-sm rounded-xl bg-gray-100 dark:bg-dark-300 px-3 py-1 focus:ring-2 focus:ring-primary-500"
                          >
                            <option value="admin">Admin</option>
                            <option value="manager">Manager</option>
                            <option value="user">User</option>
                            <option value="viewer">Viewer</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {user.department || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
                                deleteUserMutation.mutate(user._id);
                              }
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                      <AnimatePresence>
                        {expandedUser === user._id && (
                          <motion.tr
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-gray-50 dark:bg-dark-300"
                          >
                            <td colSpan="5" className="px-6 py-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">User ID</p>
                                  <p className="text-sm font-mono text-gray-600 dark:text-gray-400">{user._id}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Login</p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                                  </p>
                                </div>
                              </div>
                            </td>
                          </motion.tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-dark-300">
              <div className="flex justify-between items-center">
                <button
                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                  disabled={filters.page === 1}
                  className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-dark-300 disabled:opacity-50 hover:bg-gray-200 transition-all"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {filters.page} of {pagination.pages}
                </span>
                <button
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                  disabled={filters.page === pagination.pages}
                  className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-dark-300 disabled:opacity-50 hover:bg-gray-200 transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* All Tasks Tab - Admin Task Management */}
      {activeTab === 'tasks' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Search and Filters */}
          <div className="bg-white/80 dark:bg-dark-200/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tasks by title..."
                  value={taskFilters.search}
                  onChange={(e) => setTaskFilters({ ...taskFilters, search: e.target.value, page: 1 })}
                  className="w-full rounded-2xl bg-gray-100 dark:bg-dark-300 text-gray-900 dark:text-white px-12 py-3 focus:ring-2 focus:ring-primary-500 transition-all"
                />
              </div>
              
              <div className="flex gap-2">
                <select
                  value={taskFilters.status}
                  onChange={(e) => setTaskFilters({ ...taskFilters, status: e.target.value, page: 1 })}
                  className="px-4 py-3 rounded-2xl bg-gray-100 dark:bg-dark-300 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Status</option>
                  <option value="Todo">Todo</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
                
                <select
                  value={taskFilters.priority}
                  onChange={(e) => setTaskFilters({ ...taskFilters, priority: e.target.value, page: 1 })}
                  className="px-4 py-3 rounded-2xl bg-gray-100 dark:bg-dark-300 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Priority</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
                
                {(taskFilters.status || taskFilters.priority || taskFilters.search) && (
                  <button
                    onClick={clearTaskFilters}
                    className="px-4 py-3 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100 transition-all"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Tasks Grid */}
          {tasksLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
            </div>
          ) : tasks.length === 0 ? (
            <div className="bg-white/80 dark:bg-dark-200/80 backdrop-blur-sm rounded-3xl p-12 text-center shadow-lg">
              <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No tasks found</h3>
              <p className="text-gray-500">No tasks match your search criteria</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tasks.map((task) => (
                  <div key={task._id} className="bg-white/80 dark:bg-dark-200/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white flex-1">
                        {task.title}
                      </h3>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setEditingTask(task);
                            setShowTaskForm(true);
                          }}
                          className="p-2 text-gray-500 hover:text-primary-600 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-300 transition-all"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this task?')) {
                              deleteTaskMutation.mutate(task._id);
                            }
                          }}
                          className="p-2 text-gray-500 hover:text-red-600 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-300 transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    {task.description && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        task.status === 'Done' ? 'bg-green-100 text-green-700' :
                        task.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {task.status}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${
                        task.priority === 'High' ? 'bg-red-100 text-red-700' :
                        task.priority === 'Medium' ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        <Flag className="h-3 w-3" />
                        {task.priority}
                      </span>
                      {task.dueDate && (
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                        </span>
                      )}
                    </div>
                    
                    <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200 dark:border-dark-300">
                      <div>Created by: {task.createdBy?.name || 'Unknown'}</div>
                      {task.assignedTo && (
                        <div>Assigned to: {task.assignedTo.name}</div>
                      )}
                      <div>Created: {format(new Date(task.createdAt), 'MMM dd, yyyy')}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination for Tasks */}
              {tasksPagination && tasksPagination.pages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <button
                    onClick={() => setTaskFilters({ ...taskFilters, page: taskFilters.page - 1 })}
                    disabled={taskFilters.page === 1}
                    className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-dark-300 disabled:opacity-50 hover:bg-gray-200 transition-all"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-gray-600">
                    Page {taskFilters.page} of {tasksPagination.pages}
                  </span>
                  <button
                    onClick={() => setTaskFilters({ ...taskFilters, page: taskFilters.page + 1 })}
                    disabled={taskFilters.page === tasksPagination.pages}
                    className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-dark-300 disabled:opacity-50 hover:bg-gray-200 transition-all"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </motion.div>
      )}

      {/* Task Edit Modal */}
      <AnimatePresence>
        {showTaskForm && editingTask && (
          <TaskForm
            task={editingTask}
            onSubmit={handleTaskSubmit}
            onClose={() => {
              setShowTaskForm(false);
              setEditingTask(null);
            }}
            isLoading={updateTaskMutation.isPending}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Admin;