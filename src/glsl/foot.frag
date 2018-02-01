precision highp float;

uniform sampler2D footMap;

varying float vColor;
varying float vOpacity;

void main() {
	gl_FragColor = vec4(vec3(vColor),vOpacity);
}