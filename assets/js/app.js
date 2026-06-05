/**
 * Student Lift - Main App Module
 */

const API_BASE = 'http://localhost:5000/v1';
let currentUser = null;
let authToken = null;

document.addEventListener('DOMContentLoaded', function () {
    if (!loadUserData()) return;
    setupNavigation();
    loadDashboardData();
});

// ── Auth helpers ──────────────────────────────────────────────────────────────

function loadUserData() {
    authToken = localStorage.getItem('token');
    const userJSON = localStorage.getItem('currentUser');

    if (!authToken || !userJSON) {
        window.location.href = '/index.html';
        return false;
    }

    currentUser = JSON.parse(userJSON);
    updateUserDisplay();
    return true;
}

function authHeaders() {
    return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` };
}

function updateUserDisplay() {
    if (!currentUser) return;

    const name = `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || 'Student';
    const initial = name.charAt(0).toUpperCase();

    document.querySelectorAll('#user-initial').forEach(el => el.textContent = initial);
    document.querySelectorAll('#user-name').forEach(el => el.textContent = name);
    document.querySelectorAll('#user-campus').forEach(el => el.textContent = currentUser.campus || '');
}

// ── Navigation ────────────────────────────────────────────────────────────────

function setupNavigation() {
    document.querySelectorAll('.user-avatar').forEach(avatar => {
        avatar.addEventListener('click', showUserMenu);
    });
}

