"use strict";
const getResponse = require("./responses/dataset-example.json");
const errResponse = require("./responses/OperationOutcome-INVALID_ENDPOINT_PATH.json");
const errResponse1 = require("./responses/OperationOutcome-RESOURCE_NOT_FOUND.json");

const log = require("loglevel");


const write_log = (res, log_level, options = {}) => {
    if (log.getLevel()>log.levels[log_level.toUpperCase()]) {
        return
    }
    if (typeof options === "function") {
        options = options()
    }
    let log_line = {
        timestamp: Date.now(),
        level: log_level,
        correlation_id: res.locals.correlation_id
    }
    if (typeof options === 'object') {
        options = Object.keys(options).reduce(function(obj, x) {
            let val = options[x]
            if (typeof val === "function") {
                val = val()
            }
            obj[x] = val;
            return obj;
        }, {});
        log_line = Object.assign(log_line, options)
    }
    if (Array.isArray(options)) {
        log_line["log"] = {log: options.map(x=> {return typeof x === "function"? x() : x })}
    }

    log[log_level](JSON.stringify(log_line))
};


async function status(req, res, next) {
    res.json({
        status: "pass",
        ping: "pong",
        service: req.app.locals.app_name,
        version: req.app.locals.version_info
    });
    res.end();
    next();
}

async function hello(req, res, next) {

    write_log(res, "warn", {
        message: "hello world",
        req: {
            path: req.path,
            query: req.query,
            headers: req.rawHeaders
        }
    });


    res.json({message: "hello world"});
    res.end();
    next();
}

async function datasets(req, res, next) {

    var persistentIdentifier = req.query["id"];
    // var patientIdentifier = req.query["patient.identifier"].split("|")[1];

    write_log(res, "info", {
        message: "datasets",
        req: {
            path: req.path,
            query: req.query,
            headers: req.rawHeaders,
            persistentIdentifier: persistentIdentifier
        }
    });
    if (persistentIdentifier == null || persistentIdentifier == "") {
        res.status(400).json(errResponse);
    } else if (persistentIdentifier == "dd5f0174-575f-4f4c-a4fc-b406aab953d9") {
        res.json(getResponse);
    } else {
        res.json(errResponse1);
    }
    res.end();
    next();
}

module.exports = {
    status: status,
    hello: hello
    datasets: datasets
};