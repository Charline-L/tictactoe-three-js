// class Board

// regroupe :
// - toutes les fonctions en lien avec Three.js
// - gère l'affichage et l'animation
// - ne gère pas l'intéraction


class Board {

    constructor(gameSize) {
        const t = this

        // device
        t.ww = window.innerWidth - 400
        t.wh = window.innerHeight


        // elements basic three
        t.scene = new THREE.Scene()
        t.camera = new THREE.PerspectiveCamera( 75, t.ww / t.wh, 0.1, 1000 )
        t.renderer = new THREE.WebGLRenderer({ alpha: true })
        t.renderer.shadowMap.enabled = true


        // elements du DOM
        t.$gameC = document.getElementById('canvas')
        t.$gameC.appendChild( t.renderer.domElement )


        // permet d'intéragir avec le DOM
        t.domEvents	= new THREEx.DomEvents(t.camera, t.renderer.domElement)


        // couleurs
        t.white = 0xfcf9f9
        t.trueWhite = 0xffffff
        t.purple = 0x64698f
        t.pink = 0xefd0f2
        t.lightPink = 0xeaccee
        t.lightPurple = 0x936e9a
        t.whitePink = 0xeddff8


        // variables de calcul
        t.gameSize = gameSize
        t.decalage = 20
        t.sphereSize = 1
        t.gap = (t.sphereSize * 2) - t.decalage


        // variables stockage
        t.spheresElements = []
        t.dodecahedronElements = []
        t.flowersObj = []
        t.linesElements = []
        t.starFieldElements = []
        t.starFieldElementsPositions = []
        t.updateRateParticules = 50
        t.currentUpdateRateParticules = 0


        t.init()
    }

    init() {

        const t = this

        t.loadFlowers()
        t.setSizeRenderer()
        t.setLights()
        t.createGamePlay()
        t.setCamera()
        t.controls = new THREE.OrbitControls(t.camera)
        t.animate()

    }

    setSizeRenderer() {
        const t = this

        // on calcule la taille
        t.ww = window.innerWidth - 400
        t.wh = window.innerHeight

        // on set la taille du renderer an fonction de la taille de l'écran
        t.renderer.setSize( t.ww, t.wh )
    }

    setLights() {
        const t = this

        // on ajoute une lumière ambiante
        let lightAmbient = new THREE.AmbientLight(t.white, 1)
        t.scene.add(lightAmbient)

        // on ajoute une lumière
        let lightPoint = new THREE.PointLight(t.purple, 1)
        t.scene.add(lightPoint)

    }

    setCamera() {
        const t = this

        // on set la position de la camera
        t.camera.position.z = t.gameSize * 20
        t.camera.position.x = t.gap / 4 + 5
        t.camera.position.y = t.gap / -4 - 2.5

        // on la centre sur le jeu
        t.camera.lookAt(0,0,0)

    }

    animate() {
        const t = this


        // rotation de la forme autour de la sphère
        for (let i = 0; i < t.dodecahedronElements.length; i++) {
            let randomRotate = Math.random() * ( 0.01 + -0.01) + -0.01

            t.dodecahedronElements[i].rotation.y += randomRotate
            t.dodecahedronElements[i].rotation.x += randomRotate
        }


        // update la scène
        t.controls.update()
        t.renderer.render( t.scene, t.camera )


        // rapelle la fonction
        requestAnimationFrame( t.animate.bind(t) )
    }

