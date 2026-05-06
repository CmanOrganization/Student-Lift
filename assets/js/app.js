/**
 * Student Lift - Main App Module
 * Handles dashboard, navigation, and general app functionality
 */

// User object for tracking current logged-in user
let currentUser = null;

// Initialize app on page load
document.addEventListener('DOMContentLoaded', function() {
    loadUserData();
    setupNavigation();
    loadDashboardData();
});

// Load user data from localStorage
function loadUserData() {
    const userJSON = localStorage.getItem('currentUser');
    
    if (!userJSON) {
        // No user logged in, redirect to login
        window.location.href = '../index.html';
        return;
    }

    currentUser = JSON.parse(userJSON);
    
    // Update UI with user information
    updateUserDisplay();
}

// Update user display elements
function updateUserDisplay() {
    if (!currentUser) return;

    // Update user avatar
    const userInitials = document.querySelectorAll('#user-initial');
    userInitials.forEach(el => {
        el.textContent = currentUser.avatar;
    });

    // Update user name
    const userNameElements = document.querySelectorAll('#user-name');
    userNameElements.forEach(el => {
        el.textContent = currentUser.name || 'User';
    });

    // Update user campus
    const userCampusElements = document.querySelectorAll('#user-campus');
    userCampusElements.forEach(el => {
        el.textContent = capitalizeFirst(currentUser.campus);
    });
}

// Setup navigation functionality
function setupNavigation() {
    // Add logout functionality to user menu
    const userAvatars = document.querySelectorAll('.user-avatar');
    userAvatars.forEach(avatar => {
        avatar.addEventListener('click', function() {
            showUserMenu();
        });
    });
}

// Show user menu dropdown
function showUserMenu() {
    if (!currentUser) return;

    const menu = confirm(`User: ${currentUser.name}\nEmail: ${currentUser.email}\n\nClick Cancel to Logout`);
    
    if (!menu) {
        logout();
    }
}

// Logout functionality
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = '../index.html';
}

// Load dashboard data
function loadDashboardData() {
    // Load stats
    loadDashboardStats();
    
    // Load available rides
    loadAvailableRides();
    
    // Load user's posted rides
    loadPostedRides();
    
    // Load user's ride requests
    loadRideRequests();
}

// Load and display dashboard statistics
function loadDashboardStats() {
    // Simulate loading stats from backend
    const stats = {
        ridesCompleted: 12,
        moneySaved: 540,
        rating: 4.9,
        activeRides: 2
    };

    const completedEl = document.getElementById('rides-completed');
    if (completedEl) completedEl.textContent = stats.ridesCompleted;

    const savedEl = document.getElementById('money-saved');
    if (savedEl) savedEl.textContent = `R${stats.moneySaved}`;

    const ratingEl = document.getElementById('user-rating');
    if (ratingEl) ratingEl.textContent = `${stats.rating} ⭐`;

    const activeEl = document.getElementById('active-rides');
    if (activeEl) activeEl.textContent = stats.activeRides;
}

// Load available rides list
function loadAvailableRides() {
    const listContainer = document.getElementById('available-rides-list');
    if (!listContainer) return;

    // Simulate available rides from backend
    const availableRides = [
        {
            id: 1,
            from: 'Stellenbosch Campus Main Gate',
            to: 'Pick n Pay Shopping Center',
            time: '10:30 AM',
            driver: 'Sarah Johnson',
            cost: 50,
            seats: '2/4',
            rating: 4.8
        },
        {
            id: 2,
            from: 'Pretoria Campus',
            to: 'Train Station',
            time: '2:00 PM',
            driver: 'Michael Chen',
            cost: 60,
            seats: '3/4',
            rating: 4.9
        },
        {
            id: 3,
            from: 'Kempton Park Campus',
            to: 'Shopping Mall',
            time: '4:30 PM',
            driver: 'Emma Williams',
            cost: 45,
            seats: '1/3',
            rating: 5.0
        }
    ];

    // Clear existing content
    listContainer.innerHTML = '';

    // Create ride cards
    availableRides.forEach(ride => {
        const card = createRideCard(ride, 'request');
        listContainer.appendChild(card);
    });
}

// Create a ride card element
function createRideCard(ride, action = 'view') {
    const card = document.createElement('div');
    card.className = 'ride-card';

    const statusClass = ride.seats.split('/')[0] > 0 ? 'status-available' : 'status-full';
    const statusText = ride.seats.split('/')[0] > 0 ? 'Available' : 'Full';

    card.innerHTML = `
        <div class="ride-header">
            <div class="ride-route">
                <div class="ride-from-to">
                    <span>📍</span>
                    <span>${ride.from}</span>
                    <span style="color: var(--text-secondary); margin: 0 0.5rem;">→</span>
                    <span>${ride.to}</span>
                </div>
            </div>
            <span class="ride-status ${statusClass}">${statusText}</span>
        </div>
        <div class="ride-details">
            <div class="ride-detail-label">Time:</div>
            <div>${ride.time}</div>
            
            <div class="ride-detail-label">Driver:</div>
            <div>${ride.driver} ⭐${ride.rating}</div>
            
            <div class="ride-detail-label">Cost:</div>
            <div>R${ride.cost}</div>
            
            <div class="ride-detail-label">Seats:</div>
            <div>${ride.seats}</div>
        </div>
        <div style="display: flex; gap: 1rem;">
            <button class="btn btn-primary btn-block" onclick="requestRide(${ride.id})">Request Ride</button>
            <button class="btn btn-secondary btn-block" onclick="viewRideDetails(${ride.id})">Details</button>
        </div>
    `;

    return card;
}

