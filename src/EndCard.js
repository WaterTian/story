const THREE = require('three');
const glslify = require('glslify');



export default class TitleCard {
  constructor() {
    var texture = new THREE.TextureLoader().load('./assets/end.jpg');
    this.texture2 = new THREE.TextureLoader().load('./assets/txt2.png');
    this.texture3 = new THREE.TextureLoader().load('./assets/txt3.png');




    this.obj = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(2, 1),
      new THREE.RawShaderMaterial({
        uniforms: {
          map: {
            value: this.gloomTexture
          },
          opacity: {
            value: 0
          }
        },
        vertexShader: glslify('./glsl/card.vert'),
        fragmentShader: glslify('./glsl/card.frag'),
        side: THREE.DoubleSide,
        depthWrite: false,
        depthTest: false,
        transparent: true
      })
    );
    this.obj.rotation.y = Math.PI / 2;
    this.obj.position.y = 1.5;
    this.obj.renderOrder = 7;
    this.obj.userData.name = 'Title Card';

  }



  render(renderCamera, titleValues) {
    if (titleValues.title === 0) this.obj.material.uniforms.map.value = this.texture1;
    if (titleValues.title === 1) this.obj.material.uniforms.map.value = this.texture2;
    if (titleValues.title === 2) this.obj.material.uniforms.map.value = this.texture3;
    
    this.obj.material.uniforms.opacity.value = titleValues.opacity;
    this.obj.position.set(0, titleValues.y, -4).applyMatrix4(renderCamera.matrix)
    this.obj.lookAt(renderCamera.position);
  }
}