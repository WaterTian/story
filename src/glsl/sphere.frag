precision highp float;

uniform vec3 backgroundColor;
uniform float emissive;
uniform vec3 rimColor;

varying vec4 vColor;
varying vec2 vUv;
varying	vec3 vPosition;
varying float vDistance;
varying vec3 vViewPosition;
varying vec3 vNormal;

void main() {
	float f = sin(abs(20.*vUv.y))+ 2.*emissive;
	f = smoothstep(.5,1.,f);

	float d = vDistance;
	d /= 15.;
	d = smoothstep(.7, 1., d);
	d = 1.-d;
	vec3 n = normalize(vNormal);
	float rim = 1. - smoothstep( 0., 1., max( 0., abs( dot( n, normalize( -vViewPosition.xyz ) ) ) ) );
	gl_FragColor = vec4(mix(.5 * rim * rimColor +vColor.xyz*(1.5*vColor.a +.1*emissive) * f,backgroundColor,1.-d),d + f * vColor.a);

}