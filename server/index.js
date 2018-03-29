'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _cors = require('cors');

var _cors2 = _interopRequireDefault(_cors);

var _JsonManager = require('./JsonManager.js');

var _JsonManager2 = _interopRequireDefault(_JsonManager);

var _Game = require('./Game.js');

var _Game2 = _interopRequireDefault(_Game);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// constantes


// class
var port = 3000; // TODO :
// - décomposer les fichiers
// - gestion des erreurs
// - réussir à faire un GROSSE CLASSEpour avoir dedans toutes linfos que je balade de class en clas
//// exemple game size !!


// packets

var app = (0, _express2.default)();
var jsonManager = new _JsonManager2.default();
var game = new _Game2.default();

app.use((0, _cors2.default)());
app.use(_bodyParser2.default.json());

// lance le serveur
app.listen(port, function () {
    console.log('||-> server listening on port ' + port);
});

// enregistre les paramètres du jeu
app.post('/registerGame', function (req, res) {

    var gameSettings = req.body;

    var registerGame = jsonManager.registerGame(gameSettings);

    res.send(registerGame);
});

// recupère les scores
app.post('/getScores', function (req, res) {

    var id = req.body.id;

    var result = _JsonManager2.default.getScores(id);

    res.send(result);
});

var count = 0;

// on vérifie les coups
app.post('/playing', function (req, res) {

    var result = { statuts: 0 };
    var position = req.body.position;
    var id = req.body.id;

    // vérifie si peut faire ce coup
    var isSelected = jsonManager.isSelected(position, id);

    if (!isSelected) {

        var whoIsPlaying = jsonManager.whoIsPlaying(id);

        var move = {
            player: whoIsPlaying,
            position: position,
            id: id
        };

        var resultJson = jsonManager.sendMove(move);
        var resultCheckMove = game.checkMove(move);

        // si erreur enregistrement du json on retourne l'erreur
        if (!resultJson.statuts) result = resultJson;else {

            result = resultCheckMove;

            // en fonction du statut de la partie on modifie le json
            if (result.message === 'pending') jsonManager.changePlayer(id);else if (result.message === 'win') {

                var hasWinner = jsonManager.winner(whoIsPlaying, id);

                if (!hasWinner.statuts) result = hasWinner;else result.name = hasWinner.name;
            }

            // vérifie si besoin IA
            if (_Game2.default.doesHaveIa(id)) result.ia = true;
        }
    } else result.message = 'Déja sélectionné';

    res.send(result);
});

// au tour de l'ia
app.post('/ia', function (req, res) {

    var result = {};
    var id = req.body.id;

    var move = {
        player: -1,
        position: game.iaPlaying(id),
        id: id
    };

    var resultJson = jsonManager.sendMove(move);
    var resultCheckMove = game.checkMove(move);

    console.log('resultJson', resultJson);

    // si erreur enregistrement du json on retourne l'erreur
    if (!resultJson.statuts) result = resultJson;else {

        result = resultCheckMove;

        // en fonction du statut de la partie on modifie le json
        if (result.message === 'pending') jsonManager.changePlayer(id);else if (result.message === 'win') {

            var hasWinner = jsonManager.winner(-1);

            if (!hasWinner.statuts) result = hasWinner;else result.name = 'ia';
        }

        console.log('move.position', move.position);

        result.move = move.position;
    }

    res.send(result);
});

// nouvelle partie
app.post('/newGame', function (req, res) {

    var id = req.body.id;

    var result = jsonManager.registerGamePlay(id);

    res.send(result);
});

// recupérer les meilleurs scores
app.post('/getWallOfFame', function (req, res) {

    var result = jsonManager.getWallOfFame();

    res.send(result);
});