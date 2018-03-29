'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// class Board

// regroupe :
// - toutes les fonctions en lien avec Three.js
// - gère l'affichage et l'animation
// - ne gère pas l'intéraction


var Board = function () {
    function Board(gameSize) {
        _classCallCheck(this, Board);

        var t = this;

        // device
        t.ww = window.innerWidth - 400;
        t.wh = window.innerHeight;

        // elements basic three
        t.scene = new THREE.Scene();
        t.camera = new THREE.PerspectiveCamera(75, t.ww / t.wh, 0.1, 1000);
        t.renderer = new THREE.WebGLRenderer({ alpha: true });
        t.renderer.shadowMap.enabled = true;

        // elements du DOM
        t.$gameC = document.getElementById('canvas');
        t.$gameC.appendChild(t.renderer.domElement);

        // permet d'intéragir avec le DOM
        t.domEvents = new THREEx.DomEvents(t.camera, t.renderer.domElement);

        // couleurs
        t.white = 0xfcf9f9;
        t.trueWhite = 0xffffff;
        t.purple = 0x64698f;
        t.pink = 0xefd0f2;
        t.lightPink = 0xeaccee;
        t.lightPurple = 0x936e9a;
        t.whitePink = 0xeddff8;

        // variables de calcul
        t.gameSize = gameSize;
        t.decalage = 20;
        t.sphereSize = 1;
        t.gap = t.sphereSize * 2 - t.decalage;

        // variables stockage
        t.spheresElements = [];
        t.dodecahedronElements = [];
        // t.flowersElements = []
        t.flowersObj = [];
        t.linesElements = [];
        t.starFieldElements = [];
        t.starFieldElementsPositions = [];
        t.updateRateParticules = 50;
        t.currentUpdateRateParticules = 0;

        t.init();
    }

    _createClass(Board, [{
        key: 'init',
        value: function init() {

            var t = this;

            t.loadFlowers();
            t.setSizeRenderer();
            t.setLights();
            t.createGamePlay();
            t.setCamera();
            t.controls = new THREE.OrbitControls(t.camera);
            t.animate();
            // t.bindEvents()
        }

        // bindEvents() {
        //     const t = this
        //
        //     window.addEventListener('resize', function(){
        //         console.log('in resize !!!')
        //         t.setSizeRenderer.bind(t)
        //     } )
        //
        // }

    }, {
        key: 'setSizeRenderer',
        value: function setSizeRenderer() {
            var t = this;

            t.ww = window.innerWidth - 400;
            t.wh = window.innerHeight;

            t.renderer.setSize(t.ww, t.wh);
        }
    }, {
        key: 'setLights',
        value: function setLights() {
            var t = this;

            var lightAmbient = new THREE.AmbientLight(t.white, 1);
            t.scene.add(lightAmbient);

            var lightPoint = new THREE.PointLight(t.purple, 1);
            t.scene.add(lightPoint);
        }
    }, {
        key: 'setCamera',
        value: function setCamera() {
            var t = this;

            t.camera.position.z = t.gameSize * 20;
            t.camera.position.x = t.gap / 4 + 5;
            t.camera.position.y = t.gap / -4 - 2.5;

            t.camera.lookAt(0, 0, 0);
        }
    }, {
        key: 'animate',
        value: function animate() {
            var t = this;

            // rotation de la forme autour de la sphère
            for (var i = 0; i < t.dodecahedronElements.length; i++) {
                var randomRotate = Math.random() * (0.01 + -0.01) + -0.01;

                t.dodecahedronElements[i].rotation.y += randomRotate;
                t.dodecahedronElements[i].rotation.x += randomRotate;
            }

            // update la scène
            t.controls.update();
            t.renderer.render(t.scene, t.camera);

            // rapelle la fonction
            requestAnimationFrame(t.animate.bind(t));
        }
    }, {
        key: 'createGamePlay',
        value: function createGamePlay() {
            var t = this;

            // on créer les geometry et textures des formes présentes dans le jeu :
            // pour case case : une sphere + un dodecahedron + des particules + une ligne
            var geometrySphere = new THREE.SphereGeometry(t.sphereSize, 20, 20);
            var materialSphere = new THREE.MeshPhongMaterial({ color: t.white, specular: 0xFF0000, shininess: 20 });

            var geometryDodecahedron = new THREE.DodecahedronGeometry(t.sphereSize * 4, 0);
            var materialDodecahedron = new THREE.MeshPhongMaterial({ color: t.white, wireframe: true });

            var materialLine = new THREE.LineBasicMaterial({
                color: t.white,
                transparent: true,
                opacity: 0.005
            });

            var geometryLine = new THREE.Geometry();

            // on boucle sur nos éléments
            // pour créer notre grille et ainsi
            // pour lier leurs position
            var startPos = -Math.trunc(t.gameSize / 2);

            for (var i = startPos; i < t.gameSize + startPos; i++) {

                for (var j = startPos; j < t.gameSize + startPos; j++) {

                    // on créer les formes
                    var sphere = new THREE.Mesh(geometrySphere, materialSphere);
                    var dodecahedron = new THREE.Mesh(geometryDodecahedron, materialDodecahedron);

                    geometryLine.vertices.push(new THREE.Vector3(0, 0, -30 * t.gameSize), new THREE.Vector3(-j * t.gap, i * t.gap, 0));

                    var line = new THREE.Line(geometryLine, materialLine);

                    // on les positionne
                    sphere.position.x = -j * t.gap;
                    sphere.position.y = i * t.gap;

                    dodecahedron.position.x = -j * t.gap;
                    dodecahedron.position.y = i * t.gap;

                    // on les stocke dans un tableau
                    t.spheresElements.push(sphere);
                    t.dodecahedronElements.push(dodecahedron);
                    t.linesElements.push(line);
                }
            }

            // on parcours un de nos tableau dnas lequel est stocké nos sphère

            var _loop = function _loop(_i) {

                // on ajoute les élément à la scène
                t.scene.add(t.spheresElements[_i]);
                t.scene.add(t.dodecahedronElements[_i]);
                t.scene.add(t.linesElements[_i]);

                // on ajoute l'intéraction avec la sphere et le passage du curseur
                t.domEvents.addEventListener(t.dodecahedronElements[_i], 'mouseover', function () {
                    for (var _i4 = 0; _i4 < t.spheresElements.length; _i4++) {
                        t.animateMoveDown(_i4);
                    }t.animateMoveUp(_i);
                });

                t.domEvents.addEventListener(t.dodecahedronElements[_i], 'mouseout', function () {
                    t.animateMoveDown(_i);
                });
            };

            for (var _i = 0; _i < t.spheresElements.length; _i++) {
                _loop(_i);
            }

            // on crée les particules présentes dans chaque dodecahedron
            // la texture des particules est cette fois une image
            for (var _i2 = 0; _i2 < t.dodecahedronElements.length; _i2++) {

                // on calcul les valeur maximales et minimales pour les positions des particules
                // pour que cette dernières restent proches du dodecahedron
                var interValPositions = t.getIntervalPosition(_i2);

                // on va créer un "champ d'étoiles"
                var starsGeometry = new THREE.Geometry();
                var sprite = new THREE.TextureLoader().load("assets/img/disc.png");

                // on créer 10 particule par case
                for (var _i3 = 0; _i3 < 10; _i3++) {

                    var star = new THREE.Vector3();

                    star.x = THREE.Math.randFloat(interValPositions.xMin, interValPositions.xMax);
                    star.y = THREE.Math.randFloat(interValPositions.yMin, interValPositions.yMax);
                    star.z = THREE.Math.randFloat(interValPositions.zMin, interValPositions.zMax);

                    // on ajoute chaque particule dans notre geometry
                    starsGeometry.vertices.push(star);
                }

                // on créer notre "champ d'étoile" en lui donnant un matriel de point
                // vu que la textur est un jpg on lui dit de gérer la transarence
                var starsMaterial = new THREE.PointsMaterial({ size: 0.5, sizeAttenuation: true, map: sprite, alphaTest: 0.5, opacity: 1, transparent: true });

                // on créer la forme qui va contenir tous les spheres
                var starField = new THREE.Points(starsGeometry, starsMaterial);

                // on stocke dans notre tableau
                t.starFieldElements.push(starField);

                // on ajoute à la scène
                t.scene.add(starField);
            }
        }
    }, {
        key: 'animateMoveDown',
        value: function animateMoveDown(i) {
            var t = this;

            // effet de hover à l'entrée du curseur
            // on récupère l'élément à modifier avec son index i passé dans la fonction
            var moveDown = setInterval(function () {

                if (t.spheresElements[i].position.z > 0) t.spheresElements[i].position.z = t.spheresElements[i].position.z - 0.08333333333 * 2;else clearInterval(moveDown);
            }, 0.5);
        }
    }, {
        key: 'animateMoveUp',
        value: function animateMoveUp(i) {
            var t = this;

            // effet de hover à la sortie du curseur
            // on récupère l'élément à modifier avec son index i passé dans la fonction
            var moveUp = setInterval(function () {

                if (t.spheresElements[i].position.z <= 1) t.spheresElements[i].position.z = t.spheresElements[i].position.z + 0.08333333333;else clearInterval(moveUp);
            }, 0.5);
        }
    }, {
        key: 'animateSelect',
        value: function animateSelect(i) {
            var t = this;

            // effet de disparition du dodecahedron lorsqu'une fleur apparait
            // on récupère l'élément à modifier avec son index i passé dans la fonction
            var scaleDown = setInterval(function () {

                if (t.dodecahedronElements[i].scale.x > 0) {
                    t.dodecahedronElements[i].scale.x = t.dodecahedronElements[i].scale.x - 0.048;
                    t.dodecahedronElements[i].scale.y = t.dodecahedronElements[i].scale.y - 0.048;
                    t.dodecahedronElements[i].scale.z = t.dodecahedronElements[i].scale.z - 0.048;
                } else clearInterval(scaleDown);
            }, 2);
        }
    }, {
        key: 'showFlower',
        value: function showFlower(i, player) {
            var t = this;

            // en fonction du joueur on choisi la fleur
            var indexFlower = player === 1 ? 1 : 0;

            // on configure le material de la lfeur
            var materialFlower = new THREE.MeshBasicMaterial({ color: t.white });

            // on récupère sa geometry stockée dans le tableau
            var flower = new THREE.Mesh(t.flowersObj[indexFlower], materialFlower);

            // on calque sa position sur le dodecahedron de la même case
            flower.position.copy(t.dodecahedronElements[i].position);

            // on positionne la fleur à l'endroit
            flower.rotation.x = THREE.Math.degToRad(-90);

            // t.flowersElements.push(flowerInfos)
            t.scene.add(flower);

            // on anime son apparatition
            // en changeant sa scale et en la faisant tourner
            var flowerUp = setInterval(function () {

                if (flower.scale.x < 6) {
                    flower.scale.x = flower.scale.x + 0.048;
                    flower.scale.y = flower.scale.y + 0.048;
                    flower.scale.z = flower.scale.z + 0.048;

                    if (flower.rotation.y > 4) flower.rotation.y = flower.rotation.y + 0.05 / flower.rotation.y;else flower.rotation.y = flower.rotation.y + 0.05;
                } else clearInterval(flowerUp);
            }, 1);
        }
    }, {
        key: 'loadFlowers',
        value: function loadFlowers() {
            var t = this;

            // permet de gérer le chargement
            var manager = new THREE.LoadingManager();

            // lance le premier chargement
            // on configure le marnager dans le JSONLoader
            var loaderMeshOne = new THREE.JSONLoader(manager);

            loaderMeshOne.load('assets/objets/flowerC.json', function (geometry) {
                // une fois terminé on stocke la geometry de la fleur dans un tableau
                // pour la réutiliser lors de son apparition
                t.flowersObj.push(geometry);
            });

            // lance le deuxième chargement
            // on configure le marnager dans le JSONLoader
            var loaderMeshTwo = new THREE.JSONLoader(manager);

            loaderMeshTwo.load('assets/objets/flowerI.json', function (geometry) {
                // une fois terminé on stocke la geometry de la fleur dans un tableau
                // pour la réutiliser lors de son apparition
                t.flowersObj.push(geometry);
            });
        }
    }, {
        key: 'getIntervalPosition',
        value: function getIntervalPosition(i) {
            var t = this;

            // on récupère le container
            var containerParticles = new THREE.Box3().setFromObject(t.dodecahedronElements[i]);

            // on stocke sa taille
            var sizeX = containerParticles.getSize().x;
            var sizeY = containerParticles.getSize().y;
            var sizeZ = containerParticles.getSize().z;

            // ses intervales
            // toutes les valeurs partent de son centre

            var xMin = t.dodecahedronElements[i].position.x - sizeX / 2;
            var xMax = xMin + sizeX;

            var yMin = t.dodecahedronElements[i].position.y - sizeY / 2;
            var yMax = yMin + sizeY;

            var zMin = t.dodecahedronElements[i].position.z - sizeZ / 2;
            var zMax = zMin + sizeZ;

            // on range ces valeurs dans un objet
            var intevalPositions = {
                xMin: xMin,
                xMax: xMax,
                yMin: yMin,
                yMax: yMax,
                zMin: zMin,
                zMax: zMax

                // on retourne le retourne
            };return intevalPositions;
        }

        // méthodes appelées pour manipuler le DOM

    }, {
        key: 'getShapes',
        value: function getShapes() {
            var t = this;

            return t.dodecahedronElements;
        }
    }, {
        key: 'getDomListerner',
        value: function getDomListerner() {
            var t = this;

            return t.domEvents;
        }
    }]);

    return Board;
}();
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// class Server

