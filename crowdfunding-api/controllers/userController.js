const bcrypt = require('bcryptjs');
const User = require('./../models/userModel');
const AppError = require('./../utils/appError');

/*API: Get all users in database*/
exports.getAllUsers = async (req, res, next) => {
    
    try {
        let query = User.find();
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        }      
        const users = await query;
    
        res.status(200).json({
                status: 'success',
                results: users.length,
                data: {
                    users: users
                }
            });

    } catch (err) {

        return next(new AppError(500, err.message));

        // res.status(400).json({
        //     status: 'Fail',
        //     message: err.message
        // })
    }
}

/*API: Search user by id*/
exports.getUser = async (req, res, next) => {

    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return next(new AppError(404, `User with id ${req.body.id} not found`));
        }
    
        res.status(200).json({
                status: 'success',
                data: {
                    user: user
                }
            });

    } catch (err) {

        return next(new AppError(500, err.message));

        // res.status(400).json({
        //     status: 'Fail',
        //     message: err.message
        // })
    }
}

/*API: Create a new user */
exports.createNewUser = async (req, res, next) => {
    
    try {
        const newUser = await User.create({
            name: req.body.name,
            email: req.body.email,
            idDocument: req.body.idDocument,
            nationality: req.body.nationality,
            password: await bcrypt.hash(req.body.password, parseInt(process.env.BCRYPT_SALT)),
            roles: req.body.roles,
            lastLoginAttempt: 0
        });

        res.status(201).json({
            status: "success",
            message: 'User created successfully',
            data: {
                userId: newUser._id
            }
        });

    } catch (err) {

        return next(new AppError(500, err.message));

        // res.status(400).json({
        //     status: 'Fail',
        //     message: err.message
        // })
    }
}

/*API: Update of user data*/
exports.updateUser = async (req, res, next) => {

    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return next(new AppError(404, `User with id ${req.body.id} not found`));
        }

        if (req.body.password) {
            user.password = await bcrypt.hash(req.body.password, parseInt(process.env.BCRYPT_SALT));
        }
        if (req.body.active) {
            user.active = req.body.active;
        }
        if (req.body.roles) {
            user.roles = req.body.roles;
        }

        await user.save();
    
        res.status(200).json({
                status: 'success',
                data: {
                    userId: user._id
                }
            });

    } catch (err) {
        
        return next(new AppError(500, err.message));

        // res.status(400).json({
        //     status: 'Fail',
        //     message: err.message
        // })
    }
}

/*API: Inactivate user*/
exports.inactivateUser = async (req, res, next) => {

    try {
        const user = await User.findByIdAndUpdate(req.params.id, {
            active: false
        }, { new: true });
    
        res.status(200).json({
                status: 'success',
                data: {
                    userId: user._id
                }
            });

    } catch (err) {

        return next(new AppError(500, err.message));

        // res.status(400).json({
        //     status: 'Fail',
        //     message: err.message
        // })
    }
}