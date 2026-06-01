-- Student Lift Database Schema
-- SQL Server Management Studio
-- Version 1.0

-- =============================================================================
-- USERS & AUTHENTICATION TABLES
-- =============================================================================

-- Users table
CREATE TABLE Users (
    UserID INT PRIMARY KEY IDENTITY(1,1),
    FirstName NVARCHAR(50) NOT NULL,
    LastName NVARCHAR(50) NOT NULL,
    Email NVARCHAR(100) NOT NULL UNIQUE,
    PhoneNumber NVARCHAR(20) NOT NULL,
    PasswordHash NVARCHAR(255) NOT NULL,
    Campus NVARCHAR(50) NOT NULL, -- 'Stellenbosch', 'Pretoria', 'Kempton Park'
    StudentID NVARCHAR(20) NOT NULL UNIQUE,
    Avatar NVARCHAR(MAX), -- Base64 or URL to avatar image
    Bio NVARCHAR(500),
    IsVerified BIT DEFAULT 0,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    LastLogin DATETIME,
    IsActive BIT DEFAULT 1,
    CONSTRAINT CK_Campus CHECK (Campus IN ('Stellenbosch', 'Pretoria', 'Kempton Park'))
);

-- User Ratings (for drivers and passengers)
CREATE TABLE UserRatings (
    RatingID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT NOT NULL,
    RatedByUserID INT NOT NULL,
    RideID INT NOT NULL,
    Score DECIMAL(2,1) NOT NULL CHECK (Score >= 1 AND Score <= 5),
    Comment NVARCHAR(500),
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (RatedByUserID) REFERENCES Users(UserID),
    CONSTRAINT CK_UniqueRating UNIQUE (RideID, RatedByUserID)
);

-- =============================================================================
-- RIDES TABLES
-- =============================================================================

-- Rides (Posted by drivers)
CREATE TABLE Rides (
    RideID INT PRIMARY KEY IDENTITY(1,1),
    DriverID INT NOT NULL,
    Campus NVARCHAR(50) NOT NULL,
    FromLocation NVARCHAR(200) NOT NULL,
    ToLocation NVARCHAR(200) NOT NULL,
    DepartureDate DATE NOT NULL,
    DepartureTime TIME NOT NULL,
    EstimatedDuration INT, -- Minutes
    AvailableSeats INT NOT NULL CHECK (AvailableSeats > 0),
    TotalSeats INT NOT NULL,
    CostPerSeat DECIMAL(10,2) NOT NULL CHECK (CostPerSeat >= 0),
    VehicleType NVARCHAR(50) NOT NULL, -- 'Sedan', 'SUV', 'Hatchback', 'Van'
    VehiclePlate NVARCHAR(20),
    VehicleColor NVARCHAR(50),
    LuggageAccepted BIT DEFAULT 1,
    PetFriendly BIT DEFAULT 0,
    MusicInCar BIT DEFAULT 1,
    AdditionalNotes NVARCHAR(500),
    Status NVARCHAR(20) NOT NULL DEFAULT 'Active', -- 'Active', 'Full', 'Completed', 'Cancelled'
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (DriverID) REFERENCES Users(UserID),
    CONSTRAINT CK_RideStatus CHECK (Status IN ('Active', 'Full', 'Completed', 'Cancelled'))
);

-- Ride Requests (Passengers requesting to join rides)
CREATE TABLE RideRequests (
    RequestID INT PRIMARY KEY IDENTITY(1,1),
    RideID INT NOT NULL,
    PassengerID INT NOT NULL,
    NumberOfSeats INT NOT NULL CHECK (NumberOfSeats > 0),
    Status NVARCHAR(20) NOT NULL DEFAULT 'Pending', -- 'Pending', 'Accepted', 'Rejected', 'Cancelled'
    RequestedAt DATETIME DEFAULT GETDATE(),
    RespondedAt DATETIME,
    Notes NVARCHAR(300),
    FOREIGN KEY (RideID) REFERENCES Rides(RideID),
    FOREIGN KEY (PassengerID) REFERENCES Users(UserID),
    CONSTRAINT CK_RequestStatus CHECK (Status IN ('Pending', 'Accepted', 'Rejected', 'Cancelled'))
);

-- Ride History (For tracking completed and cancelled rides)
CREATE TABLE RideHistory (
    HistoryID INT PRIMARY KEY IDENTITY(1,1),
    RideID INT NOT NULL,
    ActualPassengers INT,
    TotalCost DECIMAL(10,2),
    CompletionStatus NVARCHAR(20), -- 'Completed', 'Cancelled'
    CancellationReason NVARCHAR(300),
    CompletedAt DATETIME,
    FOREIGN KEY (RideID) REFERENCES Rides(RideID)
);

-- =============================================================================
-- PAYMENT & TRANSACTION TABLES
-- =============================================================================

