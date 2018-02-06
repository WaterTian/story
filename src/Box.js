const THREE = require('three');
const glslify = require('glslify');


export default class Backdrop {
  constructor(boxGeometry) {

    const boxMap = new THREE.TextureLoader().load('./assets/box.png');
    this.obj = new THREE.Mesh(
      boxGeometry,
      new THREE.RawShaderMaterial({
        uniforms: {
          map: {
            value: boxMap
          },
          color: {
            value: new THREE.Color(0xffea3b)
          }
        },
        vertexShader: glslify('./glsl/light.vert'),
        fragmentShader: glslify('./glsl/light.frag'),
      })
    );
    this.obj.position.y = 1.1;
    this.obj.scale.set(1.6, 1.6, 1.6);
    this.obj.renderOrder = 6;
    this.obj.userData.name = 'Box';
  }

  render(trackTime, position, trailColor, ground) {

    if (position && trackTime > 10) {
      this.obj.position.lerp(position, 0.2);
      // if (That.box.obj.position.y < 1) That.box.obj.position.z += That.box.obj.position.y;
      // That.box.obj.position.y = Math.max(That.box.obj.position.y, 1);

      if (this.obj.position.y < 0) {
        ground.setAlpha(1 + this.obj.position.y);
      } else {
        ground.setAlpha(1);
      }

    }


    this.obj.material.uniforms.color.value.setHex(trailColor);

    this.obj.rotation.x += 0.01;
    this.obj.rotation.y += 0.03;
    this.obj.rotation.z += 0.02;
  }
}