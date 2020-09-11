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
"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

var globalVariables;
var playerVariables;
var subroutines;
var currentLanguage;
var ELEMENT_LIMIT = 20000; //If it is in a browser then it is assumed to be in debug mode.
//const DEBUG_MODE = (typeof window !== "undefined");

var DEBUG_MODE = false; //Compilation variables - are reset at each compilation.
//The absolute path of the folder containing the main file. Used for relative paths.

var rootPath; //Global variables used to keep track of the name for the current array element/index.
//Should be null at the beginning and end of each rule; if not, throws an error. (for compilation and decompilation)

var currentArrayElementName;
var currentArrayIndexName; //Set at each rule, to check whether it is legal to use "eventPlayer" and related.

var currentRuleEvent; //The encountered labels throughout the rule, to not have duplicate labels. Set at each rule.

var currentRuleLabels; //The number of times the specified label is referenced. If that number is 0, then the label is considered as not accessed.

var currentRuleLabelAccess;
var currentRuleHasVariableGoto; //Settings for whether to enable obfuscation techniques.

var obfuscationSettings;
var enableOptimization; //Contains all macros.

var macros;
var encounteredWarnings;
var suppressedWarnings;
var globalSuppressedWarnings; //A list of imported files, to prevent import loops.

var importedFiles;
var disableUnusedVars;
var compiledCustomGameSettings; //The stack of the files (macros count as "files").

var fileStack; //An unique number for automatically generated labels.

var uniqueNumber; //Initialization directives for global and player variables.

var globalInitDirectives = [];
var playerInitDirectives = []; //Workshop setting names, as each name must be unique even if belonging to different categories.

var workshopSettingNames = []; //User-declared enums.

var enumMembers = {}; //Decompilation variables
//Global variable used for "skip", to keep track of where the skip ends.
//Is reset at each rule.

var decompilerGotos; //Global variable used for the number of tabs.
//Is reset at each rule.

var nbTabs; //Global variable used to mark the action number of the last loop in the rule.
//Is reset at each rule.

var decompilationLabelNumber; //Global variable used to keep track of operator precedence.
//Is reset at each action and rule condition.

var operatorPrecedenceStack;

function resetGlobalVariables(language) {
  rootPath = "";
  currentArrayElementName = null;
  currentArrayIndexName = null;
  currentLanguage = language;
  currentRuleEvent = "";
  obfuscationSettings = {
    obfuscateNames: false,
    obfuscateStrings: false,
    obfuscateConstants: false,
    obfuscateInspector: false,
    ruleFilling: false,
    copyProtection: false
  };
  macros = [];
  fileStack = [];
  decompilerGotos = [];
  nbTabs = 0;
  operatorPrecedenceStack = [];
  globalVariables = [];
  playerVariables = [];
  subroutines = [];
  encounteredWarnings = [];
  suppressedWarnings = [];
  globalSuppressedWarnings = [];
  importedFiles = [];
  disableUnusedVars = false;
  compiledCustomGameSettings = "";
  enableOptimization = true;
  uniqueNumber = 1;
  globalInitDirectives = [];
  playerInitDirectives = [];
  workshopSettingNames = [];
  enumMembers = {};
} //Other constants
//Operator precedence, from lowest to highest.


var operatorPrecedence = {
  "=": 1,
  "+=": 1,
  "-=": 1,
  "*=": 1,
  "/=": 1,
  "%=": 1,
  "**=": 1,
  "min=": 1,
  "max=": 1,
  "if": 2,
  "or": 3,
  "and": 4,
  "not": 5,
  "in": 7,
  "==": 7,
  "!=": 7,
  "<=": 7,
  ">=": 7,
  ">": 7,
  "<": 7,
  "+": 8,
  "-": 8,
  "*": 9,
  "/": 9,
  "%": 9,
  //unary plus/minus: 10,
  "**": 11
};
var astOperatorPrecedence = {
  "__ifThenElse__": 2,
  "__or__": 3,
  "__and__": 4,
  "__not__": 5,
  "__arrayContains__": 6,
  "__equals__": 6,
  "__inequals__": 6,
  "__lessThanOrEquals__": 6,
  "__greaterThanOrEquals__": 6,
  "__lessThan__": 6,
  "__greaterThan__": 6,
  "__add__": 7,
  "__subtract__": 7,
  "__multiply__": 8,
  "__divide__": 8,
  "__modulo__": 8,
  "__negate__": 9,
  "__raiseToPower__": 9
}; //Text that gets inserted on top of all js scripts.

