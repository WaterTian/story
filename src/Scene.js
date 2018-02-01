const THREE = require('three');
const glslify = require('glslify');
const TweenMax = require('gsap');
const OrbitControls = require('three-orbit-controls')(THREE);
const Stats = require('stats.js');
const dat = require('dat-gui');

const FBOHelper = require('./THREE.FBOHelper');
const Bloom = require('./THREE.Bloom').default;
const ShaderTexture = require('./THREE.ShaderTexture').default;

const Ground = require('./Ground').default;
const Backdrop = require('./Backdrop').default;



var That;
var clock = new THREE.Clock();

var track = new Audio();

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

export default class Scene {
	constructor() {
		That = this;
		this.init();
	}

	init() {
		this.stats = new Stats();
		document.body.appendChild(this.stats.dom);

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
		clock.start();
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
			// track.play();
		}
		startPlaying();



		That.backdrop = new Backdrop();
		That.scene.add(That.backdrop.obj);

		That.ground = new Ground(this.renderer, this.helper);
		That.scene.add(That.ground.obj);


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
			type: THREE.FloatType,
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

		let deltaTime = clock.getDelta();
		this.render(deltaTime);
	}


	// main animation loop
	render(dt) {
		var trackTime = track.currentTime;

		var renderCamera = this.camera;
		renderCamera.updateMatrix();
		renderCamera.updateMatrixWorld();

		raycaster.setFromCamera(mouse, renderCamera);
		intersectionPlane.lookAt(renderCamera.position);
		var intersects = raycaster.intersectObject(intersectionPlane);

		if (intersects.length) {
			dummy.position.copy(intersects[0].point);
			dummy.position.y = Math.max(dummy.position.y, 1);
		}

		

		if (this.stats) this.stats.update();
		if (this.helper) this.helper.update();

		if (this.backdrop) this.backdrop.render(dt);
		if (this.ground) this.ground.render(this.renderer, 0 ,dummy.position);







		this.renderer.render(this.scene, renderCamera, baseFBO);


		finalTexture.shader.uniforms.overall.value = 1;

		bloom.render(this.renderer);
		fxaaTexture.render();
		finalTexture.shader.uniforms.inputTexture.value = fxaaTexture.fbo.texture;
		finalTexture.render(true);
	}



}