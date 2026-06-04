/**
 * Student Lift - Main App Module
 * Handles dashboard, navigation, and general app functionality
 */

// User object for tracking current logged-in user
let currentUser = null;

document.addEventListener('DOMContentLoaded', initializeApp);

function initializeApp() {
    loadUserData();
    setupNavigation();
    loadDashboardData();
}

async function loadUserData() {
    var token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = '/index.html';
        return;
    }

    try {
        var response = await fetch('/api/auth/me', {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token }
        });

        if (!response.ok) {
            localStorage.removeItem('authToken');
            window.location.href = '/index.html';
            return;
        }

        var data = await response.json();
        var user = data.user;
        if (!user) {
            localStorage.removeItem('authToken');
            window.location.href = '/index.html';
            return;
        }

        currentUser = user;
        if (currentUser.firstName) {
            currentUser.name = (currentUser.firstName + ' ' + (currentUser.lastName || '')).trim();
        }
        if (!currentUser.avatar && currentUser.firstName) {
            currentUser.avatar = currentUser.firstName.charAt(0).toUpperCase();
        }

        updateUserDisplay();
    } catch (err) {
        localStorage.removeItem('authToken');
        window.location.href = '/index.html';
    }
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
    localStorage.removeItem('authToken');
    window.location.href = '/index.html';
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
async function loadAvailableRides() {
    const listContainer = document.getElementById('available-rides-list');
    if (!listContainer) return;

    listContainer.innerHTML = '<p class="text-center" style="color: var(--text-secondary); padding: 2rem;">Loading available rides...</p>';

    try {
        var token = localStorage.getItem('authToken');
        var headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = 'Bearer ' + token;

        const response = await fetch('/api/rides/all-Rides', { method: 'GET', headers: headers });

        if (!response.ok) {
            throw new Error('Failed to load rides: ' + response.status);
        }

        const rides = await response.json();
        listContainer.innerHTML = '';

        if (!rides.length) {
            listContainer.innerHTML = '<p class="text-center" style="color: var(--text-secondary); padding: 2rem;">No available rides found.</p>';
            return;
        }

        rides.forEach(ride => {
            const rideDate = ride.departureDate ? new Date(ride.departureDate) : null;
            const rideTime = rideDate
                ? rideDate.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })
                : ride.departureTime;

            const displayRide = {
                id: ride._id,
                from: ride.fromLocation,
                to: ride.toLocation,
                time: rideTime,
                driver: ride.driverID ? `${ride.driverID.firstName} ${ride.driverID.lastName}` : 'Unknown Driver',
                cost: ride.costPerSeat,
                seats: `${ride.availableSeats}/${ride.totalSeats}`,
                rating: ride.driverID?.ratingSummary?.average ?? 0
            };

            const card = createRideCard(displayRide, 'request');
            listContainer.appendChild(card);
        });
    } catch (error) {
        listContainer.innerHTML = `<p class="text-center" style="color: var(--danger-color); padding: 2rem;">${error.message}</p>`;
    }
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
    fetchAndRenderPostedRides();
}

