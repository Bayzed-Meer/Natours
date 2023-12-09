const { JsonWebTokenError } = require('jsonwebtoken');
const appError = require('./../utils/appError');

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new appError(message, 400);
};

const handleDuplicateFieldsDB = err => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  console.log(value);

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new appError(message, 400);
};
const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new appError(message, 400);
};

const handleJWTerror = () =>{
  return new appError('Invalid token.', 401);
}

const handleTokenExpiredError = () => {
  return new appError('Your Token has expired!', 401);
}
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });

    // Programming or other unknown error: don't leak error details
  } else {
    // 1) Log error
    console.error('ERROR 💥', err);

    // 2) Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!'
    });
  }
};

module.exports = (err, req, res, next) => {
  // console.log(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if(error.name === 'JsonWebTokenError') error = handleJWTerror();
    if(error.name === 'TokenExpiredError') error = handleTokenExpiredError();

    sendErrorProd(error, res);
  }
};




// const handleCastErrorDB = err => {
//   const message = `Invalid ${err.path}: ${err.value}.`;
//   return new appError(message, 404);
// }

// const sendErrorDev = (err, res) => {
// res.status(err.statusCode).json({
//     status: err.status,
//     err: err,
//     message: err.message,
//     stack: err.stack
//   })
// }

// const sendErrorProd = (err, res) => {
//   if(err.isOperational){
//     res.status(err.statusCode).json({
//       status: err.status,
//       message: err.message
//     })
//   }
//   else{
//     res.status(500).json({
//       status: 'Error',
//       message: 'Something went wrong'
//     })
//   }
// }


// module.exports = (err, req, res, next)=>{
//     err.statusCode = err.statusCode || 500;
//     err.status = err.status || 'error';
    
//     if(process.env.NODE_ENV === 'development'){
//       sendErrorDev(err,res);
//     }
//     else{
//       let error = { ...err };
//       if(error.name === 'CastError') error = handleCastErrorDB(error);
//       sendErrorProd(error,res);
//     }
//   }