// regroupe :
// - la fonction d'envoi ajax
// - la fonction de gestion des erreurs

var Server = function () {
    function Server() {
        _classCallCheck(this, Server);
    }

    _createClass(Server, null, [{
        key: 'ajaxRequest',
        value: function ajaxRequest(infos) {

            var resultValue = null;
            var messageError = null;

            // on récupères les données s'il y a
            var data = infos.data ? infos.data : {};

            // on ajout l'identifiant de la partie
            data.id = window.gameID;

            $.ajax({
                url: 'http://localhost:3000/' + infos.action,
                type: 'POST',
                crossDomain: true,
                data: JSON.stringify(data),
                dataType: 'json',
                contentType: 'application/json',
                async: false,
                success: function success(data) {

                    // on stock les données renvoyées
                    resultValue = data;

                    // si retour négatif on récupère le message
                    if (!data.statuts) messageError = data.message;
                },
                error: function error(xhr, ajaxOptions, thrownError) {
                    // DEBUG
                    console.log(xhr.status);
                    console.log(thrownError);
                    resultValue = false;
                }
            });

            // DEBUG
            // si on a un message d'erreur alors on l'affiche dans la console
            if (messageError !== null) console.error('Server.js - ajaxRequest()', messageError);

            // on retourne le message
            return resultValue;
        }
    }, {
        key: 'errorConnectServer',
        value: function errorConnectServer() {

            // si erreur on informe l'utilisateur
            alert('Erreur de connexion au serveur');
            location.reload();
        }
    }]);

    return Server;
}();
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// class Tictactoe

