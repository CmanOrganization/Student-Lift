# Student Lift 🚗

A ride-sharing platform designed exclusively for university students. Share journeys, save money, and build community connections.

## Overview

Student Lift is a web-based ride-sharing application that allows students from Belgium Campus IT University to post and request rides between three campuses:
- **Stellenbosch** (Main Campus)
- **Pretoria** (North Campus)  
- **Kempton Park** (East Campus)

## Features

✅ **Student Authentication**
- Secure login and registration system
- Campus-specific user profiles
- User ratings and reviews

✅ **Post Rides**
- Create ride postings with custom routes, times, and pricing
- Set available seats and vehicle information
- Add ride preferences (luggage, pets, music)
- Multi-step form wizard with validation

✅ **Request Rides**
- Search for available rides based on preferences
- Filter by budget, date, and route
- Send ride requests to drivers
- Track request status

✅ **Ride Management**
- View active rides
- Track completed trips
- Access ride history
- Manage cancellations

✅ **Mobile Responsive**
- Fully optimized for phones and tablets
- Touch-friendly interface
- Fast loading times

## Project Structure

```
Student-Lift/
├── index.html                    # Login/Registration page
├── pages/                        # Application pages
│   ├── dashboard.html           # Main dashboard
│   ├── post-ride.html           # Post a ride (multi-step form)
│   ├── request-ride.html        # Request a ride
│   └── my-rides.html            # View all rides
├── assets/                       # Static files
│   ├── css/
│   │   └── styles.css           # Main stylesheet (mobile-responsive)
│   ├── js/
│   │   ├── auth.js              # Authentication logic
│   │   ├── app.js               # Dashboard & main app logic
│   │   └── rides.js             # Ride management & utilities
│   └── images/                  # Logos, icons (placeholder)
├── Models/                       # Database schema documentation
├── data/                         # Future backend data layer
└── README.md                     # This file
```

## Quick Start

### 1. Open the Application
Simply open `index.html` in a web browser to get started.

### 2. Create an Account
- Click "Register" tab
- Fill in your information
- Select your campus
- Create password
- Accept terms and submit

### 3. Login
- Use your email and password to login
- You'll be directed to the dashboard

### 4. Post a Ride
1. Click "Post Ride" button
2. Follow the 3-step wizard:
   - **Step 1**: Select campus, enter route details
   - **Step 2**: Set date, time, seats, and pricing
   - **Step 3**: Add preferences and review
3. Click "Post Ride" to publish

### 5. Request a Ride
1. Click "Request Ride" button
2. Enter your location needs and preferences
3. Set your budget
4. Click "Search Rides"
5. Browse matching rides and send requests

### 6. View Rides
- **Dashboard**: See available rides and statistics
- **My Rides**: View all your posted rides and requests
- Track active, completed, and cancelled rides

## Technology Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Mobile-first responsive design
- **JavaScript ES6+** - Interactive functionality
- **LocalStorage** - Temporary data storage (frontend demo)

### Future Backend
- **SQL Server Management Studio** - Database
- **Backend Framework** - (To be determined)
- **API** - RESTful endpoints

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## File Descriptions

### HTML Files
| File | Purpose |
|------|---------|
| `index.html` | Login and registration interface |
| `pages/dashboard.html` | Main user dashboard with stats and ride listings |
| `pages/post-ride.html` | Multi-step form to create and post rides |
| `pages/request-ride.html` | Form to search and request available rides |
| `pages/my-rides.html` | Display active, completed, and cancelled rides |

### CSS File
| File | Purpose |
|------|---------|
| `assets/css/styles.css` | Complete styling with mobile responsiveness (1000+ lines) |

### JavaScript Files
| File | Purpose |
|------|---------|
| `assets/js/auth.js` | Login/registration form handling, user authentication |
| `assets/js/app.js` | Dashboard logic, navigation, data loading |
| `assets/js/rides.js` | Ride management, filtering, validation utilities |

## Key Features Explained

### Authentication System
- User credentials stored securely in browser localStorage (demo)
- User object contains: ID, name, email, phone, campus, avatar
- Logout functionality clears session data

### Ride Management
- **RidesManager** class handles CRUD operations
- **RideFilter** class provides filtering by date, campus, budget, route
- **RideCalculator** computes costs, duration, distance
- **AvailabilityChecker** tracks seat availability

### Form Validation
- Real-time field validation
- Password strength checking
- Email format validation
- Budget and seat quantity validation

### Responsive Design
- Mobile-first approach
- Breakpoints for tablets (768px) and mobile (480px)
- Touch-friendly buttons and forms
- Optimized images and CSS for performance

## Customization

### Colors
Edit the CSS variables in `assets/css/styles.css`:
```css
:root {
    --primary-color: #2563eb;
    --secondary-color: #1e40af;
    /* ... more colors ... */
}
```

### Campus Names
Update in all HTML files and JavaScript to match your needs:
- Stellenbosch
- Pretoria
- Kempton Park

### Form Fields
Modify form fields in respective HTML pages. Ensure JavaScript validation is updated accordingly.

## Data Management (Current)

The application currently uses:
- **LocalStorage** for user sessions and ride data (frontend only)
- Mock data for demonstration purposes
- No backend connectivity yet

## Next Steps for Backend Integration

1. **Database Setup**
   - Create SQL Server schema (see `Models/` folder)
   - Design tables: Users, Rides, Requests, Reviews, Ratings

2. **Backend API**
   - Create REST endpoints for all operations
   - Implement authentication (JWT or Session)
   - Add payment processing (Stripe, PayPal, Luno)

3. **Security**
   - Implement HTTPS/SSL
   - Add CORS configuration
   - Validate user permissions
   - Implement rate limiting

4. **Additional Features**
   - Real-time notifications (WebSockets)
   - Map integration (Google Maps API)
   - Payment gateway integration
   - Email/SMS notifications
   - Rating and review system
   - In-app messaging

## Database Schema (Placeholder)

See `Models/database-schema.md` for the planned SQL Server schema.

## Troubleshooting

### Not Able to Login After Registration?
- Check browser console for errors (F12)
- Clear browser cache and localStorage
- Ensure JavaScript is enabled

### Styles Not Loading?
- Verify the CSS file path is correct
- Check browser developer tools (F12) for 404 errors
- Hard refresh the page (Ctrl+F5)

### Form Not Submitting?
- Check that all required fields are filled
- Verify JavaScript is enabled
- Check console for validation errors

## Code Examples

### Creating a Ride (JavaScript)
```javascript
const rideData = {
    userId: currentUser.id,
    campus: 'stellenbosch',
    from_location: 'Campus Main Gate',
    to_location: 'Shopping Center',
    ride_date: '2026-05-06',
    ride_time: '10:30',
    available_seats: 3,
    cost_per_seat: 50
};

const newRide = ridesManager.addRide(rideData);
```

### Filtering Rides (JavaScript)
```javascript
const filters = {
    campus: 'stellenbosch',
    date: '2026-05-06',
    maxBudget: 100
};

const availableRides = RideFilter.combineFilters(ridesManager.rides, filters);
```

## Contributing

When contributing to this project:
1. Maintain the existing code structure
2. Update documentation for new features
3. Test on multiple devices (desktop, tablet, mobile)
4. Ensure code is commented and readable
5. Follow the existing styling conventions

## License

This project is created for educational purposes for Belgium Campus IT University students.

## Support & Contact

For issues, questions, or suggestions, please contact the Student Lift team.

---

**Last Updated**: May 6, 2026  
**Version**: 1.0.0 (Beta)  
**Status**: Frontend Complete - Backend Coming Soon
