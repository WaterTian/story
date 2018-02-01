precision highp float;

uniform sampler2D source;
uniform vec2 resolution;

varying vec2 vUv;

void main() {
	vec2 i = vec2(0.,1.)/resolution;
	vec4 s = texture2D(source,vUv-i);
	if(vUv.y <= i.y ) s = vec4(1.);
	gl_FragColor = s;
}