var builtInJsFunctions = "\nfunction vect(x,y,z) {\n    return ({\n        x:x,\n        y:y,\n        z:z,\n        toString: function() {\n            return \"vect(\"+this.x+\",\"+this.y+\",\"+this.z+\")\";\n        }\n    });\n}";
var builtInJsFunctionsNbLines = builtInJsFunctions.split("\n").length;
var defaultVarNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL', 'AM', 'AN', 'AO', 'AP', 'AQ', 'AR', 'AS', 'AT', 'AU', 'AV', 'AW', 'AX', 'AY', 'AZ', 'BA', 'BB', 'BC', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BK', 'BL', 'BM', 'BN', 'BO', 'BP', 'BQ', 'BR', 'BS', 'BT', 'BU', 'BV', 'BW', 'BX', 'BY', 'BZ', 'CA', 'CB', 'CC', 'CD', 'CE', 'CF', 'CG', 'CH', 'CI', 'CJ', 'CK', 'CL', 'CM', 'CN', 'CO', 'CP', 'CQ', 'CR', 'CS', 'CT', 'CU', 'CV', 'CW', 'CX', 'CY', 'CZ', 'DA', 'DB', 'DC', 'DD', 'DE', 'DF', 'DG', 'DH', 'DI', 'DJ', 'DK', 'DL', 'DM', 'DN', 'DO', 'DP', 'DQ', 'DR', 'DS', 'DT', 'DU', 'DV', 'DW', 'DX']; //Sub0 to Sub127

var defaultSubroutineNames = Array(128).fill().map(function (e, i) {
  return i;
}).map(function (x) {
  return "Sub" + x;
}); //Names that cannot be used for variables.

var reservedNames = Object.keys(opyKeywords);

for (var func in funcKw) {
  if (funcKw[func].args === null) {
    reservedNames.push(func);
  }
} //Names that cannot be used for subroutines.


var reservedFuncNames = [];
var _iteratorNormalCompletion = true;
var _didIteratorError = false;
var _iteratorError = undefined;

