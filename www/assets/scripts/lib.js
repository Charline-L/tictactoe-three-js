'use strict';

/**
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author erich666 / http://erichaines.com
 */

// This set of controls performs orbiting, dollying (zooming), and panning.
// Unlike TrackballControls, it maintains the "up" direction object.up (+Y by default).
//
//   Orbit - left mouse / touch: one finger move
//    Zoom - middle mouse, or mousewheel / touch: two finger spread or squish
//    Pan - right mouse, or arrow keys / touch: three finger swipe

THREE.OrbitControls = function (object, domElement) {

	this.object = object;

	this.domElement = domElement !== undefined ? domElement : document;

	// Set to false to disable this control
	this.enabled = true;

	// "target" sets the location of focus, where the object orbits around
	this.target = new THREE.Vector3();

	// How far you can dolly in and out ( PerspectiveCamera only )
	this.minDistance = 0;
	this.maxDistance = Infinity;

	// How far you can zoom in and out ( OrthographicCamera only )
	this.minZoom = 0;
	this.maxZoom = Infinity;

	// How far you can orbit vertically, upper and lower limits.
	// Range is 0 to Math.PI radians.
	this.minPolarAngle = 0; // radians
	this.maxPolarAngle = Math.PI; // radians

	// How far you can orbit horizontally, upper and lower limits.
	// If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
	this.minAzimuthAngle = -Infinity; // radians
	this.maxAzimuthAngle = Infinity; // radians

	// Set to true to enable damping (inertia)
	// If damping is enabled, you must call controls.update() in your animation loop
	this.enableDamping = false;
	this.dampingFactor = 0.25;

	// This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
	// Set to false to disable zooming
	this.enableZoom = true;
	this.zoomSpeed = 1.0;

	// Set to false to disable rotating
	this.enableRotate = true;
	this.rotateSpeed = 1.0;

	// Set to false to disable panning
	this.enablePan = true;
	this.keyPanSpeed = 7.0; // pixels moved per arrow key push

	// Set to true to automatically rotate around the target
	// If auto-rotate is enabled, you must call controls.update() in your animation loop
	this.autoRotate = false;
	this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

	// Set to false to disable use of the keys
	this.enableKeys = true;

	// The four arrow keys
	this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };

	// Mouse buttons
	this.mouseButtons = { ORBIT: THREE.MOUSE.LEFT, ZOOM: THREE.MOUSE.MIDDLE, PAN: THREE.MOUSE.RIGHT };

	// for reset
	this.target0 = this.target.clone();
	this.position0 = this.object.position.clone();
	this.zoom0 = this.object.zoom;

	//
	// public methods
	//

	this.getPolarAngle = function () {

		return spherical.phi;
	};

	this.getAzimuthalAngle = function () {

		return spherical.theta;
	};

	this.saveState = function () {

		scope.target0.copy(scope.target);
		scope.position0.copy(scope.object.position);
		scope.zoom0 = scope.object.zoom;
	};

	this.reset = function () {

		scope.target.copy(scope.target0);
		scope.object.position.copy(scope.position0);
		scope.object.zoom = scope.zoom0;

		scope.object.updateProjectionMatrix();
		scope.dispatchEvent(changeEvent);

		scope.update();

		state = STATE.NONE;
	};

	// this method is exposed, but perhaps it would be better if we can make it private...
	this.update = function () {

		var offset = new THREE.Vector3();

		// so camera.up is the orbit axis
		var quat = new THREE.Quaternion().setFromUnitVectors(object.up, new THREE.Vector3(0, 1, 0));
		var quatInverse = quat.clone().inverse();

		var lastPosition = new THREE.Vector3();
		var lastQuaternion = new THREE.Quaternion();

		return function update() {

			var position = scope.object.position;

			offset.copy(position).sub(scope.target);

			// rotate offset to "y-axis-is-up" space
			offset.applyQuaternion(quat);

			// angle from z-axis around y-axis
			spherical.setFromVector3(offset);

			if (scope.autoRotate && state === STATE.NONE) {

				rotateLeft(getAutoRotationAngle());
			}

			spherical.theta += sphericalDelta.theta;
			spherical.phi += sphericalDelta.phi;

			// restrict theta to be between desired limits
			spherical.theta = Math.max(scope.minAzimuthAngle, Math.min(scope.maxAzimuthAngle, spherical.theta));

			// restrict phi to be between desired limits
			spherical.phi = Math.max(scope.minPolarAngle, Math.min(scope.maxPolarAngle, spherical.phi));

			spherical.makeSafe();

			spherical.radius *= scale;

			// restrict radius to be between desired limits
			spherical.radius = Math.max(scope.minDistance, Math.min(scope.maxDistance, spherical.radius));

			// move target to panned location
			scope.target.add(panOffset);

			offset.setFromSpherical(spherical);

			// rotate offset back to "camera-up-vector-is-up" space
			offset.applyQuaternion(quatInverse);

			position.copy(scope.target).add(offset);

			scope.object.lookAt(scope.target);

			if (scope.enableDamping === true) {

				sphericalDelta.theta *= 1 - scope.dampingFactor;
				sphericalDelta.phi *= 1 - scope.dampingFactor;
			} else {

				sphericalDelta.set(0, 0, 0);
			}

			scale = 1;
			panOffset.set(0, 0, 0);

			// update condition is:
			// min(camera displacement, camera rotation in radians)^2 > EPS
			// using small-angle approximation cos(x/2) = 1 - x^2 / 8

			if (zoomChanged || lastPosition.distanceToSquared(scope.object.position) > EPS || 8 * (1 - lastQuaternion.dot(scope.object.quaternion)) > EPS) {

				scope.dispatchEvent(changeEvent);

				lastPosition.copy(scope.object.position);
				lastQuaternion.copy(scope.object.quaternion);
				zoomChanged = false;

				return true;
			}

			return false;
		};
	}();

	this.dispose = function () {

		scope.domElement.removeEventListener('contextmenu', onContextMenu, false);
		scope.domElement.removeEventListener('mousedown', onMouseDown, false);
		scope.domElement.removeEventListener('wheel', onMouseWheel, false);

		scope.domElement.removeEventListener('touchstart', onTouchStart, false);
		scope.domElement.removeEventListener('touchend', onTouchEnd, false);
		scope.domElement.removeEventListener('touchmove', onTouchMove, false);

		document.removeEventListener('mousemove', onMouseMove, false);
		document.removeEventListener('mouseup', onMouseUp, false);

		window.removeEventListener('keydown', onKeyDown, false);

		//scope.dispatchEvent( { type: 'dispose' } ); // should this be added here?
	};

	//
	// internals
	//

	var scope = this;

	var changeEvent = { type: 'change' };
	var startEvent = { type: 'start' };
	var endEvent = { type: 'end' };

	var STATE = { NONE: -1, ROTATE: 0, DOLLY: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_DOLLY: 4, TOUCH_PAN: 5 };

	var state = STATE.NONE;

	var EPS = 0.000001;

	// current position in spherical coordinates
	var spherical = new THREE.Spherical();
	var sphericalDelta = new THREE.Spherical();

	var scale = 1;
	var panOffset = new THREE.Vector3();
	var zoomChanged = false;

	var rotateStart = new THREE.Vector2();
	var rotateEnd = new THREE.Vector2();
	var rotateDelta = new THREE.Vector2();

	var panStart = new THREE.Vector2();
	var panEnd = new THREE.Vector2();
	var panDelta = new THREE.Vector2();

	var dollyStart = new THREE.Vector2();
	var dollyEnd = new THREE.Vector2();
	var dollyDelta = new THREE.Vector2();

	function getAutoRotationAngle() {

		return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;
	}

	function getZoomScale() {

		return Math.pow(0.95, scope.zoomSpeed);
	}

	function rotateLeft(angle) {

		sphericalDelta.theta -= angle;
	}

	function rotateUp(angle) {

		sphericalDelta.phi -= angle;
	}

	var panLeft = function () {

		var v = new THREE.Vector3();

		return function panLeft(distance, objectMatrix) {

			v.setFromMatrixColumn(objectMatrix, 0); // get X column of objectMatrix
			v.multiplyScalar(-distance);

			panOffset.add(v);
		};
	}();

	var panUp = function () {

		var v = new THREE.Vector3();

		return function panUp(distance, objectMatrix) {

			v.setFromMatrixColumn(objectMatrix, 1); // get Y column of objectMatrix
			v.multiplyScalar(distance);

			panOffset.add(v);
		};
	}();

	// deltaX and deltaY are in pixels; right and down are positive
	var pan = function () {

		var offset = new THREE.Vector3();

		return function pan(deltaX, deltaY) {

			var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

			if (scope.object.isPerspectiveCamera) {

				// perspective
				var position = scope.object.position;
				offset.copy(position).sub(scope.target);
				var targetDistance = offset.length();

				// half of the fov is center to top of screen
				targetDistance *= Math.tan(scope.object.fov / 2 * Math.PI / 180.0);

				// we actually don't use screenWidth, since perspective camera is fixed to screen height
				panLeft(2 * deltaX * targetDistance / element.clientHeight, scope.object.matrix);
				panUp(2 * deltaY * targetDistance / element.clientHeight, scope.object.matrix);
			} else if (scope.object.isOrthographicCamera) {

				// orthographic
				panLeft(deltaX * (scope.object.right - scope.object.left) / scope.object.zoom / element.clientWidth, scope.object.matrix);
				panUp(deltaY * (scope.object.top - scope.object.bottom) / scope.object.zoom / element.clientHeight, scope.object.matrix);
			} else {

				// camera neither orthographic nor perspective
				console.warn('WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.');
				scope.enablePan = false;
			}
		};
	}();

	function dollyIn(dollyScale) {

		if (scope.object.isPerspectiveCamera) {

			scale /= dollyScale;
		} else if (scope.object.isOrthographicCamera) {

			scope.object.zoom = Math.max(scope.minZoom, Math.min(scope.maxZoom, scope.object.zoom * dollyScale));
			scope.object.updateProjectionMatrix();
			zoomChanged = true;
		} else {

			console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
			scope.enableZoom = false;
		}
	}

	function dollyOut(dollyScale) {

		if (scope.object.isPerspectiveCamera) {

			scale *= dollyScale;
		} else if (scope.object.isOrthographicCamera) {

			scope.object.zoom = Math.max(scope.minZoom, Math.min(scope.maxZoom, scope.object.zoom / dollyScale));
			scope.object.updateProjectionMatrix();
			zoomChanged = true;
		} else {

			console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
			scope.enableZoom = false;
		}
	}

	//
	// event callbacks - update the object state
	//

	function handleMouseDownRotate(event) {

		//console.log( 'handleMouseDownRotate' );

		rotateStart.set(event.clientX, event.clientY);
	}

	function handleMouseDownDolly(event) {

		//console.log( 'handleMouseDownDolly' );

		dollyStart.set(event.clientX, event.clientY);
	}

	function handleMouseDownPan(event) {

		//console.log( 'handleMouseDownPan' );

		panStart.set(event.clientX, event.clientY);
	}

	function handleMouseMoveRotate(event) {

		//console.log( 'handleMouseMoveRotate' );

		rotateEnd.set(event.clientX, event.clientY);
		rotateDelta.subVectors(rotateEnd, rotateStart);

		var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

		// rotating across whole screen goes 360 degrees around
		rotateLeft(2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed);

		// rotating up and down along whole screen attempts to go 360, but limited to 180
		rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed);

		rotateStart.copy(rotateEnd);

		scope.update();
	}

	function handleMouseMoveDolly(event) {

		//console.log( 'handleMouseMoveDolly' );

		dollyEnd.set(event.clientX, event.clientY);

		dollyDelta.subVectors(dollyEnd, dollyStart);

		if (dollyDelta.y > 0) {

			dollyIn(getZoomScale());
		} else if (dollyDelta.y < 0) {

			dollyOut(getZoomScale());
		}

		dollyStart.copy(dollyEnd);

		scope.update();
	}

	function handleMouseMovePan(event) {

		//console.log( 'handleMouseMovePan' );

		panEnd.set(event.clientX, event.clientY);

		panDelta.subVectors(panEnd, panStart);

		pan(panDelta.x, panDelta.y);

		panStart.copy(panEnd);

		scope.update();
	}

	function handleMouseUp(event) {

		// console.log( 'handleMouseUp' );

	}

	function handleMouseWheel(event) {

		// console.log( 'handleMouseWheel' );

		if (event.deltaY < 0) {

			dollyOut(getZoomScale());
		} else if (event.deltaY > 0) {

			dollyIn(getZoomScale());
		}

		scope.update();
	}

	function handleKeyDown(event) {

		//console.log( 'handleKeyDown' );

		switch (event.keyCode) {

			case scope.keys.UP:
				pan(0, scope.keyPanSpeed);
				scope.update();
				break;

			case scope.keys.BOTTOM:
				pan(0, -scope.keyPanSpeed);
				scope.update();
				break;

			case scope.keys.LEFT:
				pan(scope.keyPanSpeed, 0);
				scope.update();
				break;

			case scope.keys.RIGHT:
				pan(-scope.keyPanSpeed, 0);
				scope.update();
				break;

		}
	}

	function handleTouchStartRotate(event) {

		//console.log( 'handleTouchStartRotate' );

		rotateStart.set(event.touches[0].pageX, event.touches[0].pageY);
	}

	function handleTouchStartDolly(event) {

		//console.log( 'handleTouchStartDolly' );

		var dx = event.touches[0].pageX - event.touches[1].pageX;
		var dy = event.touches[0].pageY - event.touches[1].pageY;

		var distance = Math.sqrt(dx * dx + dy * dy);

		dollyStart.set(0, distance);
	}

	function handleTouchStartPan(event) {

		//console.log( 'handleTouchStartPan' );

		panStart.set(event.touches[0].pageX, event.touches[0].pageY);
	}

	function handleTouchMoveRotate(event) {

		//console.log( 'handleTouchMoveRotate' );

		rotateEnd.set(event.touches[0].pageX, event.touches[0].pageY);
		rotateDelta.subVectors(rotateEnd, rotateStart);

		var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

		// rotating across whole screen goes 360 degrees around
		rotateLeft(2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed);

		// rotating up and down along whole screen attempts to go 360, but limited to 180
		rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed);

		rotateStart.copy(rotateEnd);

		scope.update();
	}

	function handleTouchMoveDolly(event) {

		//console.log( 'handleTouchMoveDolly' );

		var dx = event.touches[0].pageX - event.touches[1].pageX;
		var dy = event.touches[0].pageY - event.touches[1].pageY;

		var distance = Math.sqrt(dx * dx + dy * dy);

		dollyEnd.set(0, distance);

		dollyDelta.subVectors(dollyEnd, dollyStart);

		if (dollyDelta.y > 0) {

			dollyOut(getZoomScale());
		} else if (dollyDelta.y < 0) {

			dollyIn(getZoomScale());
		}

		dollyStart.copy(dollyEnd);

		scope.update();
	}

	function handleTouchMovePan(event) {

		//console.log( 'handleTouchMovePan' );

		panEnd.set(event.touches[0].pageX, event.touches[0].pageY);

		panDelta.subVectors(panEnd, panStart);

		pan(panDelta.x, panDelta.y);

		panStart.copy(panEnd);

		scope.update();
	}

	function handleTouchEnd(event) {}

	//console.log( 'handleTouchEnd' );

	//
	// event handlers - FSM: listen for events and reset state
	//

	function onMouseDown(event) {

		if (scope.enabled === false) return;

		event.preventDefault();

		switch (event.button) {

			case scope.mouseButtons.ORBIT:

				if (scope.enableRotate === false) return;

				handleMouseDownRotate(event);

				state = STATE.ROTATE;

				break;

			case scope.mouseButtons.ZOOM:

				if (scope.enableZoom === false) return;

				handleMouseDownDolly(event);

				state = STATE.DOLLY;

				break;

			case scope.mouseButtons.PAN:

				if (scope.enablePan === false) return;

				handleMouseDownPan(event);

				state = STATE.PAN;

				break;

		}

		if (state !== STATE.NONE) {

			document.addEventListener('mousemove', onMouseMove, false);
			document.addEventListener('mouseup', onMouseUp, false);

			scope.dispatchEvent(startEvent);
		}
	}

	function onMouseMove(event) {

		if (scope.enabled === false) return;

		event.preventDefault();

		switch (state) {

			case STATE.ROTATE:

				if (scope.enableRotate === false) return;

				handleMouseMoveRotate(event);

				break;

			case STATE.DOLLY:

				if (scope.enableZoom === false) return;

				handleMouseMoveDolly(event);

				break;

			case STATE.PAN:

				if (scope.enablePan === false) return;

				handleMouseMovePan(event);

				break;

		}
	}

	function onMouseUp(event) {

		if (scope.enabled === false) return;

		handleMouseUp(event);

		document.removeEventListener('mousemove', onMouseMove, false);
		document.removeEventListener('mouseup', onMouseUp, false);

		scope.dispatchEvent(endEvent);

		state = STATE.NONE;
	}

	function onMouseWheel(event) {

		if (scope.enabled === false || scope.enableZoom === false || state !== STATE.NONE && state !== STATE.ROTATE) return;

		event.preventDefault();
		event.stopPropagation();

		scope.dispatchEvent(startEvent);

		handleMouseWheel(event);

		scope.dispatchEvent(endEvent);
	}

	function onKeyDown(event) {

		if (scope.enabled === false || scope.enableKeys === false || scope.enablePan === false) return;

		handleKeyDown(event);
	}

	function onTouchStart(event) {

		if (scope.enabled === false) return;

		switch (event.touches.length) {

			case 1:
				// one-fingered touch: rotate

				if (scope.enableRotate === false) return;

				handleTouchStartRotate(event);

				state = STATE.TOUCH_ROTATE;

				break;

			case 2:
				// two-fingered touch: dolly

				if (scope.enableZoom === false) return;

				handleTouchStartDolly(event);

				state = STATE.TOUCH_DOLLY;

				break;

			case 3:
				// three-fingered touch: pan

				if (scope.enablePan === false) return;

				handleTouchStartPan(event);

				state = STATE.TOUCH_PAN;

				break;

			default:

				state = STATE.NONE;

		}

		if (state !== STATE.NONE) {

			scope.dispatchEvent(startEvent);
		}
	}

	function onTouchMove(event) {

		if (scope.enabled === false) return;

		event.preventDefault();
		event.stopPropagation();

		switch (event.touches.length) {

			case 1:
				// one-fingered touch: rotate

				if (scope.enableRotate === false) return;
				if (state !== STATE.TOUCH_ROTATE) return; // is this needed?...

				handleTouchMoveRotate(event);

				break;

			case 2:
				// two-fingered touch: dolly

				if (scope.enableZoom === false) return;
				if (state !== STATE.TOUCH_DOLLY) return; // is this needed?...

				handleTouchMoveDolly(event);

				break;

			case 3:
				// three-fingered touch: pan

				if (scope.enablePan === false) return;
				if (state !== STATE.TOUCH_PAN) return; // is this needed?...

				handleTouchMovePan(event);

				break;

			default:

				state = STATE.NONE;

		}
	}

	function onTouchEnd(event) {

		if (scope.enabled === false) return;

		handleTouchEnd(event);

		scope.dispatchEvent(endEvent);

		state = STATE.NONE;
	}

	function onContextMenu(event) {

		if (scope.enabled === false) return;

		event.preventDefault();
	}

	//

	scope.domElement.addEventListener('contextmenu', onContextMenu, false);

	scope.domElement.addEventListener('mousedown', onMouseDown, false);
	scope.domElement.addEventListener('wheel', onMouseWheel, false);

	scope.domElement.addEventListener('touchstart', onTouchStart, false);
	scope.domElement.addEventListener('touchend', onTouchEnd, false);
	scope.domElement.addEventListener('touchmove', onTouchMove, false);

	window.addEventListener('keydown', onKeyDown, false);

	// force an update at start

	this.update();
};

