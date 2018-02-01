precision highp float;

uniform sampler2D base;
uniform sampler2D level0;
uniform sampler2D level1;
uniform sampler2D level2;
uniform sampler2D level3;
uniform sampler2D level4;

uniform vec2 resolution;
uniform float boost;
uniform float reduction;
uniform float levels;

varying vec2 vUv;

float applySoftLightToChannel( float base, float blend ) {
	return ((blend < 0.5) ? (2.0 * base * blend + base * base * (1.0 - 2.0 * blend)) : (sqrt(base) * (2.0 * blend - 1.0) + 2.0 * base * (1.0 - blend)));
}

vec3 applySoftLight( vec3 base, vec3 blend ) {
	return vec3(
	    applySoftLightToChannel(base.r, blend.r),
	    applySoftLightToChannel(base.g, blend.g),
	    applySoftLightToChannel(base.b, blend.b)
	);
}

vec3 applyScreen( vec3 base, vec3 blend ) {
	return (1.0 - ((1.0 - base) * (1.0 - blend)));
}

float blendOverlay(float base, float blend) {
	return base<0.5?(2.0*base*blend):(1.0-2.0*(1.0-base)*(1.0-blend));
}

vec3 blendOverlay(vec3 base, vec3 blend) {
	return vec3(blendOverlay(base.r,blend.r),blendOverlay(base.g,blend.g),blendOverlay(base.b,blend.b));
}

vec3 blendOverlay(vec3 base, vec3 blend, float opacity) {
	return (blendOverlay(base, blend) * opacity + base * (1.0 - opacity));
}

void main() {
	vec2 res = 1. / resolution;
	vec2 uv = vUv;

	vec4 bloom = vec4(0.);
	if( levels > 0. ) bloom += texture2D( level0, vUv );
	if( levels > 1. ) bloom += texture2D( level1, vUv );
	if( levels > 2. ) bloom += texture2D( level2, vUv );
	if( levels > 3. ) bloom += texture2D( level3, vUv );
	if( levels > 4. ) bloom += texture2D( level4, vUv );

	vec4 color = texture2D( base, vUv );
	gl_FragColor = color+bloom;//vec4( blendOverlay(color.xyz, bloom.xyz,.5), 1.);
}