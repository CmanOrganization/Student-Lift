const express = require(`express`);
const mongoose = require(`mongoose`);
const cors = require(`cors`);
const path = require(`path`);
require(`dotenv`).config();

const rideRoutes = require(`./routes/rideRoutes`);

const app = express();

app.use(express.json());
app.use(cors());
app.use(`/assets`, express.static(path.join(__dirname, `assets`)));
app.use(`/pages`, express.static(path.join(__dirname, `pages`)));
app.use(`/v1/rides`, rideRoutes);

app.get(`/`, (req,res) => {
    res.sendFile(path.join(__dirname, `index.html`));
});

app.get(`/index.html`, (req, res) => {
    res.sendFile(path.join(__dirname, `index.html`));
});

app.get(`/dashboard`, (req, res) => {
    res.sendFile(path.join(__dirname, `pages`, `dashboard.html`));
});

app.get(`/post-ride`, (req, res) => {
    res.sendFile(path.join(__dirname, `pages`, `post-ride.html`));
});

app.get(`/request-ride`, (req, res) => {
    res.sendFile(path.join(__dirname, `pages`, `request-ride.html`));
});

app.get(`/my-rides`, (req, res) => {
    res.sendFile(path.join(__dirname, `pages`, `my-rides.html`));
});

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    app.listen(PORT, () => console.log(`Server running on port: http://localhost:${PORT}`));
})
.catch(error => console.log(error));