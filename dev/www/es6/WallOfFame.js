class WallOfFame {

    constructor() {
        const t = this

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

        t.$openWallOfFame.addEventListener('click', t.openWallOfFame.bind(t))

        t.$closeWallOfFame.addEventListener('click', t.closeWallOfFame.bind(t))

    }


    getWallOfFame() {
        const t = this

        let infos = {
            action: 'getWallOfFame'
        }

        let result = Server.ajaxRequest(infos)

        if (!result.statuts) Server.errorConnectServer()
        else if (result.noPlayers) t.wallOfFameEmpty()
        else t.appendWallOfFame(result.wallOfFameOrdered)


    }

    appendWallOfFame(players) {
        const t = this

        for (let player of players ) {
            let li = document.createElement('li')
            let text = document.createTextNode(player.name + ' - ' + player.wins)

            li.appendChild(text)

            t.$wallOfFameContent.appendChild(li)
        }
    }

    wallOfFameEmpty() {
        const t = this

        let li = document.createElement('li')
        let text = document.createTextNode('aucun joueurs eneregistrés')

        li.appendChild(text)
        t.$wallOfFameContent.appendChild(li)
    }

    updateWallOfFame() {
        const t = this

        while(t.$wallOfFameContent.firstChild) t.$wallOfFameContent.removeChild(t.$wallOfFameContent.firstChild)

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
