const API_BASE = 'http://localhost:5000/v1';

function authHeaders() {
    const token = localStorage.getItem('token');
    return { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) };
}

function showMessage(msg, type = 'info') {
    document.querySelectorAll('.alert-toast').forEach(a => a.remove());
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-toast`;
    alertDiv.style.cssText = 'position:fixed;top:1rem;right:1rem;max-width:400px;z-index:10000;';
    alertDiv.textContent = msg;
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 5000);
}

function fmtDate(d) {
    if (!d) return '';
    try { return new Date(d).toLocaleDateString(); } catch { return d; }
}

async function loadRide() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const container = document.getElementById('ride-details-container');
    if (!id) {
        container.innerHTML = '<p class="text-center" style="color:var(--danger-color);padding:2rem;">Missing ride id.</p>';
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/rides/${id}`, { headers: authHeaders() });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || `Server returned ${res.status}`);
        }
        const ride = await res.json();

        const driverName = ride.driverID ? `${ride.driverID.firstName} ${ride.driverID.lastName}` : 'Unknown';
        const seatsText = `${ride.availableSeats || 0} / ${ride.totalSeats || 0}`;

        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <div>
                        <h2>
                            <span>📍</span>
                            ${ride.fromLocation} → ${ride.toLocation}
                        </h2>
                        <div style="font-size:0.9rem;color:var(--text-secondary);">${fmtDate(ride.departureDate)} • ${ride.departureTime || ''}</div>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-weight:600;">R${ride.costPerSeat || 0}</div>
                        <div style="font-size:0.85rem;color:var(--text-secondary);">${seatsText} seats</div>
                    </div>
                </div>
                <div class="card-body">
                    <div style="margin-bottom:1rem;"><strong>Driver:</strong> ${driverName} ${ride.driverID?.ratingSummary?.average ? ('⭐' + Number(ride.driverID.ratingSummary.average).toFixed(1)) : ''}</div>
                    <div style="margin-bottom:1rem;"><strong>Campus:</strong> ${ride.campus || '—'}</div>
                    <div style="margin-bottom:1rem;"><strong>Notes:</strong> ${ride.notes || '—'}</div>
                </div>
                <div style="display:flex;gap:1rem;padding:1rem;">
                    <button class="btn btn-primary" id="book-seat-btn">Book Seat</button>
                    <button class="btn" onclick="window.history.back()">Back</button>
                </div>
            </div>
        `;

        const bookBtn = document.getElementById('book-seat-btn');
        if (bookBtn) {
            bookBtn.addEventListener('click', async () => {
                if (!confirm('Proceed to book a seat on this ride?')) return;
                try {
                    const seats = parseInt(prompt('How many seats to book?', '1'));
                    if (!seats || seats < 1) return;
                    const r = await fetch(`${API_BASE}/bookings/book-seat`, {
                        method: 'POST',
                        headers: authHeaders(),
                        body: JSON.stringify({ rideId: id, seatsRequested: seats })
                    });
                    const data = await r.json().catch(() => ({}));
                    if (!r.ok) throw new Error(data.error || `Booking failed (${r.status})`);
                    showMessage('Seat booked successfully!', 'success');
                    // After booking, redirect back to dashboard or update UI
                    setTimeout(() => { window.location.href = '/pages/dashboard.html'; }, 800);
                } catch (err) {
                    showMessage(err.message || 'Booking failed', 'danger');
                }
            });
        }

    } catch (err) {
        container.innerHTML = `<p class="text-center" style="color:var(--danger-color);padding:2rem;">${err.message}</p>`;
    }
}

document.addEventListener('DOMContentLoaded', loadRide);
