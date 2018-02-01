precision highp float;

uniform sampler2D inputTexture;
uniform vec2 resolution;

uniform float overall;

uniform float boost;
uniform float reduction;

uniform float amount;
uniform float time;

varying vec2 vUv;

float random(vec2 n, float offset ){
	return .5 - fract(sin(dot(n.xy + vec2( offset, 0. ), vec2(12.9898, 78.233)))* 43758.5453);
}

vec3 gammaCorrect(vec3 color, float gamma){
    return pow(color, vec3(1.0/gamma));
}

vec3 levelRange(vec3 color, float minInput, float maxInput){
    return min(max(color - vec3(minInput), vec3(0.0)) / (vec3(maxInput) - vec3(minInput)), vec3(1.0));
}

vec3 finalLevels(vec3 color, float minInput, float gamma, float maxInput){
    return gammaCorrect(levelRange(color, minInput, maxInput), gamma);
}

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

void main() {

    vec2 res = 1. / resolution;

    vec4 g = texture2D(inputTexture,vUv);
    vec4 r = texture2D(inputTexture,vUv-vec2(res.x,0.));
    vec4 b = texture2D(inputTexture,vUv+vec2(res.x,0.));

    vec4 color = vec4(r.r, g.g, b.b, 1. );
	color += vec4( vec3( amount * random( vUv, time ) ), 1. );

    vec2 position = vUv - .5;
	float vignette = length( position );
    vignette = boost - vignette * reduction;

    color.rgb *= vignette;
    color.rgb = finalLevels(color.rgb, 17./255.0, 1.22, 225.0/255.0);

    //color.rgb = .5 * applySoftLight( color.rgb, vec3(0.,76.,250.)/255.)+.5*color.rgb;

    gl_FragColor = overall*color;

}