// regroupe :
// - les intéractions avec le serveur
// - les intéractions avec le plateau


var TicTacToe = function () {
    function TicTacToe(settings) {
        _classCallCheck(this, TicTacToe);

        var t = this;

        // configation du jeu
        t.gameSize = Number(settings.nbrSquare);
        t.playerCircleName = settings.playerCircleName;
        t.playerCrossName = settings.playerCrossName;
        t.computer = settings.computerLevel ? 1 : 0;
        t.computerLevel = settings.computerLevel;

        // éléments du dom
        t.$gameC = document.getElementsByClassName('game-c')[0];
        t.$score = document.getElementById('score');
        t.$game = document.getElementById('game');
        t.$end = document.getElementById('popUp');
        t.$header = document.getElementsByTagName('header')[0];
        t.$body = document.getElementsByTagName('body')[0];
        t.$accueil = document.getElementById('accueil');
        t.$end = document.getElementById('end');
        t.$newGameSecond = document.getElementById('newGameSecond');
        t.$main = document.getElementsByTagName('main')[0];

        // créer notre wall of fame
        t.wallOfFame = new WallOfFame();

        // flag pour animation des fleurs
        t.isPlaying = false;

        t.bindEvents();
        t.registerGameOptions();
    }

    _createClass(TicTacToe, [{
        key: 'bindEvents',
        value: function bindEvents() {
            var t = this;

            // on ecoute les click sur les boutons
            t.$end.querySelectorAll('#endGame')[0].addEventListener('click', t.endGame.bind(t));
            t.$end.querySelectorAll('#newGame')[0].addEventListener('click', t.newGame.bind(t));
            t.$newGameSecond.addEventListener('click', TicTacToe.restart);
        }
    }, {
        key: 'registerGameOptions',
        value: function registerGameOptions() {
            var t = this;

            // on envoie les infos transmises par l'utilisateur au serveur
            var infos = {
                action: 'registerGame',
                data: {
                    playerCircleName: t.playerCircleName,
                    playerCrossName: t.playerCrossName,
                    computer: t.computer,
                    computerLevel: t.computerLevel,
                    gameSize: t.gameSize
                }
            };

            var registerGame = Server.ajaxRequest(infos);

            // si informations bien enregistrées
            if (registerGame.statuts >= 1) {

                // on stock l'id de la partie
                window.gameID = registerGame.id;

                // on lance le jeur
                t.start();
            }

            // si erreur on l'affiche
            else Server.errorConnectServer();
        }
    }, {
        key: 'start',
        value: function start() {
            var t = this;

            // les styles
            t.createGame();

            // regarde le click sur les fleurs
            t.watchClick();

            // ajoute les scores
            t.updateScore();
        }
    }, {
        key: 'createGame',
        value: function createGame() {
            var t = this;

            // on créer notre plateau THREE
            t.board = new Board(t.gameSize);

            // on ajoute les class opur afficher ou pas des éléments
            t.$game.classList.add('active');
            t.$accueil.classList.remove('active');
            t.$main.classList.add('game-on');
            t.$header.classList.add('game-on');
        }
    }, {
        key: 'updateScore',
        value: function updateScore() {
            var t = this;

            // appelle le serveur
            var infos = { action: 'getScores'

                // stocke sa réponse
            };var getScores = Server.ajaxRequest(infos);

            // affiche les scores dans
            t.$score.querySelectorAll('#playerCircleScore')[0].innerHTML = getScores.scores[0].name + ' : ' + getScores.scores[0].wins;
            t.$score.querySelectorAll('#playerCrossScore')[0].innerHTML = getScores.scores[1].name + ' : ' + getScores.scores[1].wins;
        }
    }, {
        key: 'watchClick',
        value: function watchClick() {
            var t = this;

            // récupère nos dodecahedron
            var shapesToWatch = t.board.getShapes();

            // récupère la librairie pour les manipuler
            t.domEvents = t.board.getDomListerner();

            var _loop = function _loop(i) {

                // pour chaque forme à son click
                t.domEvents.addEventListener(shapesToWatch[i], 'click', function () {

                    // si animation ouverture de la fleur en cours on ne joue pas
                    if (t.isPlaying) return null;

                    // si non :
                    // on block le prochain click en disant qu'on animation est en cours
                    t.isPlaying = true;

                    // on récupère sa position
                    var infos = {
                        action: 'playing',
                        data: { position: i }

                        // on les envoit au serveur
                    };var playing = Server.ajaxRequest(infos);

                    // si deja coché on ne fait rien
                    if (!playing.statuts) return null;

                    // si non :
                    // on lance l'animation
                    // affichage de la fleur
                    // effacemeent de son container
                    t.board.animateSelect(i);
                    t.board.showFlower(i, playing.player);

                    // une fois l'animation finie
                    setTimeout(function () {

                        // vérifie si la partie est gagnée ou finie
                        if (playing.message === 'win') t.winner(playing.name);else if (playing.message === 'equality') t.equals();

                        // si non mais que la partie se jour contre un ordinateur
                        // on le fait jouer
                        else if (playing.ia && playing.message === 'pending') t.iaPlaying();

                        // fin de l'animation
                        t.isPlaying = false;
                    }, 1000);
                });
            };

            for (var i = 0; i < shapesToWatch.length; i++) {
                _loop(i);
            }
        }
    }, {
        key: 'iaPlaying',
        value: function iaPlaying() {
            var t = this;

            // on envoi les infos au serveur
            var infos = { action: 'ia'

                // on stocke le resultat
            };var result = Server.ajaxRequest(infos);

            // on lance l'animation de son déplacement
            t.board.animateSelect(result.move);
            t.board.showFlower(result.move, result.player);

            // on vérifie le score
            // si gagner ou partie finie on affiche la popup une fois l'animation finie
            if (result.message === 'win') setTimeout(t.winner(result.name), 1000);else if (result.message === 'equality') setTimeout(t.equals(), 1000);
        }
    }, {
        key: 'removeClick',
        value: function removeClick() {
            var t = this;

            // on récupère les fleurs
            var shapesToWatch = t.board.getShapes();

            // récupère la librairie pour les manipuler
            t.domEvents = t.board.getDomListerner();

            // on enlève leur click
            for (var i = 0; i < shapesToWatch.length; i++) {
                t.domEvents.removeEventListener(shapesToWatch[i], 'click');
            }
        }
    }, {
        key: 'showPopUp',
        value: function showPopUp() {
            var t = this;

            // affichage
            t.$end.classList.add('active');
            t.$body.classList.add('end-open');
        }
    }, {
        key: 'winner',
        value: function winner(player) {
            var t = this;

            // on met à jour les scores
            t.wallOfFame.updateWallOfFame();
            t.$end.querySelectorAll('#winnerName')[0].innerHTML = player;

            // on affiche le resultat
            t.showPopUp();
        }
    }, {
        key: 'equals',
        value: function equals() {
            var t = this;

            // met à jour le texte de la popup
            t.$end.querySelectorAll('#winnerName')[0].innerHTML = '===';

            // on affiche le resultat
            t.showPopUp();
        }
    }, {
        key: 'endGame',
        value: function endGame() {
            var t = this;

            // on met à jour le score
            t.updateScore();

            // on change les class
            t.$body.classList.remove('end-open');
            t.$end.classList.remove('active');
            t.$body.classList.remove('wallOfFame-open');

            // on enlève les clicks
            t.removeClick();
        }
    }, {
        key: 'newGame',
        value: function newGame() {
            var t = this;

            // on met à jour les scores
            t.updateScore();

            // on envoi les infos au serveur
            var infos = { action: 'newGame'

                // on récupère la réponse
            };var newGame = Server.ajaxRequest(infos);

            // si erreur on l'affiche
            if (!newGame.statuts) Server.errorConnectServer();

            // on affiche le jeu
            t.$body.classList.remove('end-open');

            // on reset le plateau
            t.destroyGame();

            // on enleve la popup
            t.$end.classList.remove('active');

            // on lance le jeu
            t.start();
        }
    }, {
        key: 'destroyGame',
        value: function destroyGame() {
            var t = this;

            // on enlève le plateau
            while (t.$gameC.firstChild) {
                t.$gameC.removeChild(t.$gameC.firstChild);
            }
        }
    }], [{
        key: 'restart',
        value: function restart() {

            // retour à la page d'accueil
            location.reload();
        }
    }]);

    return TicTacToe;
}();
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// class WallOfFame

