precision highp float;

uniform vec3 backgroundColor;
uniform float emissive;
uniform vec3 rimColor;

uniform float alpha;

varying vec4 vColor;
varying vec2 vUv;
varying	vec3 vPosition;
varying float vDistance;
varying vec3 vViewPosition;
varying vec3 vNormal;

void main() {
	float f = sin(abs(70.*vUv.y))+ emissive*.5;
	f = smoothstep(.1,1.,f);

	float d = vDistance;
	d /= 15.;
	d = smoothstep(.1, 1., d);
	d = 1.-d;
	vec3 n = normalize(vNormal);
	float rim = 1. - smoothstep( 0., 1., max( 0., abs( dot( n, normalize( -vViewPosition.xyz ) ) ) ) );
	gl_FragColor = vec4(mix(.5 * rim * rimColor +vColor.xyz*(vColor.a + emissive*.1) * f,backgroundColor,1.-d),d *alpha + f);

}