"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _wrapRegExp(re, groups) { _wrapRegExp = function _wrapRegExp(re, groups) { return new BabelRegExp(re, undefined, groups); }; var _RegExp = _wrapNativeSuper(RegExp); var _super = RegExp.prototype; var _groups = new WeakMap(); function BabelRegExp(re, flags, groups) { var _this = _RegExp.call(this, re, flags); _groups.set(_this, groups || _groups.get(re)); return _this; } _inherits(BabelRegExp, _RegExp); BabelRegExp.prototype.exec = function (str) { var result = _super.exec.call(this, str); if (result) result.groups = buildGroups(result, this); return result; }; BabelRegExp.prototype[Symbol.replace] = function (str, substitution) { if (typeof substitution === "string") { var groups = _groups.get(this); return _super[Symbol.replace].call(this, str, substitution.replace(/\$<([^>]+)>/g, function (_, name) { return "$" + groups[name]; })); } else if (typeof substitution === "function") { var _this = this; return _super[Symbol.replace].call(this, str, function () { var args = []; args.push.apply(args, arguments); if (_typeof(args[args.length - 1]) !== "object") { args.push(buildGroups(args, _this)); } return substitution.apply(this, args); }); } else { return _super[Symbol.replace].call(this, str, substitution); } }; function buildGroups(result, re) { var g = _groups.get(re); return Object.keys(g).reduce(function (groups, name) { groups[name] = result[g[name]]; return groups; }, Object.create(null)); } return _wrapRegExp.apply(this, arguments); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }

function isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _construct(Parent, args, Class) { if (isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var vectRegex = _wrapRegExp(/vect\((.*?)\)/g, {
  entries: 1
});

function parseInput() {
  var overpy_output;
  removeError();

  try {
    var script = document.getElementById("variables").value;
    var actionStart = script.indexOf("actions");
    script = script.slice(0, actionStart) + 'rule("fake rule") {\n' + script.slice(actionStart);
    script += '}';
    overpy_output = overpy.decompileAllRules(script);
    var event_position = overpy_output.indexOf("@Event undefined");
    var the_rest = overpy_output.slice(event_position).trim();

    if (the_rest == "") {
      throw null;
    }
  } catch (e) {
    console.log(e);
    createErrorAlert("Invalid script. Make sure you're pressing the button labeled <span class='uk-label'>(x)</span> in the inspector.");
    return;
  }

  var ruleStart = overpy_output.indexOf("rule");
  var rule = overpy_output.slice(ruleStart);

  try {
    var data = getVariableFromOpy(rule, "data");
    var events = getVariableFromOpy(rule, "events");
    var activeDataPieces = getVariableFromOpy(rule, "activeDataPieces");
    var roundTimestamps = getVariableFromOpy(rule, "roundTimestamps");
  } catch (e) {
    createErrorAlert(e);
  }

  var rounds = [];

  for (var i = 0; i < events.length; i++) {
    var roundOutput = {
      events: {
        damage: [],
        healing: [],
        finalBlows: [],
        knockback: []
      }
    };

    for (var j = 0; j < events[i].length; j += 5) {
      for (var k = 0; k < events[i][j].length; k++) {
        var type = events[i][j][k];
        var timestamp = events[i][j + 1][k];
        var attacker_name = events[i][j + 2][k];
        var victim_name = events[i][j + 3][k];
        var value = events[i][j + 4][k];

        switch (type) {
          case 0:
            //Damage
            var event = {
              timestamp: timestamp,
              attacker: attacker_name,
              victim: victim_name,
              amount: value
            };
            roundOutput.events.damage.push(event);
            break;

          case 1:
            //Healing
            var event = {
              timestamp: timestamp,
              healer: attacker_name,
              healee: victim_name,
              amount: value
            };
            roundOutput.events.healing.push(event);
            break;

          case 2:
            //Final Blow
            var event = {
              timestamp: timestamp,
              attacker: attacker_name,
              victim: victim_name,
              amount: value
            };
            roundOutput.events.finalBlows.push(event);
            break;

          case 3:
            //knockback
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

  var output = {};
  output.rounds = rounds;
  output.roundTimestamps = roundTimestamps;
  var element = document.getElementById("output");
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
  console.log(JSON.parse(dataJson));
  return JSON.parse(dataJson)[variableName];
}

function createErrorAlert(errorMessage) {
  var button = document.getElementById('parseButton');
  button.classList.remove("uk-button-primary");
  button.classList.add("uk-button-danger");
  var alert = document.createElement("div");
  alert.innerHTML = "<div id=\"errorAlert\" style=\"background: #A60000; color:white\" uk-alert> \n                            <a class=\"uk-alert-close\" uk-close></a> \n                            <p> " + errorMessage + "</p>\n                        </div> ";
  button.after(alert.firstChild);
  setTimeout(removeError, 5000);
}

function removeError() {
  var button = document.getElementById('parseButton');

  try {
    button.classList.add("uk-button-primary");
    button.classList.remove("uk-button-danger");
  } catch (_unused) {}

  var alert = document.getElementById("errorAlert");

  if (alert !== null) {
    UIkit.alert(alert).close();
  }
}