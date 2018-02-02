const THREE = require('three');
const glslify = require('glslify');
const TweenMax = require('gsap');
const OrbitControls = require('three-orbit-controls')(THREE);
const Stats = require('stats.js');
const dat = require('dat-gui');
const VConsole = require('vconsole');


const isMobile = require('./libs/isMobile.min.js');
const FBOHelper = require('./libs/THREE.FBOHelper');
const Bloom = require('./libs/THREE.Bloom').default;
const ShaderTexture = require('./libs/THREE.ShaderTexture').default;

const TimeLine = require('./TimeLine').default;
const Ground = require('./Ground').default;
const Backdrop = require('./Backdrop').default;
const Particles = require('./Particles').default;

window.floatType = isMobile.any ? THREE.HalfFloatType : THREE.FloatType;


var That;

var fxaaTexture, finalTexture;
var baseFBO;
var bloom;
var resolution = new THREE.Vector2();

var dummy;
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var intersectionPlane;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;


var track = new Audio();
var globalSpeed = .6;
var lastTrackTime = 0;
var t = 0;
var lastTime = 0;

var timeLine = new TimeLine();

export default class Scene {
	constructor() {
		That = this;
		this.init();
	}

	init() {
		this.stats = new Stats();
		document.body.appendChild(this.stats.dom);

		this.vconsole = new VConsole();

		this.camera;
		this.scene;


		this.scene = new THREE.Scene();

		this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, .001, 100);
		this.camera.target = new THREE.Vector3(0, 0, 0);
		this.camera.position.set(0, 4, -10);
		this.camera.lookAt(this.camera.target);
		this.scene.add(this.camera);

		this.renderer = new THREE.WebGLRenderer({
			antialias: true,
			premultipliedAlpha: false
		});
		this.renderer.setClearColor(0x0);
		// this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.sortObjects = true;
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFShadowMap;

		this.container = document.getElementById('webglContainer');
		this.container.appendChild(this.renderer.domElement);

		// controls
		this.controls = new OrbitControls(this.camera, this.renderer.domElement);
		this.controls.update();

		this.helper = new FBOHelper(this.renderer);

		window.addEventListener('resize', this.onWindowResized);
		window.addEventListener('mousemove', this.onDocumentMouseMove);


		this.initScene();
		this.animate();
		this.onWindowResized();
	}


	onDocumentMouseMove(event) {
		mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
	}
	onWindowResized(event) {
		var w = window.innerWidth;
		var h = window.innerHeight;
		windowHalfX = w / 2;
		windowHalfY = h / 2;

		That.renderer.setSize(w, h);
		That.camera.aspect = w / h;
		That.camera.updateProjectionMatrix();

		var dPR = .5 * window.devicePixelRatio;
		bloom.setSize(w * dPR, h * dPR);
		resolution.set(w * dPR, h * dPR);
		baseFBO.setSize(w * dPR, h * dPR);
		fxaaTexture.setSize(w * dPR, h * dPR);
		finalTexture.setSize(w * dPR, h * dPR);
	}


	initScene() {
		document.getElementById('loading').style.display = 'none';

		//sound
		track.src = 'assets/80sxmasexperiments3.mp3';
		track.controls = false;
		this.container.appendChild(track);
		var startDiv = document.getElementById('start');
		startDiv.style.display = 'block';
		startDiv.addEventListener('click', startPlaying);

		function startPlaying() {
			startDiv.removeEventListener('click', startPlaying);
			startDiv.style.display = 'none';
			track.play();
			track.volume = 0.1;
		}
		startPlaying();



		That.backdrop = new Backdrop();
		That.scene.add(That.backdrop.backdrop);

		That.ground = new Ground(this.renderer, this.helper);
		That.scene.add(That.ground.obj);

		That.particles = new Particles(this.renderer);
		That.scene.add(That.particles.snow);



		dummy = new THREE.Mesh(
			new THREE.IcosahedronBufferGeometry(.5, 3),
			new THREE.RawShaderMaterial({
				uniforms: {
					color: {
						value: new THREE.Color(0xffea3b)
					}
				},
				vertexShader: glslify('./glsl/light.vert'),
				fragmentShader: glslify('./glsl/light.frag'),
			})
		);
		dummy.position.y = 1.1;
		dummy.scale.set(.1, .1, .1);
		dummy.renderOrder = 6;
		dummy.userData.name = 'Dummy';
		That.scene.add(dummy);

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
		var trackTime = track.currentTime;
		t += globalSpeed * (trackTime - lastTrackTime);
		var delta = t - lastTime;
		var percent = trackTime / track.duration;


		var renderCamera = this.camera;
		renderCamera.updateMatrix();
		renderCamera.updateMatrixWorld();

		raycaster.setFromCamera(mouse, renderCamera);
		intersectionPlane.lookAt(renderCamera.position);
		var intersects = raycaster.intersectObject(intersectionPlane);

		if (intersects.length && trackTime > 20) {
			dummy.position.copy(intersects[0].point);
			dummy.position.y = Math.max(dummy.position.y, 1);
		}


		var skyColor = timeLine.getValues(timeLine.skyColorScript, trackTime);
		var clearColor = Math.round(skyColor.r) * 256 * 256 + Math.round(skyColor.g) * 256 + Math.round(skyColor.b);
		this.renderer.setClearColor(clearColor, 1.);
		var trailColor = timeLine.getValues(timeLine.trailColorScript, trackTime);

		var backdropValues = timeLine.getValues(timeLine.backdropScript, trackTime);


		if (this.stats) this.stats.update();
		if (this.helper) this.helper.update();

		if (this.backdrop) this.backdrop.render(t, backdropValues);
		if (this.ground) this.ground.render(this.renderer, t, dummy.position, skyColor, trailColor);
		if (this.particles) this.particles.render(t, delta, percent);



		this.renderer.render(this.scene, renderCamera, baseFBO);


		finalTexture.shader.uniforms.overall.value = 1;
		bloom.render(this.renderer);
		fxaaTexture.render();
		finalTexture.shader.uniforms.inputTexture.value = fxaaTexture.fbo.texture;
		finalTexture.render(true);


		lastTime = t;
		lastTrackTime = trackTime;
	}

	// setBackgroundColor(r, g, b) {
	// 	var c = Math.round(r) * 256 * 256 + Math.round(g) * 256 + Math.round(b);
	// 	this.renderer.setClearColor(c, 1.);
	// 	plane.material.uniforms.backgroundColor.value.setHex(c);
	// 	sphereMaterial.uniforms.backgroundColor.value.setHex(c);
	// }

}