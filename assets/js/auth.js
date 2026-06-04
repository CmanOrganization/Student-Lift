/**
 * Student Lift - Authentication Module
 * Handles login and registration functionality
 */

// Initialize page
document.addEventListener('DOMContentLoaded', initializeAuth);

function initializeAuth() {
    setupCampusSelection();
    attachFormHandlers();
}

// Switch between login and register tabs
function switchTab(tabName) {
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    const tabs = document.querySelectorAll('.tab');
    const tabPanels = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => tab.classList.remove('active'));
    tabPanels.forEach(panel => panel.classList.remove('active'));
    
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

function attachFormHandlers() {
    var loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }

    var registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegisterSubmit);
    }
}

async function handleLoginSubmit(e) {
    e.preventDefault();

    var email = document.getElementById('login-email').value;
    var password = document.getElementById('login-password').value;

    if (!email || !password) {
        showAlert('Please fill in all fields', 'danger');
        return;
    }

    try {
        var response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, password: password })
        });

        if (!response.ok) {
            var err = await response.json();
            showAlert(err.error || 'Login failed', 'danger');
            return;
        }

        var data = await response.json();
        var token = data.token;
        var role = data.role || 'User';
        if (!token) {
            showAlert('No token returned from server', 'danger');
            return;
        }

        localStorage.setItem('authToken', token);
        localStorage.setItem('authRole', role);
        showAlert('Login successful! Redirecting...', 'success');

        setTimeout(function() { redirectToRole(role); }, 800);
    } catch (err) {
        showAlert(err.message || 'Login failed', 'danger');
    }
}

async function handleRegisterSubmit(e) {
    e.preventDefault();

    var fullname = document.getElementById('reg-fullname').value.trim();
    var email = document.getElementById('reg-email').value.trim();
    var phone = document.getElementById('reg-phone').value.trim();
    var university = document.getElementById('reg-university').value;
    var studentIDInput = document.getElementById('reg-studentid');
    var studentID = studentIDInput ? studentIDInput.value.trim() : '';
    var password = document.getElementById('reg-password').value;
    var confirmPassword = document.getElementById('reg-confirm-password').value;
    var terms = document.querySelector('input[name="terms"]').checked;

    if (!fullname || !email || !phone || !university || !studentID || !password || !confirmPassword) {
        showAlert('Please fill in all fields', 'danger');
        return;
    }

    if (!validateEmail(email)) {
        showAlert('Please enter a valid email address', 'danger');
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

    var names = fullname.trim().split(' ');
    var firstName = names.shift() || '';
    var lastName = names.join(' ') || '';

    try {
        var response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                firstName: firstName,
                lastName: lastName,
                email: email,
                phoneNumber: phone,
                password: password,
                campus: university,
                studentID: studentID
            })
        });

        if (!response.ok) {
            var err = await response.json();
            showAlert(err.error || 'Registration failed', 'danger');
            return;
        }

        var data = await response.json();
        var token = data.token;
        var role = data.role || 'User';
        if (!token) {
            showAlert('No token returned from server', 'danger');
            return;
        }

        localStorage.setItem('authToken', token);
        localStorage.setItem('authRole', role);
        showAlert('Account created successfully! Redirecting...', 'success');

        setTimeout(function() { redirectToRole(role); }, 800);
    } catch (err) {
        showAlert(err.message || 'Registration failed', 'danger');
    }
}

// Show alert notification
function showAlert(message, type) {
    if (typeof type === 'undefined') {
        type = 'info';
    }

    var alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-' + type;
    alertDiv.style.position = 'fixed';
    alertDiv.style.top = '1rem';
    alertDiv.style.right = '1rem';
    alertDiv.style.maxWidth = '400px';
    alertDiv.style.zIndex = '10000';
    alertDiv.textContent = message;

    document.body.appendChild(alertDiv);

    window.setTimeout(removeAlert, 5000, alertDiv);
}

function removeAlert(el) {
    if (el && el.parentNode) {
        el.parentNode.removeChild(el);
    }
}

function redirectToRole(role) {
    if (role === 'Admin') {
        window.location.href = '/pages/admin.html';
    } else {
        window.location.href = '/pages/dashboard.html';
    }
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
