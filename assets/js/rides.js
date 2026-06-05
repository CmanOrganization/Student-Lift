/**
 * Student Lift - Rides Module
 * Handles ride posting and requesting functionality
 */

// Initialize rides page
document.addEventListener('DOMContentLoaded', function() {
    setupCampusSelection();
    setupFormValidation();
});

// Setup campus selection with interactive UI
function setupCampusSelection() {
    const campusOptions = document.querySelectorAll('.campus-option');
    
    campusOptions.forEach(option => {
        const radio = option.querySelector('input[type="radio"]');
        
        // Set initial state
        if (radio && radio.checked) {
            option.classList.add('selected');
        }

        // Handle option click
        option.addEventListener('click', function() {
            campusOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            radio.checked = true;
            radio.dispatchEvent(new Event('change'));
        });

        // Handle radio change
        radio.addEventListener('change', function() {
            campusOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
        });
    });
}

// Setup form validation
function setupFormValidation() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], input[type="number"], input[type="date"], input[type="time"], select, textarea');
        
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
        });
    });
}

// Validate individual field
function validateField(field) {
    let isValid = true;
    let errorMessage = '';

    if (!field.value && field.required) {
        isValid = false;
        errorMessage = 'This field is required';
    } else if (field.type === 'email') {
        isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value);
        errorMessage = 'Please enter a valid email';
    } else if (field.type === 'tel') {
        isValid = /^[\d\s\-\+\(\)]+$/.test(field.value);
        errorMessage = 'Please enter a valid phone number';
    } else if (field.type === 'number') {
        isValid = !isNaN(field.value) && field.value !== '';
        errorMessage = 'Please enter a valid number';
    }

    if (!isValid && field.value) {
        field.style.borderColor = 'var(--danger-color)';
        showFieldError(field, errorMessage);
    } else {
        field.style.borderColor = '';
        clearFieldError(field);
    }

    return isValid;
}

// Show field error
function showFieldError(field, message) {
    let errorElement = field.parentElement.querySelector('.field-error');
    
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.style.color = 'var(--danger-color)';
        errorElement.style.fontSize = '0.875rem';
        errorElement.style.marginTop = '0.25rem';
        field.parentElement.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
}

// Clear field error
function clearFieldError(field) {
    const errorElement = field.parentElement.querySelector('.field-error');
    if (errorElement) {
        errorElement.remove();
    }
}

// Format currency
function formatCurrency(value) {
    return 'R' + parseFloat(value).toFixed(2);
}

