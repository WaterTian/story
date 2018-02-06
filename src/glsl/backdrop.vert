precision highp float;

attribute vec3 position;
attribute vec2 uv;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

uniform vec3 from;
uniform vec3 to;

varying vec2 vUv;
varying vec3 vColor;

void main() {
	vUv = uv;
	// vColor = mix(from,to,vec3(mod(uv.x*2.,1.)));
	vColor = from;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
}