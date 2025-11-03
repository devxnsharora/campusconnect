// Initialize posts functionality
document.addEventListener('DOMContentLoaded', () => {
    setupPostForm();
    setupEditForm();
});

// Setup create post form
function setupPostForm() {
    document.getElementById('createPostForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const title = document.getElementById('postTitle').value.trim();
        const content = document.getElementById('postContent').value.trim();
        const category = document.getElementById('postCategory').value;
        const tagsInput = document.getElementById('postTags').value.trim();
        const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()) : [];

        try {
            const response = await createPost({ title, content, category, tags });
            
            if (response.success) {
                showToast('Post created successfully!', 'success');
                
                // Clear form
                document.getElementById('createPostForm').reset();
                
                // Reload posts
                loadPosts();
            }
        } catch (error) {
            showToast(error.message || 'Failed to create post', 'error');
        }
    });
}

// Load all posts
async function loadPosts() {
    const category = document.getElementById('categoryFilter')?.value || '';
    const search = document.getElementById('searchInput')?.value || '';
    
    const postsFeed = document.getElementById('postsFeed');
    postsFeed.innerHTML = '<div class="loading">Loading posts...</div>';

    try {
        const response = await getAllPosts(category, search);
        
        if (response.success) {
            if (response.posts.length === 0) {
                postsFeed.innerHTML = `
                    <div class="empty-state">
                        <h3>No posts found</h3>
                        <p>Be the first to create a post!</p>
                    </div>
                `;
            } else {
                postsFeed.innerHTML = '';
                response.posts.forEach(post => {
                    postsFeed.appendChild(createPostCard(post));
                });
            }
        }
    } catch (error) {
        postsFeed.innerHTML = `
            <div class="empty-state">
                <h3>Error loading posts</h3>
                <p>${error.message}</p>
            </div>
        `;
    }
}

