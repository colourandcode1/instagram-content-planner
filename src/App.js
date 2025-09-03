import React, { useState, useRef, useEffect } from 'react';
import { Calendar, List, Upload, Copy, Instagram, Camera, Video, Clock, Edit2, Trash2, Plus } from 'lucide-react';

const InstagramContentPlanner = () => {
  const [posts, setPosts] = useState([]);
  const [view, setView] = useState('calendar');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingPost, setEditingPost] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedPost, setDraggedPost] = useState(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  
  const fileInputRef = useRef(null);
  const today = new Date().toISOString().split('T')[0]);

  // Generate calendar days for current month
  const generateCalendarDays = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push(dateStr);
    }
    
    return days;
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newPost = {
          id: Date.now() + Math.random(),
          media: e.target.result,
          fileName: file.name,
          mediaType: file.type.startsWith('video/') ? 'video' : 'image',
          caption: '',
          scheduledDate: selectedDate,
          postType: 'feed',
          createdAt: new Date().toISOString()
        };
        setPosts(prev => [...prev, newPost]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragStart = (post) => {
    setIsDragging(true);
    setDraggedPost(post);
  };
  
  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedPost(null);
  };
  
  const handleDrop = (targetDate) => {
    if (draggedPost && targetDate) {
      updatePost(draggedPost.id, { scheduledDate: targetDate });
      handleDragEnd();
    }
  };

  const copyCaption = (caption) => {
    navigator.clipboard.writeText(caption);
  };

  const openInInstagram = (post) => {
    const message = post.postType === 'story' 
      ? 'Opening Instagram Stories...' 
      : 'Opening Instagram Feed composer...';
    
    alert(`${message}\n\nCaption copied to clipboard!\n\nIn a real app, this would:\n1. Copy your caption\n2. Open Instagram with your media\n3. Navigate to ${post.postType === 'story' ? 'Stories' : 'Feed'} composer`);
    
    copyCaption(post.caption);
  };

  const deletePost = (postId) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  const updatePost = (postId, updates) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, ...updates } : p));
    setEditingPost(null);
  };

  const getPostsForDate = (date) => {
    return posts.filter(post => post.scheduledDate === date);
  };

  const PostThumbnail = ({ post, inCalendar, onDragStart }) => {
    return (
      <div 
        draggable
        onDragStart={() => onDragStart(post)}
        className="relative group cursor-move"
      >
        <div className="w-full aspect-square bg-gray-100 rounded overflow-hidden">
          {post.mediaType === 'video' ? (
            <video src={post.media} className="w-full h-full object-cover" />
          ) : (
            <img src={post.media} alt="Thumbnail" className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all" />
        </div>
        <div className={`text-xs mt-1 px-1 py-0.5 rounded ${
          post.postType === 'story' ? 'bg-pink-100' : 'bg-blue-100'
        }`}>
          {post.postType === 'story' ? 'S' : 'F'}
        </div>
      </div>
    );
  };

  const PostCard = ({ post, compact = false }) => (
    <div className={`bg-white rounded-lg shadow-md border ${compact ? 'p-3' : 'p-4'} mb-3`}>
      <div className="flex gap-3">
        <div className={`${compact ? 'w-16 h-16' : 'w-20 h-20'} bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden`}>
          {post.mediaType === 'video' ? (
            <video src={post.media} className="w-full h-full object-cover" />
          ) : (
            <img src={post.media} alt="Content" className="w-full h-full object-cover" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {post.mediaType === 'video' ? (
              <Video className="w-4 h-4 text-purple-600" />
            ) : (
              <Camera className="w-4 h-4 text-blue-600" />
            )}
            <span className={`px-2 py-1 text-xs rounded-full ${
              post.postType === 'story' 
                ? 'bg-pink-100 text-pink-700' 
                : 'bg-blue-100 text-blue-700'
            }`}>
              {post.postType === 'story' ? 'Story' : 'Feed'}
            </span>
            <span className="text-sm text-gray-500">{post.scheduledDate}</span>
          </div>
          
          {!compact && (
            <div className="mb-3">
              <p className="text-sm text-gray-700 line-clamp-2">{post.caption || 'No caption yet...'}</p>
            </div>
          )}
          
          <div className="flex gap-2">
            <button
              onClick={() => openInInstagram(post)}
              className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              <Instagram className="w-4 h-4" />
              Post to IG
            </button>
            
            {post.caption && (
              <button
                onClick={() => copyCaption(post.caption)}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Copy className="w-4 h-4" />
                Copy
              </button>
            )}
            
            <button
              onClick={() => setEditingPost(post)}
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => deletePost(post.id)}
              className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 text-sm rounded-lg hover:bg-red-200 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const EditModal = ({ post, onSave, onCancel }) => {
    const [caption, setCaption] = useState(post.caption);
    const [postType, setPostType] = useState(post.postType);
    const [scheduledDate, setScheduledDate] = useState(post.scheduledDate);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4">Edit Post</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Post Type</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setPostType('feed')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    postType === 'feed' 
                      ? 'bg-blue-100 text-blue-700 border-2 border-blue-300' 
                      : 'bg-gray-100 text-gray-600 border-2 border-transparent'
                  }`}
                >
                  Feed Post
                </button>
                <button
                  onClick={() => setPostType('story')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    postType === 'story' 
                      ? 'bg-pink-100 text-pink-700 border-2 border-pink-300' 
                      : 'bg-gray-100 text-gray-600 border-2 border-transparent'
                  }`}
                >
                  Story
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled Date</label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Caption</label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write your caption here..."
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          </div>
          
          <div className="flex gap-3 mt-6">
            <button
              onClick={onCancel}
              className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave({ caption, postType, scheduledDate })}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    );
  };

  const calendarDays = generateCalendarDays();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const currentMonth = monthNames[new Date().getMonth()];
  const currentYear = new Date().getFullYear();

  // Track mouse position for drag preview
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        setDragPosition({ x: e.clientX, y: e.clientY });
      }
    };
    
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      return () => document.removeEventListener('mousemove', handleMouseMove);
    }
  }, [isDragging]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Instagram className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Content Planner</h1>
                <p className="text-sm text-gray-600">Plan your Instagram posts & stories</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*,video/*"
                multiple
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Upload className="w-4 h-4" />
                Add Content
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* View Toggle */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex gap-2">
          <button
            onClick={() => setView('calendar')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              view === 'calendar' 
                ? 'bg-blue-100 text-blue-700 font-medium' 
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Calendar View
          </button>
          <button
            onClick={() => setView('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              view === 'list' 
                ? 'bg-blue-100 text-blue-700 font-medium' 
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <List className="w-4 h-4" />
            List View
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 pb-8">
        {view === 'calendar' ? (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {currentMonth} {currentYear}
            </h2>
            
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Day headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
              
              {/* Calendar days */}
              {calendarDays.map((date, index) => {
                const dayPosts = date ? getPostsForDate(date) : [];
                const isToday = date === today;
                const isSelected = date === selectedDate;
                
                return (
                  <div
                    key={index}
                    onClick={() => date && setSelectedDate(date)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(date)}
                    className={`min-h-[100px] p-2 border rounded-lg cursor-pointer transition-all ${
                      !date 
                        ? 'bg-gray-50 cursor-default' 
                        : isSelected 
                          ? 'bg-blue-50 border-blue-300'
                          : isToday 
                            ? 'bg-yellow-50 border-yellow-300'
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {date && (
                      <>
                        <div className={`text-sm font-medium mb-1 ${
                          isToday ? 'text-yellow-700' : isSelected ? 'text-blue-700' : 'text-gray-700'
                        }`}>
                          {parseInt(date.split('-')[2])}
                        </div>
                        
                        <div className="space-y-1">
                          {dayPosts.slice(0, 2).map(post => (
                            <PostThumbnail
                              key={post.id}
                              post={post}
                              inCalendar={true}
                              onDragStart={handleDragStart}
                            />
                          ))}
                          {dayPosts.length > 2 && (
                            <div className="text-xs text-gray-500 text-center">
                              +{dayPosts.length - 2} more
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Selected Date Posts */}
            {selectedDate && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Posts for {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h3>
                
                {getPostsForDate(selectedDate).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p>No posts scheduled for this date</p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Add content for this day
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {getPostsForDate(selectedDate).map(post => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* List View */
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                All Scheduled Posts ({posts.length})
              </h2>
              
              {posts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No content yet</h3>
                  <p className="text-gray-600 mb-4">Upload your first photo or video to get started</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Content
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {posts
                    .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate))
                    .map(post => (
                      <PostCard key={post.id} post={post} />
                    ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingPost && (
        <EditModal
          post={editingPost}
          onSave={(updates) => updatePost(editingPost.id, updates)}
          onCancel={() => setEditingPost(null)}
        />
      )}

      {/* Drag Preview */}
      {isDragging && draggedPost && (
        <div
          className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2"
          style={{
            left: dragPosition.x,
            top: dragPosition.y,
          }}
        >
          <div className="w-16 h-16 bg-white rounded-lg shadow-xl border-2 border-blue-400 overflow-hidden rotate-3 scale-110">
            {draggedPost.mediaType === 'video' ? (
              <video src={draggedPost.media} className="w-full h-full object-cover" />
            ) : (
              <img src={draggedPost.media} alt="Dragging" className="w-full h-full object-cover" />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InstagramContentPlanner;
