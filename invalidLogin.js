function invalidLogin(executionContext, callback) {
    executionContext.environment.services.res.render('invalidLogin');
    callback();
}

module.exports = { invalidLogin };