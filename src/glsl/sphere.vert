precision highp float;

attribute vec3 position;
attribute vec2 uv;
attribute vec3 offset;
attribute vec4 rotation;
attribute float size;
attribute vec4 color;
attribute vec3 normal;

uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;

varying vec2 vUv;
varying	vec3 vPosition;
varying float vDistance;
varying vec4 vColor;
varying vec3 vViewPosition;
varying vec3 vNormal;

vec3 rotateVector( vec4 quat, vec3 vec ){
	return vec + 2.0 * cross( cross( vec, quat.xyz ) + quat.w * vec, quat.xyz );
}

void main() {
	vUv = uv;
	vColor = color;
	vec3 p = rotateVector(rotation,position) * size + offset;
	vPosition = (modelMatrix * vec4(p, 1.)).xyz;
	vDistance = abs(vPosition.z);
	vec4 mVP = modelViewMatrix * vec4( p, 1.);
	vNormal = normalMatrix * rotateVector(rotation,normal);
	vViewPosition = mVP.xyz;
	gl_Position = projectionMatrix * mVP;
}