const THREE = require('three');
const glslify = require('glslify');
const ShaderTexture = require('./libs/THREE.ShaderTexture').default;

const Maf = require('./libs/Maf.js');

var sphereBeats = [

  [32.2, 31.5, 33.8, 38.3, 40.6, 42.9],
  [32.7, 32, 34.3, 38.8, 41.1, 42.4],
  [33.2, 32.5, 30.8, 31.3, 33.6, 35.9],

  [32.8, 35.1, 37.4],
  [33.3, 35.6, 37.9],
  [33.8, 36.1, 38.4],

  [34.5, 36.8, 39.1],
  [35, 37.3, 39.6],
  [35.5, 37.8, 40.1],

  [40, 42.3, 44.6],
  [40.5, 42.8, 45.1],
  [41, 43.3, 45.6],

  [43.7, 46, 48.3],
  [44.2, 46.5, 48.8],
  [44.7, 47, 49.3],

  [46.2, 48.5, 40.8, 45.3, 47.6, 49.9],
  [46.7, 50, 52.3, 55.8, 58.1, 60.4],
  [47.2, 50.5, 52.8, 55.3, 58.6, 60.9],

  [52, 54.3, 56.6],
  [52.5, 54.8, 57.1],
  [53, 55.3, 57.6],

  [61.2, 63.5, 65.8, 70.3, 72.6, 74.9],
  [61.7, 64, 66.3, 70.8, 73.1, 75.4],
  [62.2, 64.5, 66.8, 71.3, 73.6, 75.9],

  [63.7, 66, 68.3],
  [64.2, 66.5, 68.8],
  [64.7, 67, 69.3],

];


export default class Spheres {
  constructor(globalSpeed) {
    this.sphereGroup = new THREE.Group();
    this.sphereData = [];
    this.sphereLight = [];
    this.sphereOriginal = [];
    this.sphereMaterial;

    this.sphereSnowValues = {};

    var palette = [
      new THREE.Color(0xf11d1d),
      new THREE.Color(0xb7db55),
      new THREE.Color(0xff9b2f),
      new THREE.Color(0xe063fb),
      new THREE.Color(0xf12b6c),
      new THREE.Color(0xffe617),
      new THREE.Color(0xffd2a1),
      new THREE.Color(0xdda1ff)
    ];

    // var g = new THREE.BoxBufferGeometry(.6, .8, 1);
    var g = new THREE.IcosahedronBufferGeometry(1, 3);
    
    var geometry = new THREE.InstancedBufferGeometry();
    geometry.index = g.index;
    geometry.attributes.position = g.attributes.position;
    geometry.attributes.normal = g.attributes.normal;
    geometry.attributes.uv = g.attributes.uv;

    this.sphereMaterial = new THREE.RawShaderMaterial({
      uniforms: {
        backgroundColor: {
          value: new THREE.Color()
        },
        rimColor: {
          value: new THREE.Color()
        },
        emissive: {
          value: 0
        },
      },
      vertexShader: glslify('./glsl/sphere.vert'),
      fragmentShader: glslify('./glsl/sphere.frag'),
      wireframe: !true,
      transparent: true
    })

    var start = 42;
    var patternLength = 9.25;
    var sequenceLength = 2;

    var positions = [];
    var rotations = [];
    var colors = [];
    var sizes = [];

    for (var i = 0; i < 3; i++) {
      for (var j = 0; j < 3; j++) {
        for( var k = 0; k < 3; k++ ) {
        var r = Maf.randomInRange(1, 4);
        if (Math.random() > .5) r *= -1;
        var p = new THREE.Vector3(
          r,
          Maf.randomInRange(1, 2),
          Maf.randomInRange(0, 0) + globalSpeed * (start + i * patternLength + j * sequenceLength /*+ k * .5*/ )
        );
        //var p = new THREE.Vector3(Maf.randomInRange(-4,4),Maf.randomInRange(1,2),Maf.randomInRange(-4,4))
        positions.push(p.x);
        positions.push(p.y);
        positions.push(p.z);
        var s = Maf.randomInRange(.2, 1);
        sizes.push(s);
        var q = new THREE.Vector4(
          Maf.randomInRange(-1, 1),
          Maf.randomInRange(-1, 1),
          Maf.randomInRange(-1, 1),
          Maf.randomInRange(-1, 1)
        ).normalize();
        rotations.push(q.x);
        rotations.push(q.y);
        rotations.push(q.z);
        rotations.push(q.w);
        this.sphereData.push(new THREE.Vector4(p.x, p.y, p.z, s));
        this.sphereOriginal.push(new THREE.Vector4(p.x, p.y, p.z, s));
        var c = palette[Math.floor(Math.random() * palette.length)];
        colors.push(c.r);
        colors.push(c.g);
        colors.push(c.b);
        colors.push(0);
        this.sphereLight.push(c.r);
        this.sphereLight.push(c.g);
        this.sphereLight.push(c.b);
        this.sphereLight.push(0);
        }
      }
    }

    geometry.addAttribute('rotation', new THREE.InstancedBufferAttribute(new Float32Array(rotations), 4));
    geometry.addAttribute('offset', new THREE.InstancedBufferAttribute(new Float32Array(positions), 3));
    geometry.addAttribute('color', new THREE.InstancedBufferAttribute(new Float32Array(colors), 4));
    geometry.addAttribute('size', new THREE.InstancedBufferAttribute(new Float32Array(sizes), 1));

    geometry.getAttribute('offset').dynamic = true;
    //geometry.getAttribute( 'color' ).dynamic = true;

    this.sphereGroup = new THREE.Mesh(
      geometry,
      this.sphereMaterial
    );
    this.sphereGroup.frustumCulled = false;
    this.sphereGroup.renderOrder = 3;
    this.sphereGroup.userData.name = 'Spheres';

  }