THREE.OrbitControls.prototype = Object.create(THREE.EventDispatcher.prototype);
THREE.OrbitControls.prototype.constructor = THREE.OrbitControls;

Object.defineProperties(THREE.OrbitControls.prototype, {

	center: {

		get: function get() {

			console.warn('THREE.OrbitControls: .center has been renamed to .target');
			return this.target;
		}

	},

	// backward compatibility

	noZoom: {

		get: function get() {

			console.warn('THREE.OrbitControls: .noZoom has been deprecated. Use .enableZoom instead.');
			return !this.enableZoom;
		},

		set: function set(value) {

			console.warn('THREE.OrbitControls: .noZoom has been deprecated. Use .enableZoom instead.');
			this.enableZoom = !value;
		}

	},

	noRotate: {

		get: function get() {

			console.warn('THREE.OrbitControls: .noRotate has been deprecated. Use .enableRotate instead.');
			return !this.enableRotate;
		},

		set: function set(value) {

			console.warn('THREE.OrbitControls: .noRotate has been deprecated. Use .enableRotate instead.');
			this.enableRotate = !value;
		}

	},

	noPan: {

		get: function get() {

			console.warn('THREE.OrbitControls: .noPan has been deprecated. Use .enablePan instead.');
			return !this.enablePan;
		},

		set: function set(value) {

			console.warn('THREE.OrbitControls: .noPan has been deprecated. Use .enablePan instead.');
			this.enablePan = !value;
		}

	},

	noKeys: {

		get: function get() {

			console.warn('THREE.OrbitControls: .noKeys has been deprecated. Use .enableKeys instead.');
			return !this.enableKeys;
		},

		set: function set(value) {

			console.warn('THREE.OrbitControls: .noKeys has been deprecated. Use .enableKeys instead.');
			this.enableKeys = !value;
		}

	},

	staticMoving: {

		get: function get() {

			console.warn('THREE.OrbitControls: .staticMoving has been deprecated. Use .enableDamping instead.');
			return !this.enableDamping;
		},

		set: function set(value) {

			console.warn('THREE.OrbitControls: .staticMoving has been deprecated. Use .enableDamping instead.');
			this.enableDamping = !value;
		}

	},

	dynamicDampingFactor: {

		get: function get() {

			console.warn('THREE.OrbitControls: .dynamicDampingFactor has been renamed. Use .dampingFactor instead.');
			return this.dampingFactor;
		},

		set: function set(value) {

			console.warn('THREE.OrbitControls: .dynamicDampingFactor has been renamed. Use .dampingFactor instead.');
			this.dampingFactor = value;
		}

	}

});
'use strict';