// Create post card element
function createPostCard(post) {
    const card = document.createElement('div');
    card.className = 'post-card';
    
    const userData = getUserData();
    const isOwner = userData && post.userId._id === userData.id;
    const isLiked = userData && post.likes.includes(userData.id);
    
    card.innerHTML = `
        <div class="post-header">
            <div class="post-author">
                <img src="${post.userId.profile.avatar}" alt="${post.userId.username}" class="post-avatar">
                <div class="author-info">
                    <h4>${post.userId.username}</h4>
                    <p>${post.userId.profile.major} • ${formatTimeAgo(post.createdAt)}</p>
                </div>
            </div>
            ${isOwner ? `
                <div class="post-actions">
                    <button class="btn btn-small btn-outline" onclick="openEditModal('${post._id}')">Edit</button>
                    <button class="btn btn-small btn-danger" onclick="handleDeletePost('${post._id}')">Delete</button>
                </div>
            ` : ''}
        </div>
        
        <div class="post-category">
            ${getCategoryEmoji(post.category)} ${post.category}
        </div>
        
        <h3 class="post-title">${post.title}</h3>
        <p class="post-content">${post.content}</p>
        
        ${post.tags.length > 0 ? `
            <div class="post-tags">
                ${post.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
            </div>
        ` : ''}
        
        <div class="post-footer">
            <div class="post-stats">
                <button class="btn-like ${isLiked ? 'liked' : ''}" onclick="handleLike('${post._id}')">
                    ${isLiked ? '❤️' : '🤍'}
                </button>
                <span class="stat">
                    <span id="likes-${post._id}">${post.likes.length}</span> likes
                </span>
                <span class="stat">💬 ${post.comments.length} comments</span>
            </div>
            <button class="btn-comment" onclick="toggleComments('${post._id}')">
                ${post.comments.length > 0 ? 'View' : 'Add'} Comments
            </button>
        </div>
        
        <div id="comments-${post._id}" class="comments-section" style="display: none;">
            <div class="comment-form">
                <input type="text" id="comment-input-${post._id}" placeholder="Add a comment..." />
                <button class="btn btn-primary btn-small" onclick="handleAddComment('${post._id}')">Post</button>
            </div>
            <div class="comments-list" id="comments-list-${post._id}">
                ${post.comments.map(comment => createCommentHTML(comment, post._id, userData)).join('')}
            </div>
        </div>
    `;
    
    return card;
}

// Create comment HTML
function createCommentHTML(comment, postId, userData) {
    const isOwner = userData && comment.userId._id === userData.id;
    
    return `
        <div class="comment">
            <div class="comment-header">
                <span class="comment-author">${comment.userId.username}</span>
                <div>
                    <span class="comment-time">${formatTimeAgo(comment.createdAt)}</span>
                    ${isOwner ? `
                        <button class="btn-delete-comment" onclick="handleDeleteComment('${postId}', '${comment._id}')">
                            Delete
                        </button>
                    ` : ''}
                </div>
            </div>
            <p class="comment-text">${comment.text}</p>
        </div>
    `;
}

// Toggle comments visibility
function toggleComments(postId) {
    const commentsSection = document.getElementById(`comments-${postId}`);
    commentsSection.style.display = commentsSection.style.display === 'none' ? 'block' : 'none';
}

// Handle like/unlike
async function handleLike(postId) {
    try {
        const response = await toggleLike(postId);
        
        if (response.success) {
            // Update like count
            document.getElementById(`likes-${postId}`).textContent = response.likes;
            
            // Update button appearance
            const likeBtn = event.target;
            if (response.isLiked) {
                likeBtn.textContent = '❤️';
                likeBtn.classList.add('liked');
            } else {
                likeBtn.textContent = '🤍';
                likeBtn.classList.remove('liked');
            }
        }
    } catch (error) {
        showToast(error.message || 'Failed to like post', 'error');
    }
}

// Handle add comment
async function handleAddComment(postId) {
    const input = document.getElementById(`comment-input-${postId}`);
    const text = input.value.trim();
    
    if (!text) {
        showToast('Please enter a comment', 'error');
        return;
    }
    
    try {
        const response = await addComment(postId, text);
        
        if (response.success) {
            showToast('Comment added!', 'success');
            input.value = '';
            
            // Reload posts to show new comment
            loadPosts();
        }
    } catch (error) {
        showToast(error.message || 'Failed to add comment', 'error');
    }
}

// Handle delete comment
async function handleDeleteComment(postId, commentId) {
    if (!confirm('Delete this comment?')) return;
    
    try {
        const response = await deleteComment(postId, commentId);
        
        if (response.success) {
            showToast('Comment deleted!', 'success');
            loadPosts();
        }
    } catch (error) {
        showToast(error.message || 'Failed to delete comment', 'error');
    }
}

// Handle delete post
async function handleDeletePost(postId) {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
        const response = await deletePost(postId);
        
        if (response.success) {
            showToast('Post deleted successfully!', 'success');
            loadPosts();
        }
    } catch (error) {
        showToast(error.message || 'Failed to delete post', 'error');
    }
}

// Open edit modal
async function openEditModal(postId) {
    try {
        const response = await getPost(postId);
        
        if (response.success) {
            const post = response.post;
            
            document.getElementById('editPostId').value = post._id;
            document.getElementById('editPostTitle').value = post.title;
            document.getElementById('editPostContent').value = post.content;
            document.getElementById('editPostCategory').value = post.category;
            document.getElementById('editPostTags').value = post.tags.join(', ');
            
            document.getElementById('editModal').classList.add('show');
        }
    } catch (error) {
        showToast(error.message || 'Failed to load post', 'error');
    }
}

// Close edit modal
function closeEditModal() {
    document.getElementById('editModal').classList.remove('show');
}

// Setup edit form
function setupEditForm() {
    document.getElementById('editPostForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const postId = document.getElementById('editPostId').value;
        const title = document.getElementById('editPostTitle').value.trim();
        const content = document.getElementById('editPostContent').value.trim();
        const category = document.getElementById('editPostCategory').value;
        const tagsInput = document.getElementById('editPostTags').value.trim();
        const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()) : [];

        try {
            const response = await updatePost(postId, { title, content, category, tags });
            
            if (response.success) {
                showToast('Post updated successfully!', 'success');
                closeEditModal();
                loadPosts();
            }
        } catch (error) {
            showToast(error.message || 'Failed to update post', 'error');
        }
    });
}

// Search posts (debounced)
let searchTimeout;
function searchPosts() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        loadPosts();
    }, 500);
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('editModal');
    if (event.target === modal) {
        closeEditModal();
    }
}