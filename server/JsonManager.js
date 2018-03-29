'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _Tools = require('./Tools.js');

var _Tools2 = _interopRequireDefault(_Tools);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var JsonManager = function () {
    function JsonManager() {
        _classCallCheck(this, JsonManager);

        var t = this;

        t.filesName = {
            game: _path2.default.resolve(__dirname) + '/jsons/game.json',
            players: _path2.default.resolve(__dirname) + '/jsons/players.json'
        };

        t.fileGame = JsonManager.getFileGame();
        t.filePlayers = JsonManager.getFilePlayers();
    }

    _createClass(JsonManager, [{
        key: 'registerGamePlay',
        value: function registerGamePlay(id) {
            var t = this;

            t.fileGame = JsonManager.getFileGame();

            var indexCurrentGame = null;
            var gameSize = null;

            for (var index in t.fileGame.games) {

                if (t.fileGame.games[index].id === id) {

                    gameSize = t.fileGame.games[index].gameSize;
                    indexCurrentGame = index;
                }
            }

            for (var _index = 0; _index < Math.pow(gameSize, 2); _index++) {
                t.fileGame.games[indexCurrentGame].game[_index] = 0;
            }

            return t.updateGameJson();
        }
    }, {
        key: 'registerGame',
        value: function registerGame(game) {
            var t = this;
            var result = null;

            var gameBoard = [];

            var id = JsonManager.generateID();

            for (var index = 0; index < Math.pow(game.gameSize, 2); index++) {
                gameBoard[index] = 0;
            } // 1 - dans le fichier du jeu
            var newGame = {
                id: id,
                playerCircle: {
                    valuePlayer: 1,
                    isPlaying: true,
                    name: game.playerCircleName ? game.playerCircleName : 'idk',
                    wins: 0
                },
                playerCross: {
                    valuePlayer: -1,
                    isPlaying: false,
                    name: game.playerCrossName ? game.playerCrossName : 'doe',
                    wins: 0
                },
                game: gameBoard,
                gameSize: game.gameSize,
                gameStatus: "playing",
                computer: {
                    on: game.computer,
                    level: game.computerLevel
                }
            };

            t.fileGame.games.push(newGame);

            var resultGame = t.updateGameJson();

            // 2 - dans le fichier des joueurs
            var resultPlayerCircle = t.addPlayer(game.playerCircleName, id);
            var resultPlayerCross = t.addPlayer(game.playerCrossName, id);

            if (resultGame.statuts + resultPlayerCircle.statuts + resultPlayerCross.statuts >= 3) result = { statuts: 1, id: id };else result = { statuts: 0, message: 'ERROR JsonManager.registerPlayer()' };

            return result;
        }
    }, {
        key: 'addPlayer',
        value: function addPlayer(playerName, id) {
            var t = this;

            if (!playerName) return { statuts: 1 };

            var newPlayer = {
                name: playerName,
                wins: 0,
                id: id
            };

            t.filePlayers.players.push(newPlayer);

            return t.updatePlayersJson();
        }
    }, {
        key: 'whoIsPlaying',
        value: function whoIsPlaying(id) {
            var t = this;

            var player = 0;

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = t.fileGame.games[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var games = _step.value;


                    if (games.id === id) {
                        player = games.playerCircle.isPlaying ? 1 : -1;
                    }
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

            return player;
        }
    }, {
        key: 'sendMove',
        value: function sendMove(infos) {
            var t = this;

            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = t.fileGame.games[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var games = _step2.value;

                    if (games.id === infos.id) {
                        games.game[infos.position] = infos.player;
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

            return t.updateGameJson();
        }
    }, {
        key: 'changePlayer',
        value: function changePlayer(id) {

            var t = this;

            t.fileGame = JsonManager.getFileGame();

            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = t.fileGame.games[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var game = _step3.value;


                    if (game.id === id) {
                        game.playerCircle.isPlaying = !game.playerCircle.isPlaying;
                        game.playerCross.isPlaying = !game.playerCross.isPlaying;
                    }
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

            t.updateGameJson();
        }
    }, {
        key: 'isSelected',
        value: function isSelected(position, id) {
            var t = this;

            var isSelected = 0;

            t.fileGame = JsonManager.getFileGame();

            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = t.fileGame.games[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var games = _step4.value;

                    if (games.id === id && games.game[position] === position) {
                        isSelected = Math.abs(games.game[position]);
                    }
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

            return isSelected;
        }
    }, {
        key: 'winner',
        value: function winner(player, id) {
            var t = this;

            var result = {};
            var playerName = JsonManager.getPlayerName(id);
            t.fileGame = JsonManager.getFileGame();
            t.filePlayers = JsonManager.getFilePlayers();
            t.files = JsonManager.getFileGame();

            // dans la game
            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = t.fileGame.games[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var game = _step5.value;


                    if (game.id === id) {
                        if (player === 1) game.playerCircle.wins++;else game.playerCross.wins++;
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

            t.updateGameJson();

            // dans players
            var _iteratorNormalCompletion6 = true;
            var _didIteratorError6 = false;
            var _iteratorError6 = undefined;

            try {
                for (var _iterator6 = t.filePlayers.players[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                    var _player = _step6.value;


                    if (_player.name === playerName && _player.id === id) _player.wins++;
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

            var resultGame = t.updateGameJson();
            var resultPlayers = t.updatePlayersJson();

            if (resultGame.statuts + resultPlayers.statuts === 2) result = { statuts: 1, name: playerName };else result = { statuts: 0, message: 'ERROR JsonManager winner()' };

            return result;
        }
    }, {
        key: 'getWallOfFame',
        value: function getWallOfFame() {
            var t = this;

            var players = t.filePlayers.players;
            var wallOfFame = _Tools2.default.bubbleSort(players, 10);
            var result = { statuts: 1 };

            if (!wallOfFame) result.noPlayers = true;else result.wallOfFameOrdered = wallOfFame;

            return result;
        }
    }, {
        key: 'updateGameJson',
        value: function updateGameJson() {
            var t = this;

            var result = null;

            try {
                _fs2.default.writeFileSync(t.filesName.game, JSON.stringify(t.fileGame));
                t.fileGame = JsonManager.getFileGame();

                result = { statuts: 1 };
            } catch (err) {
                result = {
                    statuts: 0,
                    message: err
                };
            }

            return result;
        }
    }, {
        key: 'updatePlayersJson',
        value: function updatePlayersJson() {
            var t = this;

            var result = null;

            try {
                _fs2.default.writeFileSync(t.filesName.players, JSON.stringify(t.filePlayers));
                t.filePlayers = JsonManager.getFilePlayers();

                result = { statuts: 1 };
            } catch (err) {
                result = {
                    statuts: 0,
                    message: err
                };
            }

            return result;
        }
    }], [{
        key: 'generateID',
        value: function generateID() {

            var gameFile = JsonManager.getFileGame();

            var lastInsertedId = -1;

            if (gameFile.games.length !== 0) {
                lastInsertedId = Number(gameFile.games[gameFile.games.length - 1].id);
            }

            return lastInsertedId + 1;
        }
    }, {
        key: 'getFileGame',
        value: function getFileGame() {

            var file = _fs2.default.readFileSync(_path2.default.resolve(__dirname) + '/jsons/game.json', 'utf-8');
            if (typeof file !== 'string') return { statuts: 1, message: 'Erreur - UpdateJson.getFileGame()' };else return JSON.parse(file);
        }
    }, {
        key: 'getFilePlayers',
        value: function getFilePlayers() {

            var file = _fs2.default.readFileSync(_path2.default.resolve(__dirname) + '/jsons/players.json', 'utf-8');
            if (typeof file !== 'string') return { statuts: 1, message: 'Erreur - UpdateJson.getFilePlayers()' };else return JSON.parse(file);
        }
    }, {
        key: 'getPlayerName',
        value: function getPlayerName(id) {

            var file = JsonManager.getFileGame();
            var payerName = null;

            var _iteratorNormalCompletion7 = true;
            var _didIteratorError7 = false;
            var _iteratorError7 = undefined;

            try {
                for (var _iterator7 = file.games[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                    var game = _step7.value;


                    if (game.id === id) {
                        payerName = game.playerCircle.isPlaying ? game.playerCircle.name : game.playerCross.name;
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

            return payerName;
        }
    }, {
        key: 'getGamePlay',
        value: function getGamePlay() {

            var file = JsonManager.getFileGame();
            return file.game;
        }
    }, {
        key: 'getCurrentGame',
        value: function getCurrentGame(id) {

            var fileGame = JsonManager.getFileGame();
            var currentGame = {};

            var _iteratorNormalCompletion8 = true;
            var _didIteratorError8 = false;
            var _iteratorError8 = undefined;

            try {
                for (var _iterator8 = fileGame.games[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                    var game = _step8.value;

                    if (game.id === id) currentGame = game;
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

            return currentGame;
        }
    }, {
        key: 'getScores',
        value: function getScores(id) {

            var currentGame = JsonManager.getCurrentGame(id);
            var ia = currentGame.computer.on;

            var results = {
                statuts: 1,
                scores: [{
                    name: currentGame.playerCircle.name,
                    wins: currentGame.playerCircle.wins
                }, {
                    name: !ia ? currentGame.playerCross.name : 'ia',
                    wins: currentGame.playerCross.wins
                }]
            };

            return results;
        }
    }]);

    return JsonManager;
}();

module.exports = JsonManager;