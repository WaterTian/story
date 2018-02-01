const THREE = require('three');
const glslify = require('glslify');
const ShaderTexture = require('./THREE.ShaderTexture').default;


export default class Backdrop {
  constructor() {

    this.obj = new THREE.Mesh(
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
    this.obj.renderOrder = 6;
    this.obj.userData.name = 'Backdrop';
  }

  render(dt) {

    var backdropValues = {fr: 0xa1, fg: 0xb5, fb: 0xd7, tr: 0, rg: 0, tb: 0, rot: -Math.PI/2};
    this.obj.rotation.z = backdropValues.rot;

    var bFrom = Math.round(backdropValues.fr) * 256 * 256 + Math.round(backdropValues.fg) * 256 + Math.round(backdropValues.fb);
    var bTo = Math.round(backdropValues.tr) * 256 * 256 + Math.round(backdropValues.tg) * 256 + Math.round(backdropValues.tb);
    this.obj.material.uniforms.from.value.setHex(bFrom);
    this.obj.material.uniforms.to.value.setHex(bTo);
    this.obj.material.uniforms.time.value += .05 * dt;

  }
}