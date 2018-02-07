precision highp float;

attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;
attribute vec2 lookup;



uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;

uniform sampler2D curPos;
uniform sampler2D prevPos;
uniform vec3 scale;
uniform float squashiness;

uniform mat4 shadowMVP;
uniform mat4 shadowV;
uniform mat4 shadowP;
uniform vec3 lightPosition;

varying vec2 vUv;
varying vec3 vNormal;
varying float vLife;
varying vec4 vShadowCoord;
varying float vDiffuse;
varying float vSpecular;
varying float vBias;
varying vec3 vColor;


mat3 calcLookAtMatrix(vec3 origin, vec3 target, float roll) {
    vec3 rr = vec3(sin(roll), cos(roll), 0.0);
    vec3 ww = normalize(target - origin);
    vec3 uu = normalize(cross(ww, rr));
    vec3 vv = normalize(cross(uu, ww));

    return mat3(uu, vv, ww);
}

const mat4 biasMatrix = mat4(
    0.5, 0.0, 0.0, 0.0,
    0.0, 0.5, 0.0, 0.0,
    0.0, 0.0, 0.5, 0.0,
    0.5, 0.5, 0.5, 1.0
);

void main() {

    vec2 luv = lookup;
    vec4 i = texture2D( curPos, luv );
    vLife = i.w;
    vec4 p = texture2D( prevPos, luv );
    vec3 orientation = i.xyz - p.xyz;
    mat3 rot = calcLookAtMatrix( p.xyz, i.xyz, 0. );
    float squash = length(orientation);
    squash = clamp( squash, 1., 100. );
    vec3 vPosition = rot * ( position * scale * mix( vec3(1.),vec3(1. / squash,1. / squash,squash), squashiness ) );
    vPosition += mix(p.xyz, i.xyz, .5);
    vNormal = normalMatrix * rot * normal;

    if( i.w == 100. || p.w == 100. ) {
        vPosition.x += 100000.;
    }

    vUv = uv;
    vShadowCoord = biasMatrix * shadowP * modelMatrix * shadowV * vec4(vPosition,1.);

    vec4 mvp = modelViewMatrix * vec4( vPosition, 1.0 );
    vPosition = mvp.xyz;

    vec3 L = normalize( lightPosition - mvp.xyz );
    vec3 E = normalize(-mvp.xyz);

    vec3 n = normalize(vNormal);
    vDiffuse = max( 0., dot( L, n ) );
    float theta = clamp( -vDiffuse, 0., 1. );
    vBias = max(.002 * (1.0 - dot(n, L)), .002);
    vec3 R = normalize(-reflect(L,n));
    vSpecular = 4. * pow(max(dot(R,E),0.0),100.);
    vColor = vec3( lookup, 0.);

    gl_Position = projectionMatrix * mvp;

}