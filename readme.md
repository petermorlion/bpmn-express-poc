# bpmn-express-poc

A proof-of-concept to use a BPMN engine with an Express.js web application.

## Run it

```
npm install
node index.js
```

## The idea

The idea is to start a BPMN flow after a HTTP request, pause it and continue it on a second request.

Specifically, the engine is started when we request `http://localhost:3000`. We are then served a login page.
After submitting the form, the engine must continue by choosing the correct path, depending on the correctness
of the credentials.