  processSphereBeats(t) {
    var adjustedT = t + .1;
    var beats = [];
    for (var j = 0; j < sphereBeats.length; j++) {
      var l = sphereBeats[j];
      for (var k = 0; k < l.length; k++) {
        var tt = l[k];
        if (adjustedT >= tt && adjustedT <= tt + .3) {
          beats.push({
            id: j,
            l: (adjustedT - tt) / .3
          })
        }
      }
    }
    return beats;
  }

  render(trackTime, t, backgroundColor) {
    var tt = Math.max(0, trackTime - 44);
    var v = tt / 30;
    this.sphereGroup.material.uniforms.emissive.value = v;

    for (var j = 0; j < this.sphereLight.length; j += 4) {
      this.sphereLight[j + 3] = this.sphereGroup.material.uniforms.emissive.value / 5.;
      this.sphereGroup.geometry.attributes.color.array[j + 3] = this.sphereGroup.material.uniforms.emissive.value / 5.;
    }
    var b = this.processSphereBeats(trackTime);
    for (var j = 0; j < b.length; j++) {
      var ptr = b[j].id * 4 + 3;
      var v = Maf.parabola(b[j].l, 3);
      this.sphereLight[ptr] = v;
      this.sphereGroup.geometry.attributes.color.array[ptr] = 1;

      ///
      this.sphereSnowValues.persistence = 1 + v * .5;
      this.sphereSnowValues.speed = .002 + .004 * v;
      this.sphereSnowValues.delta = 1 + 1 * v;
      this.sphereSnowValues.opacity = .8;
      ////
    }
    this.sphereGroup.geometry.attributes.color.needsUpdate = true;

    for (var j = 0; j < this.sphereData.length; j++) {
      var ptr = j;
      this.sphereData[ptr].y = this.sphereOriginal[ptr].y + .1 * Math.max(0., (trackTime - 37 - j )* 2);
      this.sphereGroup.geometry.attributes.offset.array[j * 3 + 1] = this.sphereData[ptr].y;
    }
    this.sphereGroup.geometry.attributes.offset.needsUpdate = true;

    this.sphereGroup.position.z = -t;

    this.sphereMaterial.uniforms.backgroundColor.value.setHex(backgroundColor);

  }
}