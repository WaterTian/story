precision highp float;

uniform sampler2D heightMap;
uniform vec2 resolution;
uniform vec3 lightPosition;
uniform vec3 lightColor;

uniform vec4 sphereData[18];
uniform vec4 sphereLight[18];
uniform float pos;

varying vec2 vUv;

float blendOverlay(float base, float blend) {
	return base<0.5?(2.0*base*blend):(1.0-2.0*(1.0-base)*(1.0-blend));
}

vec3 blendOverlay(vec3 base, vec3 blend) {
	return vec3(blendOverlay(base.r,blend.r),blendOverlay(base.g,blend.g),blendOverlay(base.b,blend.b));
}

vec3 blendOverlay(vec3 base, vec3 blend, float opacity) {
	return (blendOverlay(base, blend) * opacity + base * (1.0 - opacity));
}

vec3 applyHardLight(vec3 base, vec3 blend) {
	return blendOverlay(blend,base);
}

vec3 applyScreen( vec3 base, vec3 blend ) {
	return (1.0 - ((1.0 - base) * (1.0 - blend)));
}

float sampleOcclusion(vec2 uv, float offset){
	vec2 inc = vec2(1.)/resolution;
	float oh = texture2D(heightMap,uv).r + offset;
	float th = lightPosition.y;
	vec2 dir = vec2(.5)-(uv+vec2(-lightPosition.x,lightPosition.z)/20.);
	float falloff = length(dir) * 20. + th;
	float steps = 20.;//abs(dir.x)/inc.x;
	//if( dir.y>dir.x) steps = abs(dir.y)/inc.y;
	//steps = max(1.,steps);
	int iSteps = int(steps);
	dir /= steps;
	float occlusion = 0.;
	for(int i = 0; i < 300; i++ ){
		if( i > iSteps ) {
			break;
		}
		float sh = texture2D(heightMap,uv + dir*float(i)).r;
		float vh = oh + float(i) * ( th - oh ) / steps;
		if( sh > vh ) {
			occlusion = 1.;
		}
	}
	return ( 1. - sqrt(.1*falloff) ) * ( 1. - occlusion );
}

void main() {
	vec3 brightness = vec3(0.);
	float h = texture2D(heightMap,vUv).r;
	vec3 p = vec3((vUv.x-.5)*20.,h,((1.-vUv.y)-.5)*20.);
	for(int i=0;i<18;i++) {
		float d = sphereData[i].w/pow(length(p-(sphereData[i].xyz-vec3(0.,0.,pos))),1.);
		brightness += 2. * sphereLight[i].w * sphereLight[i].xyz * d;
	}
	float d = length(vec2(.5)-(vUv+vec2(-lightPosition.x,lightPosition.z)/20.));
	float occlusion = sampleOcclusion(vUv,0.);
	occlusion = .5 + .5 * occlusion;
	float v = length(brightness);
	vec3 l = mix(.75 + .25 *lightColor,vec3(1.),4.*d);
	gl_FragColor = vec4(vec3(mix(.8,1.,h))*l*occlusion,.2);
	gl_FragColor.rgb = mix(gl_FragColor.rgb,brightness,v);
}