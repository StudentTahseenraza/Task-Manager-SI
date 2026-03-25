import React from 'react';
import { format } from 'date-fns';
import { Calendar, Flag, Edit2, Trash2, CheckCircle, Circle } from 'lucide-react';
import { STATUS_COLORS, PRIORITY_COLORS, TASK_STATUS } from '../../constants/constants';
import { motion } from 'framer-motion';

const TaskCard = ({ task, onEdit, onDelete, onStatusChange }) => {
  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'High':
        return <Flag className="h-4 w-4 text-red-500" />;
      case 'Medium':
        return <Flag className="h-4 w-4 text-orange-500" />;
      default:
        return <Flag className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="bg-white/80 dark:bg-dark-200/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <button
              onClick={() => onStatusChange(task._id, task.status === TASK_STATUS.DONE ? TASK_STATUS.TODO : TASK_STATUS.DONE)}
              className="focus:outline-none"
            >
              {task.status === TASK_STATUS.DONE ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <Circle className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
              )}
            </button>
            <h3 className={`font-semibold text-lg ${task.status === TASK_STATUS.DONE ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
              {task.title}
            </h3>
          </div>
          
          {task.description && (
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
              {task.description}
            </p>
          )}
          
          <div className="flex flex-wrap gap-2 mb-3">
            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[task.status]}`}>
              {task.status}
            </span>
            <span className={`px-2.5 py-1 text-xs font-medium rounded-full flex items-center space-x-1 ${PRIORITY_COLORS[task.priority]}`}>
              {getPriorityIcon(task.priority)}
              <span>{task.priority}</span>
            </span>
            {task.dueDate && (
              <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 dark:bg-dark-300 dark:text-gray-300 flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>{format(new Date(task.dueDate), 'MMM dd, yyyy')}</span>
              </span>
            )}
          </div>
          
          <div className="text-xs text-gray-500">
            Created by: {task.createdBy?.name || 'Unknown'}
          </div>
        </div>
        
        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={() => onEdit(task)}
            className="p-2 text-gray-500 hover:text-primary-600 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-300 transition-all duration-200"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(task._id)}
            className="p-2 text-gray-500 hover:text-red-600 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-300 transition-all duration-200"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default TaskCard;