import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Mail, Shield, Calendar, Edit2, Save, X, Camera, Award, Target, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    department: user?.department || '',
  });
  const queryClient = useQueryClient();

  const { data: userStats } = useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const response = await api.get('/tasks/analytics');
      return response.data;
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.put('/auth/profile', data);
      return response.data;
    },
    onSuccess: (data) => {
      updateUser(data.user);
      setIsEditing(false);
      toast.success('Profile updated successfully');
      queryClient.invalidateQueries(['user-stats']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to update profile');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const stats = [
    { label: 'Total Tasks', value: userStats?.analytics?.totalTasks || 0, icon: Target, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Completed', value: userStats?.analytics?.completedTasks || 0, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Completion Rate', value: `${userStats?.analytics?.completionPercentage || 0}%`, icon: Award, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const getRoleBadge = (role) => {
    const badges = {
      admin: 'bg-gradient-to-r from-red-500 to-pink-500',
      manager: 'bg-gradient-to-r from-blue-500 to-cyan-500',
      user: 'bg-gradient-to-r from-green-500 to-emerald-500',
      viewer: 'bg-gradient-to-r from-gray-500 to-gray-600',
    };
    return badges[role] || badges.user;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-r from-primary-600 via-primary-500 to-purple-600 rounded-3xl shadow-xl"
      >
        <div className="relative p-8">
          <h1 className="text-3xl font-bold text-white">User Profile</h1>
          <p className="text-primary-100 mt-2">Manage your account information and view your statistics</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          <div className="bg-white/80 dark:bg-dark-200/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg">
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-32 h-32 mx-auto bg-gradient-to-r from-primary-500 to-purple-500 rounded-full flex items-center justify-center shadow-xl">
                  <span className="text-5xl font-bold text-white">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-white dark:bg-dark-300 rounded-full shadow-lg hover:scale-110 transition-transform">
                  <Camera className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
              
              <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">{user?.name}</h2>
              <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
              
              <div className="mt-4">
                <span className={`inline-block px-4 py-1 rounded-full text-white text-sm font-semibold ${getRoleBadge(user?.role)}`}>
                  {user?.role?.toUpperCase()}
                </span>
              </div>
              
              {user?.department && (
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                  Department: {user.department}
                </p>
              )}
              
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-dark-300">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Member since</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {new Date(user?.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-500 dark:text-gray-400">Last login</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Edit Profile Form & Stats */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Edit Profile Card */}
          <div className="bg-white/80 dark:bg-dark-200/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Profile Information</h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 hover:bg-primary-100 transition-all"
                >
                  <Edit2 className="h-4 w-4" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-dark-300 text-gray-600 hover:bg-gray-200 transition-all"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
              )}
            </div>

            {!isEditing ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark-300 rounded-2xl">
                  <User className="h-5 w-5 text-primary-600" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Full Name</p>
                    <p className="text-gray-900 dark:text-white font-medium">{user?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark-300 rounded-2xl">
                  <Mail className="h-5 w-5 text-primary-600" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Email Address</p>
                    <p className="text-gray-900 dark:text-white font-medium">{user?.email}</p>
                  </div>
                </div>
                {user?.department && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark-300 rounded-2xl">
                    <Shield className="h-5 w-5 text-primary-600" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Department</p>
                      <p className="text-gray-900 dark:text-white font-medium">{user?.department}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-2xl bg-gray-100 dark:bg-dark-300 px-4 py-3 focus:ring-2 focus:ring-primary-500 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-2xl bg-gray-100 dark:bg-dark-300 px-4 py-3 focus:ring-2 focus:ring-primary-500 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Department (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full rounded-2xl bg-gray-100 dark:bg-dark-300 px-4 py-3 focus:ring-2 focus:ring-primary-500 transition-all"
                    placeholder="e.g., Engineering, Marketing, Sales"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-2xl hover:shadow-lg transition-all"
                  >
                    {updateProfileMutation.isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* User Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className={`${stat.bg} rounded-2xl p-4 shadow-lg`}>
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;