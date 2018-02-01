precision highp float;

uniform sampler2D map;

varying vec2 vUv;
varying vec3 vColor;

uniform float opacity;

void main() {
	vec2 uv = vUv;
	/*vec2 barycenter = vec2( .5, .5+(.5-.435) );
	float dist = 2. * length( vUv.xy - barycenter );
	float d = smoothstep(.4,.6, dist);
	d = clamp(d,0.,1.);
	gl_FragColor = vec4( vColor, ( 1.- d ) * opacity);*/
	gl_FragColor = texture2D(map,uv);
	gl_FragColor.a *= opacity;
}