THREE.OBJLoader = function () {

    // o object_name | g group_name
    var object_pattern = /^[og]\s*(.+)?/;
    // mtllib file_reference
    var material_library_pattern = /^mtllib /;
    // usemtl material_name
    var material_use_pattern = /^usemtl /;

    function ParserState() {

        var state = {
            objects: [],
            object: {},

            vertices: [],
            normals: [],
            colors: [],
            uvs: [],

            materialLibraries: [],

            startObject: function startObject(name, fromDeclaration) {

                // If the current object (initial from reset) is not from a g/o declaration in the parsed
                // file. We need to use it for the first parsed g/o to keep things in sync.
                if (this.object && this.object.fromDeclaration === false) {

                    this.object.name = name;
                    this.object.fromDeclaration = fromDeclaration !== false;
                    return;
                }

                var previousMaterial = this.object && typeof this.object.currentMaterial === 'function' ? this.object.currentMaterial() : undefined;

                if (this.object && typeof this.object._finalize === 'function') {

                    this.object._finalize(true);
                }

                this.object = {
                    name: name || '',
                    fromDeclaration: fromDeclaration !== false,

                    geometry: {
                        vertices: [],
                        normals: [],
                        colors: [],
                        uvs: []
                    },
                    materials: [],
                    smooth: true,

                    startMaterial: function startMaterial(name, libraries) {

                        var previous = this._finalize(false);

                        // New usemtl declaration overwrites an inherited material, except if faces were declared
                        // after the material, then it must be preserved for proper MultiMaterial continuation.
                        if (previous && (previous.inherited || previous.groupCount <= 0)) {

                            this.materials.splice(previous.index, 1);
                        }

                        var material = {
                            index: this.materials.length,
                            name: name || '',
                            mtllib: Array.isArray(libraries) && libraries.length > 0 ? libraries[libraries.length - 1] : '',
                            smooth: previous !== undefined ? previous.smooth : this.smooth,
                            groupStart: previous !== undefined ? previous.groupEnd : 0,
                            groupEnd: -1,
                            groupCount: -1,
                            inherited: false,

                            clone: function clone(index) {

                                var cloned = {
                                    index: typeof index === 'number' ? index : this.index,
                                    name: this.name,
                                    mtllib: this.mtllib,
                                    smooth: this.smooth,
                                    groupStart: 0,
                                    groupEnd: -1,
                                    groupCount: -1,
                                    inherited: false
                                };
                                cloned.clone = this.clone.bind(cloned);
                                return cloned;
                            }
                        };

                        this.materials.push(material);

                        return material;
                    },

                    currentMaterial: function currentMaterial() {

                        if (this.materials.length > 0) {

                            return this.materials[this.materials.length - 1];
                        }

                        return undefined;
                    },

                    _finalize: function _finalize(end) {

                        var lastMultiMaterial = this.currentMaterial();
                        if (lastMultiMaterial && lastMultiMaterial.groupEnd === -1) {

                            lastMultiMaterial.groupEnd = this.geometry.vertices.length / 3;
                            lastMultiMaterial.groupCount = lastMultiMaterial.groupEnd - lastMultiMaterial.groupStart;
                            lastMultiMaterial.inherited = false;
                        }

                        // Ignore objects tail materials if no face declarations followed them before a new o/g started.
                        if (end && this.materials.length > 1) {

                            for (var mi = this.materials.length - 1; mi >= 0; mi--) {

                                if (this.materials[mi].groupCount <= 0) {

                                    this.materials.splice(mi, 1);
                                }
                            }
                        }

                        // Guarantee at least one empty material, this makes the creation later more straight forward.
                        if (end && this.materials.length === 0) {

                            this.materials.push({
                                name: '',
                                smooth: this.smooth
                            });
                        }

                        return lastMultiMaterial;
                    }
                };

                // Inherit previous objects material.
                // Spec tells us that a declared material must be set to all objects until a new material is declared.
                // If a usemtl declaration is encountered while this new object is being parsed, it will
                // overwrite the inherited material. Exception being that there was already face declarations
                // to the inherited material, then it will be preserved for proper MultiMaterial continuation.

                if (previousMaterial && previousMaterial.name && typeof previousMaterial.clone === 'function') {

                    var declared = previousMaterial.clone(0);
                    declared.inherited = true;
                    this.object.materials.push(declared);
                }

                this.objects.push(this.object);
            },

            finalize: function finalize() {

                if (this.object && typeof this.object._finalize === 'function') {

                    this.object._finalize(true);
                }
            },

            parseVertexIndex: function parseVertexIndex(value, len) {

                var index = parseInt(value, 10);
                return (index >= 0 ? index - 1 : index + len / 3) * 3;
            },

            parseNormalIndex: function parseNormalIndex(value, len) {

                var index = parseInt(value, 10);
                return (index >= 0 ? index - 1 : index + len / 3) * 3;
            },

            parseUVIndex: function parseUVIndex(value, len) {

                var index = parseInt(value, 10);
                return (index >= 0 ? index - 1 : index + len / 2) * 2;
            },

            addVertex: function addVertex(a, b, c) {

                var src = this.vertices;
                var dst = this.object.geometry.vertices;

                dst.push(src[a + 0], src[a + 1], src[a + 2]);
                dst.push(src[b + 0], src[b + 1], src[b + 2]);
                dst.push(src[c + 0], src[c + 1], src[c + 2]);
            },

            addVertexPoint: function addVertexPoint(a) {

                var src = this.vertices;
                var dst = this.object.geometry.vertices;

                dst.push(src[a + 0], src[a + 1], src[a + 2]);
            },

            addVertexLine: function addVertexLine(a) {

                var src = this.vertices;
                var dst = this.object.geometry.vertices;

                dst.push(src[a + 0], src[a + 1], src[a + 2]);
            },

            addNormal: function addNormal(a, b, c) {

                var src = this.normals;
                var dst = this.object.geometry.normals;

                dst.push(src[a + 0], src[a + 1], src[a + 2]);
                dst.push(src[b + 0], src[b + 1], src[b + 2]);
                dst.push(src[c + 0], src[c + 1], src[c + 2]);
            },

            addColor: function addColor(a, b, c) {

                var src = this.colors;
                var dst = this.object.geometry.colors;

                dst.push(src[a + 0], src[a + 1], src[a + 2]);
                dst.push(src[b + 0], src[b + 1], src[b + 2]);
                dst.push(src[c + 0], src[c + 1], src[c + 2]);
            },

            addUV: function addUV(a, b, c) {

                var src = this.uvs;
                var dst = this.object.geometry.uvs;

                dst.push(src[a + 0], src[a + 1]);
                dst.push(src[b + 0], src[b + 1]);
                dst.push(src[c + 0], src[c + 1]);
            },

            addUVLine: function addUVLine(a) {

                var src = this.uvs;
                var dst = this.object.geometry.uvs;

                dst.push(src[a + 0], src[a + 1]);
            },

            addFace: function addFace(a, b, c, ua, ub, uc, na, nb, nc) {

                var vLen = this.vertices.length;

                var ia = this.parseVertexIndex(a, vLen);
                var ib = this.parseVertexIndex(b, vLen);
                var ic = this.parseVertexIndex(c, vLen);

                this.addVertex(ia, ib, ic);

                if (ua !== undefined && ua !== '') {

                    var uvLen = this.uvs.length;
                    ia = this.parseUVIndex(ua, uvLen);
                    ib = this.parseUVIndex(ub, uvLen);
                    ic = this.parseUVIndex(uc, uvLen);
                    this.addUV(ia, ib, ic);
                }

                if (na !== undefined && na !== '') {

                    // Normals are many times the same. If so, skip function call and parseInt.
                    var nLen = this.normals.length;
                    ia = this.parseNormalIndex(na, nLen);

                    ib = na === nb ? ia : this.parseNormalIndex(nb, nLen);
                    ic = na === nc ? ia : this.parseNormalIndex(nc, nLen);

                    this.addNormal(ia, ib, ic);
                }

                if (this.colors.length > 0) {

                    this.addColor(ia, ib, ic);
                }
            },

            addPointGeometry: function addPointGeometry(vertices) {

                this.object.geometry.type = 'Points';

                var vLen = this.vertices.length;

                for (var vi = 0, l = vertices.length; vi < l; vi++) {

                    this.addVertexPoint(this.parseVertexIndex(vertices[vi], vLen));
                }
            },

            addLineGeometry: function addLineGeometry(vertices, uvs) {

                this.object.geometry.type = 'Line';

                var vLen = this.vertices.length;
                var uvLen = this.uvs.length;

                for (var vi = 0, l = vertices.length; vi < l; vi++) {

                    this.addVertexLine(this.parseVertexIndex(vertices[vi], vLen));
                }

                for (var uvi = 0, l = uvs.length; uvi < l; uvi++) {

                    this.addUVLine(this.parseUVIndex(uvs[uvi], uvLen));
                }
            }

        };

        state.startObject('', false);

        return state;
    }

    //

    function OBJLoader(manager) {

        this.manager = manager !== undefined ? manager : THREE.DefaultLoadingManager;

        this.materials = null;
    }

    OBJLoader.prototype = {

        constructor: OBJLoader,

        load: function load(url, onLoad, onProgress, onError) {

            var scope = this;

            var loader = new THREE.FileLoader(scope.manager);
            loader.setPath(this.path);
            loader.load(url, function (text) {

                onLoad(scope.parse(text));
            }, onProgress, onError);
        },

        setPath: function setPath(value) {

            this.path = value;
        },

        setMaterials: function setMaterials(materials) {

            this.materials = materials;

            return this;
        },

        parse: function parse(text) {

            console.time('OBJLoader');

            var state = new ParserState();

            if (text.indexOf('\r\n') !== -1) {

                // This is faster than String.split with regex that splits on both
                text = text.replace(/\r\n/g, '\n');
            }

            if (text.indexOf('\\\n') !== -1) {

                // join lines separated by a line continuation character (\)
                text = text.replace(/\\\n/g, '');
            }

            var lines = text.split('\n');
            var line = '',
                lineFirstChar = '';
            var lineLength = 0;
            var result = [];

            // Faster to just trim left side of the line. Use if available.
            var trimLeft = typeof ''.trimLeft === 'function';

            for (var i = 0, l = lines.length; i < l; i++) {

                line = lines[i];

                line = trimLeft ? line.trimLeft() : line.trim();

                lineLength = line.length;

                if (lineLength === 0) continue;

                lineFirstChar = line.charAt(0);

                // @todo invoke passed in handler if any
                if (lineFirstChar === '#') continue;

                if (lineFirstChar === 'v') {

                    var data = line.split(/\s+/);

                    switch (data[0]) {

                        case 'v':
                            state.vertices.push(parseFloat(data[1]), parseFloat(data[2]), parseFloat(data[3]));
                            if (data.length === 8) {

                                state.colors.push(parseFloat(data[4]), parseFloat(data[5]), parseFloat(data[6]));
                            }
                            break;
                        case 'vn':
                            state.normals.push(parseFloat(data[1]), parseFloat(data[2]), parseFloat(data[3]));
                            break;
                        case 'vt':
                            state.uvs.push(parseFloat(data[1]), parseFloat(data[2]));
                            break;

                    }
                } else if (lineFirstChar === 'f') {

                    var lineData = line.substr(1).trim();
                    var vertexData = lineData.split(/\s+/);
                    var faceVertices = [];

                    // Parse the face vertex data into an easy to work with format

                    for (var j = 0, jl = vertexData.length; j < jl; j++) {

                        var vertex = vertexData[j];

                        if (vertex.length > 0) {

                            var vertexParts = vertex.split('/');
                            faceVertices.push(vertexParts);
                        }
                    }

                    // Draw an edge between the first vertex and all subsequent vertices to form an n-gon

                    var v1 = faceVertices[0];

                    for (var j = 1, jl = faceVertices.length - 1; j < jl; j++) {

                        var v2 = faceVertices[j];
                        var v3 = faceVertices[j + 1];

                        state.addFace(v1[0], v2[0], v3[0], v1[1], v2[1], v3[1], v1[2], v2[2], v3[2]);
                    }
                } else if (lineFirstChar === 'l') {

                    var lineParts = line.substring(1).trim().split(" ");
                    var lineVertices = [],
                        lineUVs = [];

                    if (line.indexOf("/") === -1) {

                        lineVertices = lineParts;
                    } else {

                        for (var li = 0, llen = lineParts.length; li < llen; li++) {

                            var parts = lineParts[li].split("/");

                            if (parts[0] !== "") lineVertices.push(parts[0]);
                            if (parts[1] !== "") lineUVs.push(parts[1]);
                        }
                    }
                    state.addLineGeometry(lineVertices, lineUVs);
                } else if (lineFirstChar === 'p') {

                    var lineData = line.substr(1).trim();
                    var pointData = lineData.split(" ");

                    state.addPointGeometry(pointData);
                } else if ((result = object_pattern.exec(line)) !== null) {

                    // o object_name
                    // or
                    // g group_name

                    // WORKAROUND: https://bugs.chromium.org/p/v8/issues/detail?id=2869
                    // var name = result[ 0 ].substr( 1 ).trim();
                    var name = (" " + result[0].substr(1).trim()).substr(1);

                    state.startObject(name);
                } else if (material_use_pattern.test(line)) {

                    // material

                    state.object.startMaterial(line.substring(7).trim(), state.materialLibraries);
                } else if (material_library_pattern.test(line)) {

                    // mtl file

                    state.materialLibraries.push(line.substring(7).trim());
                } else if (lineFirstChar === 's') {

                    result = line.split(' ');

                    // smooth shading

                    // @todo Handle files that have varying smooth values for a set of faces inside one geometry,
                    // but does not define a usemtl for each face set.
                    // This should be detected and a dummy material created (later MultiMaterial and geometry groups).
                    // This requires some care to not create extra material on each smooth value for "normal" obj files.
                    // where explicit usemtl defines geometry groups.
                    // Example asset: examples/models/obj/cerberus/Cerberus.obj

                    /*
                     * http://paulbourke.net/dataformats/obj/
                     * or
                     * http://www.cs.utah.edu/~boulos/cs3505/obj_spec.pdf
                     *
                     * From chapter "Grouping" Syntax explanation "s group_number":
                     * "group_number is the smoothing group number. To turn off smoothing groups, use a value of 0 or off.
                     * Polygonal elements use group numbers to put elements in different smoothing groups. For free-form
                     * surfaces, smoothing groups are either turned on or off; there is no difference between values greater
                     * than 0."
                     */
                    if (result.length > 1) {

                        var value = result[1].trim().toLowerCase();
                        state.object.smooth = value !== '0' && value !== 'off';
                    } else {

                        // ZBrush can produce "s" lines #11707
                        state.object.smooth = true;
                    }
                    var material = state.object.currentMaterial();
                    if (material) material.smooth = state.object.smooth;
                } else {

                    // Handle null terminated files without exception
                    if (line === '\0') continue;

                    throw new Error('THREE.OBJLoader: Unexpected line: "' + line + '"');
                }
            }

            state.finalize();

            var container = new THREE.Group();
            container.materialLibraries = [].concat(state.materialLibraries);

            for (var i = 0, l = state.objects.length; i < l; i++) {

                var object = state.objects[i];
                var geometry = object.geometry;
                var materials = object.materials;
                var isLine = geometry.type === 'Line';
                var isPoints = geometry.type === 'Points';
                var hasVertexColors = false;

                // Skip o/g line declarations that did not follow with any faces
                if (geometry.vertices.length === 0) continue;

                var buffergeometry = new THREE.BufferGeometry();

                buffergeometry.addAttribute('position', new THREE.Float32BufferAttribute(geometry.vertices, 3));

                if (geometry.normals.length > 0) {

                    buffergeometry.addAttribute('normal', new THREE.Float32BufferAttribute(geometry.normals, 3));
                } else {

                    buffergeometry.computeVertexNormals();
                }

                if (geometry.colors.length > 0) {

                    hasVertexColors = true;
                    buffergeometry.addAttribute('color', new THREE.Float32BufferAttribute(geometry.colors, 3));
                }

                if (geometry.uvs.length > 0) {

                    buffergeometry.addAttribute('uv', new THREE.Float32BufferAttribute(geometry.uvs, 2));
                }

                // Create materials

                var createdMaterials = [];

                for (var mi = 0, miLen = materials.length; mi < miLen; mi++) {

                    var sourceMaterial = materials[mi];
                    var material = undefined;

                    if (this.materials !== null) {

                        material = this.materials.create(sourceMaterial.name);

                        // mtl etc. loaders probably can't create line materials correctly, copy properties to a line material.
                        if (isLine && material && !(material instanceof THREE.LineBasicMaterial)) {

                            var materialLine = new THREE.LineBasicMaterial();
                            materialLine.copy(material);
                            materialLine.lights = false; // TOFIX
                            material = materialLine;
                        } else if (isPoints && material && !(material instanceof THREE.PointsMaterial)) {

                            var materialPoints = new THREE.PointsMaterial({ size: 10, sizeAttenuation: false });
                            materialLine.copy(material);
                            material = materialPoints;
                        }
                    }

                    if (!material) {

                        if (isLine) {

                            material = new THREE.LineBasicMaterial();
                        } else if (isPoints) {

                            material = new THREE.PointsMaterial({ size: 1, sizeAttenuation: false });
                        } else {

                            material = new THREE.MeshPhongMaterial();
                        }

                        material.name = sourceMaterial.name;
                    }

                    material.flatShading = sourceMaterial.smooth ? false : true;
                    material.vertexColors = hasVertexColors ? THREE.VertexColors : THREE.NoColors;

                    createdMaterials.push(material);
                }

                // Create mesh

                var mesh;

                if (createdMaterials.length > 1) {

                    for (var mi = 0, miLen = materials.length; mi < miLen; mi++) {

                        var sourceMaterial = materials[mi];
                        buffergeometry.addGroup(sourceMaterial.groupStart, sourceMaterial.groupCount, mi);
                    }

                    if (isLine) {

                        mesh = new THREE.LineSegments(buffergeometry, createdMaterials);
                    } else if (isPoints) {

                        mesh = new THREE.Points(buffergeometry, createdMaterials);
                    } else {

                        mesh = new THREE.Mesh(buffergeometry, createdMaterials);
                    }
                } else {

                    if (isLine) {

                        mesh = new THREE.LineSegments(buffergeometry, createdMaterials[0]);
                    } else if (isPoints) {

                        mesh = new THREE.Points(buffergeometry, createdMaterials[0]);
                    } else {

                        mesh = new THREE.Mesh(buffergeometry, createdMaterials[0]);
                    }
                }

                mesh.name = object.name;

                container.add(mesh);
            }

            console.timeEnd('OBJLoader');

            return container;
        }

    };

    return OBJLoader;
}();
'use strict';