// regroupe :
// - l'affichage
// - les intéractions


var WallOfFame = function () {
    function WallOfFame() {
        _classCallCheck(this, WallOfFame);

        var t = this;

        // elements du DOM
        t.$openWallOfFame = document.getElementById('openWallOfFame');
        t.$closeWallOfFame = document.getElementById('closeWallOfFame');

        t.$body = document.getElementsByTagName('body')[0];

        t.$wallOfFame = document.getElementById('wallOfFame');
        t.$wallOfFameContent = document.getElementById('wallOfFameContent');

        t.bindEvents();
        t.getWallOfFame();
    }

    _createClass(WallOfFame, [{
        key: 'bindEvents',
        value: function bindEvents() {
            var t = this;

            // écoute les interactions

            t.$openWallOfFame.addEventListener('click', t.openWallOfFame.bind(t));

            t.$closeWallOfFame.addEventListener('click', t.closeWallOfFame.bind(t));
        }
    }, {
        key: 'getWallOfFame',
        value: function getWallOfFame() {
            var t = this;

            // envoi l'action au serveur
            var infos = { action: 'getWallOfFame' };

            var result = Server.ajaxRequest(infos);

            // en fonction du résultat on affiche le wall of fame
            // ou on retourne
            if (!result.statuts) Server.errorConnectServer();else if (result.noPlayers) t.wallOfFameEmpty();else t.appendWallOfFame(result.wallOfFameOrdered);
        }
    }, {
        key: 'appendWallOfFame',
        value: function appendWallOfFame(players) {
            var t = this;

            // pour chaque joueur on créer un element dans le DOM
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = players[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var player = _step.value;


                    var li = document.createElement('li');
                    var text = document.createTextNode(player.name + ' - ' + player.wins);

                    li.appendChild(text);

                    t.$wallOfFameContent.appendChild(li);
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
        }
    }, {
        key: 'wallOfFameEmpty',
        value: function wallOfFameEmpty() {
            var t = this;

            // si vide on affiche le message
            var li = document.createElement('li');
            var text = document.createTextNode('aucun joueurs eneregistrés');

            li.appendChild(text);
            t.$wallOfFameContent.appendChild(li);
        }
    }, {
        key: 'updateWallOfFame',
        value: function updateWallOfFame() {
            var t = this;

            // on efface les players
            while (t.$wallOfFameContent.firstChild) {
                t.$wallOfFameContent.removeChild(t.$wallOfFameContent.firstChild);
            } // on récupère le wall of fame
            t.getWallOfFame();
        }
    }, {
        key: 'openWallOfFame',
        value: function openWallOfFame() {
            var t = this;

            t.$wallOfFame.style.display = 'block';
            t.$body.classList.add('wallOfFame-open');
        }
    }, {
        key: 'closeWallOfFame',
        value: function closeWallOfFame() {
            var t = this;

            t.$wallOfFame.style.display = 'none';
            t.$body.classList.remove('wallOfFame-open');
        }
    }]);

    return WallOfFame;
}();
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// class Website

// - pour les formulaires de création de la partie


var Website = function () {
    function Website() {
        _classCallCheck(this, Website);

        var t = this;

        // elements du DOM
        t.$buttonsPlayers = document.getElementsByClassName('button-player');
        t.$forms = document.getElementsByClassName('form');
        t.$options = document.getElementsByClassName('option');
        t.$inputs = document.getElementsByClassName('input-to-verify');
        t.$buttonsStart = document.getElementsByClassName('button-start');

        t.bindEvent();
    }

    _createClass(Website, [{
        key: 'bindEvent',
        value: function bindEvent() {
            var t = this;

            // choix des joueurs
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = t.$buttonsPlayers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var button = _step.value;


                    button.addEventListener('click', function () {

                        var parent = this.parentNode;

                        Website.removeSelected(parent);

                        this.classList.add('selected');

                        var formId = this.getAttribute('data-form');

                        t.showForm(formId);
                    });
                }

                // les boutons de selection
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

            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = t.$options[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var option = _step2.value;


                    option.addEventListener('click', function () {

                        var parent = this.parentNode;

                        Website.removeSelected(parent);

                        this.classList.add('selected');
                    });
                }

                // les inputs
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

            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = t.$inputs[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var input = _step3.value;


                    input.addEventListener('keydown', function (event) {

                        var content = this.value;

                        var inputValid = Website.verifyInputs(content, this, event.code);

                        if (!inputValid) event.preventDefault();
                    });
                }

                // la validation du formulaire
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

            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = t.$buttonsStart[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var _button = _step4.value;


                    _button.addEventListener('click', function () {

                        var formId = this.getAttribute('data-form');

                        var gameSettings = Website.getGameSettings(formId);

                        new TicTacToe(gameSettings);
                    });
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
        }
    }, {
        key: 'showForm',
        value: function showForm(formId) {
            var t = this;

            // on affiche le formulaire en fonction du mode de jeu

            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = t.$forms[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var form = _step5.value;
                    form.classList.remove('active');
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

            document.getElementById(formId).classList.add('active');
        }
    }], [{
        key: 'removeSelected',
        value: function removeSelected(parent) {

            var selected = parent.querySelector('.selected');

            if (selected) selected.classList.remove('selected');
        }
    }, {
        key: 'verifyInputs',
        value: function verifyInputs(content, $element, keycode) {

            // on block le nombre de caractères à 3
            if (content.length === 3 && keycode !== "Backspace") return false;

            // si vide on enlève la coloration du bouton
            if (content.length === 1) $element.classList.remove('selected');else $element.classList.add('selected');

            return true;
        }
    }, {
        key: 'getGameSettings',
        value: function getGameSettings(formId) {

            // on récupère les éléments en fonction du boutton clické
            var $form = document.getElementById(formId);

            var playerCircleName = $form.querySelector('.player-circle').value;
            var nbrSquare = $form.querySelector('.option.gameSize.selected').getAttribute('data-nbsquare');

            var gameSettings = {
                nbrSquare: nbrSquare,
                playerCircleName: playerCircleName,
                playerCrossName: null,
                computerLevel: null
            };

            if (formId === 'formOnePlayer') {
                gameSettings.computer = true;
                gameSettings.computerLevel = $form.querySelector('.option.computer.selected').getAttribute('data-level');
            } else gameSettings.playerCrossName = $form.querySelector('.player-cross').value;

            // on renvoi les informations
            return gameSettings;
        }
    }]);

    return Website;
}();

new Website();