"use strict";

const vectRegex = /vect\((?<entries>.*?)\)/g;

function parseInput() {

    let overpy_output;
    removeError();

    try {
        let script = document.getElementById("variables").value;
        let actionStart = script.indexOf("actions");
        script = script.slice(0, actionStart) + 'rule("fake rule") {\n' + script.slice(actionStart);
        script += '}';


        overpy_output = overpy.decompileAllRules(script);
        let event_position = overpy_output.indexOf("@Event undefined");
        let the_rest = overpy_output.slice(event_position).trim();

        if (the_rest == "") {
            throw null;
        }
    } catch (e) {
        console.log(e);
        createErrorAlert("Invalid script. Make sure you're pressing the button labeled <span class='uk-label'>(x)</span> in the inspector.");
        return;
    }


    let ruleStart = overpy_output.indexOf("rule");
    let rule = overpy_output.slice(ruleStart)

    try {

        var data = getVariableFromOpy(rule, "data");
        var events = getVariableFromOpy(rule, "events");

        var activeDataPieces = getVariableFromOpy(rule, "activeDataPieces");
        var roundTimestamps = getVariableFromOpy(rule, "roundTimestamps");
    } catch (e) {
        createErrorAlert(e);
    }

    // {
    //  rounds:[] {   
    //         events: {
    //         damage: [],
    //         healing: [],
    //         finalBlows: [],
    //         knockback: []
    //     }
    //    }
    // }


    let rounds = [];

    for (let round of events) {

        let roundOutput = {
            events: {
                damage: [],
                healing: [],
                finalBlows: [],
                knockback: []
            }
        };

        for (let chunk of round) {
            let count = chunk[0].length;
            for (var i = 0; i < count; i++) {
                let type = chunk[0][i];
                let timestamp = chunk[1][i];
                let attacker_name = chunk[2][i];
                let victim_name = chunk[3][i];
                let value = chunk[4][i];

                switch (type) {
                    case 0: //Damage
                        var event = {
                            timestamp: timestamp,
                            attacker: attacker_name,
                            victim: victim_name,
                            amount: value
                        };
                        roundOutput.events.damage.push(event);
                        break;

                    case 1: //Healing
                        var event = {
                            timestamp: timestamp,
                            healer: attacker_name,
                            healee: victim_name,
                            amount: value
                        };
                        roundOutput.events.healing.push(event);
                        break;
                    case 2: //Final Blow
                        var event = {
                            timestamp: timestamp,
                            attacker: attacker_name,
                            victim: victim_name,
                            amount: value
                        };
                        roundOutput.events.finalBlows.push(event);
                        break;
                    case 3: //knockback
                        var event = {
                            timestamp: timestamp,
                            attacker: attacker_name,
                            victim: victim_name,
                            direction_xyz: value
                        };
                        roundOutput.events.knockback.push(event);
                        break;
                }
            }
        }
        rounds.push(roundOutput);
    }

    let output = {};

    output.rounds = rounds;
    output.roundTimestamps = roundTimestamps;

    let element = document.getElementById("output");

    element.value = JSON.stringify(output);
    Prism.highlightAll();
}



function getVariableFromOpy(script, variableName) {
    var index = script.indexOf(variableName);
    var data = script.slice(index);
    var dataEnd = data.indexOf('\n');
    var data = data.slice(0, dataEnd);

    var dataArray = data.indexOf('=') + 1;
    var dataArray = data.slice(dataArray);

    var dataJson = '{"' + variableName + '": ' + dataArray + '}';
    var dataJson = dataJson.replace(vectRegex, '[$<entries>]');

    console.log(dataJson);

    return JSON.parse(dataJson)[variableName];
}



function createErrorAlert(errorMessage) {
    let button = document.getElementById('parseButton');

    button.classList.remove("uk-button-primary");
    button.classList.add("uk-button-danger");

    let alert = document.createElement("div");
    alert.innerHTML = `<div id="errorAlert" style="background: #A60000; color:white" uk-alert> 
                            <a class="uk-alert-close" uk-close></a> 
                            <p> ` + errorMessage + `</p>
                        </div> `;

    button.after(alert.firstChild);


    setTimeout(removeError, 5000);
}

function removeError() {
    let button = document.getElementById('parseButton');
    try {
        button.classList.add("uk-button-primary");
        button.classList.remove("uk-button-danger");
    } catch {}
    let alert = document.getElementById("errorAlert");
    if (alert !== null) {
        UIkit.alert(alert).close();
    }
}