// This THREEx helper makes it easy to handle the mouse events in your 3D scene
//
// * CHANGES NEEDED
//   * handle drag/drop
//   * notify events not object3D - like DOM
//     * so single object with property
//   * DONE bubling implement bubling/capturing
//   * DONE implement event.stopPropagation()
//   * DONE implement event.type = "click" and co
//   * DONE implement event.target
//
// # Lets get started
//
// First you include it in your page
//
// ```<script src='threex.domevent.js'>< /script>```
//
// # use the object oriented api
//
// You bind an event like this
//
// ```mesh.on('click', function(object3d){ ... })```
//
// To unbind an event, just do
//
// ```mesh.off('click', function(object3d){ ... })```
//
// As an alternative, there is another naming closer DOM events.
// Pick the one you like, they are doing the same thing
//
// ```mesh.addEventListener('click', function(object3d){ ... })```
// ```mesh.removeEventListener('click', function(object3d){ ... })```
//
// # Supported Events
//
// Always in a effort to stay close to usual pratices, the events name are the same as in DOM.
// The semantic is the same too.
// Currently, the available events are
// [click, dblclick, mouseup, mousedown](http://www.quirksmode.org/dom/events/click.html),
// [mouseover and mouse out](http://www.quirksmode.org/dom/events/mouseover.html).
//
// # use the standalone api
//
// The object-oriented api modifies THREE.Object3D class.
// It is a global class, so it may be legitimatly considered unclean by some people.
// If this bother you, simply do ```THREEx.DomEvents.noConflict()``` and use the
// standalone API. In fact, the object oriented API is just a thin wrapper
// on top of the standalone API.
//
// First, you instanciate the object
//
// ```var domEvent = new THREEx.DomEvent();```
//
// Then you bind an event like this
//
// ```domEvent.bind(mesh, 'click', function(object3d){ object3d.scale.x *= 2; });```
//
// To unbind an event, just do
//
// ```domEvent.unbind(mesh, 'click', callback);```
//
//
// # Code

