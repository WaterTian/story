precision highp float;

attribute vec3 position;
attribute vec3 offset;
attribute vec2 uv;

uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

uniform vec2 dimensions;
uniform vec2 resolution;
uniform float scale;
uniform vec3 color;
uniform float delta;

uniform sampler2D curPos;
uniform sampler2D prevPos;

varying vec2 vUv;
varying vec3 vColor;

const float PI = 3.14159265359;

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec2 rotate(vec2 v, float a) {
	float s = sin(a);
	float c = cos(a);
	mat2 m = mat2(c, -s, s, c);
	return m * v;
}

void main() {

	vec2 luv = vec2( mod( offset.x, dimensions.x ) / dimensions.x, floor( offset.x / dimensions.y ) / dimensions.y );
	vec4 lp = texture2D( curPos, luv );
	vec4 lpp = texture2D( prevPos, luv );

	vec4 tlp = projectionMatrix * modelViewMatrix * vec4( lp.xyz, 1. );
	vec4 tlpp = projectionMatrix * modelViewMatrix * vec4( lpp.xyz, 1. );
	float l = delta;//max(.5,length(tlp.xy - tlpp.xy));
	vec2 tlp2 = tlp.xy/tlp.w;
	vec2 tlpp2 = tlpp.xy/tlpp.w;
	vec2 dir = normalize(tlp2 - tlpp2);
	float aspect = resolution.x / resolution.y;
	dir.x *= aspect;
	vec2 perp = normalize(vec2(-dir.y,dir.x));
	if( l == 1. ) {
		dir = vec2(0.,1.);
		perp = vec2( 1.,0.);
	}
	dir *= l;
	perp /= l;

	vec4 mVP = modelViewMatrix * vec4(lp.xyz,1.);
	mVP.xy += ( dir.xy * position.x + perp.xy * position.y ) * scale;// * (lp.w/100.);
	//mVP.xy += position.xy * scale;

	//if( lpp.w < lp.w ) p.x = 1000000.;

	vUv = uv;
	vColor = vec3(1.);
	float fogFactor = clamp(-lp.z/10.,0.,1.);
	vColor *= vec3( 1. - fogFactor );
	vColor = vec3(fogFactor );

	gl_Position = projectionMatrix * mVP;

}