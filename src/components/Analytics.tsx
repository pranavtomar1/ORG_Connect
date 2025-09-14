import React, { useState, useEffect } from 'react';
import { TrendingUp, BarChart3, PieChart, Calendar, Target, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  organization: string;
  role: string;
}

interface AnalyticsProps {
  currentUser: User | null;
}

const Analytics: React.FC<AnalyticsProps> = ({ currentUser }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');
  const [analyticsData, setAnalyticsData] = useState({
    projectCompletionRate: 78,
    averageProjectDuration: 45,
    teamProductivity: 85,
    clientSatisfaction: 4.2,
    revenueGrowth: 12.5,
    upcomingDeadlines: 8
  });

  // Simulate real-time analytics updates
  useEffect(() => {
    const interval = setInterval(() => {
      setAnalyticsData(prev => ({
        projectCompletionRate: Math.max(60, Math.min(95, prev.projectCompletionRate + (Math.random() - 0.5) * 2)),
        averageProjectDuration: Math.max(30, Math.min(60, prev.averageProjectDuration + (Math.random() - 0.5) * 1)),
        teamProductivity: Math.max(70, Math.min(95, prev.teamProductivity + (Math.random() - 0.5) * 2)),
        clientSatisfaction: Math.max(3.5, Math.min(5, prev.clientSatisfaction + (Math.random() - 0.5) * 0.1)),
        revenueGrowth: Math.max(5, Math.min(25, prev.revenueGrowth + (Math.random() - 0.5) * 1)),
        upcomingDeadlines: Math.max(3, Math.min(15, prev.upcomingDeadlines + Math.floor((Math.random() - 0.5) * 2)))
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const projectPredictions = [
    {
      id: 1,
      name: 'E-commerce Platform',
      currentProgress: 75,
      predictedCompletion: '2024-02-10',
      originalDeadline: '2024-02-15',
      confidence: 92,
      status: 'on-track',
      remainingTasks: 8,
      riskFactors: ['Dependency on external API'],
      completionProbability: 94
    },
    {
      id: 2,
      name: 'Mobile App Development',
      currentProgress: 45,
      predictedCompletion: '2024-03-08',
      originalDeadline: '2024-03-01',
      confidence: 78,
      status: 'at-risk',
      remainingTasks: 15,
      riskFactors: ['Resource allocation', 'iOS review process'],
      completionProbability: 67
    },
    {
      id: 3,
      name: 'Data Analytics Dashboard',
      currentProgress: 90,
      predictedCompletion: '2024-01-28',
      originalDeadline: '2024-01-30',
      confidence: 98,
      status: 'ahead',
      remainingTasks: 3,
      riskFactors: [],
      completionProbability: 99
    },
    {
      id: 4,
      name: 'CRM Integration',
      currentProgress: 30,
      predictedCompletion: '2024-03-15',
      originalDeadline: '2024-02-28',
      confidence: 65,
      status: 'delayed',
      remainingTasks: 22,
      riskFactors: ['API limitations', 'Team availability', 'Scope creep'],
      completionProbability: 45
    }
  ];

  const performanceMetrics = [
    { label: 'Projects Completed', value: 23, change: '+15%', trend: 'up' },
    { label: 'Average Task Duration', value: '3.2 days', change: '-8%', trend: 'down' },
    { label: 'Client Retention Rate', value: '94%', change: '+3%', trend: 'up' },
    { label: 'Revenue Per Project', value: '$45,200', change: '+22%', trend: 'up' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track':
        return 'bg-green-100 text-green-800';
      case 'ahead':
        return 'bg-blue-100 text-blue-800';
      case 'at-risk':
        return 'bg-yellow-100 text-yellow-800';
      case 'delayed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on-track':
      case 'ahead':
        return <CheckCircle className="h-4 w-4" />;
      case 'at-risk':
      case 'delayed':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600 mr-3" />
              Predictive Analytics
            </h1>
            <p className="text-gray-600">AI-powered insights and project completion predictions</p>
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Timeframe:</label>
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.projectCompletionRate.toFixed(0)}%</p>
            </div>
            <Target className="h-8 w-8 text-green-600" />
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${analyticsData.projectCompletionRate}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Duration</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.averageProjectDuration.toFixed(0)} days</p>
            </div>
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
          <div className="mt-4">
            <span className="inline-flex items-center text-sm text-blue-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              Improving efficiency
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Team Productivity</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.teamProductivity.toFixed(0)}%</p>
            </div>
            <BarChart3 className="h-8 w-8 text-purple-600" />
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${analyticsData.teamProductivity}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Client Satisfaction</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.clientSatisfaction.toFixed(1)}/5</p>
            </div>
            <PieChart className="h-8 w-8 text-orange-600" />
          </div>
          <div className="mt-4 flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <div
                key={star}
                className={`h-4 w-4 rounded-full mr-1 ${
                  star <= analyticsData.clientSatisfaction ? 'bg-yellow-400' : 'bg-gray-200'
                }`}
              ></div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Trends */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Performance Trends</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {performanceMetrics.map((metric, index) => (
            <div key={index} className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-2">{metric.label}</p>
              <p className="text-2xl font-bold text-gray-900 mb-2">{metric.value}</p>
              <div className={`inline-flex items-center text-sm ${
                metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                <TrendingUp className={`h-4 w-4 mr-1 ${metric.trend === 'down' ? 'rotate-180' : ''}`} />
                {metric.change}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Project Completion Predictions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Project Completion Predictions</h2>
        <div className="space-y-6">
          {projectPredictions.map((project) => (
            <div key={project.id} className="border border-gray-200 rounded-lg p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                      {getStatusIcon(project.status)}
                      <span className="ml-1">{project.status.replace('-', ' ')}</span>
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Current Progress</p>
                      <div className="flex items-center mt-1">
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${project.currentProgress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{project.currentProgress}%</span>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600">Predicted Completion</p>
                      <p className="text-sm font-medium text-gray-900">{project.predictedCompletion}</p>
                      <p className="text-xs text-gray-500">Original: {project.originalDeadline}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600">Completion Probability</p>
                      <p className={`text-sm font-bold ${getConfidenceColor(project.completionProbability)}`}>
                        {project.completionProbability}%
                      </p>
                      <p className="text-xs text-gray-500">Confidence: {project.confidence}%</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Remaining Tasks</p>
                      <p className="text-sm font-medium text-gray-900">{project.remainingTasks} tasks</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600">Risk Factors</p>
                      {project.riskFactors.length > 0 ? (
                        <ul className="text-xs text-red-600 mt-1">
                          {project.riskFactors.map((risk, index) => (
                            <li key={index}>• {risk}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-green-600 mt-1">No identified risks</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">AI-Powered Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Productivity Recommendation</h3>
            <p className="text-sm text-gray-700">
              Based on current trends, consider reallocating resources from the Data Analytics Dashboard project 
              to Mobile App Development to meet the March 1st deadline.
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Risk Alert</h3>
            <p className="text-sm text-gray-700">
              CRM Integration project shows high delay probability. Recommended actions: Schedule stakeholder 
              review and consider scope reduction for critical path items.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;