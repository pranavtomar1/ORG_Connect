import React, { useState, useEffect } from 'react';
import { BarChart3, Users, DollarSign, Clock, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  organization: string;
  role: string;
}

interface DashboardProps {
  currentUser: User | null;
}

const Dashboard: React.FC<DashboardProps> = ({ currentUser }) => {
  const [realtimeData, setRealtimeData] = useState({
    activeProjects: 8,
    completedTasks: 156,
    pendingInvoices: 12,
    teamMembers: 24
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealtimeData(prev => ({
        activeProjects: prev.activeProjects + Math.floor(Math.random() * 3) - 1,
        completedTasks: prev.completedTasks + Math.floor(Math.random() * 5),
        pendingInvoices: Math.max(0, prev.pendingInvoices + Math.floor(Math.random() * 3) - 1),
        teamMembers: prev.teamMembers + Math.floor(Math.random() * 2) - 0.5
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const projects = [
    {
      id: 1,
      name: 'E-commerce Platform',
      progress: 75,
      status: 'on-track',
      deadline: '2024-02-15',
      team: 'TechCorp Solutions'
    },
    {
      id: 2,
      name: 'Mobile App Development',
      progress: 45,
      status: 'at-risk',
      deadline: '2024-03-01',
      team: 'Innovate Ltd'
    },
    {
      id: 3,
      name: 'Data Analytics Dashboard',
      progress: 90,
      status: 'on-track',
      deadline: '2024-01-30',
      team: 'TechCorp Solutions'
    },
    {
      id: 4,
      name: 'CRM Integration',
      progress: 30,
      status: 'delayed',
      deadline: '2024-02-28',
      team: 'Innovate Ltd'
    }
  ];

  const recentActivities = [
    { id: 1, action: 'Project milestone completed', project: 'E-commerce Platform', time: '2 minutes ago', user: 'John Smith' },
    { id: 2, action: 'Invoice approved', project: 'Mobile App Development', time: '15 minutes ago', user: 'Sarah Johnson' },
    { id: 3, action: 'New comment added', project: 'Data Analytics Dashboard', time: '1 hour ago', user: 'Mike Chen' },
    { id: 4, action: 'Task assigned', project: 'CRM Integration', time: '2 hours ago', user: 'Emma Wilson' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track':
        return 'text-green-600 bg-green-50';
      case 'at-risk':
        return 'text-yellow-600 bg-yellow-50';
      case 'delayed':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on-track':
        return <CheckCircle className="h-4 w-4" />;
      case 'at-risk':
      case 'delayed':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {currentUser?.name}!
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your projects at {currentUser?.organization}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Projects</p>
              <p className="text-2xl font-bold text-gray-900">{realtimeData.activeProjects}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-600" />
          </div>
          <div className="mt-4">
            <span className="inline-flex items-center text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              +2.5% from last month
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{realtimeData.completedTasks}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <div className="mt-4">
            <span className="inline-flex items-center text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              +12% from last week
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Invoices</p>
              <p className="text-2xl font-bold text-gray-900">{realtimeData.pendingInvoices}</p>
            </div>
            <DollarSign className="h-8 w-8 text-orange-600" />
          </div>
          <div className="mt-4">
            <span className="inline-flex items-center text-sm text-orange-600">
              <Clock className="h-4 w-4 mr-1" />
              Requires attention
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Team Members</p>
              <p className="text-2xl font-bold text-gray-900">{Math.floor(realtimeData.teamMembers)}</p>
            </div>
            <Users className="h-8 w-8 text-purple-600" />
          </div>
          <div className="mt-4">
            <span className="inline-flex items-center text-sm text-gray-600">
              <Users className="h-4 w-4 mr-1" />
              Across all projects
            </span>
          </div>
        </div>
      </div>

      {/* Projects Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Project Progress</h2>
          <div className="space-y-6">
            {projects.map((project) => (
              <div key={project.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(project.status)}
                    <span className="font-medium text-gray-900">{project.name}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(project.status)}`}>
                    {project.status.replace('-', ' ')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{project.team}</span>
                  <span>Due: {project.deadline}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-600">{project.progress}% complete</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-600">{activity.project}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500">by {activity.user}</span>
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;