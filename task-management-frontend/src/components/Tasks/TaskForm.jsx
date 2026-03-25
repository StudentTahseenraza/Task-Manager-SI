import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Sparkles, Calendar, Flag, User, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { TASK_STATUS, TASK_PRIORITY } from '../../constants/constants';
import { motion } from 'framer-motion';

const taskSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title too long'),
  description: z.string()
    .max(1000, 'Description too long')
    .optional(),
  status: z.enum([TASK_STATUS.TODO, TASK_STATUS.IN_PROGRESS, TASK_STATUS.DONE]),
  priority: z.enum([TASK_PRIORITY.LOW, TASK_PRIORITY.MEDIUM, TASK_PRIORITY.HIGH]),
  dueDate: z.string().optional().nullable(),
  assignedTo: z.string().optional().nullable(),
});

const TaskForm = ({ task, onSubmit, onClose, isLoading }) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: task ? {
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      assignedTo: task.assignedTo?._id || task.assignedTo || '',
    } : {
      title: '',
      description: '',
      status: TASK_STATUS.TODO,
      priority: TASK_PRIORITY.MEDIUM,
      dueDate: '',
      assignedTo: '',
    },
  });

  const selectedStatus = watch('status');
  const selectedPriority = watch('priority');

  const statusOptions = [
    { value: TASK_STATUS.TODO, label: 'Todo', icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'hover:border-yellow-500' },
    { value: TASK_STATUS.IN_PROGRESS, label: 'In Progress', icon: AlertCircle, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'hover:border-blue-500' },
    { value: TASK_STATUS.DONE, label: 'Done', icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20', border: 'hover:border-green-500' },
  ];

  const priorityOptions = [
    { value: TASK_PRIORITY.LOW, label: 'Low', color: 'text-gray-500', bg: 'bg-gray-50 dark:bg-gray-900/20', border: 'hover:border-gray-500' },
    { value: TASK_PRIORITY.MEDIUM, label: 'Medium', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'hover:border-orange-500' },
    { value: TASK_PRIORITY.HIGH, label: 'High', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', border: 'hover:border-red-500' },
  ];

  const handleFormSubmit = (data) => {
    const cleanedData = {
      ...data,
      dueDate: data.dueDate === '' ? null : data.dueDate,
      assignedTo: data.assignedTo === '' ? null : data.assignedTo,
    };
    onSubmit(cleanedData);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-white dark:bg-dark-200 rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-r from-primary-600 via-primary-500 to-purple-600 px-6 py-5">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {task ? 'Edit Task' : 'Create New Task'}
                </h2>
                <p className="text-primary-100 text-sm mt-1">
                  {task ? 'Update your task details' : 'Add a new task to your workflow'}
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 rounded-xl bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-200"
            >
              <X className="h-5 w-5 text-white" />
            </motion.button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Title Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Task Title <span className="text-red-500">*</span>
            </label>
            <input
              {...register('title')}
              className="w-full px-4 py-3 rounded-2xl bg-gray-100 dark:bg-dark-300 border-2 border-transparent focus:border-primary-500 focus:ring-2 focus:ring-primary-500 transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500"
              placeholder="Enter a descriptive title..."
            />
            {errors.title && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1 text-sm text-red-500 flex items-center gap-1"
              >
                <AlertCircle className="h-3 w-3" />
                {errors.title.message}
              </motion.p>
            )}
          </div>
          
          {/* Description Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              {...register('description')}
              rows="3"
              className="w-full px-4 py-3 rounded-2xl bg-gray-100 dark:bg-dark-300 border-2 border-transparent focus:border-primary-500 focus:ring-2 focus:ring-primary-500 transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 resize-none"
              placeholder="Add details about this task..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>
          
          {/* Status Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Status
            </label>
            <div className="grid grid-cols-3 gap-3">
              {statusOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedStatus === option.value;
                return (
                  <motion.label
                    key={option.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative cursor-pointer rounded-xl p-3 transition-all duration-200 ${
                      isSelected
                        ? `${option.bg} border-2 ${option.color} border-current`
                        : 'bg-gray-100 dark:bg-dark-300 border-2 border-transparent hover:border-gray-300 dark:hover:border-dark-400'
                    }`}
                  >
                    <input
                      type="radio"
                      value={option.value}
                      {...register('status')}
                      className="absolute opacity-0"
                    />
                    <div className="flex flex-col items-center gap-1">
                      <Icon className={`h-5 w-5 ${isSelected ? option.color : 'text-gray-400'}`} />
                      <span className={`text-xs font-medium ${isSelected ? option.color : 'text-gray-600 dark:text-gray-400'}`}>
                        {option.label}
                      </span>
                    </div>
                  </motion.label>
                );
              })}
            </div>
          </div>
          
          {/* Priority Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Priority
            </label>
            <div className="grid grid-cols-3 gap-3">
              {priorityOptions.map((option) => {
                const isSelected = selectedPriority === option.value;
                return (
                  <motion.label
                    key={option.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative cursor-pointer rounded-xl p-3 transition-all duration-200 ${
                      isSelected
                        ? `${option.bg} border-2 ${option.color} border-current`
                        : 'bg-gray-100 dark:bg-dark-300 border-2 border-transparent hover:border-gray-300 dark:hover:border-dark-400'
                    }`}
                  >
                    <input
                      type="radio"
                      value={option.value}
                      {...register('priority')}
                      className="absolute opacity-0"
                    />
                    <div className="flex flex-col items-center gap-1">
                      <Flag className={`h-5 w-5 ${isSelected ? option.color : 'text-gray-400'}`} />
                      <span className={`text-xs font-medium ${isSelected ? option.color : 'text-gray-600 dark:text-gray-400'}`}>
                        {option.label}
                      </span>
                    </div>
                  </motion.label>
                );
              })}
            </div>
          </div>
          
          {/* Due Date & Assigned To */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Due Date
              </label>
              <input
                type="date"
                {...register('dueDate')}
                className="w-full px-4 py-3 rounded-2xl bg-gray-100 dark:bg-dark-300 border-2 border-transparent focus:border-primary-500 focus:ring-2 focus:ring-primary-500 transition-all duration-200 text-gray-900 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <User className="h-4 w-4 inline mr-1" />
                Assign To
              </label>
              <input
                {...register('assignedTo')}
                className="w-full px-4 py-3 rounded-2xl bg-gray-100 dark:bg-dark-300 border-2 border-transparent focus:border-primary-500 focus:ring-2 focus:ring-primary-500 transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500"
                placeholder="User ID (optional)"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Leave empty to assign to yourself
              </p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-2xl bg-gray-100 dark:bg-dark-300 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-200 dark:hover:bg-dark-400 transition-all duration-200"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {task ? 'Updating...' : 'Creating...'}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  {task ? 'Update Task' : 'Create Task'}
                </span>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default TaskForm;