// Load user's posted rides
function loadPostedRides() {
    const container = document.getElementById('my-posted-rides');
    if (!container) return;

    // Simulate user's posted rides
    const postedRides = [
        {
            id: 101,
            from: 'Stellenbosch Campus',
            to: 'Airport',
            time: '5:00 PM',
            seats: '2/3',
            cost: 150,
            rating: 5.0,
            passengers: 1
        }
    ];

    container.innerHTML = '';

    if (postedRides.length === 0) {
        container.innerHTML = '<p class="text-center" style="color: var(--text-secondary); padding: 2rem;">You haven\'t posted any rides yet</p>';
        return;
    }

    postedRides.forEach(ride => {
        const card = document.createElement('div');
        card.className = 'ride-card';
        card.innerHTML = `
            <div class="ride-header">
                <div class="ride-route">
                    <div class="ride-from-to">
                        <span>📍</span>
                        <span>${ride.from}</span>
                        <span style="color: var(--text-secondary); margin: 0 0.5rem;">→</span>
                        <span>${ride.to}</span>
                    </div>
                </div>
                <span class="ride-status status-available">Active</span>
            </div>
            <div class="ride-details">
                <div class="ride-detail-label">Time:</div>
                <div>${ride.time}</div>
                
                <div class="ride-detail-label">Seats Available:</div>
                <div>${ride.seats}</div>
                
                <div class="ride-detail-label">Cost:</div>
                <div>R${ride.cost}</div>
                
                <div class="ride-detail-label">Pending Requests:</div>
                <div>${ride.passengers} request(s)</div>
            </div>
            <div style="display: flex; gap: 1rem;">
                <button class="btn btn-secondary btn-block" onclick="editRide(${ride.id})">Edit</button>
                <button class="btn btn-danger btn-block" onclick="cancelRide(${ride.id})">Cancel</button>
            </div>
        `;
        container.appendChild(card);
    });
}

// Load user's ride requests
function loadRideRequests() {
    const container = document.getElementById('my-requests-list');
    if (!container) return;

    // Simulate ride requests
    const requests = [
        {
            id: 201,
            from: 'Pretoria Campus',
            to: 'Downtown',
            time: '1:00 PM',
            status: 'pending',
            cost: 75
        }
    ];

    container.innerHTML = '';

    if (requests.length === 0) {
        container.innerHTML = '<p class="text-center" style="color: var(--text-secondary); padding: 2rem;">You haven\'t made any ride requests yet</p>';
        return;
    }

    requests.forEach(request => {
        const card = document.createElement('div');
        card.className = 'ride-card';
        const statusClass = request.status === 'pending' ? 'status-available' : 'status-full';
        const statusText = request.status.charAt(0).toUpperCase() + request.status.slice(1);

        card.innerHTML = `
            <div class="ride-header">
                <div class="ride-route">
                    <div class="ride-from-to">
                        <span>📍</span>
                        <span>${request.from}</span>
                        <span style="color: var(--text-secondary); margin: 0 0.5rem;">→</span>
                        <span>${request.to}</span>
                    </div>
                </div>
                <span class="ride-status ${statusClass}">${statusText}</span>
            </div>
            <div class="ride-details">
                <div class="ride-detail-label">Time:</div>
                <div>${request.time}</div>
                
                <div class="ride-detail-label">Cost:</div>
                <div>R${request.cost}</div>
                
                <div class="ride-detail-label">Status:</div>
                <div>Waiting for driver confirmation...</div>
            </div>
            <div style="display: flex; gap: 1rem;">
                <button class="btn btn-secondary btn-block" onclick="cancelRequest(${request.id})">Cancel Request</button>
            </div>
        `;
        container.appendChild(card);
    });
}

// Switch between ride tabs
function switchRideTab(tabName) {
    const tabs = document.querySelectorAll('.tab-content');
    const tabButtons = document.querySelectorAll('.tab');

    tabs.forEach(tab => tab.classList.remove('active'));
    tabButtons.forEach(btn => btn.classList.remove('active'));

    const activeTab = document.getElementById(tabName + '-tab');
    if (activeTab) activeTab.classList.add('active');

    // Find and activate the corresponding button
    tabButtons.forEach(btn => {
        if (btn.textContent.toLowerCase().includes(tabName.replace('-', ' '))) {
            btn.classList.add('active');
        }
    });
}

// Navigation functions
function goToPostRide() {
    window.location.href = 'post-ride.html';
}

function goToRequestRide() {
    window.location.href = 'request-ride.html';
}

// Ride action functions
function requestRide(rideId) {
    alert('Ride request sent! The driver will respond shortly.');
}

function viewRideDetails(rideId) {
    alert('View details for ride #' + rideId);
}

function editRide(rideId) {
    alert('Edit ride #' + rideId);
}

function cancelRide(rideId) {
    if (confirm('Are you sure you want to cancel this ride?')) {
        alert('Ride cancelled successfully');
        location.reload();
    }
}

function cancelRequest(requestId) {
    if (confirm('Are you sure you want to cancel this request?')) {
        alert('Request cancelled');
        location.reload();
    }
}

// Utility function to capitalize first letter
function capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).replace('-', ' ');
}

// Check authentication on page load
window.addEventListener('load', function() {
    if (!localStorage.getItem('currentUser')) {
        window.location.href = '../index.html';
    }
});
