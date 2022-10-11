const express = require('express');
const publicProjectRouter = require('./routes/public/projectRoutes');
const publicAuthRouter = require('./routes/public/authRoutes');
const adminProjectRouter = require('./routes/admin/projectRoutes');
const adminUserRouter = require('./routes/admin/userRoutes');
const ownerProjectRouter = require('./routes/projectowner/projectRoutes');
const AppError = require('./utils/appError');
const errorController = require('./controllers/errorController');
const donorDonationRouter = require('./routes/donor/donationRoutes');

const app = express();

// MIDLEWARE
app.use(express.json());


// PUBLIC USER ROUTES -- DO NOT NEED AUTHENTICATION
app.use('/api/v1/public/projects', publicProjectRouter);
app.use('/api/v1/public/auth', publicAuthRouter);

// PROJECT OWNER ROUTES
app.use('/api/v1/projectOwner/projects', ownerProjectRouter);

// DONOR ROUTES
app.use('/api/v1/donor/donations', donorDonationRouter);

// ADMIN ROUTES
app.use('/api/v1/admin/projects', adminProjectRouter);
app.use('/api/v1/admin/users', adminUserRouter);

/*API: Welcome message*/
app.get('/', (req, res) => {
    res
        .status(200)
        .json({message: 'Hello from GreenHub!', app: 'GreenHub'});
});

// UNKNOWN ROUTES
app.all('*', (req, res, next) => {
    const err = new AppError(404, `Can't find ${req.originalUrl} on this server!`);
    next(err);
});

// EXCEPTIONS HANDLER
app.use(errorController.catchError);

module.exports = app;