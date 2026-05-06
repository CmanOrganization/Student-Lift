# Student Lift - API Documentation
## Backend Integration Guide

This document outlines the API endpoints that should be implemented for the Student Lift application.

---

## Base URL
```
https://api.studentlift.com/v1
```

## Authentication
All endpoints (except `/auth/login` and `/auth/register`) require an Authorization header:
```
Authorization: Bearer {JWT_TOKEN}
```

---

## 1. AUTHENTICATION ENDPOINTS

### Register User
```
POST /auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@student.ac.za",
  "phoneNumber": "+27123456789",
  "password": "SecurePass123!",
  "campus": "Stellenbosch",
  "studentID": "12345678"
}

Response: 201 Created
{
  "userId": 1,
  "email": "john.doe@student.ac.za",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 86400
}
```

### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "john.doe@student.ac.za",
  "password": "SecurePass123!"
}

Response: 200 OK
{
  "userId": 1,
  "email": "john.doe@student.ac.za",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 86400
}
```

### Logout
```
POST /auth/logout
Authorization: Bearer {JWT_TOKEN}

Response: 200 OK
{
  "message": "Logged out successfully"
}
```

### Refresh Token
```
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "..."
}

Response: 200 OK
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 86400
}
```

---

## 2. USER ENDPOINTS

### Get User Profile
```
GET /users/me
Authorization: Bearer {JWT_TOKEN}

Response: 200 OK
{
  "userId": 1,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@student.ac.za",
  "phoneNumber": "+27123456789",
  "campus": "Stellenbosch",
  "avatar": "base64_image_data",
  "bio": "Love carpooling!",
  "averageRating": 4.8,
  "totalRatings": 12,
  "ridesCompleted": 25,
  "isVerified": true,
  "createdAt": "2026-01-15T10:30:00Z"
}
```

### Update User Profile
```
PUT /users/me
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+27123456789",
  "bio": "Updated bio",
  "avatar": "base64_image_data"
}

Response: 200 OK
{
  "message": "Profile updated successfully",
  "user": { ... }
}
```

### Get User by ID
```
GET /users/{userId}
Authorization: Bearer {JWT_TOKEN}

Response: 200 OK
{
  "userId": 1,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@student.ac.za",
  "campus": "Stellenbosch",
  "averageRating": 4.8,
  "totalRatings": 12
}
```

### Change Password
```
POST /users/change-password
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass456!"
}

Response: 200 OK
{
  "message": "Password changed successfully"
}
```

---

## 3. RIDES ENDPOINTS

### Post a Ride
```
POST /rides
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "campus": "Stellenbosch",
  "fromLocation": "Campus Main Gate",
  "toLocation": "Pick n Pay Shopping Center",
  "departureDate": "2026-05-10",
  "departureTime": "14:30",
  "estimatedDuration": 45,
  "availableSeats": 3,
  "totalSeats": 4,
  "costPerSeat": 50,
  "vehicleType": "Sedan",
  "vehiclePlate": "ABC123",
  "vehicleColor": "Silver",
  "luggageAccepted": true,
  "petFriendly": false,
  "musicInCar": true,
  "additionalNotes": "No smoking please"
}

Response: 201 Created
{
  "rideId": 1,
  "driverId": 1,
  "status": "Active",
  "createdAt": "2026-05-06T10:30:00Z"
}
```

### Get All Available Rides
```
GET /rides?campus=Stellenbosch&date=2026-05-10&maxBudget=100
Authorization: Bearer {JWT_TOKEN}

Response: 200 OK
{
  "total": 5,
  "rides": [
    {
      "rideId": 1,
      "driverId": 1,
      "driverName": "John Doe",
      "driverRating": 4.8,
      "fromLocation": "Campus Main Gate",
      "toLocation": "Pick n Pay Shopping Center",
      "departureDate": "2026-05-10",
      "departureTime": "14:30",
      "availableSeats": 3,
      "costPerSeat": 50,
      "vehicleType": "Sedan",
      "luggageAccepted": true,
      "petFriendly": false
    },
    ...
  ]
}
```

### Get Ride Details
```
GET /rides/{rideId}
Authorization: Bearer {JWT_TOKEN}

