precision highp float;
uniform sampler2D map;
uniform vec3 color;

varying vec2 vUv;

void main() {
	vec3 c = texture2D(map,vUv).rgb;
	gl_FragColor = vec4(color*c,1.5);
}