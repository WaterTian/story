precision highp float;

attribute vec3 position;
attribute vec2 uv;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

uniform sampler2D heightMap;

varying vec2 vUv;
varying float vHeight;
varying vec3 vPosition;
varying float vDepth;

void main() {

	vUv = uv;
	vec3 p = position;
	float h = texture2D(heightMap,uv).r;
	vHeight = h;
	p.y += h;
	vPosition = p;
	gl_Position = projectionMatrix * modelViewMatrix * vec4( p, 1. );
	vDepth = clamp(-(modelViewMatrix * vec4( p, 1. )).z/10.,0.,1.);

}