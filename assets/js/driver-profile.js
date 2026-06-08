const API_BASE = 'http://localhost:5000/v1';

function fmtDate(value) {
    if (!value) return '—';
    const date = new Date(value);
    return date.toLocaleDateString('en-ZA');
}

async function loadDriverProfile() {
    const params = new URLSearchParams(window.location.search);
    const driverId = params.get('id');
    const container = document.getElementById('driver-profile-container');

    if (!driverId) {
        container.innerHTML = '<p class="text-center" style="color:var(--danger-color);padding:2rem;">Driver id missing.</p>';
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/users/${driverId}`);
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || `Server returned ${res.status}`);
        }
        const driver = await res.json();

        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <div>
                        <h2>${driver.firstName} ${driver.lastName}</h2>
                        <div style="font-size:0.9rem;color:var(--text-secondary);">${driver.campus || 'Campus not set'}</div>
                    </div>
                </div>
                <div class="card-body">
                    <div style="margin-bottom:1rem;"><strong>Email:</strong> ${driver.email}</div>
                    <div style="margin-bottom:1rem;"><strong>Phone:</strong> ${driver.phoneNumber}</div>
                    <div style="margin-bottom:1rem;"><strong>Rating:</strong> ${driver.ratingSummary?.average ? `⭐ ${driver.ratingSummary.average.toFixed(1)} (${driver.ratingSummary.count} reviews)` : 'No ratings yet'}</div>
                    <div style="margin-bottom:1rem;"><strong>Bio:</strong> ${driver.bio || 'No bio available.'}</div>
                </div>
            </div>
        `;
    } catch (err) {
        container.innerHTML = `<p class="text-center" style="color:var(--danger-color);padding:2rem;">${err.message}</p>`;
    }
}

document.addEventListener('DOMContentLoaded', loadDriverProfile);
