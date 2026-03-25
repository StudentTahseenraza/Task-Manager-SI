import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  Clock,
  Plus
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import TaskForm from '../components/Tasks/TaskForm';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const { data: tasksData, isLoading } = useQuery({
    queryKey: ['dashboard-tasks'],
    queryFn: () => taskService.getTasks({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }),
  });

  const { data: analyticsData } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => taskService.getAnalytics(),
  });

  const createTaskMutation = useMutation({
    mutationFn: (taskData) => {
      const cleanData = { ...taskData };
      if (cleanData.assignedTo === '') cleanData.assignedTo = null;
      if (cleanData.dueDate === '') cleanData.dueDate = null;
      return taskService.createTask(cleanData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
      queryClient.invalidateQueries(['analytics']);
      queryClient.invalidateQueries(['dashboard-tasks']);
      toast.success('Task created successfully');
      setShowCreateModal(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to create task');
    },
  });

  const handleCreateTask = (data) => {
    createTaskMutation.mutate(data);
  };

  const stats = [
    {
      name: 'Total Tasks',
      value: analyticsData?.data?.analytics?.totalTasks || 0,
      icon: Activity,
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      change: '+4.75%',
      changeColor: 'text-green-500',
    },
    {
      name: 'Completed',
      value: analyticsData?.data?.analytics?.completedTasks || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50 dark:bg-green-900/20',
      change: '+2.02%',
      changeColor: 'text-green-500',
    },
    {
      name: 'Pending',
      value: analyticsData?.data?.analytics?.pendingTasks || 0,
      icon: Circle,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      change: '-1.39%',
      changeColor: 'text-red-500',
    },
    {
      name: 'Completion Rate',
      value: `${analyticsData?.data?.analytics?.completionPercentage || 0}%`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      change: '+12.5%',
      changeColor: 'text-green-500',
    },
  ];

  const recentTasks = tasksData?.data?.tasks || [];

  return (
    <>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Welcome Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden bg-gradient-to-r from-primary-600 via-primary-500 to-purple-600 rounded-3xl shadow-xl"
        >
          <div className="absolute inset-0 bg-black/10"></div>
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
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className={`${stat.bg} rounded-2xl p-6 transition-all duration-300 hover:shadow-xl`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <span className={`text-sm font-semibold ${stat.changeColor}`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                {stat.name}
              </p>
              <p className={`text-3xl font-bold ${stat.color}`}>
                {stat.value}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Recent Tasks & Task Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Tasks */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white/80 dark:bg-dark-200/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary-600" />
                Recent Tasks
              </h2>
              <div className="text-sm text-gray-500">
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
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-300 dark:to-dark-400 rounded-2xl p-8">
                    <Target className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      No tasks yet. Create your first task!
                    </p>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-2xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                    >
                      <Plus className="h-5 w-5" />
                      Create Your First Task
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
                    whileHover={{ x: 5 }}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-300 rounded-2xl transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex-1">
                      <p className={`font-semibold ${task.status === 'Done' ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          task.priority === 'High' ? 'bg-red-100 text-red-700' :
                          task.priority === 'Medium' ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {task.priority}
                        </span>
                        {task.dueDate && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(task.dueDate), 'MMM dd')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      task.status === 'Done' ? 'bg-green-100 text-green-700' :
                      task.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {task.status}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>

          {/* Task Overview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white/80 dark:bg-dark-200/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Target className="h-5 w-5 text-primary-600" />
              Task Overview
            </h2>
            
            {/* Progress Circle */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-gray-100 dark:text-dark-300"
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
                    className="text-primary-600 transition-all duration-1000 ease-out"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {analyticsData?.data?.analytics?.completionPercentage || 0}%
                    </p>
                    <p className="text-xs text-gray-500">Completion</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl">
                <Flag className="h-6 w-6 text-red-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">High Priority</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analyticsData?.data?.analytics?.priorityBreakdown?.High || 0}
                </p>
              </div>
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-2xl">
                <AlertCircle className="h-6 w-6 text-orange-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Due Soon</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analyticsData?.data?.analytics?.tasksDueSoon || 0}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Task Creation Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <TaskForm
            task={null}
            onSubmit={handleCreateTask}
            onClose={() => setShowCreateModal(false)}
            isLoading={createTaskMutation.isPending}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Dashboard;