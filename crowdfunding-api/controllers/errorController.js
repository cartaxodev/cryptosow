exports.catchError = (err, req, res, next) => {

    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    let clientMessage = err.message;

    // HIDING ERROR DETAILS FROM THE CLIENT
    if (`${err.statusCode}`.startsWith('5')) {
        console.log(err.message);
        console.log(err.stack);
        clientMessage = 'Internal server error'
    }

    // RESPONDING TO THE CLIENT
    res.status(err.statusCode).json({
        status: err.status,
        message: clientMessage
    });

    next();
}