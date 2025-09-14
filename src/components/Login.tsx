import React, { useState } from 'react';
import { LogIn, Building } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  organization: string;
  role: string;
}

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedOrg, setSelectedOrg] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');

  // Mock organizations
  const organizations = [
    { id: 'tech-corp', name: 'TechCorp Solutions', color: 'blue' },
    { id: 'innovate-ltd', name: 'Innovate Ltd', color: 'green' }
  ];

  // Mock users database
  const mockUsers = [
    {
      id: '1',
      name: 'John Smith',
      email: 'john@techcorp.com',
      password: 'password',
      organization: 'TechCorp Solutions',
      role: 'Project Manager'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah@innovate.com',
      password: 'password',
      organization: 'Innovate Ltd',
      role: 'Developer'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isRegistering) {
      // Mock registration
      if (name && email && password && selectedOrg) {
        const orgName = organizations.find(org => org.id === selectedOrg)?.name || '';
        const newUser: User = {
          id: Date.now().toString(),
          name,
          email,
          organization: orgName,
          role: 'Team Member'
        };
        onLogin(newUser);
      } else {
        alert('Please fill in all fields');
      }
    } else {
      // Mock login
      const user = mockUsers.find(u => u.email === email && u.password === password);
      if (user) {
        onLogin({
          id: user.id,
          name: user.name,
          email: user.email,
          organization: user.organization,
          role: user.role
        });
      } else {
        alert('Invalid credentials. Try john@techcorp.com or sarah@innovate.com with password "password"');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <Building className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">OrgConnect</h1>
          <p className="text-gray-600">Collaborative Project Management</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {isRegistering && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Enter your full name"
                required
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Enter your password"
              required
            />
          </div>

          {isRegistering && (
            <div>
              <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-2">
                Organization
              </label>
              <select
                id="organization"
                value={selectedOrg}
                onChange={(e) => setSelectedOrg(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                required
              >
                <option value="">Select your organization</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <LogIn className="h-5 w-5 mr-2" />
            {isRegistering ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        {/* Toggle Register/Login */}
        <div className="mt-6 text-center">
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            {isRegistering ? 'Already have an account? Sign in' : 'Need an account? Register'}
          </button>
        </div>

        {/* Demo Credentials */}
        {!isRegistering && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Demo Credentials:</h3>
            <div className="text-xs text-gray-600 space-y-1">
              <p><strong>TechCorp:</strong> john@techcorp.com / password</p>
              <p><strong>Innovate:</strong> sarah@innovate.com / password</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;