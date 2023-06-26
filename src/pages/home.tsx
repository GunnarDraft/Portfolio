import { Canvas, useFrame } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { MathUtils, Vector2 } from "three";
import { OrbitControls } from "@react-three/drei";
import { Color } from "three";
import styled from "styled-components";

const fragmentShaderGunnar = /*glsl*/`  
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time; 
uniform vec2 u_mouse;
uniform sampler2D u_channel0;

#define R u_resolution.xy
#define A(U) texture(u_channel0,(U)/R)
#define cx(b) mat2((b).x,-(b).y,(b).yx)
#define ei(a) cx(vec2(cos(a),sin(a)))
#define norm(v) (length(v)<=0.?vec2(0):normalize(v))
#define pi 3.14159265359
float factorial (float n) {
    float o = 1.;
    for (float i = 1.; i <= n; i++) 
        o *= i;
    return o;
}
float legendre (float x, float l, float m) {
    float p0 = 1.;
    for (float i = 0.; i<m; i++) 
        p0 = (1.-2.*i)*sqrt(1.-x*x)*p0;
    if (l == m) return p0;
    float p1 = (2.*m+1.)*x*p0;
    for (float i = m+2.; i < l; i++) {
        float t = ((2.*i-1.)*x*p1-(i+m-1.)*p0)/(i-m);
        p0 = p1;
        p1 = t;
    }
    return p1;
}
float laguerre (float x, float k, float a) {
    float _0 = 1.;
    float _1 = 1.+a-x;
    for (float i = 0.; i < k; i++) {
        float t = ((2.*i+1.+a-x)*_1-(i+a)*_0)/(i+1.);
        _0 = _1;
        _1 = t;
    }
    return _0;
}
vec2 harmonic (vec3 k, float l, float m) {
    if (length(k)>0.) k = normalize(k);
    vec2 o = vec2(1,0)*ei(atan(k.y,k.x)*m);
    o *= legendre(k.z,l,m);
    o *= pow(-1.,m)*sqrt((2.*l+1.)/(4.*pi)*factorial(l-m)/factorial(l+m));
    return o;
}
float normalization (float n, float l) {
    return sqrt(pow(2./n,3.)/(2.*n)*factorial(n-l-1.)/factorial(n+l));
}
vec2 hydrogen (vec3 k, float n, float l, float m) {
    
    vec2 o = harmonic(k,l,m);
    float p = 2.*length(k)/n;
    o *= laguerre(p,n-l-1.,2.*l+1.);
    o *= exp(-p*.5)*pow(p,l);
    return o*normalization(n,l);
}
vec4 color (vec2 u) {

    return dot(u,u)*(0.5+0.5*normalize(sin(atan(u.y,u.x)+vec4(1,0,0,4))));
}
void main() { 

    vec2 uv = (-u_resolution.xy + 2.0*gl_FragCoord.xy) / u_resolution.y;
    vec3 p = vec3(0,0,-60);
    vec3 d = normalize(vec3(uv,1));
    vec2 t = vec2(u_time);
   
    t = 6.2*u_mouse.xy/R.x;
        
    p.xy *= ei(t.x);
    p.yz *= ei(t.y);
    d.xy *= ei(t.x);
    d.yz *= ei(t.y);
    gl_FragColor = vec4(0);
    
    float n = 5., l = 3., m = 0.;
    for (int i = 0; i < 100; i++) {
        vec2 psi = 35.*hydrogen(p,n,l,m);
        float ro = dot(psi,psi);
        p += 3.*d*exp(-200.*ro);
        gl_FragColor += color(psi);
    }
    
}

`

//OrbitControls props limitan el valor minimo y maximo del zoom y limito el desplazamiento de la camara mas no la rotacion
const controls = {
  enableZoom: true,
  enablePan: true,
  minDistance: 8,
  maxDistance: 16,
}



