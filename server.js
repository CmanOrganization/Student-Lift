const express = require(`express`);
const mongoose = require(`mongoose`);
const cors = require(`cors`);
require(`dotenv`).config();

const rideRoutes = require(`./routes/rideRoutes`);

const app = express();

app.use(express.json());
app.use(cors());
app.use(`/v1/rides`, rideRoutes);

app.get(`/`, (req,res) => {
    res.send(`BC WildWatch Student Lift API is running..`);
})

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})
.catch(error => console.log(error));