async function fetchAndRenderPostedRides() {
    var container = document.getElementById('my-posted-rides');
    if (!container) return;
    container.innerHTML = '<p class="text-center" style="color: var(--text-secondary); padding: 2rem;">Loading your posted rides...</p>';

    try {
        var token = localStorage.getItem('authToken');
        var headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = 'Bearer ' + token;

        var response = await fetch('/api/rides/all-Rides', { method: 'GET', headers: headers });
        if (!response.ok) {
            container.innerHTML = '<p class="text-center" style="color: var(--text-secondary); padding: 2rem;">You haven\'t posted any rides yet</p>';
            return;
        }

        var rides = await response.json();
        var myRides = rides.filter(function (r) { return r.driverID && (r.driverID._id === (currentUser && currentUser._id)); });

        container.innerHTML = '';
        if (myRides.length === 0) {
            container.innerHTML = '<p class="text-center" style="color: var(--text-secondary); padding: 2rem;">You haven\'t posted any rides yet</p>';
            return;
        }

        for (var i = 0; i < myRides.length; i++) {
            var ride = myRides[i];
            var card = document.createElement('div');
            card.className = 'ride-card';
            card.innerHTML = '\n                <div class="ride-header">\n                    <div class="ride-route">\n                        <div class="ride-from-to">\n                            <span>📍</span>\n                            <span>' + (ride.fromLocation || '') + '</span>\n                            <span style="color: var(--text-secondary); margin: 0 0.5rem;">→</span>\n                            <span>' + (ride.toLocation || '') + '</span>\n                        </div>\n                    </div>\n                    <span class="ride-status status-available">' + (ride.status || 'Active') + '</span>\n                </div>\n                <div class="ride-details">\n                    <div class="ride-detail-label">Time:</div>\n                    <div>' + (ride.departureTime || '') + '</div>\n                        \n                    <div class="ride-detail-label">Seats Available:</div>\n                    <div>' + ((ride.availableSeats !== undefined) ? (ride.availableSeats + '/' + (ride.totalSeats || '')) : '') + '</div>\n                        \n                    <div class="ride-detail-label">Cost:</div>\n                    <div>R' + (ride.costPerSeat || '') + '</div>\n                        \n                    <div class="ride-detail-label">Pending Requests:</div>\n                    <div>' + ((ride.requests && ride.requests.length) || 0) + ' request(s)</div>\n                </div>\n                <div style="display: flex; gap: 1rem;">\n                    <button class="btn btn-secondary btn-block" onclick="editRide(' + (ride._id || '') + ')">Edit</button>\n                    <button class="btn btn-danger btn-block" onclick="cancelRide(' + (ride._id || '') + ')">Cancel</button>\n                </div>\n            ';
            container.appendChild(card);
        }
    } catch (err) {
        container.innerHTML = '<p class="text-center" style="color: var(--danger-color); padding: 2rem;">Failed to load posted rides</p>';
    }
}

// Load user's ride requests
function loadRideRequests() {
    fetchAndRenderRideRequests();
}

async function fetchAndRenderRideRequests() {
    var container = document.getElementById('my-requests-list');
    if (!container) return;
    container.innerHTML = '<p class="text-center" style="color: var(--text-secondary); padding: 2rem;">Loading your ride requests...</p>';

    try {
        var token = localStorage.getItem('authToken');
        var headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = 'Bearer ' + token;

        var response = await fetch('/api/bookings/my-requests', { method: 'GET', headers: headers });
        if (!response.ok) {
            container.innerHTML = '<p class="text-center" style="color: var(--text-secondary); padding: 2rem;">You haven\'t made any ride requests yet</p>';
            return;
        }

        var requests = await response.json();
        if (!requests || requests.length === 0) {
            container.innerHTML = '<p class="text-center" style="color: var(--text-secondary); padding: 2rem;">You haven\'t made any ride requests yet</p>';
            return;
        }

        container.innerHTML = '';
        for (var i = 0; i < requests.length; i++) {
            var request = requests[i];
            var card = document.createElement('div');
            card.className = 'ride-card';
            var statusClass = (request.status === 'pending') ? 'status-available' : 'status-full';
            var statusText = (request.status && request.status.charAt(0).toUpperCase() + request.status.slice(1)) || '';

            card.innerHTML = '\n            <div class="ride-header">\n                <div class="ride-route">\n                    <div class="ride-from-to">\n                        <span>📍</span>\n                        <span>' + (request.fromLocation || request.from || '') + '</span>\n                        <span style="color: var(--text-secondary); margin: 0 0.5rem;">→</span>\n                        <span>' + (request.toLocation || request.to || '') + '</span>\n                    </div>\n                </div>\n                <span class="ride-status ' + statusClass + '">' + statusText + '</span>\n            </div>\n            <div class="ride-details">\n                <div class="ride-detail-label">Time:</div>\n                <div>' + (request.departureTime || request.time || '') + '</div>\n                \n                <div class="ride-detail-label">Cost:</div>\n                <div>R' + (request.cost || '') + '</div>\n                \n                <div class="ride-detail-label">Status:</div>\n                <div>' + (request.statusDetail || 'Waiting for driver confirmation...') + '</div>\n            </div>\n            <div style="display: flex; gap: 1rem;">\n                <button class="btn btn-secondary btn-block" onclick="cancelRequest(' + (request._id || request.id || '') + ')">Cancel Request</button>\n            </div>\n        ';
            container.appendChild(card);
        }
    } catch (err) {
        container.innerHTML = '<p class="text-center" style="color: var(--danger-color); padding: 2rem;">Failed to load requests</p>';
    }
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
    window.location.href = '/pages/post-ride.html';
}

function goToRequestRide() {
    window.location.href = '/pages/request-ride.html';
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
window.addEventListener('load', checkAuthOnLoad);

function checkAuthOnLoad() {
    if (!localStorage.getItem('authToken')) {
        window.location.href = '/index.html';
    }
}
