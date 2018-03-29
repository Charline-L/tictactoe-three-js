// class WallOfFame

// regroupe :
// - l'affichage
// - les intéractions


class WallOfFame {

    constructor() {
        const t = this

        // elements du DOM
        t.$openWallOfFame = document.getElementById('openWallOfFame')
        t.$closeWallOfFame = document.getElementById('closeWallOfFame')

        t.$body = document.getElementsByTagName('body')[0]

        t.$wallOfFame = document.getElementById('wallOfFame')
        t.$wallOfFameContent = document.getElementById('wallOfFameContent')

        t.bindEvents()
        t.getWallOfFame()
    }

    bindEvents() {
        const t = this

        // écoute les interactions

        t.$openWallOfFame.addEventListener('click', t.openWallOfFame.bind(t))

        t.$closeWallOfFame.addEventListener('click', t.closeWallOfFame.bind(t))

    }


    getWallOfFame() {
        const t = this

        // envoi l'action au serveur
        let infos = { action: 'getWallOfFame' }

        let result = Server.ajaxRequest(infos)

        // en fonction du résultat on affiche le wall of fame
        // ou on retourne
        if (!result.statuts) Server.errorConnectServer()
        else if (result.noPlayers) t.wallOfFameEmpty()
        else t.appendWallOfFame(result.wallOfFameOrdered)

    }

    appendWallOfFame(players) {
        const t = this

        // pour chaque joueur on créer un element dans le DOM
        for (let player of players ) {

            let li = document.createElement('li')
            let text = document.createTextNode(player.name + ' - ' + player.wins)

            li.appendChild(text)

            t.$wallOfFameContent.appendChild(li)
        }
    }

    wallOfFameEmpty() {
        const t = this

        // si vide on affiche le message
        let li = document.createElement('li')
        let text = document.createTextNode('aucun joueurs eneregistrés')

        li.appendChild(text)
        t.$wallOfFameContent.appendChild(li)
    }

    updateWallOfFame() {
        const t = this

        // on efface les players
        while(t.$wallOfFameContent.firstChild) t.$wallOfFameContent.removeChild(t.$wallOfFameContent.firstChild)

        // on récupère le wall of fame
        t.getWallOfFame()
    }

    openWallOfFame() {
        const t = this

        t.$wallOfFame.style.display = 'block'
        t.$body.classList.add('wallOfFame-open')
    }

    closeWallOfFame(){
        const t = this

        t.$wallOfFame.style.display = 'none'
        t.$body.classList.remove('wallOfFame-open')
    }
}