function showUserMenu() {
    if (!currentUser) return;
    const name = `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim();
    const leave = confirm(`Logged in as: ${name}\nEmail: ${currentUser.email}\n\nClick Cancel to Logout`);
    if (!leave) logout();
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    window.location.href = '/index.html';
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

async function loadDashboardData() {
    await Promise.all([
        loadDashboardStats(),
        loadAvailableRides(),
        loadPostedRides(),
        loadRideRequests()
    ]);
}

async function loadDashboardStats() {
    // Fetch live stats from metrics endpoint + user wallet
    try {
        const [metricsRes, userRes] = await Promise.all([
            fetch(`${API_BASE}/metrics/platform-summary`),
            fetch(`${API_BASE}/auth/me`, { headers: authHeaders() })
        ]);

        if (userRes.ok) {
            const user = await userRes.json();
            currentUser = { ...currentUser, ...user };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));

            const walletEl = document.getElementById('money-saved');
            if (walletEl) walletEl.textContent = `R${(user.wallet?.balance ?? 0).toFixed(2)}`;

            const ratingEl = document.getElementById('user-rating');
            if (ratingEl) ratingEl.textContent = `${(user.ratingSummary?.average ?? 0).toFixed(1)} ⭐`;
        }

        if (metricsRes.ok) {
            const metrics = await metricsRes.json();
            const activeEl = document.getElementById('active-rides');
            if (activeEl) activeEl.textContent = metrics.totalRidesCreated || 0;
        }
    } catch (err) {
        console.warn('Stats load error:', err);
    }
}

async function loadAvailableRides() {
    const listContainer = document.getElementById('available-rides-list');
    if (!listContainer) return;

    listContainer.innerHTML = '<p class="text-center" style="color:var(--text-secondary);padding:2rem;">Loading available rides...</p>';

    try {
        const res = await fetch(`${API_BASE}/rides/all-Rides`);
        if (!res.ok) throw new Error(`Server error: ${res.status}`);

        const rides = await res.json();
        listContainer.innerHTML = '';

        if (!rides.length) {
            listContainer.innerHTML = '<p class="text-center" style="color:var(--text-secondary);padding:2rem;">No available rides right now.</p>';
            return;
        }

        rides.forEach(ride => {
            const card = createRideCard({
                id: ride._id,
                from: ride.fromLocation,
                to: ride.toLocation,
                time: ride.departureTime,
                driver: ride.driverID ? `${ride.driverID.firstName} ${ride.driverID.lastName}` : 'Unknown',
                cost: ride.costPerSeat,
                seats: `${ride.availableSeats}/${ride.totalSeats}`,
                rating: ride.driverID?.ratingSummary?.average ?? 0
            }, 'request');
            listContainer.appendChild(card);
        });
    } catch (error) {
        listContainer.innerHTML = `<p class="text-center" style="color:var(--danger-color);padding:2rem;">${error.message}</p>`;
    }
}

function createRideCard(ride, action = 'view') {
    const card = document.createElement('div');
    card.className = 'ride-card';

    const availableSeats = parseInt(ride.seats.split('/')[0]);
    const statusClass = availableSeats > 0 ? 'status-available' : 'status-full';
    const statusText = availableSeats > 0 ? 'Available' : 'Full';

    card.innerHTML = `
        <div class="ride-header">
            <div class="ride-route">
                <div class="ride-from-to">
                    <span>📍</span>
                    <span>${ride.from}</span>
                    <span style="color:var(--text-secondary);margin:0 0.5rem;">→</span>
                    <span>${ride.to}</span>
                </div>
            </div>
            <span class="ride-status ${statusClass}">${statusText}</span>
        </div>
        <div class="ride-details">
            <div class="ride-detail-label">Time:</div><div>${ride.time}</div>
            <div class="ride-detail-label">Driver:</div><div>${ride.driver} ⭐${Number(ride.rating).toFixed(1)}</div>
            <div class="ride-detail-label">Cost:</div><div>R${ride.cost}</div>
            <div class="ride-detail-label">Seats:</div><div>${ride.seats}</div>
        </div>
        <div style="display:flex;gap:1rem;">
            <button class="btn btn-primary btn-block" onclick="bookRide('${ride.id}', ${ride.cost})">Book Seat</button>
            <button class="btn btn-secondary btn-block" onclick="viewRideDetails('${ride.id}')">Details</button>
        </div>
    `;
    return card;
}

async function loadPostedRides() {
    const container = document.getElementById('my-posted-rides');
    if (!container) return;

    container.innerHTML = '<p class="text-center" style="color:var(--text-secondary);padding:2rem;">Loading...</p>';

    try {
        const res = await fetch(`${API_BASE}/rides/my-rides`, { headers: authHeaders() });
        if (!res.ok) throw new Error(`Server error: ${res.status}`);

        const rides = await res.json();
        container.innerHTML = '';

        const active = rides.filter(r => r.status === 'Active');

        // Update stat card
        const completedEl = document.getElementById('rides-completed');
        if (completedEl) completedEl.textContent = rides.filter(r => r.status === 'Completed').length;

        if (!active.length) {
            container.innerHTML = '<p class="text-center" style="color:var(--text-secondary);padding:2rem;">You haven\'t posted any rides yet.</p>';
            return;
        }

        active.forEach(ride => {
            const card = document.createElement('div');
            card.className = 'ride-card';
            card.innerHTML = `
                <div class="ride-header">
                    <div class="ride-route">
                        <div class="ride-from-to">
                            <span>📍</span>
                            <span>${ride.fromLocation}</span>
                            <span style="color:var(--text-secondary);margin:0 0.5rem;">→</span>
                            <span>${ride.toLocation}</span>
                        </div>
                    </div>
                    <span class="ride-status status-available">Active</span>
                </div>
                <div class="ride-details">
                    <div class="ride-detail-label">Time:</div><div>${ride.departureTime}</div>
                    <div class="ride-detail-label">Seats Available:</div><div>${ride.availableSeats}/${ride.totalSeats}</div>
                    <div class="ride-detail-label">Cost per seat:</div><div>R${ride.costPerSeat}</div>
                </div>
                <div style="display:flex;gap:1rem;">
                    <button class="btn btn-danger btn-block" onclick="cancelRide('${ride._id}')">Cancel Ride</button>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        container.innerHTML = `<p class="text-center" style="color:var(--danger-color);padding:2rem;">${error.message}</p>`;
    }
}

