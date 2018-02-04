const THREE = require('three');
const glslify = require('glslify');
const ShaderTexture = require('./libs/THREE.ShaderTexture').default;


export default class Backdrop {
  constructor() {

    this.backdrop = new THREE.Mesh(
      new THREE.IcosahedronBufferGeometry(50, 3),
      new THREE.RawShaderMaterial({
        uniforms: {
          from: {
            value: new THREE.Color(0xa1b5d7)
          },
          to: {
            value: new THREE.Color(0x0000000)
          },
          time: {
            value: 0
          }
        },
        vertexShader: glslify('./glsl/backdrop.vert'),
        fragmentShader: glslify('./glsl/backdrop.frag'),
        side: THREE.DoubleSide,
      })
    );
    this.backdrop.renderOrder = 6;
    this.backdrop.userData.name = 'Backdrop';
  }

  render(t, backdropValues ,ground ,spheres) {

    this.backdrop.rotation.z = backdropValues.rot;

    var bFrom = Math.round(backdropValues.fr) * 256 * 256 + Math.round(backdropValues.fg) * 256 + Math.round(backdropValues.fb);
    var bTo = Math.round(backdropValues.tr) * 256 * 256 + Math.round(backdropValues.tg) * 256 + Math.round(backdropValues.tb);
    this.backdrop.material.uniforms.from.value.setHex(bFrom);
    this.backdrop.material.uniforms.to.value.setHex(bTo);
    this.backdrop.material.uniforms.time.value = .05 * t;

    ground.plane.material.uniforms.backgroundColor.value.setHex(bFrom);
    spheres.sphereMaterial.uniforms.rimColor.value.setHex(bFrom);
    spheres.sphereMaterial.uniforms.backgroundColor.value.setHex(bFrom);

  }
}