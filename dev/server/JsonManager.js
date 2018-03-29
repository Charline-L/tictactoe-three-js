import path from 'path'
import fs from 'fs'

import Tools from './Tools.js'

class JsonManager {

    constructor() {
        const t = this

        t.filesName = {
            game :  path.resolve( __dirname ) + '/jsons/game.json',
            players :  path.resolve( __dirname ) + '/jsons/players.json'
        }

        t.fileGame = JsonManager.getFileGame()
        t.filePlayers = JsonManager.getFilePlayers()
    }


    registerGamePlay(id) {
        const t = this

        t.fileGame = JsonManager.getFileGame()

        let indexCurrentGame = null
        let gameSize = null

        for (let index in t.fileGame.games ) {

            if (t.fileGame.games[index].id === id) {

                gameSize = t.fileGame.games[index].gameSize
                indexCurrentGame = index
            }

        }

        for (let index = 0; index < Math.pow( gameSize, 2); index++) {
            t.fileGame.games[indexCurrentGame].game[index] = 0
        }


        return t.updateGameJson()
    }


    registerGame(game) {
        const t = this
        let result = null

        let gameBoard = []

        let id = JsonManager.generateID()

        for (let index = 0; index < Math.pow( game.gameSize, 2); index++) gameBoard[index] = 0

        // 1 - dans le fichier du jeu
        let newGame = {
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
        }

        t.fileGame.games.push(newGame)

        let resultGame = t.updateGameJson()

        // 2 - dans le fichier des joueurs
        let resultPlayerCircle = t.addPlayer(game.playerCircleName, id)
        let resultPlayerCross = t.addPlayer(game.playerCrossName, id)


        if ( resultGame.statuts + resultPlayerCircle.statuts + resultPlayerCross.statuts >= 3 )
            result = { statuts : 1, id: id }
        else
            result = { statuts : 0, message : 'ERROR JsonManager.registerPlayer()' }

        return result
    }

    static generateID() {

        let gameFile = JsonManager.getFileGame()

        let lastInsertedId = -1

        if ( gameFile.games.length !== 0) {
            lastInsertedId = Number( gameFile.games[ gameFile.games.length - 1 ].id )
        }

        return lastInsertedId + 1
    }

    addPlayer(playerName, id) {
        const t = this

        if (!playerName) return { statuts: 1}

        let newPlayer = {
            name: playerName,
            wins: 0,
            id: id
        }

        t.filePlayers.players.push(newPlayer)

        return t.updatePlayersJson()

    }

    whoIsPlaying(id) {
        const t = this

        let player = 0

        for (let games of t.fileGame.games ){

            if (games.id === id) {
                player = games.playerCircle.isPlaying ? 1 : -1
            }

        }

        return player
    }

    sendMove(infos) {
        const t = this

        for (let games of t.fileGame.games ){
            if (games.id === infos.id) {
                games.game[infos.position] = infos.player
            }
        }

        return t.updateGameJson()
    }

    changePlayer(id) {

        const t = this

        t.fileGame = JsonManager.getFileGame()

        for (let game of t.fileGame.games ){

            if ( game.id === id) {
                game.playerCircle.isPlaying = !game.playerCircle.isPlaying
                game.playerCross.isPlaying = !game.playerCross.isPlaying
            }

        }

        t.updateGameJson()
    }

    isSelected(position, id) {
        const t = this

        let isSelected = 0

        t.fileGame = JsonManager.getFileGame()

        for (let games of t.fileGame.games ){
            if (games.id === id && games.game[position] === position) {
                isSelected = Math.abs(games.game[position])
            }
        }

        return isSelected
    }

    winner(player, id) {
        const t = this

        let result = {}
        let playerName = JsonManager.getPlayerName(id)
        t.fileGame = JsonManager.getFileGame()
        t.filePlayers = JsonManager.getFilePlayers()
        t.files = JsonManager.getFileGame()

        // dans la game
        for (let game of t.fileGame.games ){

            if ( game.id === id) {
                if ( player === 1 ) game.playerCircle.wins++
                else game.playerCross.wins++
            }

        }

        t.updateGameJson()

        // dans players
        for (let player of t.filePlayers.players ){

            if ( player.name === playerName && player.id === id) player.wins++

        }

        let resultGame = t.updateGameJson()
        let resultPlayers = t.updatePlayersJson()

        if (resultGame.statuts + resultPlayers.statuts === 2) result = {statuts : 1, name: playerName}
        else result = {statuts : 0, message: 'ERROR JsonManager winner()'}

        return result
    }

    getWallOfFame() {
        const t = this

        let players = t.filePlayers.players
        let wallOfFame = Tools.bubbleSort(players, 10)
        let result = { statuts : 1}


        if (!wallOfFame) result.noPlayers = true
        else result.wallOfFameOrdered = wallOfFame

        return result
    }

    static getFileGame() {

        let file = fs.readFileSync( path.resolve( __dirname ) + '/jsons/game.json' , 'utf-8')
        if ( typeof file !== 'string') return { statuts: 1, message: 'Erreur - UpdateJson.getFileGame()'}
        else return JSON.parse(file)
    }

    static getFilePlayers() {

        let file = fs.readFileSync( path.resolve( __dirname ) + '/jsons/players.json', 'utf-8')
        if ( typeof file !== 'string') return { statuts: 1, message: 'Erreur - UpdateJson.getFilePlayers()'}
        else return JSON.parse(file)
    }

    static getPlayerName(id) {

        let file = JsonManager.getFileGame()
        let payerName = null

        for (let game of file.games ){

            if ( game.id === id) {
                payerName = game.playerCircle.isPlaying ? game.playerCircle.name : game.playerCross.name
            }

        }

        return payerName
    }

    static getGamePlay() {

        let file = JsonManager.getFileGame()
        return file.game
    }

    static getCurrentGame(id) {

        let fileGame = JsonManager.getFileGame()
        let currentGame = {}

        for (let game of fileGame.games) {
            if ( game.id === id ) currentGame = game
        }

        return currentGame
    }

    static getScores(id) {

        let currentGame = JsonManager.getCurrentGame(id)
        let ia = currentGame.computer.on

        let results = {
            statuts: 1,
            scores: [
                {
                    name: currentGame.playerCircle.name,
                    wins: currentGame.playerCircle.wins
                },
                {
                    name: !ia ? currentGame.playerCross.name : 'ia',
                    wins: currentGame.playerCross.wins
                }
            ]
        }

        return results
    }

    updateGameJson() {
        const t = this

        let result = null

        try {
            fs.writeFileSync( t.filesName.game, JSON.stringify(t.fileGame))
            t.fileGame = JsonManager.getFileGame()

            result = { statuts: 1 }
        }
        catch(err) {
            result = {
                statuts: 0,
                message: err
            }
        }

        return result
    }

    updatePlayersJson() {
        const t = this

        let result = null

        try {
            fs.writeFileSync( t.filesName.players, JSON.stringify(t.filePlayers))
            t.filePlayers = JsonManager.getFilePlayers()

            result = {statuts : 1}
        }
        catch(err) {
            result = {
                statuts: 0,
                message: err
            }
        }

        return result
    }
}


module.exports = JsonManager