import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { taskService } from '../services/api';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { TrendingUp, Target, CheckCircle, Clock, Activity, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const COLORS = ['#f59e0b', '#3b82f6', '#10b981'];

const Analytics = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => taskService.getAnalytics(),
  });

  const { data: tasksData } = useQuery({
    queryKey: ['all-tasks-analytics'],
    queryFn: () => taskService.getTasks({ limit: 100 }),
  });

  const analytics = data?.data?.analytics;
  const tasks = tasksData?.data?.tasks || [];

  // Prepare progress data for the last 7 days
  const getLast7DaysProgress = () => {
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const tasksOnDate = tasks.filter(task => {
        const taskDate = new Date(task.createdAt).toISOString().split('T')[0];
        return taskDate === dateStr;
      });
      
      const completedOnDate = tasksOnDate.filter(task => task.status === 'Done').length;
      
      last7Days.push({
        date: dateStr,
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        created: tasksOnDate.length,
        completed: completedOnDate,
        completionRate: tasksOnDate.length > 0 ? (completedOnDate / tasksOnDate.length) * 100 : 0,
      });
    }
    return last7Days;
  };

  // Prepare monthly progress data
  const getMonthlyProgress = () => {
    const monthlyData = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    months.forEach((month, index) => {
      const monthTasks = tasks.filter(task => {
        const taskDate = new Date(task.createdAt);
        return taskDate.getMonth() === index;
      });
      
      monthlyData.push({
        month,
        tasks: monthTasks.length,
        completed: monthTasks.filter(t => t.status === 'Done').length,
      });
    });
    
    return monthlyData;
  };

  const weeklyProgress = getLast7DaysProgress();
  const monthlyProgress = getMonthlyProgress();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  const statusData = analytics ? [
    { name: 'Todo', value: analytics.statusBreakdown.Todo },
    { name: 'In Progress', value: analytics.statusBreakdown.InProgress },
    { name: 'Done', value: analytics.statusBreakdown.Done },
  ] : [];

  const priorityData = analytics ? [
    { name: 'Low', value: analytics.priorityBreakdown.Low },
    { name: 'Medium', value: analytics.priorityBreakdown.Medium },
    { name: 'High', value: analytics.priorityBreakdown.High },
  ] : [];

  const stats = [
    { label: 'Total Tasks', value: analytics?.totalTasks || 0, icon: Target, color: 'text-blue-600', bg: 'bg-blue-50', change: '+12%' },
    { label: 'Completed', value: analytics?.completedTasks || 0, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', change: '+8%' },
    { label: 'Pending', value: analytics?.pendingTasks || 0, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', change: '-5%' },
    { label: 'Completion Rate', value: `${analytics?.completionPercentage || 0}%`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50', change: '+15%' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-r from-primary-600 via-primary-500 to-purple-600 rounded-3xl shadow-xl"
      >
        <div className="relative p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
              <p className="text-primary-100 mt-2">Track your productivity and task insights</p>
            </div>
            <Activity className="h-12 w-12 text-white/20" />
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`${stat.bg} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300`}
          >
            <div className="flex items-center justify-between mb-3">
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
              <span className={`text-xs font-semibold ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change}
              </span>
            </div>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Weekly Progress Graph - New Feature */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/80 dark:bg-dark-200/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary-600" />
              Weekly Progress
            </h2>
            <p className="text-sm text-gray-500 mt-1">Task creation and completion over the last 7 days</p>
          </div>
          <div className="flex gap-3">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-xs text-gray-600">Created</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-600">Completed</span>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={weeklyProgress}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="day" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                borderRadius: '12px',
                border: 'none',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="created" 
              stroke="#3b82f6" 
              fill="#3b82f6" 
              fillOpacity={0.2}
              strokeWidth={2}
            />
            <Area 
              type="monotone" 
              dataKey="completed" 
              stroke="#10b981" 
              fill="#10b981" 
              fillOpacity={0.2}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
        
        {/* Completion Rate Trend */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-dark-300">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Completion Rate Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weeklyProgress}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" stroke="#6b7280" />
              <YAxis stroke="#6b7280" unit="%" />
              <Tooltip 
                formatter={(value) => [`${value.toFixed(1)}%`, 'Completion Rate']}
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                  borderRadius: '12px',
                  border: 'none'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="completionRate" 
                stroke="#8b5cf6" 
                strokeWidth={3}
                dot={{ fill: '#8b5cf6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Monthly Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-white/80 dark:bg-dark-200/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg"
      >
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary-600" />
          Monthly Performance
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyProgress}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                borderRadius: '12px',
                border: 'none'
              }}
            />
            <Bar dataKey="tasks" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Tasks Created" />
            <Bar dataKey="completed" fill="#10b981" radius={[8, 8, 0, 0]} name="Tasks Completed" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Status & Priority Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 dark:bg-dark-200/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Task Status Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 dark:bg-dark-200/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Priority Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={priorityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Key Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/80 dark:bg-dark-200/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg"
      >
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Key Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/10 rounded-2xl">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Tasks Due Soon</p>
            <p className="text-3xl font-bold text-orange-600">{analytics?.tasksDueSoon || 0}</p>
            <p className="text-xs text-gray-500 mt-2">Due in the next 7 days</p>
          </div>
          <div className="p-5 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 rounded-2xl">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Productivity Score</p>
            <p className="text-3xl font-bold text-green-600">
              {analytics?.completionPercentage > 70 ? 'Excellent' : 
               analytics?.completionPercentage > 40 ? 'Good' : 'Needs Improvement'}
            </p>
            <p className="text-xs text-gray-500 mt-2">{analytics?.completionPercentage}% completion rate</p>
          </div>
          <div className="p-5 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10 rounded-2xl">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Weekly Growth</p>
            <p className="text-3xl font-bold text-purple-600">
              {weeklyProgress[weeklyProgress.length - 1]?.created - weeklyProgress[0]?.created > 0 ? '+' : ''}
              {weeklyProgress[weeklyProgress.length - 1]?.created - weeklyProgress[0]?.created || 0}
            </p>
            <p className="text-xs text-gray-500 mt-2">Tasks created this week</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;