// Format date/time
function formatDateTime(date, time) {
    const d = new Date(date + 'T' + time);
    return d.toLocaleString('en-ZA', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Rides storage (replace with backend API calls)
class RidesManager {
    constructor() {
        this.rides = this.loadRides();
    }

    loadRides() {
        const ridesJSON = localStorage.getItem('rides');
        return ridesJSON ? JSON.parse(ridesJSON) : [];
    }

    saveRides() {
        localStorage.setItem('rides', JSON.stringify(this.rides));
    }

    addRide(rideData) {
        const ride = {
            id: Date.now(),
            ...rideData,
            createdAt: new Date().toISOString(),
            status: 'active',
            requests: []
        };
        
        this.rides.push(ride);
        this.saveRides();
        return ride;
    }

    getRidesByUser(userId) {
        return this.rides.filter(ride => ride.userId === userId);
    }

    getRidesByStatus(status) {
        return this.rides.filter(ride => ride.status === status);
    }

    updateRide(rideId, updates) {
        const ride = this.rides.find(r => r.id === rideId);
        if (ride) {
            Object.assign(ride, updates);
            this.saveRides();
        }
        return ride;
    }

    cancelRide(rideId) {
        return this.updateRide(rideId, { status: 'cancelled' });
    }

    completeRide(rideId) {
        return this.updateRide(rideId, { status: 'completed' });
    }

    addRequestToRide(rideId, requestData) {
        const ride = this.rides.find(r => r.id === rideId);
        if (ride) {
            ride.requests.push({
                id: Date.now(),
                ...requestData,
                status: 'pending',
                createdAt: new Date().toISOString()
            });
            this.saveRides();
        }
        return ride;
    }
}

// Initialize rides manager
const ridesManager = new RidesManager();

// Ride filter and search
class RideFilter {
    static byDate(rides, date) {
        return rides.filter(ride => ride.date === date);
    }

    static byCampus(rides, campus) {
        return rides.filter(ride => ride.campus === campus);
    }

    static byRoute(rides, from, to) {
        return rides.filter(ride => 
            ride.from_location.toLowerCase().includes(from.toLowerCase()) &&
            ride.to_location.toLowerCase().includes(to.toLowerCase())
        );
    }

    static byBudget(rides, maxPrice) {
        return rides.filter(ride => ride.cost_per_seat <= maxPrice);
    }

    static available(rides) {
        return rides.filter(ride => ride.status === 'active');
    }

    static combineFilters(rides, filters) {
        let filtered = rides;
        
        if (filters.date) {
            filtered = this.byDate(filtered, filters.date);
        }
        if (filters.campus) {
            filtered = this.byCampus(filtered, filters.campus);
        }
        if (filters.maxBudget) {
            filtered = this.byBudget(filtered, filters.maxBudget);
        }
        
        return filtered;
    }
}

// Ride calculator
class RideCalculator {
    static calculateTotal(costPerSeat, numPassengers) {
        return costPerSeat * numPassengers;
    }

    static calculateDuration(startTime, endTime) {
        const [startH, startM] = startTime.split(':').map(Number);
        const [endH, endM] = endTime.split(':').map(Number);
        
        let minutes = (endH * 60 + endM) - (startH * 60 + startM);
        
        if (minutes < 0) {
            minutes += 24 * 60; // Next day
        }
        
        const hours = Math.floor(minutes / 60);
        minutes = minutes % 60;
        
        return `${hours}h ${minutes}m`;
    }

    static calculateDistance(origin, destination) {
        // This would typically use Google Maps API
        // For now, return a placeholder
        return '~15 km';
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RidesManager, RideFilter, RideCalculator };
}

// Availability Checker
class AvailabilityChecker {
    static hasAvailableSeats(ride) {
        const [available, total] = ride.seats.split('/').map(Number);
        return available > 0;
    }

    static getAvailableSeats(ride) {
        return parseInt(ride.seats.split('/')[0]);
    }

    static getTotalSeats(ride) {
        return parseInt(ride.seats.split('/')[1]);
    }

    static updateSeats(ride, numPassengers) {
        const [available, total] = ride.seats.split('/').map(Number);
        const newAvailable = available - numPassengers;
        
        if (newAvailable < 0) {
            throw new Error('Not enough seats available');
        }
        
        return `${newAvailable}/${total}`;
    }
}

// Notifications
class NotificationManager {
    static show(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type}`;
        notification.style.position = 'fixed';
        notification.style.top = '5rem';
        notification.style.right = '1rem';
        notification.style.maxWidth = '400px';
        notification.style.zIndex = '10000';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, duration);
    }

    static success(message) {
        this.show(message, 'success');
    }

    static error(message) {
        this.show(message, 'danger');
    }

    static warning(message) {
        this.show(message, 'warning');
    }

    static info(message) {
        this.show(message, 'info');
    }
}

// Rating system
class RatingSystem {
    static getRating(score) {
        const stars = Math.round(score * 2) / 2; // Round to nearest 0.5
        let starDisplay = '';
        
        for (let i = 0; i < 5; i++) {
            if (i < Math.floor(stars)) {
                starDisplay += '⭐';
            } else if (i < Math.ceil(stars) && stars % 1 !== 0) {
                starDisplay += '✨'; // Half star
            } else {
                starDisplay += '☆';
            }
        }
        
        return starDisplay;
    }

    static submitRating(rideId, score, comment) {
        if (score < 1 || score > 5) {
            throw new Error('Score must be between 1 and 5');
        }
        
        // Store rating (replace with backend API)
        console.log('Rating submitted:', { rideId, score, comment });
        return true;
    }
}

// Payment calculator (for future integration with payment gateway)
class PaymentCalculator {
    static calculateTotal(ride, numPassengers) {
        return ride.cost_per_seat * numPassengers;
    }

    static calculateCommission(amount, commissionRate = 0.1) {
        return amount * commissionRate;
    }

    static calculateDriverEarnings(ride, numPassengers, commissionRate = 0.1) {
        const total = this.calculateTotal(ride, numPassengers);
        const commission = this.calculateCommission(total, commissionRate);
        return total - commission;
    }
}