//

/** @namespace */
var THREEx = THREEx || {};

// # Constructor
THREEx.DomEvents = function (camera, domElement) {
    this._camera = camera || null;
    this._domElement = domElement || document;
    this._raycaster = new THREE.Raycaster();
    this._selected = null;
    this._boundObjs = {};
    // Bind dom event for mouse and touch
    var _this = this;

    this._$onClick = function () {
        _this._onClick.apply(_this, arguments);
    };
    this._$onDblClick = function () {
        _this._onDblClick.apply(_this, arguments);
    };
    this._$onMouseMove = function () {
        _this._onMouseMove.apply(_this, arguments);
    };
    this._$onMouseDown = function () {
        _this._onMouseDown.apply(_this, arguments);
    };
    this._$onMouseUp = function () {
        _this._onMouseUp.apply(_this, arguments);
    };
    this._$onTouchMove = function () {
        _this._onTouchMove.apply(_this, arguments);
    };
    this._$onTouchStart = function () {
        _this._onTouchStart.apply(_this, arguments);
    };
    this._$onTouchEnd = function () {
        _this._onTouchEnd.apply(_this, arguments);
    };
    this._$onContextmenu = function () {
        _this._onContextmenu.apply(_this, arguments);
    };
    this._domElement.addEventListener('click', this._$onClick, false);
    this._domElement.addEventListener('dblclick', this._$onDblClick, false);
    this._domElement.addEventListener('mousemove', this._$onMouseMove, false);
    this._domElement.addEventListener('mousedown', this._$onMouseDown, false);
    this._domElement.addEventListener('mouseup', this._$onMouseUp, false);
    this._domElement.addEventListener('touchmove', this._$onTouchMove, false);
    this._domElement.addEventListener('touchstart', this._$onTouchStart, false);
    this._domElement.addEventListener('touchend', this._$onTouchEnd, false);
    this._domElement.addEventListener('contextmenu', this._$onContextmenu, false);
};

