"use strict";

const vectRegex = /vect\((?<entries>.*?)\)/g;

function parseInput() {
    let script = document.getElementById("variables").value;
    let actionStart = script.indexOf("actions");
    console.log(actionStart);
    script = script.slice(0, actionStart) + 'rule("fake rule") {\n' + script.slice(actionStart);
    script += '}';


    let output = overpy.decompileAllRules(script);

    let ruleStart = output.indexOf("rule");
    let rule = output.slice(ruleStart)

    var dataIndex = rule.indexOf("data");
    var data = rule.slice(dataIndex);
    var dataEnd = data.indexOf('\n');
    var data = data.slice(0, dataEnd);

    var dataArray = data.indexOf('=') + 1;
    var dataArray = data.slice(dataArray);

    var dataJson = '{"data": ' + dataArray + '}';
    var dataJson = dataJson.replace(vectRegex, '[$<entries>]');


    var events = rule.indexOf("events");
    var events = rule.slice(events);
    var eventsEnd = events.indexOf('\n');
    var events = events.slice(0, eventsEnd);

    var eventsArray = events.indexOf('=') + 1;
    var eventsArray = events.slice(eventsArray);

    var eventsJson = '{"events": ' + eventsArray + '}';
    var eventsJson = eventsJson.replace(vectRegex, '[$<entries>]');


    var data = JSON.parse(dataJson);
    var events = JSON.parse(eventsJson);



}

String.prototype.splice = function(idx, rem, str) {
    return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
};