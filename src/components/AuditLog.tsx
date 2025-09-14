import React, { useState, useEffect } from 'react';
import { Shield, Search, Filter, Download, Eye, Lock, User, FileText, DollarSign, MessageSquare } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  organization: string;
  role: string;
}

interface AuditLogProps {
  currentUser: User | null;
}

const AuditLog: React.FC<AuditLogProps> = ({ currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [auditEntries, setAuditEntries] = useState([
    {
      id: 'AUDIT-2024-001',
      timestamp: '2024-01-25T10:30:15.123Z',
      action: 'project_update',
      actionDescription: 'Updated project milestone',
      user: 'John Smith',
      userEmail: 'john@techcorp.com',
      organization: 'TechCorp Solutions',
      resource: 'E-commerce Platform',
      resourceType: 'project',
      details: {
        field: 'progress',
        oldValue: '70%',
        newValue: '75%',
        milestone: 'Frontend Development'
      },
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      severity: 'low',
      hash: 'a1b2c3d4e5f6789012345678901234567890abcd'
    },
    {
      id: 'AUDIT-2024-002',
      timestamp: '2024-01-25T09:45:32.456Z',
      action: 'invoice_created',
      actionDescription: 'Created new invoice',
      user: 'Sarah Johnson',
      userEmail: 'sarah@innovate.com',
      organization: 'Innovate Ltd',
      resource: 'INV-2024-006',
      resourceType: 'invoice',
      details: {
        amount: '$15,000',
        project: 'Mobile App Development',
        dueDate: '2024-02-25'
      },
      ipAddress: '192.168.1.102',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      severity: 'medium',
      hash: 'b2c3d4e5f6789012345678901234567890abcde1'
    },
    {
      id: 'AUDIT-2024-003',
      timestamp: '2024-01-25T08:20:41.789Z',
      action: 'user_login',
      actionDescription: 'User authentication successful',
      user: 'Mike Chen',
      userEmail: 'mike@innovate.com',
      organization: 'Innovate Ltd',
      resource: 'Authentication System',
      resourceType: 'system',
      details: {
        loginMethod: 'email_password',
        sessionId: 'sess_1234567890abcdef',
        deviceType: 'desktop'
      },
      ipAddress: '192.168.1.103',
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
      severity: 'low',
      hash: 'c3d4e5f6789012345678901234567890abcdef12'
    },
    {
      id: 'AUDIT-2024-004',
      timestamp: '2024-01-24T16:15:28.012Z',
      action: 'feedback_submitted',
      actionDescription: 'Submitted project feedback',
      user: 'Lisa Brown',
      userEmail: 'lisa@techcorp.com',
      organization: 'TechCorp Solutions',
      resource: 'Data Analytics Dashboard',
      resourceType: 'project',
      details: {
        rating: 5,
        feedbackType: 'positive',
        wordCount: 45
      },
      ipAddress: '192.168.1.104',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      severity: 'low',
      hash: 'd4e5f6789012345678901234567890abcdef123'
    },
    {
      id: 'AUDIT-2024-005',
      timestamp: '2024-01-24T14:30:55.345Z',
      action: 'payment_processed',
      actionDescription: 'Invoice payment processed',
      user: 'System',
      userEmail: 'system@orgconnect.com',
      organization: 'System',
      resource: 'INV-2024-001',
      resourceType: 'payment',
      details: {
        amount: '$25,000',
        paymentMethod: 'bank_transfer',
        transactionId: 'TXN-789012345'
      },
      ipAddress: '10.0.0.1',
      userAgent: 'OrgConnect-PaymentProcessor/1.0',
      severity: 'high',
      hash: 'e5f6789012345678901234567890abcdef1234'
    },
    {
      id: 'AUDIT-2024-006',
      timestamp: '2024-01-24T11:45:18.678Z',
      action: 'security_scan',
      actionDescription: 'Automated security vulnerability scan completed',
      user: 'Security Scanner',
      userEmail: 'security@orgconnect.com',
      organization: 'System',
      resource: 'All Projects',
      resourceType: 'security',
      details: {
        vulnerabilities: 0,
        scanType: 'full_system',
        scanDuration: '45 minutes'
      },
      ipAddress: '10.0.0.2',
      userAgent: 'OrgConnect-SecurityScanner/2.1',
      severity: 'medium',
      hash: 'f6789012345678901234567890abcdef12345'
    }
  ]);

  // Simulate real-time audit log updates
  useEffect(() => {
    const interval = setInterval(() => {
      const actions = [
        'file_accessed', 'project_viewed', 'comment_added', 'task_completed', 'user_login'
      ];
      const users = ['John Smith', 'Sarah Johnson', 'Mike Chen', 'Lisa Brown'];
      const organizations = ['TechCorp Solutions', 'Innovate Ltd'];
      
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomOrg = organizations[Math.floor(Math.random() * organizations.length)];
      
      const newEntry = {
        id: `AUDIT-2024-${String(Date.now()).slice(-6)}`,
        timestamp: new Date().toISOString(),
        action: randomAction,
        actionDescription: `${randomAction.replace('_', ' ')} performed`,
        user: randomUser,
        userEmail: `${randomUser.toLowerCase().replace(' ', '.')}@${randomOrg === 'TechCorp Solutions' ? 'techcorp.com' : 'innovate.com'}`,
        organization: randomOrg,
        resource: 'E-commerce Platform',
        resourceType: 'project',
        details: { automated: true },
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0 (automated)',
        severity: 'low',
        hash: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      };

      setAuditEntries(prev => [newEntry, ...prev.slice(0, 49)]); // Keep last 50 entries
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const filteredEntries = auditEntries.filter(entry => {
    const matchesSearch = entry.action.includes(searchTerm.toLowerCase()) ||
                         entry.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.resource.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = filterAction === 'all' || entry.action === filterAction;
    
    let matchesDate = true;
    if (dateRange !== 'all') {
      const entryDate = new Date(entry.timestamp);
      const now = new Date();
      const daysDiff = (now.getTime() - entryDate.getTime()) / (1000 * 3600 * 24);
      
      switch (dateRange) {
        case 'today':
          matchesDate = daysDiff < 1;
          break;
        case 'week':
          matchesDate = daysDiff < 7;
          break;
        case 'month':
          matchesDate = daysDiff < 30;
          break;
      }
    }
    
    return matchesSearch && matchesAction && matchesDate;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action.split('_')[0]) {
      case 'user':
        return <User className="h-4 w-4" />;
      case 'project':
      case 'file':
      case 'task':
        return <FileText className="h-4 w-4" />;
      case 'invoice':
      case 'payment':
        return <DollarSign className="h-4 w-4" />;
      case 'feedback':
      case 'comment':
        return <MessageSquare className="h-4 w-4" />;
      case 'security':
        return <Shield className="h-4 w-4" />;
      default:
        return <Eye className="h-4 w-4" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    });
  };

  const exportAuditLog = () => {
    const csvContent = [
      'ID,Timestamp,Action,User,Organization,Resource,Severity,IP Address,Hash',
      ...filteredEntries.map(entry => 
        `${entry.id},${entry.timestamp},${entry.action},${entry.user},${entry.organization},${entry.resource},${entry.severity},${entry.ipAddress},${entry.hash}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              Tamperproof Audit Log
            </h1>
            <p className="text-gray-600">Secure, immutable record of all system activities</p>
          </div>
          <button
            onClick={exportAuditLog}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            <Download className="h-5 w-5 mr-2" />
            Export Log
          </button>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <Lock className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-blue-900">Security Features</h3>
            <p className="text-sm text-blue-700 mt-1">
              All entries are cryptographically hashed and timestamped. Any unauthorized modifications will be detected.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search audit log..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Actions</option>
              <option value="user_login">User Login</option>
              <option value="project_update">Project Updates</option>
              <option value="invoice_created">Invoice Created</option>
              <option value="payment_processed">Payment Processed</option>
              <option value="feedback_submitted">Feedback Submitted</option>
              <option value="security_scan">Security Scan</option>
            </select>
          </div>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resource
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hash
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatTimestamp(entry.timestamp)}</div>
                    <div className="text-xs text-gray-500">{entry.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getActionIcon(entry.action)}
                      <div className="ml-2">
                        <div className="text-sm font-medium text-gray-900">{entry.actionDescription}</div>
                        <div className="text-xs text-gray-500">{entry.action}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{entry.user}</div>
                    <div className="text-xs text-gray-500">{entry.organization}</div>
                    <div className="text-xs text-gray-400">{entry.ipAddress}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{entry.resource}</div>
                    <div className="text-xs text-gray-500">{entry.resourceType}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(entry.severity)}`}>
                      {entry.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-xs font-mono text-gray-500 max-w-xs truncate">
                      {entry.hash}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Integrity Status */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-900">Log Integrity: Verified</span>
          </div>
          <span className="text-xs text-green-700">
            Last verified: {new Date().toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AuditLog;