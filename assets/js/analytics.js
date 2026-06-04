// Analytics frontend: fetch platform metrics and render Chart.js graphs

document.addEventListener('DOMContentLoaded', startAnalytics);

function getAuthToken() {
  return localStorage.getItem('authToken');
}

async function fetchPlatformMetrics() {
  try {
    var token = getAuthToken();
    var headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = 'Bearer ' + token;

    var response = await fetch('/api/metrics/platform-summary', { method: 'GET', headers: headers });
    if (!response.ok) {
      throw new Error('Failed to fetch metrics');
    }
    var data = await response.json();
    return data;
  } catch (err) {
    return null;
  }
}

function renderRidesByStatusChart(elementId, ridesByStatus) {
  var ctx = document.getElementById(elementId).getContext('2d');
  var labels = [];
  var data = [];
  for (var key in ridesByStatus) {
    if (Object.prototype.hasOwnProperty.call(ridesByStatus, key)) {
      labels.push(key);
      data.push(ridesByStatus[key]);
    }
  }

  var config = {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{ label: 'Rides by Status', data: data, backgroundColor: ['#3b82f6', '#10b981', '#f97316'] }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  };

  return new Chart(ctx, config);
}

function tooltipLabel(context) {
  return context.dataset.label + ': ' + context.formattedValue;
}

function renderRevenueChart(elementId, revenueByType) {
  var ctx = document.getElementById(elementId).getContext('2d');
  var labels = ['Credit', 'Debit'];
  var data = [revenueByType.Credit || 0, revenueByType.Debit || 0];

  var config = {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{ label: 'Revenue', data: data, backgroundColor: ['#06b6d4', '#ef4444'] }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          callbacks: { label: tooltipLabel }
        }
      }
    }
  };

  return new Chart(ctx, config);
}

function renderStatistics(metrics) {
  var totalUsersEl = document.getElementById('statTotalUsers');
  var totalRidesEl = document.getElementById('statTotalRides');
  var completionRateEl = document.getElementById('statCompletionRate');
  var totalRevenueEl = document.getElementById('statTotalRevenue');

  if (totalUsersEl) {
    totalUsersEl.textContent = metrics.totalUsers != null ? metrics.totalUsers : '0';
  }

  if (totalRidesEl) {
    totalRidesEl.textContent = metrics.totalRidesCreated != null ? metrics.totalRidesCreated : '0';
  }

  if (completionRateEl) {
    completionRateEl.textContent = metrics.completionRate != null ? metrics.completionRate + '%' : '0%';
  }

  if (totalRevenueEl) {
    totalRevenueEl.textContent = metrics.totalRevenueExchanged != null ? 'R' + metrics.totalRevenueExchanged : 'R0';
  }
}

async function startAnalytics() {
  var metrics = await fetchPlatformMetrics();
  if (!metrics) return;

  initializeAnalytics(metrics);
}

function initializeAnalytics(metrics) {
  renderStatistics(metrics);

  if (metrics.ridesByStatus) {
    renderRidesByStatusChart('ridesByStatusChart', metrics.ridesByStatus);
  }

  if (metrics.revenueByType) {
    renderRevenueChart('revenueChart', metrics.revenueByType);
  }
}
