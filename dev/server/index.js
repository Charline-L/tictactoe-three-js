// packets
import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'

// class
import JsonManager from './JsonManager.js'
import Game from './Game.js'


// constantes
const port = 3000
const app = express()
const jsonManager = new JsonManager()
const game = new Game()



app.use(cors())
app.use(bodyParser.json())
app.use(express.static('./'))

// lance le serveur
app.listen(port, function () {
    console.log('||-> server listening on port ' + port)
})


// affiche le jeux
app.get('/', function (req, res) {
    res.sendFile('index.html', { root: 'www'})
})

// enregistre les paramètres du jeu
app.post('/registerGame', function (req, res) {

    let gameSettings = req.body

    let registerGame = jsonManager.registerGame(gameSettings)

    res.send(registerGame)

})



// recupère les scores
app.post('/getScores', function (req, res) {

    let id = req.body.id

    let result = JsonManager.getScores(id)

    res.send(result)

})

let count = 0

// on vérifie les coups
app.post('/playing', function (req, res) {

    let result = { statuts: 0 }
    let position = req.body.position
    let id = req.body.id

    // vérifie si peut faire ce coup
    let isSelected = jsonManager.isSelected(position, id)

    if (!isSelected) {

        let whoIsPlaying = jsonManager.whoIsPlaying(id)

        let move = {
            player: whoIsPlaying,
            position: position,
            id: id
        }

        let resultJson = jsonManager.sendMove(move)
        let resultCheckMove = game.checkMove(move)


        // si erreur enregistrement du json on retourne l'erreur
        if ( !resultJson.statuts ) result = resultJson

        else {

            result = resultCheckMove

            // en fonction du statut de la partie on modifie le json
            if ( result.message === 'pending' ) jsonManager.changePlayer(id)

            else if ( result.message === 'win' ) {

                let hasWinner = jsonManager.winner(whoIsPlaying, id)

                if(!hasWinner.statuts ) result = hasWinner
                else result.name = hasWinner.name

            }

            // vérifie si besoin IA
            if ( Game.doesHaveIa(id) ) result.ia = true

        }
    }

    else result.message = 'Déja sélectionné'

    res.send(result)
})


// au tour de l'ia
app.post('/ia', function (req, res) {

    let result = {}
    let id = req.body.id

    let move = {
        player: -1,
        position: game.iaPlaying(id),
        id: id
    }

    let resultJson = jsonManager.sendMove(move)
    let resultCheckMove = game.checkMove(move)

    // si erreur enregistrement du json on retourne l'erreur
    if ( !resultJson.statuts ) result = resultJson

    else {

        result = resultCheckMove

        // en fonction du statut de la partie on modifie le json
        if ( result.message === 'pending' ) jsonManager.changePlayer(id)

        else if ( result.message === 'win' ) {

            let hasWinner = jsonManager.winner(-1)

            if( !hasWinner.statuts ) result = hasWinner
            else result.name = 'ia'

        }

        result.move = move.position
    }

    res.send(result)

})



// nouvelle partie
app.post('/newGame', function (req, res) {

    let id = req.body.id

    let result = jsonManager.registerGamePlay(id)

    res.send(result)

})




// recupérer les meilleurs scores
app.post('/getWallOfFame', function (req, res) {

    let result = jsonManager.getWallOfFame()

    res.send(result)

})



