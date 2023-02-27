function validLogin(executionContext, callback) {
    executionContext.environment.services.res.render('validLogin');
    callback();
}

module.exports = { validLogin };