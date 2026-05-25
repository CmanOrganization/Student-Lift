const express = require(`express`);
const router = express.Router();
const Ride = require(`../Models/Ride`);

router.post(`/post-Ride`, async(req,res) => {
    try{
        const newRide = new Ride(req.body);
        const savedRide = await newRide.save();
        res.status(201).json(savedRide);
    } catch (error) {
        res.status(500).json({error:error.message});
    }
})

router.get(`/all-Rides`, async (req,res) =>{
    try{
        const rides = await Ride.find({ status: `Active` })
            .populate(`driverID`, `firstName lastName campus ratingSummary`);
        res.json(rides);
    } catch (error) {
        res.status(500).json({ error: error.message});
    }
})

module.exports = router;