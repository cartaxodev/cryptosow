const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('./../models/userModel');
const AppError = require('../utils/appError');

// Middleware function to check if all obrigatory params are specified on request body
exports.checkBody = (req, res, next) => {
    if (!req.body.name 
        || !req.body.email
        || !req.body.idDocument 
        || !req.body.nationality
        || !req.body.password
        || !req.body.roles
        || !req.body.passwordConfirm
        ) {
        
        return next(new AppError(400, 'Migging user params'));
        // return res.status(400).json({
        //     status: 'Fail',
        //     message: 'Missing user params'
        // });
    }
    next();
}

/*API to sign up a new user */
exports.signUp = async (req, res, next) => {

    if (req.body.password === req.body.passwordConfirm) {
        
        const hashPassword = await bcrypt.hash(req.body.password, parseInt(process.env.BCRYPT_SALT));

        try {
            const newUser = await User.create({
                name: req.body.name,
                email: req.body.email,
                idDocument: req.body.idDocument,
                nationality: req.body.nationality,
                password: hashPassword,
                roles: req.body.roles
            });

            const token = jwt.sign(
                {id: newUser._id}, 
                process.env.JWT_SECRET, 
                {expiresIn: process.env.JWT_EXPIRES_IN}
            );
    
            res.status(201).json({
                status: "success",
                token: token,
                message: 'User created successfully',
                data: {
                    user: newUser
                }
            });
    
        } catch (err) {

            return next(new AppError(500, err.message));

            // res.status(500).json({
            //     status: 'Fail',
            //     message: err.message
            // })
        }

    } else {

        return next(new AppError(400, 'Password confirmation is not equal to password'));

        // res.status(400).json({
        //     status: 'Fail',
        //     message: 'Password confirmation is not equal to password'
        // });
    }
}

/*API to login a user. Returns a token JWT*/
exports.login = async (req, res, next) => {
    
    const email = req.body.email;
    const password = req.body.password;

    //1) Check if email and password was provided by user
    if (!email || !password) {
        
        return next(new AppError(400, 'Please provide email and password'));
        
        // return res.status(400).json({
        //     status: 'Fail',
        //     message: 'Please provide email and password'
        // });
    }

    //2) Check if user exists and password is correct. If ok, send jwt token to client
    try {
        const user = await User.findOne( {email: email} ).select('+password');

        //Check if login attempts in last ten minutes is less than 5
        let loginAttempts = user.checkLoginAttempts();
        if (loginAttempts >= 5) {

            return next(new AppError(401, 'This user made more than 5 login attempts last ten minutes. Please wait ten minutes to try again.'));

            // return res.status(401).json({
            //     status: 'Unauthorized',
            //     message: 'This user made more than 5 login attempts last ten minutes. Please wait ten minutes to try again.'
            // });
        }

        if (user.active) {
            if (await bcrypt.compare(password, user.password)) {
                
                const token = jwt.sign(
                    {id: user._id}, 
                    process.env.JWT_SECRET, 
                    {expiresIn: process.env.JWT_EXPIRES_IN}
                );
                
                res.status(201).json({
                    status: "success",
                    token: token,
                    message: 'User logged successfully'
                });

            } else {
                user.updateLoginAttempts();

                return next(new AppError(401, 'Incorrect email or password'));

                // return res.status(401).json({
                //     status: 'Unauthorized',
                //     message: 'Incorrect email or password'
                // });
            }
        } else {

            return next(new AppError(401, 'This user has been inactivated'));

            // return res.status(401).json({
            //     status: 'Unauthorized',
            //     message: 'This user has been inactivated'
            // });
        }

    } catch (err) {

        return next(new AppError(500, err.message));

        // return res.status(500).json({
        //     status: 'Fail',
        //     message: err.message
        // });
    }
}

/* Check if a user is logged in, verifying the token validity */
exports.autenticate = async (req, res, next) => {

    //1) Getting token from header and check if it's there
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {

        return next(new AppError(401, 'User not logged in'));

        // return res.status(401).json({
        //     status: 'Unauthorized',
        //     message: 'User not logged in'
        // });
    }

    //2) Verify the if token is valid (if the signature has been manipulated or not)
    let decoded;
    try {
        decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    }   catch (err) {

        return next(new AppError(401, err.message));

        // return res.status(401).json({
        //     status: 'Unauthorized',
        //     message: err.message
        // });
    }

    //3) Check if user still exists and is active
    let user;
    try {
        user = await User.findById(decoded.id);

        if (!user) {

            return next(new AppError(404, 'User does not exist'));

            // return res.status(401).json({
            //     status: 'Unauthorized',
            //     message: 'User does not exist'
            // });
        }

        if (!user.active) {

            return next(new AppError(401, 'User is inactive'));

            // return res.status(401).json({
            //     status: 'Unauthorized',
            //     message: 'User is inactive'
            // });
        }

    } catch (err) {

        return next(new AppError(500, err.message));

        // return res.status(500).json({
        //     status: 'Fail',
        //     message: err.message
        // });
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.currentUser = user;

    next();
}

/* Check if current user roles is authorized */
exports.authorize = (roles) => {

    return (req, res, next) => {

        let authorized = false;
        const userRoles = req.currentUser.roles;

        userRoles.forEach(element => {
            if (roles.includes(element)) {
                authorized = true;
            }
        });

        if(!authorized) {

            return next(new AppError(401, 'User have not permission to this resource'));

            // return res.status(401).json({
            //     status: 'Unauthorized',
            //     message: 'User have not permission to this resource'
            // });
        }
        
        next();
    }
}