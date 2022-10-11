const AppError = require('../utils/appError');
const Donation = require('./../models/donationModel');
const Project = require('./../models/projectModel');

// Middleware function to check if all obrigatory params are specified on request body
exports.checkBody = (req, res, next) => {
    if (!req.body.projectId 
        || !req.body.value 
        || !req.body.serviceTax
        || !req.body.networkTax) {

            return next(new AppError(400, 'Missing donation params'));
    }
    next();
}

/*API: Get all donations in database*/
exports.getAllDonations = async (req, res, next) => {
    
    try {

        let query = Donation.find();

        // SORTING
        query = query.sort('-value');

        // PAGINATION
        const page = (req.query.page * 1) || 1;
        const limit = process.env.LIMIT_PAGINATION;
        const skip = (page-1)*limit;

        query = query.skip(skip).limit(limit);

        // EXECUTE QUERY
        const donations = await query;

        if (donations.length === 0) {
            return next(new AppError(404, 'This page does not exist'));
        }
    
        res.status(200).json({
                status: 'success',
                results: donations.length,
                data: {
                    donations: donations
                }
            });

    } catch (err) {
        return next(new AppError(500, err.message));
    }
}

/*API: Search donation by id*/
exports.getDonationById = async (req, res, next) => {

    try {
        const donation = await Donation.findById(req.params.id);
    
        if (!donation) {
            return next(new AppError(404, `Donation with id ${req.body.id} not found`));
        }

        res.status(200).json({
                status: 'success',
                data: {
                    donation: donation
                }
            });

    } catch (err) {
        return next(new AppError(500, err.message));
    }
}

/*API: Create a new donation */
exports.makeNewDonation = async (req, res, next) => {
    
    try {
        //Check if project is active
        const project = await Project.findById(req.body.projectId);
        if (!(project.status === 'active')) {
            return next(new AppError(404, 'This project is not active'));
        }

        const newDonation = await Donation.create({
            donor: req.currentUser,
            project: req.body.projectId,
            value: req.body.value,
            serviceTax: req.body.serviceTax,
            networkTax: req.body.networkTax
        });

        res.status(201).json({
            status: "success",
            message: 'Donation registered successfully'
        });

    } catch (err) {
        console.log(err);
        return next(new AppError(500, err.message));
    }
}

/*API: Get all donations realized by the curret user */
exports.getCurrentUserDonations = async (req, res, next) => {
    
    try {

        let query = Donation.find({
            donorId: req.currentUser._id
        });

        // SORTING
        query = query.sort('-timestamp');

        // PAGINATION
        const page = (req.query.page * 1) || 1;
        const limit = process.env.LIMIT_PAGINATION;
        const skip = (page-1)*limit;

        query = query.skip(skip).limit(limit);

        // EXECUTE QUERY
        const donations = await query;

        if (donations.length === 0) {
            return next(new AppError(404, 'This page does not exist'));
        }
    
        res.status(200).json({
                status: 'success',
                results: donations.length,
                data: {
                    donations: donations
                }
            });

    } catch (err) {
        return next(new AppError(500, err.message));
    }
}
