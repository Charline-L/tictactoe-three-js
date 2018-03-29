'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _JsonManager = require('./JsonManager.js');

var _JsonManager2 = _interopRequireDefault(_JsonManager);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Ia = function () {
    function Ia(infos) {
        _classCallCheck(this, Ia);

        var t = this;

        t.iasLevel = infos.level;
        t.gameSize = infos.gameSize;

        t.possibilites = [];
    }

    _createClass(Ia, null, [{
        key: 'randomMove',
        value: function randomMove(id, fileGame) {

            var currentGame = [];

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = fileGame.games[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var game = _step.value;

                    if (game.id === id) currentGame = game.game;
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            var possibilities = Ia.getPossibilities(currentGame);

            var max = possibilities.length - 1;

            var move = Math.floor(Math.random() * max);

            return possibilities[move];
        }
    }, {
        key: 'getPossibilities',
        value: function getPossibilities() {
            var board = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

            var possibilities = [];

            var gamePlay = board ? board : _JsonManager2.default.getGamePlay();

            for (var index in gamePlay) {
                if (gamePlay[index] === 0) possibilities.push(index);
            }

            return possibilities;
        }
    }]);

    return Ia;
}();

module.exports = Ia;