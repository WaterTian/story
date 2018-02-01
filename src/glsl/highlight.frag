precision highp float;

uniform sampler2D source;
uniform float threshold;

varying vec2 vUv;

void main() {
	vec4 c = texture2D( source, vUv );
	c.xyz -= 1.;
	gl_FragColor = vec4( c.xyz, 1. );
}