const fragmentShader =  /*glsl*/`
 uniform float u_time;

uniform vec3 u_bg;
uniform vec3 u_colorA;
uniform vec3 u_colorB;
uniform vec2 u_mouse;
uniform vec2 u_resolution; 
uniform float u_intensity;  
uniform float u_frame;
varying vec2 vUv;
 
#define n 3
#define l 2
#define m 0

#define EXPOSURE 1.0
 
#define FOV 1.5

#define STEP_SIZE 4.0

#define STEP_SIZE_SHADOW 0.4

#define CUTOFF 0.008
#define DENSITY 16.0

#define POSITIVE_COL vec3(0.250, 1.000, 0.500)
#define NEGATIVE_COL vec3(1.000, 0.500, 0.250)
 
#if n < 1
#error n must be greater than 0
#endif
 

#if l < 0
#error l must be greater than or equal to 0
#endif

#if l >= n
#error l must be less than n
#endif
 

#if m > l || -m > l
#error m must be less than or equal to abs(l)
#endif
 
const float pi     = 3.141592653589793; // Pi
const float two_pi = 6.283185307179586; // 2 * Pi
const float inv_pi = 0.318309886183790; // 1 / Pi
 
const float a0 = 0.52946541;
 
float dot_product(vec2 x) { return dot(x, x); }
float dot_product(vec3 x) { return dot(x, x); }
float dot_product(vec4 x) { return dot(x, x); }

vec2 rotate(vec2 vector, float theta)
{
    float s = sin(theta), c = cos(theta);
    return vec2(vector.x * c - vector.y * s, vector.x * s + vector.y * c);
}

int factorial(int x)
{
    int f = 1;

    for(int i = 1; i <= x; i++)
    {
        f = f * i;
    }

    return f;
}
 
vec3 cartesian2spherical(vec3 p)
{
    return vec3(
    length(p), // r
    atan(p.y, p.x), // theta
    atan(length(p.xy), p.z) // phi
    );
}
 
vec3 spherical2cartesian(vec3 p)
{
    float r     = p.x;
    float theta = p.y;
    float phi   = p.z;

    return vec3(
    cos(theta) * sin(phi),
    sin(theta) * sin(phi),
    cos(phi)
    );
}
 
const float k01 = 0.2820947918; // sqrt(  1 / PI) / 2
const float k02 = 0.4886025119; // sqrt(  3 / PI) / 2
const float k03 = 1.0925484306; // sqrt( 15 / PI) / 2
const float k04 = 0.3153915652; // sqrt(  5 / PI) / 4
const float k05 = 0.5462742153; // sqrt( 15 / PI) / 4
const float k06 = 0.5900435860; // sqrt( 70 / PI) / 8
const float k07 = 2.8906114210; // sqrt(105 / PI) / 2
const float k08 = 0.4570214810; // sqrt( 42 / PI) / 8
const float k09 = 0.3731763300; // sqrt(  7 / PI) / 4
const float k10 = 1.4453057110; // sqrt(105 / PI) / 4
 
float SH( in vec3 s )
{ 
    vec3 n_ = s.zxy;

    //----------------------------------------------------------
    if( l==0 )          return  k01;
    //----------------------------------------------------------
    if( l==1 && m==-1 ) return -k02 * n_.y;
    if( l==1 && m== 0 ) return  k02 * n_.z;
    if( l==1 && m== 1 ) return -k02 * n_.x;
    //----------------------------------------------------------
	if( l==2 && m==-2 ) return  k03 * n_.x * n_.y;
    if( l==2 && m==-1 ) return -k03 * n_.y * n_.z;
    if( l==2 && m== 0 ) return  k04 * (3.0 * n_.z * n_.z - 1.0);
    if( l==2 && m== 1 ) return -k03 * n_.x * n_.z;
    if( l==2 && m== 2 ) return  k05 * (n_.x * n_.x - n_.y * n_.y);
    //----------------------------------------------------------
    if( l==3 && m==-3 ) return -k06 * n_.y * (3.0 * n_.x * n_.x - n_.y * n_.y);
    if( l==3 && m==-2 ) return  k07 * n_.z * n_.y * n_.x;
    if( l==3 && m==-1 ) return -k08 * n_.y * (5.0 * n_.z * n_.z - 1.0);
    if( l==3 && m== 0 ) return  k09 * n_.z * (5.0 * n_.z * n_.z - 3.0);
    if( l==3 && m== 1 ) return -k08 * n_.x * (5.0 * n_.z * n_.z - 1.0);
    if( l==3 && m== 2 ) return  k10 * n_.z * (n_.x * n_.x - n_.y * n_.y);
    if( l==3 && m== 3 ) return -k06 * n_.x * (n_.x * n_.x - 3.0 * n_.y * n_.y);
    //----------------------------------------------------------

    return 0.0;
} 
float L(float rho)
{
    return 1.0;
} 
float Y(float theta, float phi)
{
    vec3 p = spherical2cartesian( vec3(1.0, theta, phi) );

    return SH(p);
}
 
float wavefunction(float r, float theta, float phi)
{
    float rho = (2.0 * r) / (float(n) * a0);

    float f0 = 2.0 / (float(n) * a0);
    float f1 = float( factorial(n - l - 1) ) / float( 2 * n * factorial(n + l) );

    return sqrt(f0 * f0 * f0 * f1) * exp(-rho / 2.0) * pow( rho, float(l) ) * L(rho) * Y(theta, phi);
}

// ##### Rendering #####

vec3 sky(vec3 dir)
{
    return vec3(0);
    return vec3(1) * 0.8 * smoothstep(0.0, 1.0, dir.y) + 0.2;
}

float sample_volume(in vec3 p, out vec3 col)
{
    col = vec3(0.100, 0.250, 1.000);

    if(dot_product(p) > 32.0 * 32.0)
    {
        return 0.0;
    }
 

    p = vec3(rotate(p.xy, 1.0 * (0.1 / 3.0) * two_pi * u_time), p.z).xyz;
    p = vec3(rotate(p.xz, 2.0 * (0.1 / 3.0) * two_pi * u_time), p.y).xzy;
    p = vec3(rotate(p.yz, 3.0 * (0.1 / 3.0) * two_pi * u_time), p.x).yzx;

    p = cartesian2spherical(p);
    float r     = p.x;
    float theta = p.y;
    float phi   = p.z;

    float w = wavefunction(r, theta, phi);

    if(w > 0.0)
    {
        col = POSITIVE_COL;
    }
    else
    {
        col = NEGATIVE_COL;
    }

    return DENSITY * max(abs(w) - CUTOFF, 0.0);
}

vec3 sample_light(vec3 ro, vec3 rd)
{
    vec3 a = vec3(1);

    for(int i = 0; i < 10; i++)
    {
        float t = STEP_SIZE_SHADOW * float(i);

        vec3 p = ro + rd * t;

        vec3 c;
        float d = sample_volume(p, c);

        if(d > 0.0)
        {
            a *= exp(-STEP_SIZE_SHADOW * c * d);
        }
    }

    return a;
}
 
float ign(vec2 pixel_coord, int frame)
{
    frame = frame % 64;

    pixel_coord += 5.588238 * float(frame);

    return fract( 52.9829189 * fract(0.06711056 * pixel_coord.x + 0.00583715 * pixel_coord.y) );
}
 
void main()
{
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);

    // vec2 uv = 2.0 * (gl_FragCoord - 0.5 * u_resolution.xy) / max(u_resolution.x, u_resolution.y);
    vec2 uv = (-u_resolution.xy + 2.0*gl_FragCoord.xy) / u_resolution.y;
    #ifdef ORTHO
    vec3 ro = vec3( FOV * uv ,  16.0);
    vec3 rd = vec3( 0.0,  0.0,  -1.0);
    #else 
    vec3 ro = vec3( 0.0, 0.0, 16.0);
    vec3 rd = normalize( vec3(FOV * uv, -1.0) );
    #endif
 

    vec3 att = vec3(1);
    vec3 col = vec3(0);

    float dither = STEP_SIZE * ign(floor(uv), u_frame);

    for(int i = 0; i < 40; i++)
    {
        float t = ( STEP_SIZE * float(i) ) + dither;

        vec3 p = ro + rd * t;

        #ifndef ORTHO
        if(dot_product(p) > 16.0 * 16.0)
        {
            break;
        }
        #else
        if(dot_product(p) > 32.0 * 32.0)
        {
            break;
        }
        #endif

        vec3 c;
        float d = sample_volume(p, c);

        if(d > 0.0)
        {
            col += STEP_SIZE * att * d * sample_light( p, normalize( vec3(1, 1, 0) ) );
 
            att *= exp(-STEP_SIZE * d);
        }
    }

    gl_FragColor.rgb = col + att * sky(rd);

    #ifdef EXPOSURE
    gl_FragColor.rgb = smoothstep( 0.0, 1.0, 1.0 - exp(-max(gl_FragColor.rgb, 0.0) * EXPOSURE) );
    #endif
}

`
const vertexShader = /*glsl*/` 
void main() { 

  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;

  gl_Position = projectedPosition;
}

`
const Gradient = () => {
  // This reference will give us direct access to the mesh
  const mesh = useRef(null);
  const mousePosition = useRef({ x: 0, y: 0 });

  const updateMousePosition = useCallback((e) => {
    mousePosition.current = { x: e.pageX, y: e.pageY };
  }, []);

  const uniforms = useMemo(
    () => ({
      u_time: {
        value: 0.0,
      },
      u_mouse: { value: new Vector2(0, 0) },
      u_resolution: { value: new Vector2(window.innerWidth, window.innerHeight) },
    }),
    []
  );

  useEffect(() => {
    window.addEventListener("mousemove", updateMousePosition, false);

    return () => {
      window.removeEventListener("mousemove", updateMousePosition, false);
    };
  }, [updateMousePosition]);

  useFrame((state) => {
    const { clock } = state;

    mesh.current.material.uniforms.u_time.value = clock.getElapsedTime();
    mesh.current.material.uniforms.u_mouse.value = new Vector2(
      mousePosition.current.x,
      mousePosition.current.y
    );
  });

  return (
    <mesh ref={mesh} position={[0, 0, 0]} scale={1.5}>
      <planeGeometry args={[1, 1, 100, 100]} />
      <shaderMaterial
        fragmentShader={fragmentShaderGunnar}
        vertexShader={vertexShader}
        uniforms={uniforms}
        wireframe={false}
      />
    </mesh>
  );
};
const CanvasContainer = styled(Canvas)`
display: flex;
height: 100vh;
width: 100vw;
flex:1;
`
const Scene = () => {
  return (
    <CanvasContainer camera={{ position: [0.0, 0.0, 1.5] }}>
      <Gradient />
    </CanvasContainer>
  );
};

export default function Home() {

  return <Scene />;
};