async function loadRideRequests() {
    const container = document.getElementById('my-requests-list');
    if (!container) return;

    container.innerHTML = '<p class="text-center" style="color:var(--text-secondary);padding:2rem;">Loading...</p>';

    try {
        const res = await fetch(`${API_BASE}/bookings/my-requests`, { headers: authHeaders() });
        if (!res.ok) throw new Error(`Server error: ${res.status}`);

        const requests = await res.json();
        container.innerHTML = '';

        if (!requests.length) {
            container.innerHTML = '<p class="text-center" style="color:var(--text-secondary);padding:2rem;">No ride requests yet.</p>';
            return;
        }

        requests.forEach(req => {
            const ride = req.rideID || {};
            const statusColors = { Accepted: 'status-available', Pending: 'status-available', Rejected: 'status-full', Cancelled: 'status-full' };
            const card = document.createElement('div');
            card.className = 'ride-card';
            card.innerHTML = `
                <div class="ride-header">
                    <div class="ride-route">
                        <div class="ride-from-to">
                            <span>📍</span>
                            <span>${ride.fromLocation || 'N/A'}</span>
                            <span style="color:var(--text-secondary);margin:0 0.5rem;">→</span>
                            <span>${ride.toLocation || 'N/A'}</span>
                        </div>
                    </div>
                    <span class="ride-status ${statusColors[req.status] || ''}">${req.status}</span>
                </div>
                <div class="ride-details">
                    <div class="ride-detail-label">Seats:</div><div>${req.numberOfSeats}</div>
                    <div class="ride-detail-label">Cost:</div><div>R${ride.costPerSeat ? ride.costPerSeat * req.numberOfSeats : 'N/A'}</div>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        container.innerHTML = `<p class="text-center" style="color:var(--danger-color);padding:2rem;">${error.message}</p>`;
    }
}

// ── Ride actions ──────────────────────────────────────────────────────────────

async function bookRide(rideId, costPerSeat) {
    const seats = parseInt(prompt('How many seats would you like to book?', '1'));
    if (!seats || seats < 1) return;

    try {
        const res = await fetch(`${API_BASE}/bookings/book-seat`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ rideId, seatsRequested: seats })
        });
        const data = await res.json();

        if (!res.ok) {
            showAlert(data.error || 'Booking failed', 'danger');
            return;
        }
        showAlert('Seat booked successfully! 🎉', 'success');
        loadDashboardData();
    } catch (err) {
        showAlert('Could not complete booking. Check your connection.', 'danger');
    }
}

function viewRideDetails(rideId) {
    alert('Ride ID: ' + rideId + '\n\nFull ride detail page coming soon!');
}

async function cancelRide(rideId) {
    if (!confirm('Are you sure you want to cancel this ride?')) return;

    try {
        const res = await fetch(`${API_BASE}/rides/${rideId}/cancel`, {
            method: 'PATCH',
            headers: authHeaders()
        });
        const data = await res.json();

        if (!res.ok) {
            showAlert(data.error || 'Could not cancel ride', 'danger');
            return;
        }
        showAlert('Ride cancelled.', 'success');
        loadPostedRides();
    } catch (err) {
        showAlert('Could not connect to server.', 'danger');
    }
}

// ── Navigation shortcuts ──────────────────────────────────────────────────────

function goToPostRide() { window.location.href = '/pages/post-ride.html'; }
function goToRequestRide() { window.location.href = '/pages/request-ride.html'; }

function switchRideTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
    const tab = document.getElementById(tabName + '-tab');
    if (tab) tab.classList.add('active');
    document.querySelectorAll('.tab').forEach(btn => {
        if (btn.textContent.toLowerCase().includes(tabName.replace('-', ' '))) btn.classList.add('active');
    });
}

// ── Utilities ─────────────────────────────────────────────────────────────────

function showAlert(message, type = 'info') {
    document.querySelectorAll('.alert-toast').forEach(a => a.remove());
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-toast`;
    alertDiv.style.cssText = 'position:fixed;top:1rem;right:1rem;max-width:400px;z-index:10000;';
    alertDiv.textContent = message;
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 5000);
}

function capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).replace('-', ' ');
}

// ── Wallet top-up ─────────────────────────────────────────────────────────────

async function topUpWallet() {
    const input = prompt('How much would you like to add to your wallet? (R)', '100');
    if (!input) return;
    const amount = parseFloat(input);
    if (isNaN(amount) || amount <= 0) { showAlert('Please enter a valid amount.', 'danger'); return; }

    try {
        const res = await fetch(`${API_BASE}/auth/wallet/topup`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ amount })
        });
        const data = await res.json();
        if (!res.ok) { showAlert(data.error || 'Top-up failed', 'danger'); return; }

        // Update local user + display
        currentUser.wallet = data.wallet;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        const walletEl = document.getElementById('money-saved');
        if (walletEl) walletEl.textContent = `R${data.wallet.balance.toFixed(2)}`;
        showAlert(data.message, 'success');
    } catch (err) {
        showAlert('Could not connect to server.', 'danger');
    }
}
