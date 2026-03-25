import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { taskService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  CheckCircle, 
  Circle, 
  AlertCircle, 
  TrendingUp,
  Activity,
  Calendar,
  Flag,
  Sparkles,
  Target,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { user } = useAuth();
  
  const { data: tasksData, isLoading } = useQuery({
    queryKey: ['dashboard-tasks'],
    queryFn: () => taskService.getTasks({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }),
  });

  const { data: analyticsData } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => taskService.getAnalytics(),
  });

  const stats = [
    {
      name: 'Total Tasks',
      value: analyticsData?.data?.analytics?.totalTasks || 0,
      icon: Activity,
      gradient: 'from-blue-500 to-blue-600',
      glow: 'shadow-blue-500/20',
      change: '+4.75%',
      changeColor: 'text-green-500',
    },
    {
      name: 'Completed',
      value: analyticsData?.data?.analytics?.completedTasks || 0,
      icon: CheckCircle,
      gradient: 'from-green-500 to-green-600',
      glow: 'shadow-green-500/20',
      change: '+2.02%',
      changeColor: 'text-green-500',
    },
    {
      name: 'Pending',
      value: analyticsData?.data?.analytics?.pendingTasks || 0,
      icon: Circle,
      gradient: 'from-yellow-500 to-yellow-600',
      glow: 'shadow-yellow-500/20',
      change: '-1.39%',
      changeColor: 'text-red-500',
    },
    {
      name: 'Completion Rate',
      value: `${analyticsData?.data?.analytics?.completionPercentage || 0}%`,
      icon: TrendingUp,
      gradient: 'from-purple-500 to-purple-600',
      glow: 'shadow-purple-500/20',
      change: '+12.5%',
      changeColor: 'text-green-500',
    },
  ];

  const recentTasks = tasksData?.data?.tasks || [];

  return (
    <div className="space-y-6">
      {/* Welcome Section with 3D Effect */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden bg-gradient-to-r from-primary-600 via-primary-500 to-primary-700 rounded-2xl shadow-2xl transform hover:scale-[1.01] transition-all duration-300"
      >
        <div className="absolute inset-0 bg-black/20 backdrop-blur-3xl"></div>
        <div className="relative p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
                Welcome back, {user?.name}! 
                <Sparkles className="h-6 w-6 text-yellow-300 animate-pulse" />
              </h1>
              <p className="text-primary-100 text-lg">
                Here's what's happening with your tasks today.
              </p>
            </div>
            <div className="hidden lg:block">
              <div className="w-20 h-20 bg-white/20 rounded-full blur-2xl"></div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid with 3D Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="group relative"
          >
            <div className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 ${stat.glow}`}></div>
            <div className="relative bg-white dark:bg-dark-200 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-dark-300">
              <div className="flex items-center justify-between mb-4">
                <div className={`bg-gradient-to-r ${stat.gradient} p-3 rounded-xl shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <span className={`text-sm font-semibold ${stat.changeColor} bg-opacity-10 px-2 py-1 rounded-full`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                {stat.name}
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Tasks & Task Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          <div className="relative bg-white dark:bg-dark-200 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 dark:border-dark-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary-600" />
                Recent Tasks
              </h2>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Last 5 tasks
              </div>
            </div>
            <div className="space-y-3">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : recentTasks.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-dark-300 dark:to-dark-400 rounded-2xl p-8">
                    <Target className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">
                      No tasks yet. Create your first task!
                    </p>
                    <button className="mt-4 btn-primary inline-flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Create Task
                    </button>
                  </div>
                </motion.div>
              ) : (
                recentTasks.map((task, idx) => (
                  <motion.div
                    key={task._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-dark-300 dark:to-dark-400 rounded-xl hover:shadow-lg transition-all duration-300 cursor-pointer group"
                  >
                    <div className="flex-1">
                      <p className={`font-semibold ${task.status === 'Done' ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          task.priority === 'High' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                          task.priority === 'Medium' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {task.priority}
                        </span>
                        {task.dueDate && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(task.dueDate), 'MMM dd')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className={`badge ${
                      task.status === 'Done' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      task.status === 'In Progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {task.status}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </motion.div>

        {/* Task Overview Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          <div className="relative bg-white dark:bg-dark-200 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 dark:border-dark-300">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Target className="h-5 w-5 text-primary-600" />
              Task Overview
            </h2>
            
            {/* Progress Circle */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-gray-200 dark:text-dark-300"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 70}`}
                    strokeDashoffset={`${2 * Math.PI * 70 * (1 - (analyticsData?.data?.analytics?.completionPercentage || 0) / 100)}`}
                    className="text-green-500 transition-all duration-1000 ease-out"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {analyticsData?.data?.analytics?.completionPercentage || 0}%
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Completion</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/10 rounded-xl"
              >
                <Flag className="h-6 w-6 text-red-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">High Priority</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analyticsData?.data?.analytics?.priorityBreakdown?.High || 0}
                </p>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/10 rounded-xl"
              >
                <AlertCircle className="h-6 w-6 text-orange-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Due Soon</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analyticsData?.data?.analytics?.tasksDueSoon || 0}
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;