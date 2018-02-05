const THREE = require('three');
const glslify = require('glslify');
const PingPongTexture = require('./libs/THREE.PingPongTexture').default;

const Maf = require('./libs/Maf.js');


export default class Particles {
  constructor(renderer) {
    this.renderer = renderer;

    this.initSnow();
    this.initTrail();


  }


  initSnow() {
    var width = 256;
    var height = 256;
    var NUM_POINTS = width * height;

    var params = {
      decay: .1,
      persistence: .1,
      speed: .05,
      spread: 10,
      scale: .03,
      taper: 0,
      opacity: .5
    }


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
        var r = Maf.randomInRange(.5 * radius, radius);
        tmp.set(Maf.randomInRange(-r, r), Maf.randomInRange(-r, r), Maf.randomInRange(-r, r));
        //tmp.normalize().multiplyScalar(r);
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

    var particleGeometry = new THREE.InstancedBufferGeometry();
    particleGeometry.maxInstancedCount = width * height;

    var planeGeometry = new THREE.BufferGeometry().fromGeometry(new THREE.PlaneGeometry(.5, .5));
    particleGeometry.addAttribute('position', new THREE.Float32BufferAttribute(planeGeometry.attributes.position.array, 3));
    particleGeometry.addAttribute('uv', new THREE.Float32BufferAttribute(planeGeometry.attributes.uv.array, 2));
    //particleGeometry.addAttribute( 'position', new THREE.Float32BufferAttribute( new Float32Array([0,-.58,0, .5,.29,0, -.5,.29,0]), 3 ) );
    //particleGeometry.addAttribute( 'uv', new THREE.Float32BufferAttribute( new Float32Array([.5,0, 1,1, 0,1]), 2 ) );
    particleGeometry.addAttribute('offset', new THREE.InstancedBufferAttribute(new Float32Array(pData), 3));

    var snowTexture = new THREE.TextureLoader().load('./assets/snow.png');

    var snowMaterial = new THREE.RawShaderMaterial({
      uniforms: {
        scale: {
          value: params.scale
        },
        dimensions: {
          value: new THREE.Vector2(width, height)
        },
        resolution: {
          value: new THREE.Vector2(0, 0)
        },
        delta: {
          value: 0
        },
        opacity: {
          value: 1.
        },
        color: {
          value: new THREE.Color(0xffffff)
        },
        curPos: {
          value: curPos
        },
        prevPos: {
          value: prevPos
        },
        map: {
          value: snowTexture
        }
      },
      vertexShader: glslify('./glsl/snow.vert'),
      fragmentShader: glslify('./glsl/snow.frag'),
      depthTest: true,
      depthWrite: false,
      transparent: true,
      wireframe: !true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });

    this.snow = new THREE.Mesh(particleGeometry, snowMaterial);
    this.snow.renderOrder = 4;
    this.snow.userData.name = 'Snow';
    this.snow.frustumCulled = false;
    this.snow.position.y = 5;
    this.snow.position.z = 5;


    var snowSimulationShader = new THREE.RawShaderMaterial({
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
          value: params.spread
        },
        decay: {
          value: params.decay
        },
        delta: {
          value: 0
        }
      },
      vertexShader: glslify('./glsl/ortho.vert'),
      fragmentShader: glslify('./glsl/sim.frag'),
    });

    this.snowSimulation = new PingPongTexture(this.renderer, snowSimulationShader, width, height, THREE.RGBAFormat, floatType);

  }


  initTrail() {
    var width = 64;
    var height = 64;

    var NUM_POINTS = width * height;

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
        var r = Maf.randomInRange(.5 * radius, radius);
        tmp.set(Maf.randomInRange(-r, r), Maf.randomInRange(-r, r), Maf.randomInRange(-r, r));
        //tmp.normalize().multiplyScalar(r);
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

    var particleGeometry = new THREE.InstancedBufferGeometry();
    particleGeometry.maxInstancedCount = width * height;

    particleGeometry.addAttribute('position', new THREE.Float32BufferAttribute(new Float32Array([0, -.58, 0, .5, .29, 0, -.5, .29, 0]), 3));
    particleGeometry.addAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array([.5, 0, 1, 1, 0, 1]), 2));
    particleGeometry.addAttribute('offset', new THREE.InstancedBufferAttribute(new Float32Array(pData), 3));

    var trailMaterial = new THREE.RawShaderMaterial({
      uniforms: {
        scale: {
          value: .05
        },
        dimensions: {
          value: new THREE.Vector2(width, height)
        },
        resolution: {
          value: new THREE.Vector2(0, 0)
        },
        delta: {
          value: 0
        },
        opacity: {
          value: .5
        },
        color: {
          value: new THREE.Color(0xff00ff)
        },
        curPos: {
          value: curPos
        },
        prevPos: {
          value: prevPos
        },
      },
      vertexShader: glslify('./glsl/trail.vert'),
      fragmentShader: glslify('./glsl/trail.frag'),
      depthTest: true,
      depthWrite: false,
      transparent: true,
      wireframe: !true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });

    this.trail = new THREE.Mesh(particleGeometry, trailMaterial);
    this.trail.frustumCulled = false;
    this.trail.renderOrder = 5;
    this.trail.userData.name = 'Trail';

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
          value: .5
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



  render(trackTime, t, delta, percent, snowValues, sphereSnowValues,trailColor,trailPosition,trailValues) {

    this.snowSimulation.shader.uniforms.persistence.value = snowValues.persistence;
    this.snowSimulation.shader.uniforms.speed.value = snowValues.speed;
    this.snow.material.uniforms.delta.value = snowValues.delta;
    this.snow.material.uniforms.opacity.value = snowValues.opacity;

    if (sphereSnowValues.speed) {
      this.snowSimulation.shader.uniforms.persistence.value = sphereSnowValues.persistence;
      this.snowSimulation.shader.uniforms.speed.value = sphereSnowValues.speed;
      this.snow.material.uniforms.delta.value = sphereSnowValues.delta;
      this.snow.material.uniforms.opacity.value = sphereSnowValues.opacity;
    }
    // this.snowSimulation.shader.uniforms.decay.value = params.decay;
    // this.snowSimulation.shader.uniforms.spread.value = params.spread;
    this.snowSimulation.shader.uniforms.time.value = t;
    this.snowSimulation.shader.uniforms.delta.value = delta / (1 / 60.);
    this.snowSimulation.render();
    this.snow.material.uniforms.curPos.value = this.snowSimulation.front.texture;
    this.snow.material.uniforms.prevPos.value = this.snowSimulation.back.texture;


    this.snow.geometry.setDrawRange(0, Math.floor(this.snow.geometry.maxInstancedCount * percent));
    // this.snow.material.uniforms.scale.value = params.scale;


    ////////////////////////////////////
    if (trackTime < 20) {
      this.trail.position.z = -10;
    } else {
      this.trail.position.z = 0;
    }

    this.trail.material.uniforms.color.value.setHex(trailColor);

    this.trailSimulation.shader.uniforms.persistence.value = 1.;
    this.trailSimulation.shader.uniforms.speed.value = .01;
    this.trailSimulation.shader.uniforms.decay.value = 1.;
    this.trailSimulation.shader.uniforms.spread.value = .1;
    this.trailSimulation.shader.uniforms.time.value = t;
    this.trailSimulation.shader.uniforms.delta.value = delta / ( 1 / 60. );
    this.trailSimulation.shader.uniforms.spawn.value.copy(trailPosition);

    this.trailSimulation.shader.uniforms.persistence.value = this.snowSimulation.shader.uniforms.persistence.value;
    this.trailSimulation.shader.uniforms.speed.value = this.snowSimulation.shader.uniforms.speed.value;
    // this.trailSimulation.shader.uniforms.decay.value = this.snowSimulation.shader.uniforms.decay.value;

    this.trailSimulation.render();
    this.trail.material.uniforms.curPos.value = this.trailSimulation.front.texture;
    this.trail.material.uniforms.prevPos.value = this.trailSimulation.back.texture;

    this.trail.material.uniforms.opacity.value = trailValues.opacity;
    this.trail.material.uniforms.scale.value = trailValues.scale;


  }
}