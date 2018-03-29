import JsonManager from './JsonManager.js'
import Ia from "./Ia"

class Game {
    constructor() {
        const t = this

        t.filesGame = JsonManager.getFileGame()
    }

    iaPlaying(id) {
        const t = this

        let move = null

        let fileGame = JsonManager.getFileGame()
        let iaLevel = []

        for (let game of fileGame.games) {
            if (game.id === id) iaLevel = game.computer.level
        }


        if ( iaLevel === 'dumb' ) move = Ia.randomMove(id, fileGame)

        else {

            let canIaWin = false
            let canPlayerWin = false


            let fileGame = JsonManager.getFileGame()
            let currentGame = []
            let gameSize = null

            for (let game of fileGame.games) {
                if (game.id === id) {
                    currentGame = game.game
                    gameSize = game.gameSize
                }
            }

            let possibilites = Ia.getPossibilities(currentGame)

            // VERIFIE SI ELLE OU LE JOUEUR PEUT GAGNER
            for (let position of possibilites ) {

                let boardIA = currentGame
                boardIA[position] = -1

                let optionsIa = {
                    position: position,
                    direction: null,
                    player: -1,
                    board: boardIA
                }

                t.checkWin(optionsIa, function(hasWin){

                    if (hasWin) canIaWin = position

                })

            }
            for (let position of possibilites ) {

                let fileGame = JsonManager.getFileGame()
                let currentGame = []
                let gameSize = null

                for (let game of fileGame.games) {
                    if (game.id === id) {
                        currentGame = game.game
                        gameSize = game.gameSize
                    }
                }

                let boardPlayer = currentGame
                boardPlayer[position] = 1

                let optionsPlayer = {
                    position: position,
                    direction: null,
                    player: 1,
                    board: boardPlayer,
                    gameSize: gameSize
                }

                t.checkWin(optionsPlayer, function(hasWin){

                    if (hasWin) canPlayerWin = position

                })

            }

            if ( canIaWin ) move = canIaWin
            else if ( canPlayerWin ) move = canPlayerWin
            else move = Ia.randomMove(id, JsonManager.getFileGame())

        }

        return move
    }

    checkMove(move) {
        const t = this

        let result = { statuts: 1, message: 'pending' }
        let player = move.player

        let fileGame = JsonManager.getFileGame()
        let currentGame = []
        let gameSize = 0


        for (let game of fileGame.games ){

            if ( game.id === move.id) {
                currentGame = game.game
                gameSize = game.gameSize
            }

        }

        result.player = player

        if ( !t.needToCheck(player, move.id) ) return result


        let options = {
            position: move.position,
            direction: null,
            player: move.player,
            board: currentGame,
            gameSize: gameSize
        }

        t.checkWin(options, function(hasWin){

            if ( hasWin ) result.message = 'win'
            else if ( !hasWin && t.equality(move.id) ) result.message = 'equality'

        })

        return result

    }

    needToCheck(player, id) {
        const t = this

        let gameSize = 0
        let gamePlay = []
        let numberMovesDone = 0

        t.fileGame = JsonManager.getFileGame()

        for (let game of t.fileGame.games ){

            if ( game.id === id) {
                gameSize = game.gameSize
                gamePlay = game.game
            }

        }

        for (let positions in gamePlay ) {
            if ( gamePlay[positions] === player) numberMovesDone++
        }

        return numberMovesDone >= gameSize
    }


    checkWin(optionsReceived, callback) {
        const t = this

        let verifyOptions = Object.assign({}, optionsReceived)

        let posCol = optionsReceived.position % optionsReceived.gameSize
        let posRow = (optionsReceived.position - posCol) / optionsReceived.gameSize

        verifyOptions.posCol = posCol
        verifyOptions.posRow = posRow

        let hasWin = t.verify(verifyOptions)

        callback(hasWin)
    }

    verify(options) {
        const t = this

        t.lines = {
            vertical: 1,
            horizontal: 1,
            rightDiag: 1,
            leftDiag: 1
        }

        t.checkLines(options)

        for (let line in t.lines) {

            let count = t.lines[line]
            if (count === options.gameSize ) return true

        }

        return false
    }

