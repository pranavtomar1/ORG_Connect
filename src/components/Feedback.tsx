import React, { useState } from 'react';
import { MessageSquare, Send, ThumbsUp, ThumbsDown, Star, Search, Filter, Plus } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  organization: string;
  role: string;
}

interface FeedbackProps {
  currentUser: User | null;
}

const Feedback: React.FC<FeedbackProps> = ({ currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProject, setFilterProject] = useState('all');
  const [newComment, setNewComment] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [rating, setRating] = useState(0);

  const [feedbacks, setFeedbacks] = useState([
    {
      id: 1,
      projectId: 1,
      projectName: 'E-commerce Platform',
      author: 'John Smith',
      authorOrg: 'TechCorp Solutions',
      comment: 'The new checkout flow is working great! Users are reporting a much smoother experience. The loading times have improved significantly.',
      rating: 5,
      timestamp: '2024-01-25T10:30:00Z',
      replies: [
        {
          id: 1,
          author: 'Sarah Johnson',
          authorOrg: 'Innovate Ltd',
          comment: 'Thanks for the feedback! We worked hard on optimizing the performance.',
          timestamp: '2024-01-25T14:15:00Z'
        }
      ],
      likes: 8,
      dislikes: 0
    },
    {
      id: 2,
      projectId: 2,
      projectName: 'Mobile App Development',
      author: 'Mike Chen',
      authorOrg: 'Innovate Ltd',
      comment: 'The iOS version needs some UI adjustments. The navigation feels a bit cramped on smaller devices. Overall good progress though.',
      rating: 3,
      timestamp: '2024-01-24T16:45:00Z',
      replies: [
        {
          id: 1,
          author: 'Emma Davis',
          authorOrg: 'Innovate Ltd',
          comment: 'Good point! I\'ll look into the navigation spacing for iPhone SE and similar devices.',
          timestamp: '2024-01-24T18:20:00Z'
        },
        {
          id: 2,
          author: 'John Smith',
          authorOrg: 'TechCorp Solutions',
          comment: 'We can schedule a review session to go over the mobile UI together.',
          timestamp: '2024-01-25T09:10:00Z'
        }
      ],
      likes: 5,
      dislikes: 1
    },
    {
      id: 3,
      projectId: 3,
      projectName: 'Data Analytics Dashboard',
      author: 'Lisa Brown',
      authorOrg: 'TechCorp Solutions',
      comment: 'Excellent work on the real-time charts! The data visualization is exactly what we needed for executive reporting.',
      rating: 5,
      timestamp: '2024-01-23T11:20:00Z',
      replies: [],
      likes: 12,
      dislikes: 0
    },
    {
      id: 4,
      projectId: 4,
      projectName: 'CRM Integration',
      author: 'Tom Wilson',
      authorOrg: 'Innovate Ltd',
      comment: 'The Salesforce integration is having some sync issues. Customer data is not updating consistently. Needs investigation.',
      rating: 2,
      timestamp: '2024-01-22T13:15:00Z',
      replies: [
        {
          id: 1,
          author: 'Kate Lee',
          authorOrg: 'Innovate Ltd',
          comment: 'I\'m looking into the API rate limiting issues. Should have a fix by tomorrow.',
          timestamp: '2024-01-22T15:30:00Z'
        }
      ],
      likes: 3,
      dislikes: 0
    }
  ]);

  const projects = [
    { id: 1, name: 'E-commerce Platform' },
    { id: 2, name: 'Mobile App Development' },
    { id: 3, name: 'Data Analytics Dashboard' },
    { id: 4, name: 'CRM Integration' },
    { id: 5, name: 'Security Audit' }
  ];

  const filteredFeedbacks = feedbacks.filter(feedback => {
    const matchesSearch = feedback.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feedback.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feedback.projectName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProject = filterProject === 'all' || feedback.projectId.toString() === filterProject;
    return matchesSearch && matchesProject;
  });

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedProject) return;

    const project = projects.find(p => p.id.toString() === selectedProject);
    const newFeedback = {
      id: Date.now(),
      projectId: parseInt(selectedProject),
      projectName: project?.name || '',
      author: currentUser?.name || 'Unknown',
      authorOrg: currentUser?.organization || 'Unknown',
      comment: newComment,
      rating: rating,
      timestamp: new Date().toISOString(),
      replies: [],
      likes: 0,
      dislikes: 0
    };

    setFeedbacks([newFeedback, ...feedbacks]);
    setNewComment('');
    setSelectedProject('');
    setRating(0);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Project Feedback</h1>
            <p className="text-gray-600">Share and track feedback for collaborative projects</p>
          </div>
        </div>
      </div>

      {/* Add Feedback Form */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Feedback</h2>
        <form onSubmit={handleSubmitFeedback} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select a project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-6 w-6 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Feedback</label>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={4}
              placeholder="Share your feedback, suggestions, or concerns..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              required
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <Send className="h-4 w-4 mr-2" />
              Submit Feedback
            </button>
          </div>
        </form>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search feedback..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Projects</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback List */}
      <div className="space-y-4">
        {filteredFeedbacks.map((feedback) => (
          <div key={feedback.id} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{feedback.author}</h3>
                    <span className="text-sm text-gray-500">from {feedback.authorOrg}</span>
                  </div>
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-sm text-blue-600 font-medium">{feedback.projectName}</span>
                    <div className="flex items-center space-x-1">
                      {getRatingStars(feedback.rating)}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">{formatTimestamp(feedback.timestamp)}</p>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-gray-700 leading-relaxed">{feedback.comment}</p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-1 text-sm text-gray-600 hover:text-green-600 transition-colors">
                  <ThumbsUp className="h-4 w-4" />
                  <span>{feedback.likes}</span>
                </button>
                <button className="flex items-center space-x-1 text-sm text-gray-600 hover:text-red-600 transition-colors">
                  <ThumbsDown className="h-4 w-4" />
                  <span>{feedback.dislikes}</span>
                </button>
                <span className="text-sm text-gray-500">
                  {feedback.replies.length} {feedback.replies.length === 1 ? 'reply' : 'replies'}
                </span>
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors">
                Reply
              </button>
            </div>

            {/* Replies */}
            {feedback.replies.length > 0 && (
              <div className="mt-6 pl-14 space-y-4 border-l-2 border-gray-100">
                {feedback.replies.map((reply) => (
                  <div key={reply.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{reply.author}</span>
                        <span className="text-sm text-gray-500">from {reply.authorOrg}</span>
                      </div>
                      <span className="text-sm text-gray-500">{formatTimestamp(reply.timestamp)}</span>
                    </div>
                    <p className="text-gray-700">{reply.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Feedback;