const THREE = require('three');
const glslify = require('glslify');
const ShaderTexture = require('./libs/THREE.ShaderTexture').default;

const Maf = require('./libs/Maf.js');

var sphereBeats = [
  [74.5, 76.8, 79.1],
  [75, 77.3, 79.6],
  [75.5, 77.8, 80.1],

  [83.7, 86, 88.3],
  [84.2, 86.5, 88.8],
  [84.7, 87, 89.3],

  [92.8, 95.1, 97.4],
  [93.3, 95.6, 97.9],
  [93.8, 96.1, 98.4],

  [102, 104.3, 106.6],
  [102.5, 104.8, 107.1],
  [103, 105.3, 107.6],

  [111.2, 113.5, 115.8],
  [111.7, 114, 116.3],
  [112.2, 114.5, 116.8],

  [111.2, 113.5, 115.8, 120.3, 122.6, 124.9],
  [111.7, 114, 116.3, 120.8, 123.1, 125.4],
  [112.2, 114.5, 116.8, 121.3, 123.6, 125.9],

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

    var g = new THREE.BoxBufferGeometry(.6, .8, 1);
    // var g = new THREE.IcosahedronBufferGeometry(1, 3);
    
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

    var start = 1 * 60 + 14.5 + 2;
    var patternLength = 9.25;
    var sequenceLength = 2;

    var positions = [];
    var rotations = [];
    var colors = [];
    var sizes = [];

    for (var i = 0; i < 6; i++) {
      for (var j = 0; j < 3; j++) {
        for( var k = 0; k < 3; k++ ) {
        var r = Maf.randomInRange(1, 3);
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
    var tt = Math.max(0, trackTime - 94);
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
      this.sphereData[ptr].y = this.sphereOriginal[ptr].y + .1 * Math.max(0., trackTime - 80 - j * 2.3);
      this.sphereGroup.geometry.attributes.offset.array[j * 3 + 1] = this.sphereData[ptr].y;
    }
    this.sphereGroup.geometry.attributes.offset.needsUpdate = true;

    this.sphereGroup.position.z = -t;

    this.sphereMaterial.uniforms.backgroundColor.value.setHex(backgroundColor);

  }
}