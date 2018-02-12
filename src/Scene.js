const THREE = require('three');
const glslify = require('glslify');
const TweenMax = require('gsap');
const OrbitControls = require('three-orbit-controls')(THREE);
const Stats = require('stats.js');
const dat = require('dat-gui');
const VConsole = require('vconsole');

const Tone = require('tone');


const isMobile = require('./libs/isMobile.min.js');
const Bloom = require('./libs/THREE.Bloom').default;
const ShaderTexture = require('./libs/THREE.ShaderTexture').default;

const TimeLine = require('./TimeLine').default;
const Ground = require('./Ground').default;
const Backdrop = require('./Backdrop').default;
const Particles = require('./Particles').default;
const Spheres = require('./Spheres').default;
const TitleCard = require('./TitleCard').default;
const City = require('./City').default;

const Box = require('./Box').default;

window.floatType = isMobile.any ? THREE.HalfFloatType : THREE.FloatType;

var That;

var container = document.getElementById('webglContainer');

var fxaaTexture, finalTexture;
var baseFBO;
var bloom;
var resolution = new THREE.Vector2(0, 0);

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2(0, 0);
var intersectionPlane;

var orientation = new THREE.Vector2(0, 0);

var loadingAudio;
var startAudio;
var soundPlayer;
var toneMeter;
var soundPanVol;

var startTime = 0; //debug for player

var globalSpeed = .6;
var lastTrackTime = 0;
var t = 0;
var lastTime = 0;

var svgLine = document.getElementById('soundSVG');


var endDiv;
var logoDiv;
var loadingDiv;

var timeLine = new TimeLine();

export default class Scene {
	constructor() {
		That = this;
		logoDiv = document.getElementById('logo');
		endDiv = document.getElementById('end');
		loadingDiv = document.getElementById('loading');

		logoDiv.addEventListener('touchmove', EventPreventDefault);
		endDiv.addEventListener('touchmove', EventPreventDefault);
		loadingDiv.addEventListener('touchmove', EventPreventDefault);
		svgLine.addEventListener('touchmove', EventPreventDefault);


		function EventPreventDefault(event) {
			event.preventDefault();
		}



		// // this.vconsole = new VConsole();
		// this.stats = new Stats();
		// document.body.appendChild(this.stats.dom);

		this.loadSound();

	}


	loadSound() {

		soundPlayer = new Tone.Player("./assets/bg2.mp3", this.initStart);

		soundPanVol = new Tone.PanVol(0, -5);
		soundPlayer.connect(soundPanVol);
		soundPanVol.toMaster();

		// toneMeter = new Tone.Meter();
		toneMeter = new Tone.Waveform(64);
		soundPlayer.connect(toneMeter);
		toneMeter.toMaster();


		startAudio = new Audio();
		startAudio.controls = false;
		container.appendChild(startAudio);
		startAudio.src = "./assets/start_btn.mp3";

		loadingAudio = new Audio();
		loadingAudio.controls = false;
		loadingAudio.loop = true;
		container.appendChild(loadingAudio);
		loadingAudio.src = "./assets/bg1.mp3";
		loadingAudio.play();

		document.getElementById('svgCanvas').addEventListener('click', function() {
			loadingAudio.play();
		});
	}

	initStart() {

		loadingOut();
		var startDiv = document.getElementById('svgCanvas');
		startDiv.addEventListener('click', startPlaying);

		That.init();


		function startPlaying() {
			startDiv.setAttribute('class', 'loadingOut');
			setTimeout(function() {
				loadingDiv.style.display = "none";
				clearInterval(window.siv);
			}, 1000);

			startAudio.play();
			soundPlayer.start();
			startTime = soundPlayer.now();
			console.log(soundPlayer);
			console.log(soundPlayer.now());
			console.log(soundPlayer.buffer.duration);

			That.animate();
		}
	}

	init() {

		container = document.getElementById('webglContainer');

		this.camera;
		this.scene;

		this.scene = new THREE.Scene();

		this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, .001, 1000);
		this.camera.target = new THREE.Vector3(0, 0, 0);
		this.camera.position.set(0, 4, -10);
		this.camera.lookAt(this.camera.target);
		// this.scene.add(this.camera);

		this.renderer = new THREE.WebGLRenderer({
			antialias: true,
			premultipliedAlpha: false
		});
		this.renderer.setClearColor(0x0);
		this.renderer.setPixelRatio(window.devicePixelRatio);
		// this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.sortObjects = true;
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFShadowMap;


		container.appendChild(this.renderer.domElement);


		// // controls
		// this.controls = new OrbitControls(this.camera, this.renderer.domElement);
		// this.controls.update();


