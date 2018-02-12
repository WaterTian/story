const THREE = require('three');
const glslify = require('glslify');

const PingPongTexture = require('./libs/THREE.PingPongTexture').default;
const Maf = require('./libs/Maf.js');


export default class Box {
  constructor(renderer, scene) {

    var That = this;

    this.renderer = renderer;
    this.scene = scene;

    this.position = new THREE.Vector3(0, 1.1, 0);
    this.obj = new THREE.Object3D();

    this.obj.renderOrder = 6;
    this.obj.userData.name = 'Box';

    var joyMap = new THREE.TextureLoader().load('./assets/joy.png');
    this.Material = new THREE.MeshLambertMaterial({
      map: joyMap
    });
    //light
    var ambient = new THREE.AmbientLight(0x888888, 1);
    this.scene.add(ambient);
    var dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(1, 1.75, 1);
    this.scene.add(dirLight);

    // this.Material = new THREE.RawShaderMaterial({
    //   uniforms: {
    //     map: {
    //       value: boxMap
    //     },
    //     color: {
    //       value: new THREE.Color(0xffea3b)
    //     }
    //   },
    //   vertexShader: glslify('./glsl/light.vert'),
    //   fragmentShader: glslify('./glsl/light.frag'),
    // });


    var loader = new THREE.ObjectLoader();
    loader.load('./assets/joy.json', function(object) {
      var boxGeometry = object.children[0].geometry;
      That.mesh = new THREE.Mesh(boxGeometry, That.Material);
      That.obj.add(That.mesh);
      That.obj.scale.set(.7, .7, .7);
    });


    this.initTrail();

  }

  joyScale(s)
  {
    this.obj.scale.set(s, s, s);
  }