Response: 200 OK
{
  "rideId": 1,
  "driverId": 1,
  "driverName": "John Doe",
  "driverPhone": "+27123456789",
  "driverRating": 4.8,
  "fromLocation": "Campus Main Gate",
  "toLocation": "Pick n Pay Shopping Center",
  "departureDate": "2026-05-10",
  "departureTime": "14:30",
  "estimatedDuration": 45,
  "availableSeats": 2,
  "totalSeats": 4,
  "costPerSeat": 50,
  "vehicleType": "Sedan",
  "vehicleColor": "Silver",
  "luggageAccepted": true,
  "additionalNotes": "No smoking please",
  "status": "Active",
  "currentPassengers": [
    {
      "userId": 2,
      "firstName": "Jane",
      "lastName": "Smith",
      "rating": 4.9
    }
  ]
}
```

### Update Ride
```
PUT /rides/{rideId}
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "departureTime": "15:00",
  "costPerSeat": 55,
  "additionalNotes": "Updated notes"
}

Response: 200 OK
{
  "message": "Ride updated successfully",
  "ride": { ... }
}
```

### Cancel Ride
```
DELETE /rides/{rideId}
Authorization: Bearer {JWT_TOKEN}

{
  "reason": "Changed my schedule"
}

Response: 200 OK
{
  "message": "Ride cancelled successfully"
}
```

### Get My Posted Rides
```
GET /rides/my-posts
Authorization: Bearer {JWT_TOKEN}

Response: 200 OK
{
  "total": 3,
  "rides": [ ... ]
}
```

### Mark Ride Complete
```
POST /rides/{rideId}/complete
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "actualPassengers": 3
}

Response: 200 OK
{
  "message": "Ride marked as complete"
}
```

---

## 4. RIDE REQUEST ENDPOINTS

### Request a Ride
```
POST /rides/{rideId}/requests
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "numberOfSeats": 1,
  "notes": "Student with luggage"
}

Response: 201 Created
{
  "requestId": 1,
  "rideId": 1,
  "passengerId": 2,
  "status": "Pending",
  "createdAt": "2026-05-06T10:30:00Z"
}
```

### Get Ride Requests (for driver)
```
GET /rides/{rideId}/requests
Authorization: Bearer {JWT_TOKEN}

Response: 200 OK
{
  "total": 2,
  "requests": [
    {
      "requestId": 1,
      "passengerId": 2,
      "passengerName": "Jane Smith",
      "passengerRating": 4.9,
      "numberOfSeats": 1,
      "status": "Pending",
      "notes": "Student with luggage",
      "createdAt": "2026-05-06T10:30:00Z"
    }
  ]
}
```

### Accept Request
```
POST /rides/{rideId}/requests/{requestId}/accept
Authorization: Bearer {JWT_TOKEN}

Response: 200 OK
{
  "message": "Request accepted",
  "request": { ... }
}
```

### Reject Request
```
POST /rides/{rideId}/requests/{requestId}/reject
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "reason": "Ride is full"
}

Response: 200 OK
{
  "message": "Request rejected"
}
```

### Get My Requests
```
GET /ride-requests/my-requests
Authorization: Bearer {JWT_TOKEN}

Response: 200 OK
{
  "total": 2,
  "requests": [
    {
      "requestId": 1,
      "rideId": 1,
      "driverName": "John Doe",
      "fromLocation": "Campus Main Gate",
      "toLocation": "Shopping Center",
      "status": "Accepted",
      "createdAt": "2026-05-06T10:30:00Z"
    }
  ]
}
```

### Cancel Request
```
DELETE /ride-requests/{requestId}
Authorization: Bearer {JWT_TOKEN}

Response: 200 OK
{
  "message": "Request cancelled"
}
```

---

## 5. RATINGS & REVIEWS ENDPOINTS

### Submit Rating
```
POST /ratings
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "rideId": 1,
  "ratedUserId": 1,
  "score": 5,
  "comment": "Great driver, very friendly!"
}

