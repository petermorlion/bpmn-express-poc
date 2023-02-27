function beforeWait(api, execution) {
    api.environment.services.res.render('login');
}

function afterWait(api, execution) {
    return {
        isValidLogin: api.environment.services.req.body.username === 'user' && api.environment.services.req.body.password === 'pwd'
    }
}

module.exports = { 
    beforeWait,
    afterWait
 };