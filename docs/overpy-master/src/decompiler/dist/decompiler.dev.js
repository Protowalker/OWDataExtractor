/* 
 * This file is part of OverPy (https://github.com/Zezombye/overpy).
 * Copyright (c) 2019 Zezombye.
 * 
 * This program is free software: you can redistribute it and/or modify  
 * it under the terms of the GNU General Public License as published by  
 * the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful, but 
 * WITHOUT ANY WARRANTY; without even the implied warranty of 
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU 
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License 
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
"use strict"; //OverPy Decompiler (Workshop -> OverPy)

function decompileAllRules(content) {
  var language = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "en-US";
  resetGlobalVariables(language);
  var result = "";
  content = content.trim();
  var bracketPos = getBracketPositions(content); //Check for settings

  if (content.startsWith(tows("__settings__", ruleKw))) {
    result += decompileCustomGameSettings(content.substring(bracketPos[0] + 1, bracketPos[1]));
    content = content.substring(bracketPos[1] + 1);
  }

  content = content.trim();
  bracketPos = getBracketPositions(content); //Check for variable names

  if (content.startsWith(tows("__variables__", ruleKw))) {
    decompileVarNames(content.substring(bracketPos[0] + 1, bracketPos[1]));
    content = content.substring(bracketPos[1] + 1);
  }

  content = content.trim();
  bracketPos = getBracketPositions(content); //Check for subroutine names

  if (content.startsWith(tows("__subroutines__", ruleKw))) {
    decompileSubroutines(content.substring(bracketPos[0] + 1, bracketPos[1]));
    content = content.substring(bracketPos[1] + 1);
  }

  bracketPos = getBracketPositions(content);
  debug("global vars: " + globalVariables);
  debug("player vars: " + playerVariables);
  debug("subroutines: " + subroutines);
  bracketPos.unshift(-1); //A rule looks like this:
  //rule(title) {...}
  //Therefore, each rule ends every 4th bracket position

  var astRules = [];

  for (var i = 0; i < bracketPos.length - 1; i += 4) {
    //for (var i = 0; i < 4; i += 4) {
    if (i >= bracketPos.length - 1) {
      break;
    }

    astRules.push(decompileRuleToAst(content.substring(bracketPos[i] + 1, bracketPos[i + 4] + 1)));
  }

  var variableDeclarations = "";

  if (globalVariables.length > 0) {
    globalVariables.sort(function (a, b) {
      return a.index - b.index;
    });
    var globalVariableDeclarations = "";
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = globalVariables[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var variable = _step.value;

        if (defaultVarNames.indexOf(variable.name) !== variable.index) {
          globalVariableDeclarations += "globalvar " + translateVarToPy(variable.name, true) + " " + variable.index + "\n";
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator["return"] != null) {
          _iterator["return"]();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    if (globalVariableDeclarations !== "") {
      variableDeclarations += "#Global variables\n\n" + globalVariableDeclarations + "\n\n";
    }
  }

  if (playerVariables.length > 0) {
    playerVariables.sort(function (a, b) {
      return a.index - b.index;
    });
    var playerVariableDeclarations = "";
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = playerVariables[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var variable = _step2.value;

        if (defaultVarNames.indexOf(variable.name) !== variable.index) {
          playerVariableDeclarations += "playervar " + translateVarToPy(variable.name, false) + " " + variable.index + "\n";
        }
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
          _iterator2["return"]();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }

    if (playerVariableDeclarations !== "") {
      variableDeclarations += "#Player variables\n\n" + playerVariableDeclarations + "\n\n";
    }
  }

  var subroutineDeclarations = "";

  if (subroutines.length > 0) {
    subroutines.sort(function (a, b) {
      return a.index - b.index;
    });
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = subroutines[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        var subroutine = _step3.value;

        if (defaultSubroutineNames.indexOf(subroutine.name) !== subroutine.index) {
          subroutineDeclarations += "subroutine " + translateSubroutineToPy(subroutine.name) + " " + subroutine.index + "\n";
        }
      }
    } catch (err) {
      _didIteratorError3 = true;
      _iteratorError3 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion3 && _iterator3["return"] != null) {
          _iterator3["return"]();
        }
      } finally {
        if (_didIteratorError3) {
          throw _iteratorError3;
        }
      }
    }

    if (subroutineDeclarations !== "") {
      subroutineDeclarations = "#Subroutine names\n\n" + subroutineDeclarations + "\n\n";
    }
  }

  result += variableDeclarations + subroutineDeclarations;

  for (var _i = 0, _astRules = astRules; _i < _astRules.length; _i++) {
    var rule = _astRules[_i];
    console.log(astToString(rule));
  }

  console.log(astRules);
  result += astRulesToOpy(astRules);
  return result;
}

function decompileCustomGameSettings(content) {
  console.log(content);
  var result = {};
  var wsDisabled = tows("__disabled__", ruleKw); //Convert the settings to an object (without even translating).

  var serialized = {};
  var lines = content.split("\n").map(function (x) {
    return x.trim();
  });
  var objectStack = [];
  var currentObject = null;
  var depth = 0;

  function updateCurrentObject() {
    currentObject = serialized;
    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
      for (var _iterator4 = objectStack[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
        var elem = _step4.value;

        if (!(elem in currentObject)) {
          currentObject[elem] = {};
        }

        currentObject = currentObject[elem];
      }
    } catch (err) {
      _didIteratorError4 = true;
      _iteratorError4 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion4 && _iterator4["return"] != null) {
          _iterator4["return"]();
        }
      } finally {
        if (_didIteratorError4) {
          throw _iteratorError4;
        }
      }
    }
  }

  for (var i = 0; i < lines.length; i++) {
    if (lines[i] === "" || lines[i] === "{") {
      continue;
    } else if (i < lines.length - 1 && lines[i + 1] === "{") {
      objectStack.push(lines[i]);
      updateCurrentObject();
      depth++;
    } else if (lines[i] === "}") {
      objectStack.pop();
      updateCurrentObject();
      depth--;

      if (depth < 0) {
        error("Depth is less than 0");
      }
    } else {
      currentObject[lines[i]] = null;
    }
  }

  if (depth > 0) {
    error("Depth is more than 0 (missing closing bracket)");
  }

  console.log(serialized);

  for (var _i2 = 0, _Object$keys = Object.keys(serialized); _i2 < _Object$keys.length; _i2++) {
    var category = _Object$keys[_i2];
    var opyCategory = topy(category, customGameSettingsSchema);
    result[opyCategory] = {};

    if (opyCategory === "main" || opyCategory === "lobby") {
      result[opyCategory] = decompileCustomGameSettingsDict(Object.keys(serialized[category]), customGameSettingsSchema[opyCategory].values);
    } else if (opyCategory === "gamemodes") {
      for (var _i3 = 0, _Object$keys2 = Object.keys(serialized[category]); _i3 < _Object$keys2.length; _i3++) {
        var gamemode = _Object$keys2[_i3];
        var isCurrentGamemodeDisabled = false;

        if (gamemode.startsWith(wsDisabled)) {
          isCurrentGamemodeDisabled = true;
          var opyGamemode = topy(gamemode.substring(wsDisabled.length), customGameSettingsSchema.gamemodes.values);
        } else {
          var opyGamemode = topy(gamemode, customGameSettingsSchema.gamemodes.values);
        }

        result[opyCategory][opyGamemode] = {};

        if (isCurrentGamemodeDisabled) {
          result[opyCategory][opyGamemode].enabled = false;
        }

        var dict = [];

        if (serialized[category][gamemode] !== null) {
          for (var _i4 = 0, _Object$keys3 = Object.keys(serialized[category][gamemode]); _i4 < _Object$keys3.length; _i4++) {
            var property = _Object$keys3[_i4];

            if (serialized[category][gamemode][property] === null) {
              //empty object - is actually part of a dict
              dict.push(property);
            } else {
              //The only object in a gamemode should be disabled/enabled maps, which is an array
              var opyPropName = topy(property, customGameSettingsSchema.gamemodes.values.general.values);
              result[opyCategory][opyGamemode][opyPropName] = [];

              for (var _i5 = 0, _Object$keys4 = Object.keys(serialized[category][gamemode][property]); _i5 < _Object$keys4.length; _i5++) {
                var map = _Object$keys4[_i5];
                result[opyCategory][opyGamemode][opyPropName].push(topy(map, mapKw));
              }
            }
          }
        }

        Object.assign(result[opyCategory][opyGamemode], decompileCustomGameSettingsDict(dict, customGameSettingsSchema[opyCategory].values[opyGamemode].values));
      }
    } else if (opyCategory === "heroes") {
      for (var _i6 = 0, _Object$keys5 = Object.keys(serialized[category]); _i6 < _Object$keys5.length; _i6++) {
        var team = _Object$keys5[_i6];
        var opyTeam = topy(team, customGameSettingsSchema[opyCategory].teams);
        result[opyCategory][opyTeam] = {};
        var dict = [];

        for (var _i7 = 0, _Object$keys6 = Object.keys(serialized[category][team]); _i7 < _Object$keys6.length; _i7++) {
          var property = _Object$keys6[_i7];

          if (serialized[category][team][property] === null) {
            //empty object - is actually part of a dict
            dict.push(property);
          } else {
            //check if it's disabled/enabled heroes
            if (property === tows("disabledHeroes", customGameSettingsSchema.heroes.values) || property === tows("enabledHeroes", customGameSettingsSchema.heroes.values)) {
              var opyPropName = topy(property, customGameSettingsSchema.heroes.values);
              result[opyCategory][opyTeam][opyPropName] = [];

              for (var _i8 = 0, _Object$keys7 = Object.keys(serialized[category][team][property]); _i8 < _Object$keys7.length; _i8++) {
                var hero = _Object$keys7[_i8];
                result[opyCategory][opyTeam][opyPropName].push(topy(hero, heroKw));
              }
            } else {
              //probably a hero
              var opyHero = topy(property, heroKw);
              result[opyCategory][opyTeam][opyHero] = {};
              Object.assign(result[opyCategory][opyTeam][opyHero], decompileCustomGameSettingsDict(Object.keys(serialized[category][team][property]), customGameSettingsSchema[opyCategory].values[opyHero].values));
            }
          }
        }

        if (dict.length > 0) {
          result[opyCategory][opyTeam].general = decompileCustomGameSettingsDict(dict, customGameSettingsSchema.heroes.values.general);
        }
      }
    } else if (opyCategory === "workshop") {
      var workshopSettings = Object.keys(serialized[category]).map(function (x) {
        return x + "\n";
      }).join("");
      var i = 0;

      while (i < workshopSettings.length) {
        var nextColonIndex = workshopSettings.indexOf(":", i);

        if (nextColonIndex < 0) {
          error("Expected a ':', but found none, while parsing workshop settings");
        }

        var key = workshopSettings.substring(i, nextColonIndex).trim();
        i = nextColonIndex + 1;
        var nextNewlineIndex = workshopSettings.indexOf("\n", i);

        if (nextNewlineIndex < 0) {
          error("Expected a newline, but found none, while parsing workshop settings");
        }

        var value = workshopSettings.substring(i, nextNewlineIndex).trim();

        if (isNumber(value)) {
          value = parseFloat(value);
        } else {
          //It should be a boolean: translate On/Off.
          value = topy(value, customGameSettingsKw);

          if (value === "__on__") {
            value = true;
          } else if (value === "__off__") {
            value = false;
          } else {
            error("Unhandled value '" + value + "'");
          }
        }

        i = nextNewlineIndex + 1;
        result[opyCategory][key] = value;
      }
    }
  }

  console.log(result);
  return "settings " + JSON.stringify(result, null, 4) + "\n\n";
}

function decompileVarNames(content) {
  content = content.split(":");
  var isInGlobalVars = true;
  var currentVarIndex = undefined;

  for (var i = 0; i < content.length; i++) {
    content[i] = content[i].trim();

    if (i === 0) {
      //First element is always a var type
      if (content[i] === tows("__global__", ruleKw)) {
        isInGlobalVars = true;
      } else if (content[i] === tows("__player__", ruleKw)) {
        isInGlobalVars = false;
      } else {
        error("Unrecognized var type '" + content[i] + "'");
      }
    } else {
      if (content[i].search(/\s/) >= 0) {
        var elems = content[i].split(/\s+/);

        if (elems.length !== 2) {
          error("Could not parse variables field: too many elements on '" + content[i] + "'");
        }

        addVariable(elems[0], isInGlobalVars, currentVarIndex);

        if (!isNaN(elems[1])) {
          currentVarIndex = +elems[1];
        } else {
          if (elems[1] === tows("__global__", ruleKw)) {
            isInGlobalVars = true;
          } else if (elems[1] === tows("__player__", ruleKw)) {
            isInGlobalVars = false;
          } else {
            error("Unrecognized var type '" + elems[1] + "'");
          }
        }
      } else {
        if (!isNaN(content[i])) {
          currentVarIndex = +content[i];
        } else if (i === content.length - 1) {
          addVariable(content[i], isInGlobalVars, currentVarIndex);
        } else {
          error("Could not parse variables field");
        }
      }
    }
  }
}

function decompileSubroutines(content) {
  content = content.split("\n");
  console.log(content);

  for (var i = 0; i < content.length; i++) {
    content[i] = content[i].trim();

    if (content[i] === "") {
      continue;
    }

    if (content[i].split(":").length % 2 !== 0) {
      error("Malformed subroutine field '" + content[i] + "'(expected 2 elements)");
    }

    var index = content[i].split(":")[0].trim();
    var subName = content[i].split(":")[1].trim();

    if (isNaN(index)) {
      error("Index '" + index + "' in subroutines field should be a number");
    }

    addSubroutine(subName, index);
  }
}