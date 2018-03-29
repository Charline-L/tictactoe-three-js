"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _JsonManager = require("./JsonManager.js");

var _JsonManager2 = _interopRequireDefault(_JsonManager);

var _Ia = require("./Ia");

var _Ia2 = _interopRequireDefault(_Ia);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Tools = function () {
    function Tools() {
        _classCallCheck(this, Tools);
    }

    _createClass(Tools, null, [{
        key: "bubbleSort",
        value: function bubbleSort(arrayToSort) {
            var numberElements = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : arrayToSort.length - 1;


            if (!Array.isArray(arrayToSort) || arrayToSort.length === 0) return false;

            for (var indexLastElement = arrayToSort.length - 1; indexLastElement >= 1; indexLastElement--) {

                var arraySorted = true;

                for (var indexFirstElement = 0; indexFirstElement <= indexLastElement - 1; indexFirstElement++) {

                    if (arrayToSort[indexFirstElement + 1].wins > arrayToSort[indexFirstElement].wins) {

                        var valueFirstElement = arrayToSort[indexFirstElement];
                        arrayToSort[indexFirstElement] = arrayToSort[indexFirstElement + 1];
                        arrayToSort[indexFirstElement + 1] = valueFirstElement;

                        arraySorted = false;
                    }
                }

                if (arraySorted) break;
            }

            return arrayToSort.slice(0, numberElements);
        }
    }]);

    return Tools;
}();

module.exports = Tools;