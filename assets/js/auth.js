/**
 * Student Lift - Authentication Module
 */

const API_BASE = 'http://localhost:5000/v1';

document.addEventListener('DOMContentLoaded', function () {
    // Redirect to dashboard if already logged in
    if (localStorage.getItem('token')) {
        window.location.href = '/pages/dashboard.html';
        return;
    }
    setupCampusSelection();
});

// Switch between login and register tabs
function switchTab(tabName) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));

    if (tabName === 'login') {
        document.getElementById('login-tab').classList.add('active');
        document.querySelectorAll('.tab')[0].classList.add('active');
    } else {
        document.getElementById('register-tab').classList.add('active');
        document.querySelectorAll('.tab')[1].classList.add('active');
    }
}

// Setup campus selection styling
function setupCampusSelection() {
    const campusOptions = document.querySelectorAll('.campus-option');
    campusOptions.forEach(option => {
        const radio = option.querySelector('input[type="radio"]');
        if (radio && radio.checked) option.classList.add('selected');

        option.addEventListener('click', function () {
            campusOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            if (radio) radio.checked = true;
        });
    });
}

// Handle login form submission
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        if (!email || !password) {
            showAlert('Please fill in all fields', 'danger');
            return;
        }

        const btn = loginForm.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.textContent = 'Logging in...';

        try {
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();

            if (!res.ok) {
                showAlert(data.error || 'Login failed', 'danger');
                return;
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            showAlert('Login successful! Redirecting...', 'success');
            setTimeout(() => { window.location.href = '/pages/dashboard.html'; }, 800);
        } catch (err) {
            showAlert('Could not connect to server. Make sure the server is running.', 'danger');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Login';
        }
    });
}

// Handle registration form submission
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const fullname = document.getElementById('reg-fullname').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const phone = document.getElementById('reg-phone').value.trim();
        const studentID = document.getElementById('reg-studentid') ? document.getElementById('reg-studentid').value.trim() : '';
        const campus = document.getElementById('reg-university').value;
        const password = document.getElementById('reg-password').value;
        const confirmPassword = document.getElementById('reg-confirm-password').value;
        const terms = document.querySelector('input[name="terms"]').checked;

        if (!fullname || !email || !phone || !campus || !password || !confirmPassword) {
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

        const nameParts = fullname.trim().split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || 'Unknown';

        // Capitalise campus to match schema enum
        const campusMap = {
            'stellenbosch': 'Stellenbosch',
            'pretoria': 'Pretoria',
            'kempton-park': 'Kempton Park',
            'kempton park': 'Kempton Park'
        };
        const normalisedCampus = campusMap[campus.toLowerCase()] || campus;

        const btn = registerForm.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.textContent = 'Creating account...';

        try {
            const res = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    email,
                    phoneNumber: phone,
                    campus: normalisedCampus,
                    studentID: studentID || email.split('@')[0],
                    password
                })
            });
            const data = await res.json();

            if (!res.ok) {
                showAlert(data.error || 'Registration failed', 'danger');
                return;
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            showAlert('Account created! Redirecting...', 'success');
            setTimeout(() => { window.location.href = '/pages/dashboard.html'; }, 800);
        } catch (err) {
            showAlert('Could not connect to server. Make sure the server is running.', 'danger');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Create Account';
        }
    });
}

// Show alert notification
function showAlert(message, type = 'info') {
    // Remove existing alerts
    document.querySelectorAll('.alert-toast').forEach(a => a.remove());

    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-toast`;
    alertDiv.style.cssText = 'position:fixed;top:1rem;right:1rem;max-width:400px;z-index:10000;';
    alertDiv.textContent = message;
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 5000);
}
