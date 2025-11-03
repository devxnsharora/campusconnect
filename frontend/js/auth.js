// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupAuthForms();
});

// Check if user is authenticated
function checkAuth() {
    const token = getToken();
    const userData = getUserData();

    if (token && userData) {
        showApp();
        displayUserInfo(userData);
        loadPosts();
    } else {
        showAuth();
    }
}

// Show authentication section
function showAuth() {
    document.getElementById('authSection').style.display = 'flex';
    document.getElementById('appSection').style.display = 'none';
    document.getElementById('navActions').style.display = 'none';
}

// Show main app section
function showApp() {
    document.getElementById('authSection').style.display = 'none';
    document.getElementById('appSection').style.display = 'block';
    document.getElementById('navActions').style.display = 'block';
}

// Switch between login and register tabs
function switchAuthTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const tabs = document.querySelectorAll('.auth-tab');

    tabs.forEach(t => t.classList.remove('active'));

    if (tab === 'login') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        tabs[0].classList.add('active');
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        tabs[1].classList.add('active');
    }
}

// Setup auth form handlers
function setupAuthForms() {
    // Login form
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await loginUser(email, password);
            
            if (response.success) {
                // Store token and user data
                localStorage.setItem('token', response.token);
                setUserData(response.user);
                
                showToast('Login successful! Welcome back!', 'success');
                
                // Show app
                setTimeout(() => {
                    showApp();
                    displayUserInfo(response.user);
                    loadPosts();
                }, 1000);
            }
        } catch (error) {
            showToast(error.message || 'Login failed', 'error');
        }
    });

    // Register form
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('registerUsername').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const major = document.getElementById('registerMajor').value;
        const year = document.getElementById('registerYear').value;

        // Basic validation
        if (password.length < 6) {
            showToast('Password must be at least 6 characters', 'error');
            return;
        }

        try {
            const response = await registerUser(username, email, password, major, year);
            
            if (response.success) {
                showToast('Registration successful! Please login.', 'success');
                
                // Switch to login tab
                setTimeout(() => {
                    switchAuthTab('login');
                    document.getElementById('loginEmail').value = email;
                }, 1500);
            }
        } catch (error) {
            showToast(error.message || 'Registration failed', 'error');
        }
    });
}

// Display user information
function displayUserInfo(user) {
    document.getElementById('userName').textContent = user.username;
    document.getElementById('userDetails').textContent = 
        `${user.profile.major} • Year ${user.profile.year}`;
    document.getElementById('userAvatar').src = user.profile.avatar;
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        removeToken();
        localStorage.removeItem('userData');
        showToast('Logged out successfully', 'success');
        
        setTimeout(() => {
            showAuth();
            // Clear forms
            document.getElementById('loginForm').reset();
            document.getElementById('registerForm').reset();
        }, 1000);
    }
}