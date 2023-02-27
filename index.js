const {Engine} = require('bpmn-engine');
const {EventEmitter} = require('events');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser')

const logger = require('./logger').logger;

const loginPage = require('./loginPage');
const validLogin = require('./validLogin').validLogin;
const invalidLogin = require('./invalidLogin').invalidLogin;


const port = 3000;

const userTasks = {
    loginPage
};

let services = {
    logger,
    invalidLogin,
    validLogin,
    isTrue: (val) => {
        const result = val === true;
        return result;
    },
    isFalse: (val) => {
        const result = val === false;
        return result;
    }
};

let state;

const source = fs.readFileSync('./bpmn.xml');
const listener = new EventEmitter();
listener.on('flow.take', (flow) => {
    console.log(`Flow <${flow.id}> was taken`);
});
listener.on('activity.start', (activity) => {
    console.log(`Activity <${activity.id}> was started`);
});
listener.on('activity.end', (activity, engineApi) => {
    console.log(`Activity <${activity.id}> was ended successfully`);
    delete activity.environment.variables.waitingFor;
    if (activity.content.output) {
        console.log('Activity has output');
        activity.environment.output[activity.id] = activity.content.output;
    }
});
listener.on('activity.throw', (activity) => {
    console.log(`Activity <${activity.id}> threw an error: ${activity.inner}`);
});
listener.on('activity.error', (activity) => {
    console.log(`Activity <${activity.id}> threw a non-recoverable error: ${activity.inner}`);
});

listener.on('activity.wait', async (api, execution) => {
    if (api.type === "bpmn:UserTask" && !api.environment.variables.waitingFor) {
        console.log(`Activity <${api.id}> waiting`);
        await userTasks[api.id].beforeWait(api, execution);
        api.environment.variables.waitingFor = api.id;

        console.log('Stopping engine');
        api.stop();
        state = await execution.getState();
    } else {
        console.log(`Activity <${api.id}> resumed`);
        const result = await userTasks[api.id].afterWait(api, execution);
        api.signal(result);
    }
});

const app = express();
app.set('view engine', 'pug')
app.use(bodyParser.urlencoded())

app.get('/', async (req, res) => {
    const id = Math.floor(Math.random() * 10000);
    services = attachExpressVariables(services, req, res);
    engine = new Engine({
        name: 'execution example',
        source,
        variables: {
            id
        },
        listener,
        services
    });

    console.log('Starting engine');
    await engine.execute();
});

app.post('/', async (req, res) => {
    services = attachExpressVariables(services, req, res);
    engine = new Engine().recover(state, { services });
    
    console.log('Resuming engine');
    await engine.resume({
        listener,
        services
    })
});
  
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});


function attachExpressVariables(services, req, res) {
    services.req = req;
    services.res = res;
    return services;
}