-- Payments
CREATE TABLE Payments (
    PaymentID INT PRIMARY KEY IDENTITY(1,1),
    RequestID INT NOT NULL,
    Amount DECIMAL(10,2) NOT NULL,
    PaymentMethod NVARCHAR(50) NOT NULL, -- 'Card', 'Bank Transfer', 'Wallet', 'Cash'
    TransactionID NVARCHAR(100),
    Status NVARCHAR(20) NOT NULL DEFAULT 'Pending', -- 'Pending', 'Completed', 'Failed', 'Refunded'
    CreatedAt DATETIME DEFAULT GETDATE(),
    CompletedAt DATETIME,
    FOREIGN KEY (RequestID) REFERENCES RideRequests(RequestID),
    CONSTRAINT CK_PaymentStatus CHECK (Status IN ('Pending', 'Completed', 'Failed', 'Refunded'))
);

-- User Wallets (For in-app wallet)
CREATE TABLE UserWallets (
    WalletID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT NOT NULL UNIQUE,
    Balance DECIMAL(10,2) DEFAULT 0.00,
    TotalAdded DECIMAL(10,2) DEFAULT 0.00,
    TotalSpent DECIMAL(10,2) DEFAULT 0.00,
    LastUpdated DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

-- Wallet Transactions
CREATE TABLE WalletTransactions (
    TransactionID INT PRIMARY KEY IDENTITY(1,1),
    WalletID INT NOT NULL,
    Type NVARCHAR(20) NOT NULL, -- 'Credit', 'Debit'
    Amount DECIMAL(10,2) NOT NULL,
    Description NVARCHAR(300),
    RelatedRideID INT,
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (WalletID) REFERENCES UserWallets(WalletID),
    FOREIGN KEY (RelatedRideID) REFERENCES Rides(RideID)
);

-- =============================================================================
-- REPORTING & SUPPORT TABLES
-- =============================================================================

-- Reports (For reporting bad behavior)
CREATE TABLE Reports (
    ReportID INT PRIMARY KEY IDENTITY(1,1),
    ReportingUserID INT NOT NULL,
    ReportedUserID INT NOT NULL,
    RideID INT,
    Reason NVARCHAR(100) NOT NULL, -- 'Behavior', 'Payment', 'Safety', 'Other'
    Description NVARCHAR(500) NOT NULL,
    Evidence NVARCHAR(MAX), -- Could store URLs to images/documents
    Status NVARCHAR(20) DEFAULT 'Submitted', -- 'Submitted', 'Under Review', 'Resolved', 'Closed'
    Resolution NVARCHAR(500),
    CreatedAt DATETIME DEFAULT GETDATE(),
    ResolvedAt DATETIME,
    FOREIGN KEY (ReportingUserID) REFERENCES Users(UserID),
    FOREIGN KEY (ReportedUserID) REFERENCES Users(UserID),
    FOREIGN KEY (RideID) REFERENCES Rides(RideID)
);

-- Support Tickets
CREATE TABLE SupportTickets (
    TicketID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT NOT NULL,
    Category NVARCHAR(50) NOT NULL, -- 'Bug', 'Feature Request', 'General Support', 'Payment'
    Subject NVARCHAR(200) NOT NULL,
    Description NVARCHAR(MAX) NOT NULL,
    Status NVARCHAR(20) DEFAULT 'Open', -- 'Open', 'In Progress', 'Resolved', 'Closed'
    Priority INT DEFAULT 3, -- 1=High, 2=Medium, 3=Low
    CreatedAt DATETIME DEFAULT GETDATE(),
    ResolvedAt DATETIME,
    Resolution NVARCHAR(MAX),
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

-- =============================================================================
-- NOTIFICATIONS & MESSAGING TABLES
-- =============================================================================

-- Notifications
CREATE TABLE Notifications (
    NotificationID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT NOT NULL,
    Type NVARCHAR(50) NOT NULL, -- 'RideRequest', 'RequestAccepted', 'RequestRejected', 'RideCancelled', 'Message'
    Title NVARCHAR(200) NOT NULL,
    Message NVARCHAR(500) NOT NULL,
    RelatedRideID INT,
    RelatedRequestID INT,
    IsRead BIT DEFAULT 0,
    CreatedAt DATETIME DEFAULT GETDATE(),
    ReadAt DATETIME,
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (RelatedRideID) REFERENCES Rides(RideID),
    FOREIGN KEY (RelatedRequestID) REFERENCES RideRequests(RequestID)
);

-- Direct Messages (Future feature)
CREATE TABLE DirectMessages (
    MessageID INT PRIMARY KEY IDENTITY(1,1),
    SenderID INT NOT NULL,
    ReceiverID INT NOT NULL,
    RelatedRideID INT,
    Message NVARCHAR(1000) NOT NULL,
    IsRead BIT DEFAULT 0,
    SentAt DATETIME DEFAULT GETDATE(),
    ReadAt DATETIME,
    FOREIGN KEY (SenderID) REFERENCES Users(UserID),
    FOREIGN KEY (ReceiverID) REFERENCES Users(UserID),
    FOREIGN KEY (RelatedRideID) REFERENCES Rides(RideID)
);

-- =============================================================================
-- SYSTEM & ADMIN TABLES
-- =============================================================================

-- System Settings
CREATE TABLE SystemSettings (
    SettingID INT PRIMARY KEY IDENTITY(1,1),
    SettingKey NVARCHAR(100) NOT NULL UNIQUE,
    SettingValue NVARCHAR(MAX),
    Description NVARCHAR(300),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

-- Activity Logs
CREATE TABLE ActivityLogs (
    LogID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT,
    Activity NVARCHAR(200) NOT NULL,
    RelatedTable NVARCHAR(100),
    RelatedID INT,
    IPAddress NVARCHAR(50),
    UserAgent NVARCHAR(MAX),
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Users indexes
CREATE INDEX IX_Users_Email ON Users(Email);
CREATE INDEX IX_Users_Campus ON Users(Campus);
CREATE INDEX IX_Users_IsActive ON Users(IsActive);

-- Rides indexes
CREATE INDEX IX_Rides_DriverID ON Rides(DriverID);
CREATE INDEX IX_Rides_Campus ON Rides(Campus);
CREATE INDEX IX_Rides_DepartureDate ON Rides(DepartureDate);
CREATE INDEX IX_Rides_Status ON Rides(Status);
CREATE INDEX IX_Rides_Route ON Rides(FromLocation, ToLocation);

-- Ride Requests indexes
CREATE INDEX IX_RideRequests_RideID ON RideRequests(RideID);
CREATE INDEX IX_RideRequests_PassengerID ON RideRequests(PassengerID);
CREATE INDEX IX_RideRequests_Status ON RideRequests(Status);

-- User Ratings indexes
CREATE INDEX IX_UserRatings_UserID ON UserRatings(UserID);
CREATE INDEX IX_UserRatings_RatedByUserID ON UserRatings(RatedByUserID);

-- Payments indexes
CREATE INDEX IX_Payments_Status ON Payments(Status);
CREATE INDEX IX_Payments_CreatedAt ON Payments(CreatedAt);

-- =============================================================================
-- VIEWS FOR COMMON QUERIES
-- =============================================================================

-- Active Rides by Campus
CREATE VIEW v_ActiveRidesByCampus AS
SELECT 
    r.RideID,
    u.FirstName + ' ' + u.LastName AS DriverName,
    r.FromLocation,
    r.ToLocation,
    r.DepartureDate,
    r.DepartureTime,
    r.AvailableSeats,
    r.CostPerSeat,
    r.Campus,
    (SELECT AVG(Score) FROM UserRatings WHERE UserID = r.DriverID) AS DriverRating
FROM Rides r
INNER JOIN Users u ON r.DriverID = u.UserID
WHERE r.Status = 'Active' AND r.DepartureDate >= CAST(GETDATE() AS DATE);

-- User Statistics
CREATE VIEW v_UserStatistics AS
SELECT 
    u.UserID,
    u.FirstName,
    u.LastName,
    u.Email,
    COUNT(DISTINCT r.RideID) AS RidesPosted,
    (SELECT COUNT(*) FROM RideRequests WHERE PassengerID = u.UserID AND Status = 'Accepted') AS RidesJoined,
    (SELECT AVG(Score) FROM UserRatings WHERE UserID = u.UserID) AS AverageRating,
    (SELECT COUNT(*) FROM UserRatings WHERE UserID = u.UserID) AS TotalRatings,
    (SELECT COUNT(*) FROM RideHistory WHERE RideID IN (SELECT RideID FROM Rides WHERE DriverID = u.UserID)) AS CompletedRides,
    (SELECT ISNULL(SUM(TotalCost), 0) FROM RideHistory WHERE RideID IN (SELECT RideID FROM Rides WHERE DriverID = u.UserID)) AS TotalEarnings
FROM Users u
LEFT JOIN Rides r ON u.UserID = r.DriverID
GROUP BY u.UserID, u.FirstName, u.LastName, u.Email;

-- =============================================================================
-- STORED PROCEDURES (Sample)
-- =============================================================================

-- Get Available Rides by Campus and Date
CREATE PROCEDURE sp_GetAvailableRides
    @Campus NVARCHAR(50),
    @Date DATE
AS
BEGIN
    SELECT * FROM v_ActiveRidesByCampus
    WHERE Campus = @Campus AND DepartureDate = @Date
    ORDER BY DepartureTime;
END;

-- =============================================================================
-- NOTES
-- =============================================================================
/*
1. All timestamps use DATETIME DEFAULT GETDATE() for server-side consistency
2. Status fields use CHECK constraints for data integrity
3. Foreign keys enforce referential integrity
4. Indexes are created on frequently searched columns
5. Views provide commonly needed data aggregations
6. Always hash passwords before storing (use bcrypt or similar in application)
7. Implement row-level security where needed
8. Consider archiving old ride data for performance
9. Regular backups are recommended
10. Monitor query performance and add indexes as needed
*/