// # Destructor
THREEx.DomEvents.prototype.destroy = function () {
    // unBind dom event for mouse and touch
    this._domElement.removeEventListener('click', this._$onClick, false);
    this._domElement.removeEventListener('dblclick', this._$onDblClick, false);
    this._domElement.removeEventListener('mousemove', this._$onMouseMove, false);
    this._domElement.removeEventListener('mousedown', this._$onMouseDown, false);
    this._domElement.removeEventListener('mouseup', this._$onMouseUp, false);
    this._domElement.removeEventListener('touchmove', this._$onTouchMove, false);
    this._domElement.removeEventListener('touchstart', this._$onTouchStart, false);
    this._domElement.removeEventListener('touchend', this._$onTouchEnd, false);
    this._domElement.removeEventListener('contextmenu', this._$onContextmenu, false);
};

THREEx.DomEvents.eventNames = ["click", "dblclick", "mouseover", "mouseout", "mousemove", "mousedown", "mouseup", "contextmenu", "touchstart", "touchend"];

THREEx.DomEvents.prototype._getRelativeMouseXY = function (domEvent) {
    var element = domEvent.target || domEvent.srcElement;
    if (element.nodeType === 3) {
        element = element.parentNode; // Safari fix -- see http://www.quirksmode.org/js/events_properties.html
    }

    //get the real position of an element relative to the page starting point (0, 0)
    //credits go to brainjam on answering http://stackoverflow.com/questions/5755312/getting-mouse-position-relative-to-content-area-of-an-element
    var elPosition = { x: 0, y: 0 };
    var tmpElement = element;
    //store padding
    var style = getComputedStyle(tmpElement, null);
    elPosition.y += parseInt(style.getPropertyValue("padding-top"), 10);
    elPosition.x += parseInt(style.getPropertyValue("padding-left"), 10);
    //add positions
    do {
        elPosition.x += tmpElement.offsetLeft;
        elPosition.y += tmpElement.offsetTop;
        style = getComputedStyle(tmpElement, null);

        elPosition.x += parseInt(style.getPropertyValue("border-left-width"), 10);
        elPosition.y += parseInt(style.getPropertyValue("border-top-width"), 10);
    } while (tmpElement = tmpElement.offsetParent);

    var elDimension = {
        width: element === window ? window.innerWidth : element.offsetWidth,
        height: element === window ? window.innerHeight : element.offsetHeight
    };

    return {
        x: +((domEvent.pageX - elPosition.x) / elDimension.width) * 2 - 1,
        y: -((domEvent.pageY - elPosition.y) / elDimension.height) * 2 + 1
    };
};

