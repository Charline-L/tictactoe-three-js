// class Website

// - pour les formulaires de création de la partie


class Website {

    constructor() {
        const t = this

        // elements du DOM
        t.$buttonsPlayers = document.getElementsByClassName('button-player')
        t.$forms = document.getElementsByClassName('form')
        t.$options = document.getElementsByClassName('option')
        t.$inputs = document.getElementsByClassName('input-to-verify')
        t.$buttonsStart = document.getElementsByClassName('button-start')

        t.bindEvent()
    }

    bindEvent() {
        const t = this

        // choix des joueurs
        for (let button of t.$buttonsPlayers) {

            button.addEventListener('click', function(){

                let parent = this.parentNode

                Website.removeSelected(parent)

                this.classList.add('selected')

                let formId = this.getAttribute('data-form')

                t.showForm(formId)

            })

        }

        // les boutons de selection
        for (let option of t.$options ) {

            option.addEventListener('click', function(){

                let parent = this.parentNode

                Website.removeSelected(parent)

                this.classList.add('selected')

            })

        }


        // les inputs
        for (let input of t.$inputs ) {

            input.addEventListener('keydown', function(event){

                let content = this.value

                let inputValid = Website.verifyInputs(content, this, event.code)

                if (!inputValid) event.preventDefault()

            })

        }

        // la validation du formulaire
        for (let button of t.$buttonsStart ) {

            button.addEventListener('click', function(){

                let formId = this.getAttribute('data-form')

                let gameSettings = Website.getGameSettings(formId)

                new TicTacToe(gameSettings)

            })

        }

    }

    static removeSelected(parent) {

        let selected = parent.querySelector('.selected')

        if (selected) selected.classList.remove('selected')

    }

    static verifyInputs(content, $element, keycode) {

        // on block le nombre de caractères à 3
        if ( content.length === 3 && keycode !== "Backspace") return false

        // si vide on enlève la coloration du bouton
        if (content.length === 1 ) $element.classList.remove('selected')
        else $element.classList.add('selected')

        return true
    }

    static getGameSettings(formId) {

        // on récupère les éléments en fonction du boutton clické
        let $form = document.getElementById(formId)

        let playerCircleName = $form.querySelector('.player-circle').value
        let nbrSquare = $form.querySelector('.option.gameSize.selected').getAttribute('data-nbsquare')

        let gameSettings = {
            nbrSquare: nbrSquare,
            playerCircleName: playerCircleName,
            playerCrossName: null,
            computerLevel: null
        }

        if ( formId === 'formOnePlayer' ) {
            gameSettings.computer = true
            gameSettings.computerLevel = $form.querySelector('.option.computer.selected').getAttribute('data-level')
        }

        else gameSettings.playerCrossName = $form.querySelector('.player-cross').value

        // on renvoi les informations
        return gameSettings
    }


    showForm(formId) {
        const t = this

        // on affiche le formulaire en fonction du mode de jeu

        for (let form of t.$forms) form.classList.remove('active')

        document.getElementById(formId).classList.add('active')

    }
}

new Website()
