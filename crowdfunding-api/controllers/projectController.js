const AppError = require('../utils/appError');
const Project = require('./../models/projectModel');
const smartContractController = require('./smartContractController');

// Middleware function to check if all obrigatory params are specified on request body
exports.checkBody = (req, res, next) => {
    if (!req.body.title 
        || !req.body.description 
        || !req.body.targetValue
        || !req.body.ownerEthereumAccount) {

            return next(new AppError(400, 'Missing project params'));

        // return res.status(400).json({
        //     status: 'Fail',
        //     message: 'Missing project params'
        // });
    }
    next();
}

/*API: Get all projects in database */
exports.getAllProjects = async (req, res, next) => {
    
    try {
        //const projects = await Project.find();

        let query = Project.find();

        // SORTING
        query = query.sort('-receivedValue');

        // PAGINATION
        const page = (req.query.page * 1) || 1;
        const limit = process.env.LIMIT_PAGINATION;
        const skip = (page-1)*limit;

        query = query.skip(skip).limit(limit);

        // EXECUTE QUERY
        const projects = await query;

        if (projects.length === 0) {

            return next(new AppError(404, 'This page does not exist'));

            // return res.status(404).json({
            //     status: 'Not found',
            //     message: 'This page does not exist'
            // })
        }
    
        res.status(200).json({
                status: 'success',
                results: projects.length,
                data: {
                    projects: projects
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

/*API: Search project by id*/
exports.getProjectById = async (req, res, next) => {

    try {
        const project = await Project.findById(req.params.id);
    
        if (!project) {
            return next(new AppError(404, `Project with id ${req.body.id} not found`));
        }

        res.status(200).json({
                status: 'success',
                data: {
                    project: project
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

/*API: Create a new project into database*/
exports.createNewProject = async (req, res, next) => {

    try {
        const newProject = await Project.create({
            owner: req.currentUser,
            title: req.body.title,
            description: req.body.description,
            targetValue: req.body.targetValue,
            ownerEthereumAccount: req.body.ownerEthereumAccount
        });

        res.status(201).json({
            status: "success",
            message: 'Project created successfully'
        });

    } catch (err) {

        return next(new AppError(500, err.message));

        // res.status(400).json({
        //     status: 'Fail',
        //     message: err.message
        // })
    }
}

/*API: Updates the status (active) of the project and creates the smart contract*/
exports.activateProject = async (req, res, next) => {

    try {
        const project = await Project.findById(req.params.id);

        if (!project.smartContractAddress) {
            // Compiling and deploying a smart contract for this project.
            const smartContractAddress = await smartContractController.createProjectContract(
                project.ownerEthereumAccount,
                project.targetValue
            );

            project.smartContractAddress = smartContractAddress;
        }

        project.status = 'active';

        project.save();
    
        res.status(200).json({
                status: 'success',
                message: 'Project activated'
            });

    } catch (err) {

        return next(new AppError(500, err.message));

        // res.status(400).json({
        //     status: 'Fail',
        //     message: err.message
        // })
    }
}

/*API: Inactivate the project*/
exports.inactivateProject = async (req, res, next) => {

    try {
        const project = await Project.findByIdAndUpdate(req.params.id, {
            status: 'inactive'
        }, { new: true });
    
        res.status(200).json({
                status: 'success',
                message: 'Project inactivated'
            });

    } catch (err) {

        return next(new AppError(500, err.message));

        // res.status(400).json({
        //     status: 'Fail',
        //     message: err.message
        // })
    }
}