/********************************************************************************/
/*		domevent context						*/
/********************************************************************************/

// handle domevent context in object3d instance

THREEx.DomEvents.prototype._objectCtxInit = function (object3d) {
    object3d._3xDomEvent = {};
};
THREEx.DomEvents.prototype._objectCtxDeinit = function (object3d) {
    delete object3d._3xDomEvent;
};
THREEx.DomEvents.prototype._objectCtxIsInit = function (object3d) {
    return object3d._3xDomEvent ? true : false;
};
THREEx.DomEvents.prototype._objectCtxGet = function (object3d) {
    return object3d._3xDomEvent;
};

/********************************************************************************/
/*										*/
/********************************************************************************/

/**
 * Getter/Setter for camera
 */
THREEx.DomEvents.prototype.camera = function (value) {
    if (value) this._camera = value;
    return this._camera;
};

THREEx.DomEvents.prototype.bind = function (object3d, eventName, callback, useCapture) {
    console.assert(THREEx.DomEvents.eventNames.indexOf(eventName) !== -1, "not available events:" + eventName);

    if (!this._objectCtxIsInit(object3d)) this._objectCtxInit(object3d);
    var objectCtx = this._objectCtxGet(object3d);
    if (!objectCtx[eventName + 'Handlers']) objectCtx[eventName + 'Handlers'] = [];

    objectCtx[eventName + 'Handlers'].push({
        callback: callback,
        useCapture: useCapture
    });

    // add this object in this._boundObjs
    if (this._boundObjs[eventName] === undefined) {
        this._boundObjs[eventName] = [];
    }
    this._boundObjs[eventName].push(object3d);
};
THREEx.DomEvents.prototype.addEventListener = THREEx.DomEvents.prototype.bind;

THREEx.DomEvents.prototype.unbind = function (object3d, eventName, callback, useCapture) {
    console.assert(THREEx.DomEvents.eventNames.indexOf(eventName) !== -1, "not available events:" + eventName);

    if (!this._objectCtxIsInit(object3d)) this._objectCtxInit(object3d);

    var objectCtx = this._objectCtxGet(object3d);
    if (!objectCtx[eventName + 'Handlers']) objectCtx[eventName + 'Handlers'] = [];

    var handlers = objectCtx[eventName + 'Handlers'];
    for (var i = 0; i < handlers.length; i++) {
        var handler = handlers[i];
        if (callback != handler.callback) continue;
        if (useCapture != handler.useCapture) continue;
        handlers.splice(i, 1);
        break;
    }
    // from this object from this._boundObjs
    var index = this._boundObjs[eventName].indexOf(object3d);
    console.assert(index !== -1);
    this._boundObjs[eventName].splice(index, 1);
};
THREEx.DomEvents.prototype.removeEventListener = THREEx.DomEvents.prototype.unbind;

THREEx.DomEvents.prototype._bound = function (eventName, object3d) {
    var objectCtx = this._objectCtxGet(object3d);
    if (!objectCtx) return false;
    return objectCtx[eventName + 'Handlers'] ? true : false;
};

