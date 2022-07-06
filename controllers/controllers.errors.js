const res = require('express/lib/response');

exports.handleCustomErrors = (err, req, res, next) => {
    if(err.status && err.msg) {
        res.status(err.status).send({msg: err.msg});
    }
}