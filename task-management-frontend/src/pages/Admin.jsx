import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/api';
import { Shield, Trash2, UserCog, Mail, Calendar, Award, TrendingUp, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const Admin = () => {
  const [filters, setFilters] = useState({ page: 1, limit: 10 });
  const [expandedUser, setExpandedUser] = useState(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['users', filters],
    queryFn: () => adminService.getAllUsers(filters),
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }) => adminService.updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      toast.success('User role updated successfully');
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId) => adminService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      toast.success('User deleted successfully');
    },
  });

  const users = data?.data?.users || [];
  const pagination = data?.data?.pagination;

  // Demo Admin Credentials
  const demoCredentials = {
    admin: {
      email: 'admin@taskflow.com',
      password: 'Admin@123',
      role: 'Administrator'
    },
    manager: {
      email: 'manager@taskflow.com',
      password: 'Manager@123',
      role: 'Manager'
    },
    user: {
      email: 'user@taskflow.com',
      password: 'User@123',
      role: 'Regular User'
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'bg-gradient-to-r from-red-500 to-pink-500',
      manager: 'bg-gradient-to-r from-blue-500 to-cyan-500',
      user: 'bg-gradient-to-r from-green-500 to-emerald-500',
      viewer: 'bg-gradient-to-r from-gray-500 to-gray-600',
    };
    return colors[role] || colors.user;
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
              <p className="text-red-100 mt-2">Manage users, roles, and system settings</p>
            </div>
            <Shield className="h-12 w-12 text-white/20" />
          </div>
        </div>
      </motion.div>

      {/* Demo Credentials Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-3xl p-6 shadow-lg"
      >
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Award className="h-5 w-5 text-blue-600" />
          Demo Credentials
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(demoCredentials).map(([key, cred]) => (
            <div key={key} className="bg-white/60 dark:bg-dark-200/60 rounded-2xl p-4">
              <div className={`inline-block px-3 py-1 rounded-full text-white text-xs font-semibold mb-3 ${getRoleColor(key)}`}>
                {cred.role}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Email:</p>
              <p className="text-sm font-mono text-gray-900 dark:text-white mb-2">{cred.email}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Password:</p>
              <p className="text-sm font-mono text-gray-900 dark:text-white">{cred.password}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Users Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
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
              {isLoading ? (
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
    </div>
  );
};

export default Admin;