const THREE = require('three');
const glslify = require('glslify');
const ShaderTexture = require('./THREE.ShaderTexture').default;


export default class Ground {
  constructor(renderer,helper) {

    this.terrainTexture;
    this.shadowTexture;
    this.blurHShadowTexture;
    this.blurVShadowTexture;

    var footMesh;
    this.footprints = [];
    this.obj = new THREE.Object3D();

    var terrainWidth = 256;
    var terrainHeight = 256;

    var terrainShader = new THREE.RawShaderMaterial({
      uniforms: {
        time: {
          value: 0
        },
        source: {
          value: null
        },
        resolution: {
          value: new THREE.Vector2(terrainWidth, terrainHeight)
        },
        speed: {
          value: -.05
        }
      },
      vertexShader: glslify('./glsl/ortho.vert'),
      fragmentShader: glslify('./glsl/terrain.frag'),
    });

    this.terrainTexture = new ShaderTexture(renderer, terrainShader, terrainWidth, terrainHeight, THREE.RGBAFormat, THREE.UnsignedByteType);

    // helper.attach(this.terrainTexture.fbo, 'terrain');
    helper.show(false);

    var shadowWidth = 256;
    var shadowHeight = 256;

    var shadowShader = new THREE.RawShaderMaterial({
      uniforms: {
        heightMap: {
          value: this.terrainTexture.fbo.texture
        },
        resolution: {
          value: new THREE.Vector2(shadowWidth, shadowHeight)
        },
        lightPosition: {
          value: new THREE.Vector3()
        },
        // sphereData: {
        //   value: sphereData
        // },
        // sphereLight: {
        //   value: sphereLight
        // },
        lightColor: {
          value: new THREE.Color(0xffea3b)
        },
        pos: {
          value: 0
        }
      },
      vertexShader: glslify('./glsl/ortho.vert'),
      fragmentShader: glslify('./glsl/terrain-shadow.frag'),
      transparent: true
    });

    this.shadowTexture = new ShaderTexture(renderer, shadowShader, shadowWidth, shadowHeight, THREE.RGBAFormat, THREE.UnsignedByteType);

    helper.attach(this.shadowTexture.fbo, 'terrain shadow');

    var blurShadowShader = new THREE.RawShaderMaterial({
      uniforms: {
        source: {
          value: this.shadowTexture.fbo.texture
        },
        resolution: {
          value: new THREE.Vector2(shadowWidth, shadowHeight)
        },
        delta: {
          value: new THREE.Vector2(1., 0.)
        },
      },
      vertexShader: glslify('./glsl/ortho.vert'),
      fragmentShader: glslify('./glsl/blur.frag'),
    });

    this.blurHShadowTexture = new ShaderTexture(renderer, blurShadowShader, shadowWidth, shadowHeight, THREE.RGBAFormat, THREE.UnsignedByteType);
    // helper.attach(this.blurHShadowTexture.fbo, 'blurh sterrain shadow');
    this.blurVShadowTexture = new ShaderTexture(renderer, blurShadowShader, shadowWidth, shadowHeight, THREE.RGBAFormat, THREE.UnsignedByteType);
    // helper.attach(this.blurVShadowTexture.fbo, 'blurv sterrain shadow');

    const footprintTexture = new THREE.TextureLoader().load('./assets/footprint.png');

    var footGeometry = new THREE.PlaneBufferGeometry(.5, .5, 20, 20);
    footGeometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
    for (var j = 0; j < 10; j++) {
      var footMaterial = new THREE.RawShaderMaterial({
        uniforms: {
          heightMap: {
            value: this.terrainTexture.fbo.texture
          },
          shadowMap: {
            value: null
          },
          footMap: {
            value: footprintTexture
          },
          offset: {
            value: new THREE.Vector2(0, 0)
          }
        },
        vertexShader: glslify('./glsl/foot.vert'),
        fragmentShader: glslify('./glsl/foot.frag'),
        transparent: true,
        depthWrite: true,
        depthTest: !true,
        wireframe: !true,
      })
      footMesh = new THREE.Mesh(footGeometry, footMaterial);
      footMesh.frustumCulled = false;
      footMesh.renderOrder = 2;
      footMesh.userData.name = 'Footprint';
      this.obj.add(footMesh);
      this.footprints.push({
        mesh: footMesh,
        x: j % 2 ? -.15 : .15,
        z: j
      });
    }

    var planeMaterial = new THREE.RawShaderMaterial({
      uniforms: {
        heightMap: {
          value: this.terrainTexture.fbo.texture
        },
        shadowMap: {
          value: null
        },
        backgroundColor: {
          value: new THREE.Color()
        },
        time: {
          value: 0
        }
      },
      vertexShader: glslify('./glsl/plane.vert'),
      fragmentShader: glslify('./glsl/plane.frag'),
      wireframe: !true,
      transparent: true
    });

    var planeGeometry = new THREE.PlaneBufferGeometry(20, 20 * terrainHeight / terrainWidth, terrainWidth, terrainHeight);
    planeGeometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));

    this.plane = new THREE.Mesh(
      planeGeometry,
      planeMaterial
    );
    this.plane.renderOrder = 1;
    this.plane.userData.name = 'Landscape';
    this.obj.add(this.plane);

  }

  render(renderer,dt,lightPosition) {

    for (var j = 0; j < this.footprints.length; j++ ) {
      var f = this.footprints[j];
      var s = f.z + dt;
      s %= 10;
      f.mesh.position.x = -f.x;
      f.mesh.position.z = -s;
      f.mesh.material.uniforms.offset.value.x = f.x;
      f.mesh.material.uniforms.offset.value.y = s;
    }



    this.terrainTexture.shader.uniforms.time.value += dt;
    this.terrainTexture.render();

    this.plane.material.uniforms.time.value += dt;
    this.shadowTexture.shader.uniforms.lightPosition.value.copy(lightPosition);
    this.shadowTexture.shader.uniforms.pos.value = this.terrainTexture.shader.uniforms.time.value;

    var trailColor ={r:0xff,g:0xff,b:0xff};
    var tC = Math.round(trailColor.r) * 256 * 256 + Math.round(trailColor.g) * 256 + Math.round(trailColor.b);
    this.shadowTexture.shader.uniforms.lightColor.value.setHex(tC);

    renderer.autoClear = false;
    this.shadowTexture.render();
    renderer.autoClear = true;


    this.blurHShadowTexture.shader.uniforms.delta.value.set(1.,0.);
    this.blurHShadowTexture.shader.uniforms.source.value = this.shadowTexture.fbo.texture;
    this.blurHShadowTexture.render();
    this.blurVShadowTexture.shader.uniforms.delta.value.set(0.,1.);
    this.blurVShadowTexture.shader.uniforms.source.value = this.blurHShadowTexture.fbo.texture;
    this.blurVShadowTexture.render();
    this.plane.material.uniforms.shadowMap.value = this.blurVShadowTexture.fbo.texture;

  }
}