Response: 201 Created
{
  "ratingId": 1,
  "score": 5,
  "comment": "Great driver, very friendly!",
  "createdAt": "2026-05-06T10:30:00Z"
}
```

### Get User Ratings
```
GET /ratings/user/{userId}
Authorization: Bearer {JWT_TOKEN}

Response: 200 OK
{
  "totalRatings": 12,
  "averageScore": 4.8,
  "ratings": [
    {
      "ratingId": 1,
      "ratedByName": "Jane Smith",
      "score": 5,
      "comment": "Great driver!",
      "createdAt": "2026-05-05T14:30:00Z"
    }
  ]
}
```

---

## 6. PAYMENT ENDPOINTS

### Process Payment
```
POST /payments
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "requestId": 1,
  "amount": 50,
  "paymentMethod": "Card",
  "stripeToken": "tok_visa"
}

Response: 201 Created
{
  "paymentId": 1,
  "amount": 50,
  "status": "Completed",
  "transactionId": "txn_1234567890",
  "createdAt": "2026-05-06T10:30:00Z"
}
```

### Get Payment History
```
GET /payments/history
Authorization: Bearer {JWT_TOKEN}

Response: 200 OK
{
  "total": 5,
  "payments": [
    {
      "paymentId": 1,
      "amount": 50,
      "paymentMethod": "Card",
      "status": "Completed",
      "createdAt": "2026-05-06T10:30:00Z"
    }
  ]
}
```

---

## 7. NOTIFICATIONS ENDPOINTS

### Get Notifications
```
GET /notifications?unreadOnly=true
Authorization: Bearer {JWT_TOKEN}

Response: 200 OK
{
  "total": 3,
  "notifications": [
    {
      "notificationId": 1,
      "type": "RideRequest",
      "title": "New ride request",
      "message": "Jane Smith requested to join your ride",
      "relatedRideId": 1,
      "isRead": false,
      "createdAt": "2026-05-06T10:30:00Z"
    }
  ]
}
```

### Mark Notification as Read
```
PUT /notifications/{notificationId}/read
Authorization: Bearer {JWT_TOKEN}

Response: 200 OK
{
  "message": "Notification marked as read"
}
```

---

## 8. SEARCH & FILTER ENDPOINTS

### Search Rides
```
GET /rides/search?
  campus=Stellenbosch&
  fromLocation=Campus&
  toLocation=Shopping&
  date=2026-05-10&
  maxBudget=100&
  limit=10&
  offset=0
Authorization: Bearer {JWT_TOKEN}

Response: 200 OK
{
  "total": 5,
  "limit": 10,
  "offset": 0,
  "rides": [ ... ]
}
```

---

## ERROR RESPONSES

### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "Invalid parameters",
  "details": {
    "field": "Invalid value"
  }
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "You don't have permission to access this resource"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Resource not found"
}
```

### 409 Conflict
```json
{
  "error": "Conflict",
  "message": "Ride is full"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

---

## RATE LIMITING

All API endpoints are rate limited:
- **Authenticated Users**: 1000 requests per hour
- **Public Endpoints**: 100 requests per hour

Rate limit information is provided in response headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1620000000
```

---

## WEBHOOK EVENTS (Future)

The API will support webhooks for real-time notifications:
- `ride.created`
- `ride.request.received`
- `ride.request.accepted`
- `ride.completed`
- `payment.completed`
- `user.rated`

---

## IMPLEMENTATION CHECKLIST

- [ ] Set up Node.js/Express backend
- [ ] Implement JWT authentication
- [ ] Create SQL Server database
- [ ] Implement all endpoints
- [ ] Add input validation
- [ ] Implement error handling
- [ ] Add logging
- [ ] Set up rate limiting
- [ ] Implement caching
- [ ] Add security headers (CORS, CSP, etc.)
- [ ] Write API tests
- [ ] Deploy to production
- [ ] Set up monitoring and alerting

---

**Last Updated**: May 6, 2026  
**API Version**: 1.0  
**Status**: Planning Phase
