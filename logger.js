function logger(executionContext, callback) {
    console.log('Logging');
    callback();
}

module.exports = { logger };