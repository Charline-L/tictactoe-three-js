'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _JsonManager = require('./JsonManager.js');

var _JsonManager2 = _interopRequireDefault(_JsonManager);

var _Ia = require('./Ia');

var _Ia2 = _interopRequireDefault(_Ia);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Game = function () {
    function Game() {
        _classCallCheck(this, Game);

        var t = this;

        t.filesGame = _JsonManager2.default.getFileGame();
    }

    _createClass(Game, [{
        key: 'iaPlaying',
        value: function iaPlaying(id) {
            var t = this;

            var move = null;

            var fileGame = _JsonManager2.default.getFileGame();
            var iaLevel = [];

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = fileGame.games[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var game = _step.value;

                    if (game.id === id) iaLevel = game.computer.level;
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

            if (iaLevel === 'dumb') move = _Ia2.default.randomMove(id, fileGame);else {

                var canIaWin = false;
                var canPlayerWin = false;

                var _fileGame = _JsonManager2.default.getFileGame();
                var currentGame = [];
                var gameSize = null;

                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = _fileGame.games[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var _game = _step2.value;

                        if (_game.id === id) {
                            currentGame = _game.game;
                            gameSize = _game.gameSize;
                        }
                    }
                } catch (err) {
                    _didIteratorError2 = true;
                    _iteratorError2 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }
                    } finally {
                        if (_didIteratorError2) {
                            throw _iteratorError2;
                        }
                    }
                }

                var possibilites = _Ia2.default.getPossibilities(currentGame);

                // VERIFIE SI ELLE OU LE JOUEUR PEUT GAGNER

                var _loop = function _loop(position) {

                    var boardIA = currentGame;
                    boardIA[position] = -1;

                    var optionsIa = {
                        position: position,
                        direction: null,
                        player: -1,
                        board: boardIA
                    };

                    t.checkWin(optionsIa, function (hasWin) {

                        if (hasWin) canIaWin = position;
                    });
                };

                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                    for (var _iterator3 = possibilites[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                        var position = _step3.value;

                        _loop(position);
                    }
                } catch (err) {
                    _didIteratorError3 = true;
                    _iteratorError3 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion3 && _iterator3.return) {
                            _iterator3.return();
                        }
                    } finally {
                        if (_didIteratorError3) {
                            throw _iteratorError3;
                        }
                    }
                }

                var _loop2 = function _loop2(position) {

                    var fileGame = _JsonManager2.default.getFileGame();
                    var currentGame = [];
                    var gameSize = null;

                    var _iteratorNormalCompletion5 = true;
                    var _didIteratorError5 = false;
                    var _iteratorError5 = undefined;

                    try {
                        for (var _iterator5 = fileGame.games[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                            var _game2 = _step5.value;

                            if (_game2.id === id) {
                                currentGame = _game2.game;
                                gameSize = _game2.gameSize;
                            }
                        }
                    } catch (err) {
                        _didIteratorError5 = true;
                        _iteratorError5 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion5 && _iterator5.return) {
                                _iterator5.return();
                            }
                        } finally {
                            if (_didIteratorError5) {
                                throw _iteratorError5;
                            }
                        }
                    }

                    var boardPlayer = currentGame;
                    boardPlayer[position] = 1;

                    var optionsPlayer = {
                        position: position,
                        direction: null,
                        player: 1,
                        board: boardPlayer,
                        gameSize: gameSize
                    };

                    t.checkWin(optionsPlayer, function (hasWin) {

                        if (hasWin) canPlayerWin = position;
                    });
                };

                var _iteratorNormalCompletion4 = true;
                var _didIteratorError4 = false;
                var _iteratorError4 = undefined;

                try {
                    for (var _iterator4 = possibilites[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                        var position = _step4.value;

                        _loop2(position);
                    }
                } catch (err) {
                    _didIteratorError4 = true;
                    _iteratorError4 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion4 && _iterator4.return) {
                            _iterator4.return();
                        }
                    } finally {
                        if (_didIteratorError4) {
                            throw _iteratorError4;
                        }
                    }
                }

                if (canIaWin) move = canIaWin;else if (canPlayerWin) move = canPlayerWin;else move = _Ia2.default.randomMove(id, _JsonManager2.default.getFileGame());
            }

            return move;
        }
    }, {
        key: 'checkMove',
        value: function checkMove(move) {
            var t = this;

            var result = { statuts: 1, message: 'pending' };
            var player = move.player;

            var fileGame = _JsonManager2.default.getFileGame();
            var currentGame = [];
            var gameSize = 0;

            var _iteratorNormalCompletion6 = true;
            var _didIteratorError6 = false;
            var _iteratorError6 = undefined;

            try {
                for (var _iterator6 = fileGame.games[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                    var game = _step6.value;


                    if (game.id === move.id) {
                        currentGame = game.game;
                        gameSize = game.gameSize;
                    }
                }
            } catch (err) {
                _didIteratorError6 = true;
                _iteratorError6 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion6 && _iterator6.return) {
                        _iterator6.return();
                    }
                } finally {
                    if (_didIteratorError6) {
                        throw _iteratorError6;
                    }
                }
            }

            result.player = player;

            if (!t.needToCheck(player, move.id)) return result;

            var options = {
                position: move.position,
                direction: null,
                player: move.player,
                board: currentGame,
                gameSize: gameSize
            };

            t.checkWin(options, function (hasWin) {

                if (hasWin) result.message = 'win';else if (!hasWin && t.equality(move.id)) result.message = 'equality';
            });

            return result;
        }
    }, {
        key: 'needToCheck',
        value: function needToCheck(player, id) {
            var t = this;

            var gameSize = 0;
            var gamePlay = [];
            var numberMovesDone = 0;

            t.fileGame = _JsonManager2.default.getFileGame();

            var _iteratorNormalCompletion7 = true;
            var _didIteratorError7 = false;
            var _iteratorError7 = undefined;

            try {
                for (var _iterator7 = t.fileGame.games[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                    var game = _step7.value;


                    if (game.id === id) {
                        gameSize = game.gameSize;
                        gamePlay = game.game;
                    }
                }
            } catch (err) {
                _didIteratorError7 = true;
                _iteratorError7 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion7 && _iterator7.return) {
                        _iterator7.return();
                    }
                } finally {
                    if (_didIteratorError7) {
                        throw _iteratorError7;
                    }
                }
            }

            for (var positions in gamePlay) {
                if (gamePlay[positions] === player) numberMovesDone++;
            }

            return numberMovesDone >= gameSize;
        }
    }, {
        key: 'checkWin',
        value: function checkWin(optionsReceived, callback) {
            var t = this;

            var verifyOptions = Object.assign({}, optionsReceived);

            var posCol = optionsReceived.position % optionsReceived.gameSize;
            var posRow = (optionsReceived.position - posCol) / optionsReceived.gameSize;

            verifyOptions.posCol = posCol;
            verifyOptions.posRow = posRow;

            var hasWin = t.verify(verifyOptions);

            callback(hasWin);
        }
    }, {
        key: 'verify',
        value: function verify(options) {
            var t = this;

            t.lines = {
                vertical: 1,
                horizontal: 1,
                rightDiag: 1,
                leftDiag: 1
            };

            t.checkLines(options);

            for (var line in t.lines) {

                var count = t.lines[line];
                if (count === options.gameSize) return true;
            }

            return false;
        }
    }, {
        key: 'checkLines',
        value: function checkLines(options) {
            var t = this;

            var gameMap = options.board;

            var currentPlayer = options.player;

            // RESET LES DIRECTIONS
            var around = {
                north: undefined,
                ne: undefined,
                est: undefined,
                se: undefined,
                south: undefined,
                sw: undefined,
                west: undefined,
                nw: undefined
            };

            // CALCULE LES DIRECTIONS POSSIBLES

            // SUD
            if (options.posRow < options.gameSize - 1) around.south = [options.posCol, options.posRow + 1];

            // NORD
            if (options.posRow > 0) around.north = [options.posCol, options.posRow - 1];

            // EST
            if (options.posCol < options.gameSize - 1) around.est = [options.posCol + 1, options.posRow];

            // OUEST
            if (options.posCol > 0) around.west = [options.posCol - 1, options.posRow];

            // SUD EST
            if (options.posCol < options.gameSize - 1 && options.posRow < options.gameSize - 1) around.se = [options.posCol + 1, options.posRow + 1];

            // SUD OUEST
            if (options.posCol > 0 && options.posRow < options.gameSize - 1) around.sw = [options.posCol - 1, options.posRow + 1];

            // NORD EST
            if (options.posCol < options.gameSize - 1 && options.posRow > 0) around.ne = [options.posCol + 1, options.posRow - 1];

            // NORD OUEST
            if (options.posCol > 0 && options.posRow > 0) around.nw = [options.posCol - 1, options.posRow - 1];

            // SI PAS DE DIRECTION DONNEES ON PARCOURS TOUTES LES DIRECTONS
            if (options.direction === null) {

                for (var index in around) {

                    var position = around[index];

                    if (position !== undefined) {
                        var indexOneD = position[0] + position[1] * options.gameSize;

                        if (gameMap[indexOneD] === currentPlayer) {

                            t.updateLine(index);

                            var optionsUpdate = options;

                            optionsUpdate.posCol = around[index][0];
                            optionsUpdate.posRow = around[index][1];
                            optionsUpdate.direction = index;

                            t.checkLines(optionsUpdate);
                        }
                    }
                }
            }

            // SI DIRECTION DONNEE ON LA POINTE
            else {

                    var _position = around[options.direction];

                    if (_position !== undefined) {
                        var _indexOneD = _position[0] + _position[1] * options.gameSize;

                        if (gameMap[_indexOneD] === currentPlayer) {

                            t.updateLine(options.direction);

                            var _optionsUpdate = options;

                            _optionsUpdate.posCol = around[options.direction][0];
                            _optionsUpdate.posRow = around[options.direction][1];
                            _optionsUpdate.direction = options.direction;

                            t.checkLines(_optionsUpdate);
                        }
                    }
                }
        }
    }, {
        key: 'updateLine',
        value: function updateLine(direction) {
            var t = this;

            switch (true) {

                case direction === 'north' || direction === 'south':
                    t.lines.vertical++;
                    break;

                case direction === 'est' || direction === 'west':
                    t.lines.horizontal++;
                    break;

                case direction === 'ne' || direction === 'sw':
                    t.lines.rightDiag++;
                    break;

                case direction === 'nw' || direction === 'se':
                    t.lines.leftDiag++;
                    break;

                default:
                    break;
            }
        }
    }, {
        key: 'equality',
        value: function equality(id) {
            var t = this;

            t.fileGame = _JsonManager2.default.getFileGame();
            var gamePlay = [];

            var _iteratorNormalCompletion8 = true;
            var _didIteratorError8 = false;
            var _iteratorError8 = undefined;

            try {
                for (var _iterator8 = t.fileGame.games[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                    var game = _step8.value;


                    if (game.id === id) {
                        gamePlay = game.game;
                    }
                }
            } catch (err) {
                _didIteratorError8 = true;
                _iteratorError8 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion8 && _iterator8.return) {
                        _iterator8.return();
                    }
                } finally {
                    if (_didIteratorError8) {
                        throw _iteratorError8;
                    }
                }
            }

            return gamePlay.indexOf(0) === -1;
        }
    }], [{
        key: 'getPlayer',
        value: function getPlayer(id) {

            var fileGame = _JsonManager2.default.getFileGame();
            var currentPlayer = 0;

            var _iteratorNormalCompletion9 = true;
            var _didIteratorError9 = false;
            var _iteratorError9 = undefined;

            try {
                for (var _iterator9 = fileGame.games[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                    var game = _step9.value;


                    if (game.id === id) {
                        currentPlayer = game.playerCircle.isPlaying ? 1 : -1;
                    }
                }
            } catch (err) {
                _didIteratorError9 = true;
                _iteratorError9 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion9 && _iterator9.return) {
                        _iterator9.return();
                    }
                } finally {
                    if (_didIteratorError9) {
                        throw _iteratorError9;
                    }
                }
            }

            return currentPlayer;
        }
    }, {
        key: 'doesHaveIa',
        value: function doesHaveIa(id) {

            var fileGame = _JsonManager2.default.getFileGame();
            var hasIa = false;

            var _iteratorNormalCompletion10 = true;
            var _didIteratorError10 = false;
            var _iteratorError10 = undefined;

            try {
                for (var _iterator10 = fileGame.games[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
                    var game = _step10.value;


                    if (game.id === id && game.computer.on) hasIa = true;
                }
            } catch (err) {
                _didIteratorError10 = true;
                _iteratorError10 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion10 && _iterator10.return) {
                        _iterator10.return();
                    }
                } finally {
                    if (_didIteratorError10) {
                        throw _iteratorError10;
                    }
                }
            }

            return hasIa;
        }
    }]);

    return Game;
}();

module.exports = Game;