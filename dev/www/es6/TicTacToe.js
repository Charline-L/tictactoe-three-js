// class Tictactoe

// regroupe :
// - les intéractions avec le serveur
// - les intéractions avec le plateau


class TicTacToe {

    constructor(settings) {
        const t = this

        // configation du jeu
        t.gameSize = Number(settings.nbrSquare)
        t.playerCircleName = settings.playerCircleName
        t.playerCrossName = settings.playerCrossName
        t.computer = settings.computerLevel ? 1 : 0
        t.computerLevel = settings.computerLevel

        // éléments du dom
        t.$gameC = document.getElementsByClassName('game-c')[0]
        t.$score = document.getElementById('score')
        t.$game = document.getElementById('game')
        t.$end = document.getElementById('popUp')
        t.$header = document.getElementsByTagName('header')[0]
        t.$body = document.getElementsByTagName('body')[0]
        t.$accueil = document.getElementById('accueil')
        t.$end = document.getElementById('end')
        t.$newGameSecond = document.getElementById('newGameSecond')
        t.$main = document.getElementsByTagName('main')[0]

        // créer notre wall of fame
        t.wallOfFame = new WallOfFame()

        // flag pour animation des fleurs
        t.isPlaying = false

        t.bindEvents()
        t.registerGameOptions()
    }

    bindEvents(){
        const t = this

        // on ecoute les click sur les boutons
        t.$end.querySelectorAll('#endGame')[0].addEventListener('click', t.endGame.bind(t))
        t.$end.querySelectorAll('#newGame')[0].addEventListener('click', t.newGame.bind(t))
        t.$newGameSecond.addEventListener('click', TicTacToe.restart )
    }

    registerGameOptions() {
        const t = this


        // on envoie les infos transmises par l'utilisateur au serveur
        let infos = {
            action : 'registerGame',
            data :
                {
                    playerCircleName : t.playerCircleName,
                    playerCrossName : t.playerCrossName,
                    computer: t.computer,
                    computerLevel: t.computerLevel,
                    gameSize: t.gameSize
                }
        }

        let registerGame = Server.ajaxRequest(infos)

        // si informations bien enregistrées
        if ( registerGame.statuts >= 1 ) {

            // on stock l'id de la partie
            window.gameID = registerGame.id

            // on lance le jeur
            t.start()
        }

        // si erreur on l'affiche
        else Server.errorConnectServer()
    }


    start() {
        const t = this

        // les styles
        t.createGame()

        // regarde le click sur les fleurs
        t.watchClick()

        // ajoute les scores
        t.updateScore()

    }

    createGame() {
        const t = this

        // on créer notre plateau THREE
        t.board = new Board(t.gameSize)


        // on ajoute les class opur afficher ou pas des éléments
        t.$game.classList.add('active')
        t.$accueil.classList.remove('active')
        t.$main.classList.add('game-on')
        t.$header.classList.add('game-on')
    }


    updateScore() {
        const t = this

        // appelle le serveur
        let infos = { action : 'getScores' }

        // stocke sa réponse
        let getScores = Server.ajaxRequest(infos)

        // affiche les scores dans
        t.$score.querySelectorAll('#playerCircleScore')[0].innerHTML = getScores.scores[0].name + ' : ' + getScores.scores[0].wins
        t.$score.querySelectorAll('#playerCrossScore')[0].innerHTML = getScores.scores[1].name + ' : ' + getScores.scores[1].wins
    }

    watchClick() {
        const t = this

        // récupère nos dodecahedron
        let shapesToWatch = t.board.getShapes()

        // récupère la librairie pour les manipuler
        t.domEvents = t.board.getDomListerner()

        for (let i = 0; i < shapesToWatch.length; i++) {


            // pour chaque forme à son click
            t.domEvents.addEventListener( shapesToWatch[i], 'click', function(){

                // si animation ouverture de la fleur en cours on ne joue pas
                if (t.isPlaying) return null

                // si non :
                // on block le prochain click en disant qu'on animation est en cours
                t.isPlaying = true

                // on récupère sa position
                let infos = {
                    action : 'playing',
                    data : { position : i }
                }

                // on les envoit au serveur
                let playing = Server.ajaxRequest(infos)

                // si deja coché on ne fait rien
                if ( !playing.statuts ) return null


                // si non :
                // on lance l'animation
                // affichage de la fleur
                // effacemeent de son container
                t.board.animateSelect(i)
                t.board.showFlower(i, playing.player)


                // une fois l'animation finie
                setTimeout(function(){

                    // vérifie si la partie est gagnée ou finie
                    if ( playing.message === 'win') t.winner(playing.name)

                    else if ( playing.message === 'equality' ) t.equals()

                    // si non mais que la partie se jour contre un ordinateur
                    // on le fait jouer
                    else if ( playing.ia && playing.message === 'pending') t.iaPlaying()

                    // fin de l'animation
                    t.isPlaying = false

                }, 1000)
            })
        }
    }

    iaPlaying() {
        const t = this

        // on envoi les infos au serveur
        let infos = { action: 'ia'}

        // on stocke le resultat
        let result = Server.ajaxRequest(infos)

        // on lance l'animation de son déplacement
        t.board.animateSelect(result.move)
        t.board.showFlower(result.move, result.player)

        // on vérifie le score
        // si gagner ou partie finie on affiche la popup une fois l'animation finie
        if ( result.message === 'win') setTimeout( t.winner(result.name), 1000)
        else if ( result.message === 'equality' ) setTimeout( t.equals(), 1000)

    }

    removeClick() {
        const t = this

        // on récupère les fleurs
        let shapesToWatch = t.board.getShapes()

        // récupère la librairie pour les manipuler
        t.domEvents = t.board.getDomListerner()

        // on enlève leur click
        for (let i = 0; i < shapesToWatch.length; i++) t.domEvents.removeEventListener( shapesToWatch[i], 'click' )
    }


    showPopUp() {
        const t = this

        // affichage
        t.$end.classList.add('active')
        t.$body.classList.add('end-open')

    }

    winner(player) {
        const t = this

        // on met à jour les scores
        t.wallOfFame.updateWallOfFame()
        t.$end.querySelectorAll('#winnerName')[0].innerHTML = player

        // on affiche le resultat
        t.showPopUp()
    }

    equals() {
        const t = this

        // met à jour le texte de la popup
        t.$end.querySelectorAll('#winnerName')[0].innerHTML = '==='

        // on affiche le resultat
        t.showPopUp()
    }

    endGame() {
        const t = this

        // on met à jour le score
        t.updateScore()

        // on change les class
        t.$body.classList.remove('end-open')
        t.$end.classList.remove('active')
        t.$body.classList.remove('wallOfFame-open')

        // on enlève les clicks
        t.removeClick()
    }

    newGame() {
        const t = this

        // on met à jour les scores
        t.updateScore()

        // on envoi les infos au serveur
        let infos = { action: 'newGame' }

        // on récupère la réponse
        let newGame = Server.ajaxRequest(infos)

        // si erreur on l'affiche
        if (!newGame.statuts) Server.errorConnectServer()

        // on affiche le jeu
        t.$body.classList.remove('end-open')

        // on reset le plateau
        t.destroyGame()

        // on enleve la popup
        t.$end.classList.remove('active')

        // on lance le jeu
        t.start()
    }

    static restart() {

        // retour à la page d'accueil
        location.reload()

    }

    destroyGame() {
        const t = this

        // on enlève le plateau
        while(t.$gameC.firstChild) t.$gameC.removeChild(t.$gameC.firstChild)
    }
}