  initTrail() {
    var width = 64;
    var height = 64;

    var NUM_POINTS = width * height;


    this.tmpVector = new THREE.Vector3();
    this.tmpMatrix = new THREE.Matrix4();



    var s = 10;
    var shadowMapSize = 512;
    this.shadowCamera = new THREE.OrthographicCamera(-s, s, s, -s, .01, 20);
    this.shadowCamera.position.set(6, 8, 5);
    this.shadowCamera.lookAt(this.scene.position);
    this.shadowBuffer = new THREE.WebGLRenderTarget(shadowMapSize, shadowMapSize, {
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
      format: THREE.RGBAFormat,
      type: floatType,
      //minFilter: THREE.LinearMipMapLinearFilter,
      //magFilter: THREE.LinearMipMapLinearFilter,
      stencilBuffer: false,
      depthBuffer: true
    });
    // var sceneCameraHelp1 = new THREE.CameraHelper(this.shadowCamera);
    // this.scene.add(sceneCameraHelp1);


    var positions = new THREE.WebGLRenderTarget(1, 1, {
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: floatType,
      stencilBuffer: false,
      depthBuffer: false,
      generateMipmaps: false
    });
    positions.setSize(width, height);

    var cur = new Float32Array(width * height * 4);
    var prev = new Float32Array(width * height * 4);

    var ptr = 0;
    var radius = 1;
    var tmp = new THREE.Vector3();
    for (var y = 0; y < height; y++) {
      for (var x = 0; x < width; x++) {
        var r = Maf.randomInRange(.2 * radius, radius);
        tmp.set(Maf.randomInRange(-r, r), Maf.randomInRange(-r, r), Maf.randomInRange(-r, r));
        tmp.normalize().multiplyScalar(r);
        cur[ptr + 0] = tmp.x;
        cur[ptr + 1] = tmp.y;
        cur[ptr + 2] = tmp.z;
        cur[ptr + 3] = Math.random() * 100;
        prev[ptr + 0] = tmp.x;
        prev[ptr + 1] = tmp.y;
        prev[ptr + 2] = tmp.z;
        prev[ptr + 3] = cur[ptr + 3];
        ptr += 4;
      }
    }

    ///must be THREE.FloatType
    var curPos = new THREE.DataTexture(cur, width, height, THREE.RGBAFormat, THREE.FloatType);
    var prevPos = new THREE.DataTexture(prev, width, height, THREE.RGBAFormat, THREE.FloatType);
    curPos.needsUpdate = true;
    prevPos.needsUpdate = true;

    var pData = [];
    for (var j = 0; j < NUM_POINTS; j++) {
      pData.push(j);
      pData.push(0);
      pData.push(0);
    }

    // var particleGeometry = new THREE.InstancedBufferGeometry();
    // particleGeometry.maxInstancedCount = width * height;
    // particleGeometry.addAttribute('position', new THREE.Float32BufferAttribute(new Float32Array([0, -.58, 0, .5, .29, 0, -.5, .29, 0]), 3));
    // particleGeometry.addAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array([.5, 0, 1, 1, 0, 1]), 2));
    // particleGeometry.addAttribute('offset', new THREE.InstancedBufferAttribute(new Float32Array(pData), 3));

    var lookup = [];
    for (var y = 0; y < height; y++) {
      for (var x = 0; x < width; x++) {
        lookup.push(x / width);
        lookup.push(y / height);
      }
    }

    // cell
    var bufferGeometry = new THREE.BoxBufferGeometry(.6, .8, 1);
    var geometry = new THREE.InstancedBufferGeometry();
    geometry.index = bufferGeometry.index;
    geometry.attributes.position = bufferGeometry.attributes.position;
    geometry.attributes.uv = bufferGeometry.attributes.uv;
    geometry.attributes.normal = bufferGeometry.attributes.normal;
    geometry.addAttribute('lookup', new THREE.InstancedBufferAttribute(new Float32Array(lookup), 2));

    var box2Map = new THREE.TextureLoader().load('./assets/box2.png');


    var trailMaterial = new THREE.RawShaderMaterial({
      uniforms: {
        map: {
          value: box2Map
        },
        scale: {
          type: 'v3',
          value: new THREE.Vector3(.1, .1, .1)
        },
        squashiness: {
          type: 'f',
          value: 0
        },
        curPos: {
          value: curPos
        },
        prevPos: {
          value: prevPos
        },
        resolution: {
          value: new THREE.Vector2(width, height)
        },
        depthTexture: {
          type: 't',
          value: null
        },
        lightPosition: {
          value: this.shadowCamera.position
        },
        shadowMVP: {
          type: 'm4',
          value: new THREE.Matrix4()
        },
        shadowV: {
          type: 'm4',
          value: new THREE.Matrix4()
        },
        shadowP: {
          type: 'm4',
          value: new THREE.Matrix4()
        },
        shadow: {
          float: 't',
          value: 0
        },
      },
      vertexShader: glslify('./glsl/box.vert'),
      fragmentShader: glslify('./glsl/box.frag'),
      depthTest: true,
      // side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });

    this.trail = new THREE.Mesh(geometry, trailMaterial);
    this.trail.frustumCulled = false;
    this.trail.renderOrder = 5;
    this.trail.userData.name = 'Trail';
    this.trail.position.z =.5;

    var trailShader = new THREE.RawShaderMaterial({
      uniforms: {
        source: {
          value: null
        },
        seed: {
          value: curPos
        },
        resolution: {
          value: new THREE.Vector2(width, height)
        },
        time: {
          value: 0
        },
        persistence: {
          value: .5
        },
        speed: {
          value: .5
        },
        spread: {
          value: .5
        },
        decay: {
          value: .1
        },
        delta: {
          value: 0
        },
        spawn: {
          value: new THREE.Vector3()
        }
      },
      vertexShader: glslify('./glsl/ortho.vert'),
      fragmentShader: glslify('./glsl/sim2.frag'),
    });

    this.trailSimulation = new PingPongTexture(this.renderer, trailShader, width, height, THREE.RGBAFormat, floatType);

  }

  renderTrail(t, delta) {

    this.trailSimulation.shader.uniforms.persistence.value = 1.;
    this.trailSimulation.shader.uniforms.speed.value = .004;
    this.trailSimulation.shader.uniforms.decay.value = .2;
    this.trailSimulation.shader.uniforms.spread.value = .6;
    this.trailSimulation.shader.uniforms.time.value = t;
    this.trailSimulation.shader.uniforms.delta.value = delta / (1 / 60.);
    this.trailSimulation.shader.uniforms.spawn.value.lerp(this.position, 0.3);

    // this.trailSimulation.shader.uniforms.persistence.value = this.snowSimulation.shader.uniforms.persistence.value;
    // this.trailSimulation.shader.uniforms.speed.value = this.snowSimulation.shader.uniforms.speed.value;

    this.trailSimulation.render();
    this.trail.material.uniforms.curPos.value = this.trailSimulation.front.texture;
    this.trail.material.uniforms.prevPos.value = this.trailSimulation.back.texture;

    // this.shadowCamera.position.copy(this.position);

    this.trail.material.uniforms.depthTexture.value = null;
    this.trail.material.uniforms.shadow.value = true;
    this.renderer.render(this.scene, this.shadowCamera, this.shadowBuffer);
    this.trail.material.uniforms.depthTexture.value = this.shadowBuffer.texture;
    this.trail.material.uniforms.shadow.value = false;


    this.tmpVector.copy(this.scene.position);
    this.tmpVector.sub(this.shadowCamera.position);
    this.tmpVector.normalize();
    this.tmpMatrix.copy(this.shadowCamera.projectionMatrix);
    this.tmpMatrix.multiply(this.trail.matrixWorld);
    this.tmpMatrix.multiply(this.shadowCamera.matrixWorldInverse);
    this.trail.material.uniforms.shadowMVP.value.copy(this.tmpMatrix);
    this.trail.material.uniforms.shadowP.value.copy(this.shadowCamera.projectionMatrix);
    this.trail.material.uniforms.shadowV.value.copy(this.shadowCamera.matrixWorldInverse);

  }


  render(trackTime, toPosition) {

    if (toPosition && trackTime > 18) {

      this.position.lerp(toPosition, 0.1);
      this.obj.lookAt(this.position);

    }

    this.obj.position.copy(this.position);

  }
}