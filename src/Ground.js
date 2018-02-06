const THREE = require('three');
const glslify = require('glslify');
const ShaderTexture = require('./libs/THREE.ShaderTexture').default;


export default class Ground {
  constructor(renderer) {

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
        sphereData: {
          value: null
        },
        sphereLight: {
          value: null
        },
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
    this.blurVShadowTexture = new ShaderTexture(renderer, blurShadowShader, shadowWidth, shadowHeight, THREE.RGBAFormat, THREE.UnsignedByteType);

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
        },
        alpha: {
          value: 1
        }
      },
      vertexShader: glslify('./glsl/plane.vert'),
      fragmentShader: glslify('./glsl/plane.frag'),
      wireframe: false,
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

  setAlpha(alpha) {

    this.plane.material.uniforms.alpha.value = alpha;

    if (alpha < 0) {
      this.plane.material.wireframe = true;
    } else {
      this.plane.material.wireframe = false;
    }
  }

  render(renderer, t, lightPosition, backgroundColor, trailColor, spheres) {

    for (var j = 0; j < this.footprints.length; j++) {
      var f = this.footprints[j];
      var s = f.z + t;
      s %= 10;
      f.mesh.position.x = -f.x;
      f.mesh.position.z = -s;
      f.mesh.material.uniforms.offset.value.x = f.x;
      f.mesh.material.uniforms.offset.value.y = s;
    }

    this.plane.material.uniforms.backgroundColor.value.setHex(backgroundColor);

    this.terrainTexture.shader.uniforms.time.value = t;
    this.terrainTexture.render();

    this.plane.material.uniforms.time.value = t;
    this.shadowTexture.shader.uniforms.lightPosition.value.copy(lightPosition);
    this.shadowTexture.shader.uniforms.pos.value = this.terrainTexture.shader.uniforms.time.value;

    this.shadowTexture.shader.uniforms.lightColor.value.setHex(trailColor);

    this.shadowTexture.shader.uniforms.sphereData.value = spheres.sphereData;
    this.shadowTexture.shader.uniforms.sphereLight.value = spheres.sphereLight;

    renderer.autoClear = false;
    this.shadowTexture.render();
    renderer.autoClear = true;


    this.blurHShadowTexture.shader.uniforms.delta.value.set(1., 0.);
    this.blurHShadowTexture.shader.uniforms.source.value = this.shadowTexture.fbo.texture;
    this.blurHShadowTexture.render();
    this.blurVShadowTexture.shader.uniforms.delta.value.set(0., 1.);
    this.blurVShadowTexture.shader.uniforms.source.value = this.blurHShadowTexture.fbo.texture;
    this.blurVShadowTexture.render();
    this.plane.material.uniforms.shadowMap.value = this.blurVShadowTexture.fbo.texture;

  }
}