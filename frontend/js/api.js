// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Toast Notification Function
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Get token from localStorage
function getToken() {
    return localStorage.getItem('token');
}

// Set token in localStorage
function setToken(token) {
    localStorage.setItem('token');
}

// Remove token from localStorage
function removeToken() {
    localStorage.removeItem('token');
}

// Get user data from localStorage
function getUserData() {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
}

// Set user data in localStorage
function setUserData(data) {
    localStorage.setItem('userData', JSON.stringify(data));
}

// API Helper Function
async function apiCall(endpoint, method = 'GET', body = null, requiresAuth = false) {
    const headers = {
        'Content-Type': 'application/json'
    };

    if (requiresAuth) {
        const token = getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    const config = {
        method,
        headers
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Something went wrong');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Auth API Calls
async function registerUser(username, email, password, major, year) {
    return await apiCall('/auth/register', 'POST', {
        username,
        email,
        password,
        major,
        year: parseInt(year)
    });
}

async function loginUser(email, password) {
    return await apiCall('/auth/login', 'POST', { email, password });
}

// User API Calls
async function getUserProfile(userId) {
    return await apiCall(`/users/${userId}`, 'GET', null, true);
}

async function updateUserProfile(userId, profileData) {
    return await apiCall(`/users/${userId}`, 'PUT', profileData, true);
}

// Post API Calls
async function createPost(postData) {
    return await apiCall('/posts', 'POST', postData, true);
}

async function getAllPosts(category = '', search = '') {
    let endpoint = '/posts?';
    if (category && category !== 'All') {
        endpoint += `category=${category}&`;
    }
    if (search) {
        endpoint += `search=${encodeURIComponent(search)}`;
    }
    return await apiCall(endpoint, 'GET', null, true);
}

async function getPost(postId) {
    return await apiCall(`/posts/${postId}`, 'GET', null, true);
}

async function updatePost(postId, postData) {
    return await apiCall(`/posts/${postId}`, 'PUT', postData, true);
}

async function deletePost(postId) {
    return await apiCall(`/posts/${postId}`, 'DELETE', null, true);
}

// Comment API Calls
async function addComment(postId, text) {
    return await apiCall(`/posts/${postId}/comments`, 'POST', { text }, true);
}

async function deleteComment(postId, commentId) {
    return await apiCall(`/posts/${postId}/comments/${commentId}`, 'DELETE', null, true);
}

// Like API Calls
async function toggleLike(postId) {
    return await apiCall(`/posts/${postId}/like`, 'POST', null, true);
}

// Utility Functions
function formatTimeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60
    };
    
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
        }
    }
    
    return 'just now';
}

function getCategoryEmoji(category) {
    const emojis = {
        'General': '📌',
        'Study': '📚',
        'Events': '🎉',
        'Projects': '💻',
        'Help': '❓'
    };
    return emojis[category] || '📌';
}