try {
  for (var _iterator = Object.keys(actionKw).concat(Object.keys(opyFuncs), Object.keys(constantValues))[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
    var func = _step.value;

    if (!func.startsWith("_")) {
      if (func.includes("(")) {
        reservedFuncNames.push(func.substring(0, func.indexOf("(")));
      } else {
        reservedFuncNames.push(func);
      }
    }
  } //Characters that are visually the same as normal ASCII characters (when uppercased), but make the string appear in "big letters" (the i18n font).
  //For now, only greek letters and the "line separator" character.
  //Let me know if you find any other such characters.

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

var bigLettersMappings = {
  a: "Α",
  A: "Α",
  b: "Β",
  B: "Β",
  e: "Ε",
  E: "Ε",
  h: "Η",
  H: "Η",
  i: "Ι",
  I: "Ι",
  k: "Κ",
  K: "Κ",
  m: "Μ",
  M: "Μ",
  n: "Ν",
  N: "Ν",
  o: "Ο",
  O: "Ο",
  p: "Ρ",
  P: "Ρ",
  t: "Τ",
  T: "Τ",
  x: "Χ",
  X: "Χ",
  y: "Υ",
  Y: "Υ",
  z: "Ζ",
  Z: "Ζ",
  " ": "\u2028" //line separator

}; //Fullwidth characters

var fullwidthMappings = {
  " ": " ",
  "¥": "￥",
  "₩": "￦",
  "¢": "￠",
  "£": "￡",
  "¯": "￣",
  "¬": "￢",
  "¦": "￤"
};
var _iteratorNormalCompletion2 = true;
var _didIteratorError2 = false;
var _iteratorError2 = undefined;

try {
  for (var _iterator2 = '!"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~'[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
    var _char = _step2.value;
    fullwidthMappings[_char] = String.fromCodePoint(_char.charCodeAt(0) + 0xFEE0);
  } //Combinations of 0x01 through 0x1F (excluding 0x09, 0x0A and 0x0D). Used for workshop settings to prevent duplicates.
  //These characters render as zero-width spaces in Overwatch.
  //For some reason, 0x0B and 0x0C aren't sorted according to their ascii value.

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

var workshopSettingWhitespaceChars = [0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08,
/*0x0b,0x0c,*/
0x0e, 0x0f, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19, 0x1a, 0x1b, 0x1c, 0x1d];
var workshopSettingWhitespace = [];

for (var _i = 0, _workshopSettingWhite = workshopSettingWhitespaceChars; _i < _workshopSettingWhite.length; _i++) {
  var chr = _workshopSettingWhite[_i];
  workshopSettingWhitespace.push(String.fromCodePoint(chr));
  workshopSettingWhitespace.push(String.fromCodePoint(0x1e, chr));
  workshopSettingWhitespace.push(String.fromCodePoint(0x1f, chr));
}

workshopSettingWhitespace.sort();
var typeTree = [{
  "Object": ["Player", {
    "float": [{
      "FloatLiteral": ["IntLiteral"]
    }, {
      "unsigned float": ["unsigned int"]
    }, {
      "signed float": ["signed int"]
    }, {
      "int": ["IntLiteral", "unsigned int", "signed int"]
    }]
  }, {
    "bool": ["BoolLiteral"]
  }, "DamageModificationId", "HealingModificationId", "DotId", "HotId", "EntityId", "TextId", "HealthPoolId", "String", {
    "Direction": ["Vector"]
  }, {
    "Position": ["Vector"]
  }, {
    "Velocity": ["Vector"]
  }, "Hero", "Map", "Team", "Gamemode", "Button"]
}, "Array", "void", "Type", "Lambda", "Label", "DictElem", "Raycast", "Subroutine", "GlobalVariable", "PlayerVariable", "HeroLiteral", "MapLiteral", "GamemodeLiteral", "TeamLiteral", "ButtonLiteral", {
  "StringLiteral": ["LocalizedStringLiteral", {
    "CustomStringLiteral": ["FullwidthStringLiteral", "BigLettersStringLiteral", "PlaintextStringLiteral"]
  }]
}, "Value", "Raycast"].concat(Object.keys(constantValues)); //Which types are suitable for a given type.
//For example, typeMatrix["float"] = ["float", "int", etc].

var typeMatrix = {};

function fillTypeMatrix(tree) {
  if (typeof tree === "string") {
    typeMatrix[tree] = [tree];
  } else {
    var type = Object.keys(tree)[0];
    typeMatrix[type] = [type];
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = tree[type][Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        var child = _step3.value;
        fillTypeMatrix(child);

        if (typeof child === "string") {
          var _typeMatrix$type;

          (_typeMatrix$type = typeMatrix[type]).push.apply(_typeMatrix$type, _toConsumableArray(typeMatrix[child]));
        } else {
          var _typeMatrix$type2;

          (_typeMatrix$type2 = typeMatrix[type]).push.apply(_typeMatrix$type2, _toConsumableArray(typeMatrix[Object.keys(child)[0]]));
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
  }
}

var _iteratorNormalCompletion4 = true;
var _didIteratorError4 = false;
var _iteratorError4 = undefined;

try {
  for (var _iterator4 = typeTree[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
    var elem = _step4.value;
    fillTypeMatrix(elem);
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

typeMatrix["Vector"].push("Direction", "Position", "Velocity");
reservedNames.push.apply(reservedNames, _toConsumableArray(Object.keys(typeMatrix))); //An array of functions for ast parsing (to not have a 4k lines file with all the functions and be able to handle each function in a separate file).

var astParsingFunctions = {};