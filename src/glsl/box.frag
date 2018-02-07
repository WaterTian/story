precision highp float;

uniform sampler2D map;
uniform float shadow;
uniform sampler2D depthTexture;
uniform vec2 resolution;

varying vec2 vUv;
varying vec3 vNormal;
varying float vLife;
varying vec4 vShadowCoord;
varying float vDiffuse;
varying float vSpecular;
varying float vBias;
varying vec3 vColor;


float random(vec3 seed, int i){
    vec4 seed4 = vec4(seed,i);
    float dot_product = dot(seed4, vec4(12.9898,78.233,45.164,94.673));
    return fract(sin(dot_product) * 43758.5453);
}

float sampleVisibility( vec3 coord, float bias ) {
    float depth = texture2D( depthTexture, coord.xy ).r;
    float visibility  = ( coord.z - depth > bias ) ? 0. : 1.;
    return visibility;
}

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {

    if( shadow == 1. ) {
        gl_FragColor = vec4( vec3( gl_FragCoord.z ), 1. );
        return;
    }

    const int NUM_TAPS = 12;

    vec2 poissonDisk[12];
    poissonDisk[0 ] = vec2( -0.94201624, -0.39906216 );
    poissonDisk[1 ] = vec2( 0.94558609, -0.76890725 );
    poissonDisk[2 ] = vec2( -0.094184101, -0.92938870 );
    poissonDisk[3 ] = vec2( 0.34495938, 0.29387760 );
    poissonDisk[4 ] = vec2( -0.91588581, 0.45771432 );
    poissonDisk[5 ] = vec2( -0.81544232, -0.87912464 );
    poissonDisk[6 ] = vec2( -0.38277543, 0.27676845 );
    poissonDisk[7 ] = vec2( 0.97484398, 0.75648379 );
    poissonDisk[8 ] = vec2( 0.44323325, -0.97511554 );
    poissonDisk[9 ] = vec2( 0.53742981, -0.47373420 );
    poissonDisk[10] = vec2( -0.26496911, -0.41893023 );
    poissonDisk[11] = vec2( 0.79197514, 0.19090188 );

    float occlusion = 0.;
    vec3 shadowCoord = vShadowCoord.xyz / vShadowCoord.w;

    for (int i=0; i < NUM_TAPS; i++) {
        vec2 r = .0005 * vec2(random(gl_FragCoord.xyz,1), random(gl_FragCoord.zxy,1));
        occlusion += sampleVisibility( shadowCoord + vec3(poissonDisk[i] / 700. + 0.*r, 0. ), vBias );
    }
    occlusion /= float( NUM_TAPS );
    float l = vLife/100.;

    //map
    vec4 base = texture2D(map, vUv);

    gl_FragColor.rgb = base.rgb * ( .25 + .75 * occlusion ) *1.5;

    // gl_FragColor.rgb += hsv2rgb( vec3(.95 + .1 * vColor.x, 1. - .25 * l, (.5 + .5 * vDiffuse ) * ( .25 + .75 * occlusion ) ) );
    gl_FragColor.rgb += .1 * vec3(55.,85.,149.)/255.;
    // gl_FragColor.a = length( gl_FragColor.rgb) + .2 * ( exp( l ) -1. );

    gl_FragColor.rgb += vec3(vSpecular) * occlusion *.2;
}



