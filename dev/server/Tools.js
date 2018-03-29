import JsonManager from './JsonManager.js'
import Ia from "./Ia"

class Tools {


    static bubbleSort ( arrayToSort, numberElements = arrayToSort.length - 1 ) {

        if ( ! Array.isArray( arrayToSort ) || arrayToSort.length === 0 ) return false


        for ( let indexLastElement = arrayToSort.length - 1; indexLastElement >= 1; indexLastElement-- ) {

            let arraySorted = true

            for ( let indexFirstElement = 0; indexFirstElement <= indexLastElement - 1; indexFirstElement++ ){

                if ( arrayToSort[ indexFirstElement + 1 ].wins > arrayToSort[ indexFirstElement ].wins ) {

                    let valueFirstElement = arrayToSort[ indexFirstElement ]
                    arrayToSort[ indexFirstElement ] = arrayToSort[ indexFirstElement + 1 ]
                    arrayToSort[ indexFirstElement + 1 ] = valueFirstElement

                    arraySorted = false
                }
            }

            if ( arraySorted ) break
        }

        return arrayToSort.slice(0, numberElements)
    }
}


module.exports = Tools