/********************************************************************************/
/*		onMove								*/
/********************************************************************************/

// # handle mousemove kind of events

THREEx.DomEvents.prototype._onMove = function (eventName, mouseX, mouseY, origDomEvent) {
    //console.log('eventName', eventName, 'boundObjs', this._boundObjs[eventName])
    // get objects bound to this event
    var boundObjs = this._boundObjs[eventName];
    if (boundObjs === undefined || boundObjs.length === 0) return;
    // compute the intersection
    var vector = new THREE.Vector2();

    // update the picking ray with the camera and mouse position
    vector.set(mouseX, mouseY);
    this._raycaster.setFromCamera(vector, this._camera);

    var intersects = this._raycaster.intersectObjects(boundObjs);

    var oldSelected = this._selected;

    if (intersects.length > 0) {
        var notifyOver, notifyOut, notifyMove;
        var intersect = intersects[0];
        var newSelected = intersect.object;
        this._selected = newSelected;
        // if newSelected bound mousemove, notify it
        notifyMove = this._bound('mousemove', newSelected);

        if (oldSelected != newSelected) {
            // if newSelected bound mouseenter, notify it
            notifyOver = this._bound('mouseover', newSelected);
            // if there is a oldSelect and oldSelected bound mouseleave, notify it
            notifyOut = oldSelected && this._bound('mouseout', oldSelected);
        }
    } else {
        // if there is a oldSelect and oldSelected bound mouseleave, notify it
        notifyOut = oldSelected && this._bound('mouseout', oldSelected);
        this._selected = null;
    }

    // notify mouseMove - done at the end with a copy of the list to allow callback to remove handlers
    notifyMove && this._notify('mousemove', newSelected, origDomEvent, intersect);
    // notify mouseEnter - done at the end with a copy of the list to allow callback to remove handlers
    notifyOver && this._notify('mouseover', newSelected, origDomEvent, intersect);
    // notify mouseLeave - done at the end with a copy of the list to allow callback to remove handlers
    notifyOut && this._notify('mouseout', oldSelected, origDomEvent, intersect);
};

/********************************************************************************/
/*		onEvent								*/
/********************************************************************************/

// # handle click kind of events

THREEx.DomEvents.prototype._onEvent = function (eventName, mouseX, mouseY, origDomEvent) {
    //console.log('eventName', eventName, 'boundObjs', this._boundObjs[eventName])
    // get objects bound to this event
    var boundObjs = this._boundObjs[eventName];
    if (boundObjs === undefined || boundObjs.length === 0) return;
    // compute the intersection
    var vector = new THREE.Vector2();

    // update the picking ray with the camera and mouse position
    vector.set(mouseX, mouseY);
    this._raycaster.setFromCamera(vector, this._camera);

    var intersects = this._raycaster.intersectObjects(boundObjs, true);
    // if there are no intersections, return now
    if (intersects.length === 0) return;

    // init some variables
    var intersect = intersects[0];
    var object3d = intersect.object;
    var objectCtx = this._objectCtxGet(object3d);
    var objectParent = object3d.parent;

    while (typeof objectCtx == 'undefined' && objectParent) {
        objectCtx = this._objectCtxGet(objectParent);
        objectParent = objectParent.parent;
    }
    if (!objectCtx) return;

    // notify handlers
    this._notify(eventName, object3d, origDomEvent, intersect);
};

THREEx.DomEvents.prototype._notify = function (eventName, object3d, origDomEvent, intersect) {
    var objectCtx = this._objectCtxGet(object3d);
    var handlers = objectCtx ? objectCtx[eventName + 'Handlers'] : null;

    // parameter check
    console.assert(arguments.length === 4);

    // do bubbling
    if (!objectCtx || !handlers || handlers.length === 0) {
        object3d.parent && this._notify(eventName, object3d.parent, origDomEvent, intersect);
        return;
    }

    // notify all handlers
    var handlers = objectCtx[eventName + 'Handlers'];
    for (var i = 0; i < handlers.length; i++) {
        var handler = handlers[i];
        var toPropagate = true;
        handler.callback({
            type: eventName,
            target: object3d,
            origDomEvent: origDomEvent,
            intersect: intersect,
            stopPropagation: function stopPropagation() {
                toPropagate = false;
            }
        });
        if (!toPropagate) continue;
        // do bubbling
        if (handler.useCapture === false) {
            object3d.parent && this._notify(eventName, object3d.parent, origDomEvent, intersect);
        }
    }
};

/********************************************************************************/
/*		handle mouse events						*/
/********************************************************************************/
// # handle mouse events

THREEx.DomEvents.prototype._onMouseDown = function (event) {
    return this._onMouseEvent('mousedown', event);
};
THREEx.DomEvents.prototype._onMouseUp = function (event) {
    return this._onMouseEvent('mouseup', event);
};

THREEx.DomEvents.prototype._onMouseEvent = function (eventName, domEvent) {
    var mouseCoords = this._getRelativeMouseXY(domEvent);
    this._onEvent(eventName, mouseCoords.x, mouseCoords.y, domEvent);
};

THREEx.DomEvents.prototype._onMouseMove = function (domEvent) {
    var mouseCoords = this._getRelativeMouseXY(domEvent);
    this._onMove('mousemove', mouseCoords.x, mouseCoords.y, domEvent);
    this._onMove('mouseover', mouseCoords.x, mouseCoords.y, domEvent);
    this._onMove('mouseout', mouseCoords.x, mouseCoords.y, domEvent);
};

THREEx.DomEvents.prototype._onClick = function (event) {
    // TODO handle touch ?
    this._onMouseEvent('click', event);
};
THREEx.DomEvents.prototype._onDblClick = function (event) {
    // TODO handle touch ?
    this._onMouseEvent('dblclick', event);
};

THREEx.DomEvents.prototype._onContextmenu = function (event) {
    //TODO don't have a clue about how this should work with touch..
    this._onMouseEvent('contextmenu', event);
};

/********************************************************************************/
/*		handle touch events						*/
/********************************************************************************/
// # handle touch events


THREEx.DomEvents.prototype._onTouchStart = function (event) {
    return this._onTouchEvent('touchstart', event);
};
THREEx.DomEvents.prototype._onTouchEnd = function (event) {
    return this._onTouchEvent('touchend', event);
};

THREEx.DomEvents.prototype._onTouchMove = function (domEvent) {
    if (domEvent.touches.length != 1) return undefined;

    domEvent.preventDefault();

    var mouseX = +(domEvent.touches[0].pageX / window.innerWidth) * 2 - 1;
    var mouseY = -(domEvent.touches[0].pageY / window.innerHeight) * 2 + 1;
    this._onMove('mousemove', mouseX, mouseY, domEvent);
    this._onMove('mouseover', mouseX, mouseY, domEvent);
    this._onMove('mouseout', mouseX, mouseY, domEvent);
};

THREEx.DomEvents.prototype._onTouchEvent = function (eventName, domEvent) {
    if (domEvent.touches.length != 1) return undefined;

    domEvent.preventDefault();

    var mouseX = +(domEvent.touches[0].pageX / window.innerWidth) * 2 - 1;
    var mouseY = -(domEvent.touches[0].pageY / window.innerHeight) * 2 + 1;
    this._onEvent(eventName, mouseX, mouseY, domEvent);
};