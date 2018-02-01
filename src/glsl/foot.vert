precision highp float;

attribute vec3 position;
attribute vec2 uv;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

uniform sampler2D heightMap;
uniform sampler2D footMap;
uniform vec2 offset;

varying float vColor;
varying float vOpacity;

void main() {

	vec3 p = position;
	vec2 uv2 = .5+(uv-.5)/40.;
	uv2.x -= offset.x / 20.;
	uv2.y += offset.y / 20.;
	vec2 uv1 = uv;
	uv1.y = 1. - uv1.y;
	if(offset.x < 0.) {
		uv1.x = 1.-uv1.x;
	}
	float h = texture2D(heightMap,uv2).r;
	vec4 c = texture2D(footMap,uv1);
	vOpacity = c.r;
	vColor = .5;
	h -= .05 * c.r;
	p.y += h;
	gl_Position = projectionMatrix * modelViewMatrix * vec4( p, 1. );

}