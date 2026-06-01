/**
 * Student Lift - Authentication Module
 * Handles login and registration functionality
 */

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    setupCampusSelection();
});

// Switch between login and register tabs
function switchTab(tabName) {
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    const tabs = document.querySelectorAll('.tab');

    tabs.forEach(tab => tab.classList.remove('active'));
    
    if (tabName === 'login') {
        loginTab.classList.add('active');
        tabs[0].classList.add('active');
    } else {
        registerTab.classList.add('active');
        tabs[1].classList.add('active');
    }
}

// Setup campus selection styling
function setupCampusSelection() {
    const campusOptions = document.querySelectorAll('.campus-option');
    campusOptions.forEach(option => {
        const radio = option.querySelector('input[type="radio"]');
        if (radio && radio.checked) {
            option.classList.add('selected');
        }

        option.addEventListener('click', function() {
            campusOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            radio.checked = true;
        });

        radio.addEventListener('change', function() {
            campusOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
        });
    });
}

// Handle login form submission
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const remember = document.querySelector('input[name="remember"]').checked;

        // Validate inputs
        if (!email || !password) {
            showAlert('Please fill in all fields', 'danger');
            return;
        }

        // Simulate authentication (replace with actual API call)
        console.log('Login attempt:', { email, password, remember });
        
        // For now, store user info in localStorage and redirect
        const mockUser = {
            id: '1',
            name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
            email: email,
            campus: 'Stellenbosch',
            avatar: email.charAt(0).toUpperCase()
        };

        localStorage.setItem('currentUser', JSON.stringify(mockUser));
        
        // Show success message
        showAlert('Login successful! Redirecting...', 'success');
        
        // Redirect after brief delay
        setTimeout(() => {
            window.location.href = '/pages/dashboard.html';
        }, 1000);
    });
}

// Handle registration form submission
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const fullname = document.getElementById('reg-fullname').value;
        const email = document.getElementById('reg-email').value;
        const phone = document.getElementById('reg-phone').value;
        const university = document.getElementById('reg-university').value;
        const password = document.getElementById('reg-password').value;
        const confirmPassword = document.getElementById('reg-confirm-password').value;
        const terms = document.querySelector('input[name="terms"]').checked;

        // Validate inputs
        if (!fullname || !email || !phone || !university || !password || !confirmPassword) {
            showAlert('Please fill in all fields', 'danger');
            return;
        }

        if (password !== confirmPassword) {
            showAlert('Passwords do not match', 'danger');
            return;
        }

        if (!terms) {
            showAlert('Please accept the terms of service', 'danger');
            return;
        }

        // Simulate registration (replace with actual API call)
        console.log('Registration attempt:', {
            fullname,
            email,
            phone,
            university,
            password
        });

        // Create user object
        const newUser = {
            id: Date.now().toString(),
            name: fullname,
            email: email,
            phone: phone,
            campus: university,
            avatar: fullname.charAt(0).toUpperCase(),
            createdAt: new Date().toISOString()
        };

        localStorage.setItem('currentUser', JSON.stringify(newUser));
        
        // Show success message
        showAlert('Account created successfully! Redirecting...', 'success');
        
        // Redirect after brief delay
        setTimeout(() => {
            window.location.href = '/pages/dashboard.html';
        }, 1000);
    });
}

// Show alert notification
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.style.position = 'fixed';
    alertDiv.style.top = '1rem';
    alertDiv.style.right = '1rem';
    alertDiv.style.maxWidth = '400px';
    alertDiv.style.zIndex = '10000';
    alertDiv.textContent = message;
    
    document.body.appendChild(alertDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Email validation
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Password strength checker
function checkPasswordStrength(password) {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    return strength;
}
