import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '../services/api';
import { Plus, Search, Filter, X, Sparkles } from 'lucide-react';
import TaskCard from '../components/Tasks/TaskCard';
import TaskForm from '../components/Tasks/TaskForm';
import { TASK_STATUS, TASK_PRIORITY } from '../constants/constants';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Tasks = () => {
  const location = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: '',
    page: 1,
    limit: 10,
  });
  
  useEffect(() => {
    if (location.state?.openCreateModal) {
      setShowForm(true);
      window.history.replaceState({}, document.title);
    }
  }, [location]);
  
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => taskService.getTasks(filters),
  });

  const createMutation = useMutation({
    mutationFn: (taskData) => {
      const cleanData = { ...taskData };
      if (cleanData.assignedTo === '') cleanData.assignedTo = null;
      if (cleanData.dueDate === '') cleanData.dueDate = null;
      return taskService.createTask(cleanData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
      queryClient.invalidateQueries(['analytics']);
      toast.success('Task created successfully');
      setShowForm(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to create task');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => {
      const cleanData = { ...data };
      if (cleanData.assignedTo === '') cleanData.assignedTo = null;
      if (cleanData.dueDate === '') cleanData.dueDate = null;
      return taskService.updateTask(id, cleanData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
      queryClient.invalidateQueries(['analytics']);
      toast.success('Task updated successfully');
      setEditingTask(null);
      setShowForm(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to update task');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => taskService.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
      queryClient.invalidateQueries(['analytics']);
      toast.success('Task deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to delete task');
    },
  });

  const handleSubmit = (data) => {
    if (editingTask) {
      updateMutation.mutate({ id: editingTask._id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleStatusChange = (id, newStatus) => {
    updateMutation.mutate({ id, data: { status: newStatus } });
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      priority: '',
      search: '',
      page: 1,
      limit: 10,
    });
  };

  const tasks = data?.data?.tasks || [];
  const pagination = data?.data?.pagination;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-r from-primary-600 via-primary-500 to-purple-600 rounded-3xl shadow-xl"
      >
        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-2">
                Task Management
                <Sparkles className="h-6 w-6 text-yellow-300 animate-pulse" />
              </h1>
              <p className="text-primary-100">Organize, track, and manage your tasks efficiently</p>
            </div>
            {!user?.isViewer && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setEditingTask(null);
                  setShowForm(true);
                }}
                className="bg-white/20 backdrop-blur-sm text-white font-semibold py-3 px-6 rounded-2xl hover:bg-white/30 transition-all duration-300 flex items-center gap-2 shadow-lg"
              >
                <Plus className="h-5 w-5" />
                <span>New Task</span>
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/80 dark:bg-dark-200/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks by title..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              className="w-full rounded-2xl bg-gray-100 dark:bg-dark-300 text-gray-900 dark:text-white px-12 py-3 focus:ring-2 focus:ring-primary-500 transition-all duration-300"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-5 py-3 rounded-2xl bg-gray-100 dark:bg-dark-300 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-400 transition-all duration-200 flex items-center gap-2"
            >
              <Filter className="h-5 w-5" />
              <span className="hidden sm:inline">Filters</span>
            </button>
            
            {(filters.status || filters.priority || filters.search) && (
              <button
                onClick={clearFilters}
                className="px-5 py-3 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-200 flex items-center gap-2"
              >
                <X className="h-5 w-5" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-6 pt-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                    className="w-full rounded-2xl bg-gray-100 dark:bg-dark-300 text-gray-900 dark:text-white px-4 py-3 focus:ring-2 focus:ring-primary-500 transition-all duration-300"
                  >
                    <option value="">All Status</option>
                    <option value={TASK_STATUS.TODO}>Todo</option>
                    <option value={TASK_STATUS.IN_PROGRESS}>In Progress</option>
                    <option value={TASK_STATUS.DONE}>Done</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Priority
                  </label>
                  <select
                    value={filters.priority}
                    onChange={(e) => setFilters({ ...filters, priority: e.target.value, page: 1 })}
                    className="w-full rounded-2xl bg-gray-100 dark:bg-dark-300 text-gray-900 dark:text-white px-4 py-3 focus:ring-2 focus:ring-primary-500 transition-all duration-300"
                  >
                    <option value="">All Priority</option>
                    <option value={TASK_PRIORITY.LOW}>Low</option>
                    <option value={TASK_PRIORITY.MEDIUM}>Medium</option>
                    <option value={TASK_PRIORITY.HIGH}>High</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Tasks Grid */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          </div>
        </div>
      ) : tasks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/80 dark:bg-dark-200/80 backdrop-blur-sm rounded-3xl p-12 text-center shadow-lg"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-primary-100 to-purple-100 dark:from-primary-900/20 dark:to-purple-900/20 mb-6">
            <Sparkles className="h-10 w-10 text-primary-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No tasks found
          </h3>
          <p className="text-gray-500 mb-6">
            {filters.search || filters.status || filters.priority 
              ? "Try adjusting your filters" 
              : "Get started by creating your first task"}
          </p>
          {!user?.isViewer && !(filters.search || filters.status || filters.priority) && (
            <button
              onClick={() => {
                setEditingTask(null);
                setShowForm(true);
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-2xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <Plus className="h-5 w-5" />
              Create Your First Task
            </button>
          )}
        </motion.div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onEdit={(task) => {
                  setEditingTask(task);
                  setShowForm(true);
                }}
                onDelete={(id) => {
                  if (window.confirm('Are you sure you want to delete this task?')) {
                    deleteMutation.mutate(id);
                  }
                }}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                disabled={filters.page === 1}
                className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-dark-300 text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-200 dark:hover:bg-dark-400 transition-all duration-200"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-600 dark:text-gray-400">
                Page {filters.page} of {pagination.pages}
              </span>
              <button
                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                disabled={filters.page === pagination.pages}
                className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-dark-300 text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-200 dark:hover:bg-dark-400 transition-all duration-200"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Task Form Modal */}
      <AnimatePresence>
        {showForm && (
          <TaskForm
            task={editingTask}
            onSubmit={handleSubmit}
            onClose={() => {
              setShowForm(false);
              setEditingTask(null);
            }}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tasks;