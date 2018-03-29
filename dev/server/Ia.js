import JsonManager from './JsonManager.js'

class Ia {

    constructor(infos) {
        const t = this

        t.iasLevel = infos.level
        t.gameSize = infos.gameSize

        t.possibilites = []
    }

    static randomMove(id, fileGame) {

        let currentGame = []

        for (let game of fileGame.games) {
            if (game.id === id) currentGame = game.game
        }

        let possibilities = Ia.getPossibilities(currentGame)

        let max = possibilities.length - 1

        let move = Math.floor(Math.random() * max )

        return possibilities[move]
    }

    static getPossibilities(board = null) {
        let possibilities = []

        let gamePlay = board ? board : JsonManager.getGamePlay()

        for (let index in gamePlay ) {
            if (gamePlay[index] === 0 ) possibilities.push(index)
        }

        return possibilities
    }
}


module.exports = Ia