    createGamePlay() {
        const t = this

        // on créer les geometry et textures des formes présentes dans le jeu :
        // pour case case : une sphere + un dodecahedron + des particules + une ligne
        let geometrySphere = new THREE.SphereGeometry(t.sphereSize, 20, 20)
        let materialSphere = new THREE.MeshPhongMaterial({color: t.white, specular : 0xFF0000, shininess: 20})

        let geometryDodecahedron = new THREE.DodecahedronGeometry(t.sphereSize * 4, 0)
        let materialDodecahedron = new THREE.MeshPhongMaterial({color: t.white, wireframe: true})

        let materialLine = new THREE.LineBasicMaterial({
            color: t.white,
            transparent: true,
            opacity: 0.005
        })

        let geometryLine = new THREE.Geometry()


        // on boucle sur nos éléments
        // pour créer notre grille et ainsi
        // pour lier leurs position
        let startPos = - Math.trunc(t.gameSize / 2)

        for ( let i = startPos; i < t.gameSize + startPos; i++ ){


            for (let j = startPos; j < t.gameSize + startPos ; j++ ) {


                // on créer les formes
                let sphere = new THREE.Mesh(geometrySphere, materialSphere)
                let dodecahedron = new THREE.Mesh(geometryDodecahedron, materialDodecahedron)

                geometryLine.vertices.push(
                    new THREE.Vector3(0, 0, (-30 * t.gameSize)),
                    new THREE.Vector3((-j * t.gap), (i * t.gap), 0)
                )

                let line = new THREE.Line(geometryLine, materialLine)


                // on les positionne
                sphere.position.x = -j * t.gap
                sphere.position.y = i * t.gap

                dodecahedron.position.x = -j * t.gap
                dodecahedron.position.y = i * t.gap


                // on les stocke dans un tableau
                t.spheresElements.push(sphere)
                t.dodecahedronElements.push(dodecahedron)
                t.linesElements.push(line)
            }
        }


        // on parcours un de nos tableau dnas lequel est stocké nos sphère
        for (let i = 0; i < t.spheresElements.length; i++){

            // on ajoute les élément à la scène
            t.scene.add(t.spheresElements[i])
            t.scene.add(t.dodecahedronElements[i])
            t.scene.add(t.linesElements[i])


            // on ajoute l'intéraction avec la sphere et le passage du curseur
            t.domEvents.addEventListener( t.dodecahedronElements[i], 'mouseover', function() {
                for (let i = 0; i < t.spheresElements.length; i++) t.animateMoveDown(i)
                t.animateMoveUp(i)
            })

            t.domEvents.addEventListener( t.dodecahedronElements[i], 'mouseout', function(){
                t.animateMoveDown(i)
            })
        }

        // on crée les particules présentes dans chaque dodecahedron
        // la texture des particules est cette fois une image
        for (let i = 0; i < t.dodecahedronElements.length; i++){

            // on calcul les valeur maximales et minimales pour les positions des particules
            // pour que cette dernières restent proches du dodecahedron
            let interValPositions = t.getIntervalPosition(i)

            // on va créer un "champ d'étoiles"
            let starsGeometry = new THREE.Geometry()
            let sprite = new THREE.TextureLoader().load( "www/assets/img/disc.png" )

            // on créer 10 particule par case
            for ( let i = 0; i < 10; i ++ ) {

                let star = new THREE.Vector3()

                star.x = THREE.Math.randFloat( interValPositions.xMin, interValPositions.xMax)
                star.y = THREE.Math.randFloat( interValPositions.yMin, interValPositions.yMax)
                star.z = THREE.Math.randFloat( interValPositions.zMin, interValPositions.zMax)

                // on ajoute chaque particule dans notre geometry
                starsGeometry.vertices.push( star )
            }

            // on créer notre "champ d'étoile" en lui donnant un matriel de point
            // vu que la textur est un jpg on lui dit de gérer la transarence
            let starsMaterial = new THREE.PointsMaterial( { size: 0.5, sizeAttenuation: true, map: sprite, alphaTest: 0.5, opacity: 1, transparent: true } );

            // on créer la forme qui va contenir tous les spheres
            let starField = new THREE.Points( starsGeometry, starsMaterial )

            // on stocke dans notre tableau
            t.starFieldElements.push(starField)

            // on ajoute à la scène
            t.scene.add( starField )
        }
    }


    animateMoveDown(i) {
        const t = this

        // effet de hover à l'entrée du curseur
        // on récupère l'élément à modifier avec son index i passé dans la fonction
        let moveDown = setInterval(function(){

            if (t.spheresElements[i].position.z > 0) t.spheresElements[i].position.z = t.spheresElements[i].position.z - (0.08333333333 * 2)
            else clearInterval(moveDown)

        }, 0.5)
    }


    animateMoveUp(i) {
        const t = this

        // effet de hover à la sortie du curseur
        // on récupère l'élément à modifier avec son index i passé dans la fonction
        let moveUp = setInterval(function(){

            if (t.spheresElements[i].position.z <= 1) t.spheresElements[i].position.z = t.spheresElements[i].position.z + 0.08333333333
            else clearInterval(moveUp)

        }, 0.5)
    }