		window.addEventListener('resize', this.onWindowResized);
		window.addEventListener('mousemove', this.onDocumentMouseMove);
		this.renderer.domElement.addEventListener('touchmove', this.onDocumentTouchMove);
		if (window.DeviceOrientationEvent) {
			window.addEventListener("deviceorientation", this.onOrientation);
		}


		this.initScene();
		this.onWindowResized();

	}



	onDocumentMouseMove(event) {
		mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
	}
	onDocumentTouchMove(event) {
		event.preventDefault();
		event.stopPropagation();
		mouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
		mouse.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
	}
	onWindowResized() {
		var w = container.clientWidth;
		var h = container.clientHeight;

		That.renderer.setSize(w, h);

		That.camera.aspect = w / h;
		That.camera.updateProjectionMatrix();

		var dPR = window.devicePixelRatio * 0.5;
		bloom.setSize(w * dPR, h * dPR);
		resolution.set(w * dPR, h * dPR);
		baseFBO.setSize(w * dPR, h * dPR);
		fxaaTexture.setSize(w * dPR, h * dPR);
		finalTexture.setSize(w * dPR, h * dPR);

		That.particles.snow.material.uniforms.resolution.value.set(w, h);
		That.particles.trail.material.uniforms.resolution.value.set(w, h);
	}
	onOrientation(event) {
		var _z = event.alpha; //表示设备沿z轴上的旋转角度，范围为0~360。(z轴垂直于平面)
		var _x = event.beta; //表示设备在x轴上的旋转角度，范围为-180~180。它描述的是设备由前向后旋转的情况。
		var _y = event.gamma; //表示设备在y轴上的旋转角度，范围为-90~90。它描述的是设备由左向右旋转的情况。

		var _ox = (_y / 90);
		var _oy = (_x / 180);

		orientation.x = _ox;
		orientation.y = _oy;
	}


	initScene() {

		That.titleCard = new TitleCard();
		That.scene.add(That.titleCard.obj);

		That.backdrop = new Backdrop();
		That.scene.add(That.backdrop.backdrop);

		That.ground = new Ground(this.renderer);
		That.scene.add(That.ground.obj);

		That.particles = new Particles(this.renderer);
		That.scene.add(That.particles.snow);
		That.scene.add(That.particles.trail);

		That.spheres = new Spheres(globalSpeed);
		That.scene.add(That.spheres.sphereGroup);

		That.city = new City(globalSpeed);
		That.scene.add(That.city.cityGroup);

		That.box = new Box(this.renderer, this.scene);
		That.scene.add(That.box.obj);
		That.scene.add(That.box.trail);


		baseFBO = new THREE.WebGLRenderTarget(1, 1, {
			wrapS: THREE.ClampToEdgeWrapping,
			wrapT: THREE.ClampToEdgeWrapping,
			format: THREE.RGBAFormat,
			type: floatType,
			minFilter: THREE.LinearFilter,
			magFilter: THREE.LinearFilter,
			stencilBuffer: false,
			depthBuffer: true
		});
		baseFBO.generateMipMaps = false;
		baseFBO.flipY = true;

		bloom = new Bloom(5, baseFBO);

		var fxaaShader = new THREE.RawShaderMaterial({
			uniforms: {
				inputTexture: {
					value: bloom.fbo.texture
				},
				resolution: {
					value: resolution
				},
			},
			vertexShader: glslify('./glsl/ortho.vert'),
			fragmentShader: glslify('./glsl/fxaa.frag'),
		});
		fxaaTexture = new ShaderTexture(That.renderer, fxaaShader, 1, 1, null, null, THREE.NearestFilter, null, THREE.ClampToEdgeWrapping, THREE.ClampToEdgeWrapping);
		fxaaTexture.fbo.generateMipMaps = false;

		var finalShader = new THREE.RawShaderMaterial({
			uniforms: {
				inputTexture: {
					value: bloom.fbo.texture
				},
				resolution: {
					value: resolution
				},
				overall: {
					value: 0
				},
				boost: {
					value: 1.1
				},
				reduction: {
					value: 1.1
				},
				amount: {
					value: .1
				},
				time: {
					value: 0
				},
			},
			vertexShader: glslify('./glsl/ortho.vert'),
			fragmentShader: glslify('./glsl/final.frag'),
		});

		finalTexture = new ShaderTexture(this.renderer, finalShader, 1, 1, null, null, THREE.NearestFilter, null, THREE.ClampToEdgeWrapping, THREE.ClampToEdgeWrapping)
		finalTexture.fbo.generateMipMaps = false;


		intersectionPlane = new THREE.Mesh(new THREE.PlaneGeometry(10000, 10000), new THREE.MeshNormalMaterial({
			side: THREE.DoubleSide,
			visible: true
		}));
		intersectionPlane.material.visible = false;
		intersectionPlane.userData.name = 'Intersection Plane';
		That.scene.add(intersectionPlane);

	}

	animate() {
		requestAnimationFrame(this.animate.bind(this));

		this.render();
	}

	// main animation loop
	render() {
		var trackTime = soundPlayer.now() - startTime + 0;
		t += globalSpeed * (trackTime - lastTrackTime);
		var delta = t - lastTime;
		var percent = trackTime / soundPlayer.buffer.duration;

		soundPanVol.pan.value = mouse.x;


		// console.log(trackTime);



		if (trackTime > 123) {
			endDiv.style.display = 'block';
			var a = (trackTime - 123);
			if (a > 1) a = 1;
			endDiv.style.opacity = a;
		}


		var renderCamera = this.camera;

		if (!this.controls) {
			var cameraValues = timeLine.getValues(timeLine.cameraScript, trackTime);

			if (trackTime > 18) {
				cameraValues.tx += -mouse.x;
				cameraValues.ty += mouse.y;
			}

			var targetPosition = new THREE.Vector3(cameraValues.x + cameraValues.tx, cameraValues.y + cameraValues.ty, cameraValues.z + cameraValues.tz);
			renderCamera.target.lerp(targetPosition, .1);

			renderCamera.position.set(cameraValues.x, cameraValues.y, cameraValues.z);
			renderCamera.lookAt(renderCamera.target);
			renderCamera.updateMatrix();
			renderCamera.updateMatrixWorld();
		}



		raycaster.setFromCamera(mouse, renderCamera);
		intersectionPlane.lookAt(renderCamera.position);
		var intersects = raycaster.intersectObject(intersectionPlane);
		if (intersects.length) var boxPostion = intersects[0].point;



		var skyColor = timeLine.getValues(timeLine.skyColorScript, trackTime);
		var backgroundColor = Math.round(skyColor.r) * 256 * 256 + Math.round(skyColor.g) * 256 + Math.round(skyColor.b);
		this.renderer.setClearColor(backgroundColor, 1.);

		var trailColor = timeLine.getValues(timeLine.trailColorScript, trackTime);
		var _trailColor = Math.round(trailColor.r) * 256 * 256 + Math.round(trailColor.g) * 256 + Math.round(trailColor.b);

		var backdropValues = timeLine.getValues(timeLine.backdropScript, trackTime);
		var snowValues = timeLine.getValues(timeLine.snowScript, trackTime);
		var titleValues = timeLine.getValues(timeLine.titleScript, trackTime);
		var trailValues = timeLine.getValues(timeLine.trailScript, trackTime);



		var soundValue = toneMeter.getValue();
		// console.log(soundValue);

		var path;
		for (var i = 0; i < 64; i++) {
			var _y = soundValue[i] * 20 + 32;
			if (i == 0) path = "M0 " + _y;
			path += "L" + i + " ";
			path += _y + " ";
		}
		svgLine.setAttribute('d', path);


		if (soundValue[0] > 1) {
			this.city.flash(soundValue[0]);
		}



		if (this.stats) this.stats.update();

		this.box.render(trackTime, boxPostion, this.ground);
		if (trackTime > 62) {
			this.box.renderTrail(t, delta);
		}

		this.backdrop.render(t, backdropValues, this.ground, this.spheres);
		this.ground.render(trackTime, this.renderer, t, That.box.position, backgroundColor, _trailColor, this.spheres);
		this.particles.render(trackTime, t, delta, percent, snowValues, this.spheres.sphereSnowValues, _trailColor, That.box.position, trailValues);
		this.spheres.render(trackTime, t, backgroundColor);
		this.city.render(trackTime, t, backgroundColor);
		this.titleCard.render(renderCamera, titleValues);



		if (this.box.position.y < 0) {
			this.ground.setAlpha(1 + this.box.position.y);
			this.city.setAlpha(1 + this.box.position.y);
		} else {
			this.city.setAlpha(1);
		}


		this.renderer.render(this.scene, renderCamera, baseFBO);

		bloom.render(this.renderer);

		var finalValues = timeLine.getValues(timeLine.lightScript, trackTime);
		finalTexture.shader.uniforms.overall.value = finalValues.overall;
		fxaaTexture.render();
		finalTexture.shader.uniforms.inputTexture.value = fxaaTexture.fbo.texture;
		finalTexture.render(true);


		lastTime = t;
		lastTrackTime = trackTime;
	}


}