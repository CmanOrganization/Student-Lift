const mongoose = require(`mongoose`);
const bcrypt   = require(`bcryptjs`);
require(`dotenv`).config();

const User            = require(`./Models/User`);
const Ride            = require(`./Models/Ride`);
const RideRequest     = require(`./Models/RideRequest`);
const Rating          = require(`./Models/Rating`);
const Notification    = require(`./Models/Notification`);
const Payment         = require(`./Models/Payment`);
const WalletTransaction = require(`./Models/WalletTransaction`);

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(`Connected to MongoDB`);

        // ── Wipe existing data ────────────────────────────────────────────────
        await Promise.all([
            User.deleteMany(),
            Ride.deleteMany(),
            RideRequest.deleteMany(),
            Rating.deleteMany(),
            Notification.deleteMany(),
            Payment.deleteMany(),
            WalletTransaction.deleteMany()
        ]);
        console.log(`  Cleared existing data`);

        // ── Create Users ──────────────────────────────────────────────────────
        const password = await bcrypt.hash(`Password123!`, 12);

        const users = await User.insertMany([
            {
                firstName:    `Thabo`,
                lastName:     `Nkosi`,
                email:        `thabo.nkosi@student.ac.za`,
                phoneNumber:  `+27821234567`,
                passwordHash: password,
                campus:       `Stellenbosch`,
                studentID:    `STU001`,
                bio:          `I drive to Cape Town every Friday. Reliable and punctual.`,
                isVerified:   true,
                wallet:       { balance: 250.00, totalAdded: 500.00, totalSpent: 250.00 },
                ratingSummary:{ average: 4.8, count: 10 }
            },
            {
                firstName:    `Lerato`,
                lastName:     `Molefe`,
                email:        `lerato.molefe@student.ac.za`,
                phoneNumber:  `+27834567890`,
                passwordHash: password,
                campus:       `Pretoria`,
                studentID:    `STU002`,
                bio:          `Final year student, love carpooling to save costs.`,
                isVerified:   true,
                wallet:       { balance: 100.00, totalAdded: 300.00, totalSpent: 200.00 },
                ratingSummary:{ average: 4.5, count: 6 }
            },
            {
                firstName:    `Armand`,
                lastName:     `Erasmus`,
                email:        `armand.erasmus@student.ac.za`,
                phoneNumber:  `+27856789012`,
                passwordHash: password,
                campus:       `Kempton Park`,
                studentID:    `STU003`,
                bio:          `I go home to Johannesburg every weekend.`,
                isVerified:   true,
                wallet:       { balance: 50.00, totalAdded: 200.00, totalSpent: 150.00 },
                ratingSummary:{ average: 4.2, count: 4 }
            },
            {
                firstName:    `Siya`,
                lastName:     `Dlamini`,
                email:        `siya.dlamini@student.ac.za`,
                phoneNumber:  `+27867890123`,
                passwordHash: password,
                campus:       `Stellenbosch`,
                studentID:    `STU004`,
                bio:          `Passenger only — studying full time.`,
                isVerified:   false,
                wallet:       { balance: 0.00, totalAdded: 0.00, totalSpent: 0.00 },
                ratingSummary:{ average: 0, count: 0 }
            },
            {
                firstName:    `Naledi`,
                lastName:     `Khumalo`,
                email:        `naledi.khumalo@student.ac.za`,
                phoneNumber:  `+27878901234`,
                passwordHash: password,
                campus:       `Pretoria`,
                studentID:    `STU005`,
                bio:          `Looking for rides between Pretoria and Centurion.`,
                isVerified:   true,
                wallet:       { balance: 175.00, totalAdded: 400.00, totalSpent: 225.00 },
                ratingSummary:{ average: 4.9, count: 8 }
            }
        ]);
        console.log(` Created ${users.length} users`);

        // ── Create Rides ──────────────────────────────────────────────────────
        const rides = await Ride.insertMany([
            {
                driverID:      users[0]._id,  // Thabo
                campus:        `Stellenbosch`,
                fromLocation:  `Stellenbosch Campus Main Gate`,
                toLocation:    `Cape Town CBD`,
                departureDate: new Date(`2026-06-02`),
                departureTime: `08:00`,
                estimatedDuration: 45,
                availableSeats: 3,
                totalSeats:    4,
                costPerSeat:   60.00,
                status:        `Active`,
                vehicle:       { type: `Sedan`, plate: `CA 123-456`, color: `White` },
                preferences:   { luggageAccepted: true, petFriendly: false, musicInCar: true },
                additionalNotes: `No smoking please`
            },
            {
                driverID:      users[0]._id,  // Thabo
                campus:        `Stellenbosch`,
                fromLocation:  `Stellenbosch Station`,
                toLocation:    `Somerset West`,
                departureDate: new Date(`2026-06-03`),
                departureTime: `14:30`,
                estimatedDuration: 30,
                availableSeats: 2,
                totalSeats:    4,
                costPerSeat:   40.00,
                status:        `Active`,
                vehicle:       { type: `Sedan`, plate: `CA 123-456`, color: `White` },
                preferences:   { luggageAccepted: true, petFriendly: true, musicInCar: true },
                additionalNotes: `Pet friendly ride`
            },
            {
                driverID:      users[1]._id,  // Lerato
                campus:        `Pretoria`,
                fromLocation:  `University of Pretoria Main Campus`,
                toLocation:    `Menlyn Mall`,
                departureDate: new Date(`2026-06-02`),
                departureTime: `17:00`,
                estimatedDuration: 20,
                availableSeats: 3,
                totalSeats:    5,
                costPerSeat:   25.00,
                status:        `Active`,
                vehicle:       { type: `SUV`, plate: `GP 789-012`, color: `Silver` },
                preferences:   { luggageAccepted: false, petFriendly: false, musicInCar: true },
                additionalNotes: `After-class ride, leaving sharp at 17:00`
            },
            {
                driverID:      users[2]._id,  // Armand
                campus:        `Kempton Park`,
                fromLocation:  `Kempton Park Campus`,
                toLocation:    `OR Tambo International Airport`,
                departureDate: new Date(`2026-06-04`),
                departureTime: `06:00`,
                estimatedDuration: 15,
                availableSeats: 3,
                totalSeats:    4,
                costPerSeat:   50.00,
                status:        `Active`,
                vehicle:       { type: `Hatchback`, plate: `GP 345-678`, color: `Black` },
                preferences:   { luggageAccepted: true, petFriendly: false, musicInCar: false },
                additionalNotes: `Early morning airport run`
            },
            {
                driverID:      users[1]._id,  // Lerato — completed ride example
                campus:        `Pretoria`,
                fromLocation:  `Hatfield`,
                toLocation:    `Centurion`,
                departureDate: new Date(`2026-05-20`),
                departureTime: `09:00`,
                estimatedDuration: 25,
                availableSeats: 0,
                totalSeats:    3,
                costPerSeat:   30.00,
                status:        `Completed`,
                vehicle:       { type: `SUV`, plate: `GP 789-012`, color: `Silver` },
                preferences:   { luggageAccepted: true, petFriendly: false, musicInCar: true },
                completionDetails: {
                    actualPassengers: 3,
                    totalCost:        90.00,
                    completionStatus: `Completed`,
                    completedAt:      new Date(`2026-05-20T09:30:00`)
                }
            }
        ]);
        console.log(`Created ${rides.length} rides`);

        // ── Create Ride Requests ──────────────────────────────────────────────
        const requests = await RideRequest.insertMany([
            {
                rideID:        rides[0]._id,  // Thabo's Cape Town ride
                passengerID:   users[3]._id,  // Siya
                numberOfSeats: 1,
                status:        `Pending`,
                notes:         `I have one small backpack`
            },
            {
                rideID:        rides[0]._id,  // Thabo's Cape Town ride
                passengerID:   users[4]._id,  // Naledi
                numberOfSeats: 1,
                status:        `Accepted`,
                notes:         ``,
                respondedAt:   new Date()
            },
            {
                rideID:        rides[2]._id,  // Lerato's Menlyn ride
                passengerID:   users[4]._id,  // Naledi
                numberOfSeats: 2,
                status:        `Pending`,
                notes:         `Coming with a friend`
            },
            {
                rideID:        rides[4]._id,  // Lerato's completed ride
                passengerID:   users[3]._id,  // Siya
                numberOfSeats: 1,
                status:        `Accepted`,
                respondedAt:   new Date(`2026-05-19`)
            }
        ]);
        console.log(` Created ${requests.length} ride requests`);

        // ── Create Ratings ────────────────────────────────────────────────────
        await Rating.insertMany([
            {
                userID:        users[1]._id,  // Lerato rated
                ratedByUserID: users[3]._id,  // by Siya
                rideID:        rides[4]._id,
                score:         5,
                comment:       `Great driver, very smooth ride!`
            },
            {
                userID:        users[3]._id,  // Siya rated
                ratedByUserID: users[1]._id,  // by Lerato
                rideID:        rides[4]._id,
                score:         4,
                comment:       `Polite passenger, on time`
            }
        ]);
        console.log(` Created ratings`);

        // ── Create Notifications ──────────────────────────────────────────────
        await Notification.insertMany([
            {
                userID:           users[0]._id,  // Thabo notified
                type:             `RideRequest`,
                title:            `New Ride Request`,
                message:          `Siya Dlamini wants to join your ride to Cape Town.`,
                relatedRideID:    rides[0]._id,
                relatedRequestID: requests[0]._id,
                isRead:           false
            },
            {
                userID:           users[4]._id,  // Naledi notified
                type:             `RequestAccepted`,
                title:            `Request Accepted!`,
                message:          `Your request to join the Cape Town ride has been accepted.`,
                relatedRideID:    rides[0]._id,
                relatedRequestID: requests[1]._id,
                isRead:           true,
                readAt:           new Date()
            }
        ]);
        console.log(`Created notifications`);

        // ── Create Payments ───────────────────────────────────────────────────
        await Payment.insertMany([
            {
                requestID:     requests[3]._id,
                amount:        30.00,
                paymentMethod: `Wallet`,
                transactionID: `TXN_001`,
                status:        `Completed`,
                completedAt:   new Date(`2026-05-20`)
            }
        ]);
        console.log(`Created payments`);

        // ── Create Wallet Transactions ────────────────────────────────────────
        await WalletTransaction.insertMany([
            {
                userID:        users[3]._id,  // Siya
                type:          `Debit`,
                amount:        30.00,
                description:   `Payment for ride to Centurion`,
                relatedRideID: rides[4]._id
            },
            {
                userID:        users[0]._id,  // Thabo
                type:          `Credit`,
                amount:        500.00,
                description:   `Wallet top-up`
            }
        ]);
        console.log(`Created wallet transactions`);

        // ── Summary ───────────────────────────────────────────────────────────
        console.log(`\n Seed complete! Test accounts (all use password: Password123!):`);
        users.forEach(u => console.log(`   ${u.email} — ${u.campus}`));

        mongoose.disconnect();
    } catch (err) {
        console.error(` Seed failed:`, err.message);
        mongoose.disconnect();
        process.exit(1);
    }
};

seed();