    animateSelect(i) {
        const t = this

        // effet de disparition du dodecahedron lorsqu'une fleur apparait
        // on récupère l'élément à modifier avec son index i passé dans la fonction
        let scaleDown = setInterval(function(){

            if (t.dodecahedronElements[i].scale.x > 0 ) {
                t.dodecahedronElements[i].scale.x = t.dodecahedronElements[i].scale.x - 0.048
                t.dodecahedronElements[i].scale.y = t.dodecahedronElements[i].scale.y - 0.048
                t.dodecahedronElements[i].scale.z = t.dodecahedronElements[i].scale.z - 0.048
            }
            else clearInterval(scaleDown)

        }, 2)

    }

    showFlower(i, player){
        const t = this

        // en fonction du joueur on choisi la fleur
        let indexFlower = player === 1 ? 1 : 0

        // on configure le material de la lfeur
        let materialFlower = new THREE.MeshBasicMaterial({color: t.white})

        // on récupère sa geometry stockée dans le tableau
        let flower = new THREE.Mesh( t.flowersObj[indexFlower], materialFlower )

        // on calque sa position sur le dodecahedron de la même case
        flower.position.copy(t.dodecahedronElements[i].position)

        // on positionne la fleur à l'endroit
        flower.rotation.x = THREE.Math.degToRad(-90)

        // t.flowersElements.push(flowerInfos)
        t.scene.add(flower)

        // on anime son apparatition
        // en changeant sa scale et en la faisant tourner
        let flowerUp = setInterval(function(){

            if (flower.scale.x < 6 ) {
                flower.scale.x = flower.scale.x + 0.048
                flower.scale.y = flower.scale.y + 0.048
                flower.scale.z = flower.scale.z + 0.048

                if ( flower.rotation.y > 4) flower.rotation.y = flower.rotation.y + 0.05 / flower.rotation.y
                else flower.rotation.y = flower.rotation.y + 0.05

            }

            else clearInterval(flowerUp)
        }, 1)
    }

    loadFlowers() {
        const t = this

        // permet de gérer le chargement
        let manager = new THREE.LoadingManager();

        // lance le premier chargement
        // on configure le marnager dans le JSONLoader
        let loaderMeshOne = new THREE.JSONLoader(manager)

        loaderMeshOne.load(
            'www/assets/objets/flowerC.json',

            function ( geometry ) {
                // une fois terminé on stocke la geometry de la fleur dans un tableau
                // pour la réutiliser lors de son apparition
                t.flowersObj.push(geometry)
            }
        )


        // lance le deuxième chargement
        // on configure le marnager dans le JSONLoader
        let loaderMeshTwo = new THREE.JSONLoader(manager)

        loaderMeshTwo.load(
            'www/assets/objets/flowerI.json',

            function ( geometry ) {
                // une fois terminé on stocke la geometry de la fleur dans un tableau
                // pour la réutiliser lors de son apparition
                t.flowersObj.push(geometry)
            }
        )
    }

    getIntervalPosition(i){
        const t = this

        // on récupère le container
        let containerParticles = new THREE.Box3().setFromObject( t.dodecahedronElements[i] )

        // on stocke sa taille
        let sizeX = containerParticles.getSize().x
        let sizeY = containerParticles.getSize().y
        let sizeZ = containerParticles.getSize().z

        // ses intervales
        // toutes les valeurs partent de son centre

        let xMin = t.dodecahedronElements[i].position.x - sizeX / 2
        let xMax = xMin + sizeX

        let yMin = t.dodecahedronElements[i].position.y - sizeY / 2
        let yMax = yMin + sizeY

        let zMin = t.dodecahedronElements[i].position.z - sizeZ / 2
        let zMax = zMin + sizeZ

        // on range ces valeurs dans un objet
        let intevalPositions = {
            xMin : xMin,
            xMax : xMax,
            yMin : yMin,
            yMax : yMax,
            zMin : zMin,
            zMax : zMax
        }

        // on retourne le retourne
        return intevalPositions;
    }

    // méthodes appelées pour manipuler le DOM
    getShapes(){
        const t = this

        return t.dodecahedronElements
    }

    getDomListerner(){
        const t = this

        return t.domEvents
    }
}
