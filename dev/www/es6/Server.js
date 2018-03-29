// class Server

// regroupe :
// - la fonction d'envoi ajax
// - la fonction de gestion des erreurs

class Server {

    static ajaxRequest(infos) {

        let resultValue = null
        let messageError = null

        // on récupères les données s'il y a
        let data = infos.data ? infos.data : {}

        // on ajout l'identifiant de la partie
        data.id = window.gameID

        $.ajax({
            url: 'http://localhost:3000/' + infos.action,
            type: 'POST',
            crossDomain: true,
            data: JSON.stringify(data),
            dataType: 'json',
            contentType: 'application/json',
            async: false,
            success: function(data){

                // on stock les données renvoyées
                resultValue = data

                // si retour négatif on récupère le message
                if (!data.statuts) messageError = data.message

            },
            error: function(xhr, ajaxOptions, thrownError){
                // DEBUG
                console.log(xhr.status)
                console.log(thrownError)
                resultValue = false
            }
        })

        // DEBUG
        // si on a un message d'erreur alors on l'affiche dans la console
        if ( messageError !== null ) console.error('Server.js - ajaxRequest()', messageError)


        // on retourne le message
        return resultValue
    }


    static errorConnectServer(){

        // si erreur on informe l'utilisateur
        alert('Erreur de connexion au serveur')
        location.reload()
    }
}