class TicTacToe {

    constructor(settings) {

        const t = this

        t.gameSize = Number(settings.nbrSquare)
        t.playerCircleName = settings.playerCircleName
        t.playerCrossName = settings.playerCrossName
        t.computer = settings.computerLevel ? 1 : 0
        t.computerLevel = settings.computerLevel

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

        t.wallOfFame = new WallOfFame()

        t.isPlaying = false

        t.bindEvents()
        t.registerGameOptions()
    }

    bindEvents(){

        const t = this

        t.$end.querySelectorAll('#endGame')[0].addEventListener('click', t.endGame.bind(t))
        t.$end.querySelectorAll('#newGame')[0].addEventListener('click', t.newGame.bind(t))
        t.$newGameSecond.addEventListener('click', TicTacToe.restart )
    }

    registerGameOptions() {
        const t = this

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

        if ( registerGame.statuts >= 1 ) {
            window.gameID = registerGame.id
            t.start()
        }
        else Server.errorConnectServer()
    }


    start() {
        const t = this

        // append des cases
        t.createGame()

        // init le click sur les div
        t.watchClick()

        // ajouter les scores
        t.updateScore()

    }

    createGame() {
        const t = this

        t.board = new Board(t.gameSize)

        t.$game.classList.add('active')
        t.$accueil.classList.remove('active')
        t.$main.classList.add('game-on')
        t.$header.classList.add('game-on')
    }


    updateScore() {
        const t = this

        let infos = {
            action : 'getScores'
        }

        let getScores = Server.ajaxRequest(infos)

        t.$score.querySelectorAll('#playerCircleScore')[0].innerHTML = getScores.scores[0].name + ' : ' + getScores.scores[0].wins
        t.$score.querySelectorAll('#playerCrossScore')[0].innerHTML = getScores.scores[1].name + ' : ' + getScores.scores[1].wins
    }

    watchClick() {
        const t = this

        let shapesToWatch = t.board.getShapes()

        t.domEvents = t.board.getDomListerner()

        for (let i = 0; i < shapesToWatch.length; i++) {
            t.domEvents.addEventListener( shapesToWatch[i], 'click', function(){

                let infos = {
                    action : 'playing',
                    data : { position : i }
                }

                // si animation en cours on ne joue pas
                if (t.isPlaying) return null

                t.isPlaying = true

                let playing = Server.ajaxRequest(infos)

                // si deja coché on ne fait rien
                if ( !playing.statuts ) return null

                t.board.animateSelect(i)
                t.board.showFlower(i, playing.player)

                setTimeout(function(){

                    if ( playing.message === 'win') t.winner(playing.name)

                    else if ( playing.message === 'equality' ) t.equals()

                    else if ( playing.ia && playing.message === 'pending') t.iaPlaying()

                    t.isPlaying = false

                }, 1000)
            })
        }
    }

    iaPlaying() {
        const t = this

        let infos = { action: 'ia'}

        let result = Server.ajaxRequest(infos)


        t.board.animateSelect(result.move)
        t.board.showFlower(result.move, result.player)

        if ( result.message === 'win') {

            setTimeout( t.winner(result.name), 1000)
        }

        else if ( result.message === 'equality' ) {

            setTimeout( t.equals(), 1000)

        }
    }

    removeClick() {
        const t = this

        let shapesToWatch = t.board.getShapes()

        t.domEvents = t.board.getDomListerner()

        for (let i = 0; i < shapesToWatch.length; i++) {
            t.domEvents.removeEventListener( shapesToWatch[i], 'click' )
        }
    }


    showPopUp() {
        const t = this

        t.$end.classList.add('active')
        t.$body.classList.add('end-open')

    }

    winner(player) {
        const t = this

        t.wallOfFame.updateWallOfFame()
        t.$end.querySelectorAll('#winnerName')[0].innerHTML = player

        t.showPopUp()
    }

    equals() {
        const t = this

        t.$end.querySelectorAll('#winnerName')[0].innerHTML = '==='

        t.showPopUp()
    }

    endGame() {
        const t = this

        t.updateScore()

        t.$body.classList.remove('end-open')
        t.$end.classList.remove('active')
        t.$body.classList.remove('wallOfFame-open')

        t.removeClick()
    }

    newGame() {
        const t = this

        t.updateScore()

        let infos = { action: 'newGame' }

        let newGame = Server.ajaxRequest(infos)

        if (!newGame.statuts) return alert(newGame.message)

        t.$body.classList.remove('end-open')

        t.destroyGame()

        t.$end.classList.remove('active')

        t.start()
    }

    static restart() {

        location.reload()

    }

    destroyGame() {
        const t = this

        while(t.$gameC.firstChild) t.$gameC.removeChild(t.$gameC.firstChild)
    }
}