    checkLines(options) {
        const t = this

        let gameMap = options.board

        let currentPlayer = options.player

        // RESET LES DIRECTIONS
        let around = {
            north : undefined,
            ne : undefined,
            est : undefined,
            se : undefined,
            south : undefined,
            sw : undefined,
            west : undefined,
            nw : undefined
        };

        // CALCULE LES DIRECTIONS POSSIBLES

        // SUD
        if ( options.posRow < (options.gameSize - 1) ) around.south = [ options.posCol, (options.posRow + 1) ]

        // NORD
        if ( options.posRow > 0 ) around.north = [ options.posCol, (options.posRow - 1) ]

        // EST
        if ( options.posCol < (options.gameSize - 1) ) around.est = [ (options.posCol + 1), options.posRow ]

        // OUEST
        if ( options.posCol > 0 ) around.west = [ (options.posCol - 1), options.posRow ]

        // SUD EST
        if ( options.posCol < (options.gameSize - 1) && options.posRow < (options.gameSize - 1) ) around.se = [ (options.posCol + 1), (options.posRow + 1) ]

        // SUD OUEST
        if ( options.posCol > 0 && options.posRow < (options.gameSize - 1) ) around.sw = [ (options.posCol - 1), (options.posRow + 1) ]

        // NORD EST
        if ( options.posCol < (options.gameSize - 1) && options.posRow > 0 ) around.ne = [ (options.posCol + 1), (options.posRow - 1) ]

        // NORD OUEST
        if ( options.posCol > 0 && options.posRow > 0 ) around.nw = [ (options.posCol - 1), (options.posRow - 1) ]


        // SI PAS DE DIRECTION DONNEES ON PARCOURS TOUTES LES DIRECTONS
        if (options.direction === null ) {

            for (let index in around ){

                let position = around[index]

                if (position !== undefined) {
                    let indexOneD = position[0] + ( position[1] * options.gameSize)

                    if ( gameMap[indexOneD] === currentPlayer ) {

                        t.updateLine(index)

                        let optionsUpdate = options

                        optionsUpdate.posCol = around[index][0]
                        optionsUpdate.posRow = around[index][1]
                        optionsUpdate.direction = index

                        t.checkLines(optionsUpdate)
                    }
                }
            }
        }

        // SI DIRECTION DONNEE ON LA POINTE
        else {

            let position = around[options.direction]

            if (position !== undefined) {
                let indexOneD = position[0] + ( position[1] * options.gameSize)

                if ( gameMap[indexOneD] === currentPlayer ) {

                    t.updateLine(options.direction)

                    let optionsUpdate = options

                    optionsUpdate.posCol = around[options.direction][0]
                    optionsUpdate.posRow = around[options.direction][1]
                    optionsUpdate.direction = options.direction


                    t.checkLines(optionsUpdate)
                }
            }
        }
    }

    updateLine(direction) {
        const t = this

        switch (true) {

            case (direction === 'north' || direction === 'south') :
                t.lines.vertical++
                break;

            case ( direction === 'est' || direction === 'west') :
                t.lines.horizontal++
                break;

            case ( direction === 'ne' || direction === 'sw') :
                t.lines.rightDiag++
                break;

            case ( direction === 'nw' || direction === 'se') :
                t.lines.leftDiag++
                break;

            default:
                break;
        }
    }

    static getPlayer(id) {

        let fileGame = JsonManager.getFileGame()
        let currentPlayer = 0

        for (let game of fileGame.games ){

            if ( game.id === id) {
                currentPlayer = game.playerCircle.isPlaying ? 1 : -1
            }

        }

        return currentPlayer
    }

    equality(id) {
        const t = this

        t.fileGame = JsonManager.getFileGame()
        let gamePlay = []

        for (let game of t.fileGame.games ){

            if ( game.id === id) {
                gamePlay = game.game
            }

        }

        return gamePlay.indexOf(0) === -1
    }

    static doesHaveIa (id)  {

        let fileGame = JsonManager.getFileGame()
        let hasIa = false

        for (let game of fileGame.games ) {

            if (game.id === id && game.computer.on ) hasIa = true

        }

        return hasIa
    }
}


module.exports = Game