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

    let data;
    let events;

    let activeDataPieces;
    let roundTimestamps;
    let playerNames;

    try {
        data = getVariableFromOpy(rule, "data");
        events = getVariableFromOpy(rule, "events");

        activeDataPieces = getVariableFromOpy(rule, "activeDataPieces");
        roundTimestamps = getVariableFromOpy(rule, "roundTimestamps");
        playerNames = getVariableFromOpy(rule, "playerNames");
    } catch (e) {
        createErrorAlert(e);
    }


    let rounds = [];

    //parse events
    for (var i = 0; i < events.length; i++) {
        let roundOutput = {
            events: {
                damage: [],
                healing: [],
                finalBlows: [],
                knockback: []
            }
        };




        for (var j = 0; j < events[i].length; j += 5) {
            for (var k = 0; k < events[i][j].length; k++) {
                let type = events[i][j][k];
                let timestamp = events[i][j + 1][k];
                let attacker_name = events[i][j + 2][k];
                let victim_name = events[i][j + 3][k];
                let value = events[i][j + 4][k];

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

    //parse data
    for (let i = 0; i < data.length; i++) {
        rounds[i].data = {
            players: {}
        };

        for (let j = 0; j < playerNames.length; j++) {
            rounds[i].data.players[playerNames[j]] = [];

            for (let k = 0; k < data[i][j].length; k++) {
                let currentData = data[i][j][k];
                let dataPiece = {};

                dataPiece["timestamp"] = currentData[0];
                if (activeDataPieces[0]) dataPiece["alive"] = currentData[1];
                if (activeDataPieces[1]) dataPiece["position"] = currentData[2];
                if (activeDataPieces[2]) dataPiece["direction_xyz"] = currentData[3];
                if (activeDataPieces[3]) dataPiece["health"] = currentData[4];
                if (activeDataPieces[4]) dataPiece["velocity"] = currentData[5];

                if (activeDataPieces[5]) {
                    //ABILITIES
                    let flags = currentData[6];
                    let abilityFlags = {
                        ability1: flags & 1,
                        ability2: flags & 2,
                        primaryFire: flags & 4,
                        secondaryFire: flags & 8,
                        melee: flags & 16,
                        ultimate: flags & 32
                    };
                    dataPiece["abilityFlags"] = abilityFlags;
                }

                rounds[i].data.players[playerNames[j]].push(dataPiece);
            }
        }

    }


    let output = {};

    output.rounds = rounds;
    output.roundTimestamps = roundTimestamps;

    let element = document.getElementById("output");

    element.value = JSON.stringify(output);

    element.select();
    element.setSelectionRange(0, 9999999999999999999);
    document.execCommand("copy");

    alert("copied JSON to clipboard");
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

    console.log("[getVariableFromOpy]");
    console.log(JSON.parse(dataJson));

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