const THREE = require('three');
const glslify = require('glslify');
const ShaderTexture = require('./libs/THREE.ShaderTexture').default;

const Maf = require('./libs/Maf.js');



export default class City {
  constructor(globalSpeed) {
    this.cityGroup = new THREE.Group();
    this.cityData = [];
    this.cityLight = [];
    this.cityMaterial;

    this.citySnowValues = {};

    var palette = [
      new THREE.Color(0xf1ea1d),
      new THREE.Color(0xf16060),
      new THREE.Color(0xff9b2f),
      new THREE.Color(0xf8e890),
      new THREE.Color(0xfdd329)
    ];

    var g = new THREE.BoxBufferGeometry(.8, 4, 1);
    
    var geometry = new THREE.InstancedBufferGeometry();
    geometry.index = g.index;
    geometry.attributes.position = g.attributes.position;
    geometry.attributes.normal = g.attributes.normal;
    geometry.attributes.uv = g.attributes.uv;

    this.cityMaterial = new THREE.RawShaderMaterial({
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
        alpha: {
          value: 1
        },
      },
      vertexShader: glslify('./glsl/sphere.vert'),
      fragmentShader: glslify('./glsl/city.frag'),
      wireframe: !true,
      transparent: true
    })

    var start = 68;
    var patternLength = 9.25;
    var sequenceLength = 2;

    var positions = [];
    var colors = [];
    var sizes = [];

    for (var i = 0; i < 4; i++) {
      for (var j = 0; j < 5; j++) {
        for( var k = 0; k < 5; k++ ) {
        var r = Maf.randomInRange(1, 5);
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
        var s = Maf.randomInRange(.6, 1);
        sizes.push(s);
        this.cityData.push(new THREE.Vector4(p.x, p.y, p.z, s));
        var c = palette[Math.floor(Math.random() * palette.length)];
        colors.push(c.r);
        colors.push(c.g);
        colors.push(c.b);
        colors.push(0);
        this.cityLight.push(c.r);
        this.cityLight.push(c.g);
        this.cityLight.push(c.b);
        this.cityLight.push(0);
        }
      }
    }

    geometry.addAttribute('offset', new THREE.InstancedBufferAttribute(new Float32Array(positions), 3));
    geometry.addAttribute('color', new THREE.InstancedBufferAttribute(new Float32Array(colors), 4));
    geometry.addAttribute('size', new THREE.InstancedBufferAttribute(new Float32Array(sizes), 1));

    geometry.getAttribute('offset').dynamic = true;
    geometry.getAttribute( 'color' ).dynamic = true;

    this.cityGroup = new THREE.Mesh(
      geometry,
      this.cityMaterial
    );
    this.cityGroup.frustumCulled = false;
    this.cityGroup.renderOrder = 3;
    this.cityGroup.userData.name = 'citys';

  }



  setAlpha(alpha) {

    this.cityMaterial.uniforms.alpha.value = alpha;

  }  

  flash(level) {

    this.cityGroup.geometry.attributes.color.array[Math.floor(Math.random() * this.cityLight.length)] = level;
    this.cityGroup.geometry.attributes.color.array[Math.floor(Math.random() * this.cityLight.length)] = level;
    this.cityGroup.geometry.attributes.color.array[Math.floor(Math.random() * this.cityLight.length)] = level;
    this.cityGroup.geometry.attributes.color.needsUpdate = true;

  }


  render(trackTime, t, backgroundColor) {
    var tt = Math.max(0, trackTime - 74);
    var v = tt / 30;
    this.cityGroup.material.uniforms.emissive.value = v;

    for (var j = 0; j < this.cityLight.length; j += 4) {
      this.cityLight[j + 3] = this.cityGroup.material.uniforms.emissive.value / 5.;
      this.cityGroup.geometry.attributes.color.array[j + 3] = this.cityGroup.material.uniforms.emissive.value / 5.;
    }
    // var b = this.processcityBeats(trackTime);
    // for (var j = 0; j < b.length; j++) {
    //   var ptr = b[j].id * 4 + 3;
    //   var v = Maf.parabola(b[j].l, 3);
    //   this.cityLight[ptr] = v;
    //   this.cityGroup.geometry.attributes.color.array[ptr] = 1;

    //   // ///
    //   // this.citySnowValues.persistence = 1 + v * .5;
    //   // this.citySnowValues.speed = .002 + .004 * v;
    //   // this.citySnowValues.delta = 1 + 1 * v;
    //   // this.citySnowValues.opacity = .8;
    //   // ////
    // }


    for (var j = 0; j < this.cityData.length; j++) {
      var ptr = j;
      this.cityData[ptr].y = this.cityData[ptr].w*1.5;
      this.cityGroup.geometry.attributes.offset.array[j * 3 + 1] = this.cityData[ptr].y;
    }
    this.cityGroup.geometry.attributes.offset.needsUpdate = true;

    this.cityGroup.position.z = -t;

    this.cityMaterial.uniforms.backgroundColor.value.setHex(backgroundColor);

  }
}