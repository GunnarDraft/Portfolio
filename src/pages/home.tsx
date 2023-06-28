import { Canvas, useFrame } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { MathUtils, Vector2 } from "three";
import { OrbitControls } from "@react-three/drei";
import { Color } from "three";
import styled from "styled-components";

const fragmentShader = /*glsl*/`  
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

// vec2 harmonic(vec3 k, float l, float m) {
//     if (length(k) > 0.0) k = normalize(k);
//     vec2 o = vec2(1, 0);
//     o *= legendre(k.z, l, m);
//     o *= pow(-1.0, m) * sqrt((2.0 * l + 1.0) / (4.0 * pi) * factorial(l - m) / factorial(l + m));
//     return o;
// }

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
// vec2 hydrogen(vec3 k, float n, float l, float m) {
//     vec2 o = harmonic(k, l, m);
//     float p = 2.0 * length(k) / n;
//     o *= laguerre(p, n - l - 1.0, 2.0 * l + 1.0);
//     o *= exp(-p * 0.5) * pow(p, l);
//     return o * normalization(n, l);
// }
vec4 color (vec2 u) {

    return dot(u,u)*(0.5+0.5*normalize(sin(atan(u.y,u.x)+vec4(1,0,0,4))));
}
void main() { 

    vec2 uv = (-u_resolution.xy + 2.0*gl_FragCoord.xy) / u_resolution.y;
    vec3 p = vec3(0,0,-120);
    vec3 d = normalize(vec3(uv,1));
    vec2 t = vec2(u_time);
   
    t = 6.2*u_mouse.xy/R.x;
        
    p.xy *= ei(t.x);
    p.yz *= ei(t.y);
    d.xy *= ei(t.x);
    d.yz *= ei(t.y);
    gl_FragColor = vec4(0);
    
    float n = 6., l = 3., m = 1.;
    for (int i = 0; i < 100; i++) {
        vec2 psi = 35.*hydrogen(p,n,l,m);
        float ro = dot(psi,psi);
        p += 3.*d*exp(-200.*ro);
        gl_FragColor += color(psi);
    }
    
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

const fragmentShader2 = /*glsl*/`
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time; 
uniform vec2 u_mouse;
uniform sampler2D u_channel0;

#define ROT(p, a) p=cos(a)*p+sin(a)*vec2(p.y, -p.x)

float a0 = 5.1;
int  n = 2;
int  l = 0;
int  m = 0;
float A = 0.;
float Y0 = 0.;

float JC(int x)
{
    float v = 1.;
    for (int i = 1; i <= x; i++)
    {
        v *= float(i);
    }
    return v;
}
int powN1(int n)
{
    return n % 2 == 0 ? 1 : -1;
}
float Cmn(int n, int m)
{
    return JC(n) / (JC(m) * JC(n - m));
}
float laguerreL(int n, int m, float x)
{
    float sum = 0.;
    for (int k = 0; k <= n; k++)
    {
        sum += float(powN1(k))* Cmn(n + m, n - k)* pow(x, float(k)) / JC(k);
    }
    return sum;
}
float PML(float m, float l, float x)
{
    float A1 = pow(1. - x * x, m / 2.);
    float sum = 0.;
    int kl = int((l - m) / 2.);
    for (int k = 0; k <= kl; k++)
    {
        float jk = JC(k);
        float jk2 = JC(int(l) - k);
        float jk3 = JC(int(l) - 2 * k - int(m));
        float B = pow(2., l) * jk * jk2 * jk3;

        float E = pow(x, l - 2. * float(k) - m);
        sum += (float(powN1(k)) * JC(2 * int(l) - 2 * k) / B) * E;
    }
    return A1 * sum;
}

float calcR(float r)
{
    float B = pow(2. * r / (float(n) * a0), float(l));
    float C = laguerreL(n - l - 1, 2 * l + 1, 2. * r / (float(n) * a0));
    float E = exp(-(r / (float(n) * a0)));
    return A * B * C * E;
}
float calcY(float cosang)
{
    float pml = PML(float(m), float(l), 
                    abs(cosang)
                   ); 
    float Yml = Y0 * pml;
    return pml * Yml;
}
vec2 calcF(float fai)
{
    return vec2(cos(float(m) * fai), sin(float(m) * fai));
}
bool mapcor(vec3 p, out float fcolor)
{
	float r = length(p);
	vec3 v = p / r;
	vec2 xz = normalize(v.xz);
	float R = calcR(r);

	float Y = calcY(v.y / length(v));
	float fai = atan(-xz.y, xz.x);
    vec2 VF = calcF(fai);
	
	float epx = R * Y * VF.x;
    float epy = R * Y * VF.y;
	
	float nlum =  (epy*epy) * 10000.0f;
	fcolor += nlum * 100.0f;

	bool ret = fcolor >= 1.0;
	if (ret)
		fcolor = 1.0;
    
	return ret;
}

void main()
{
    vec2 pp = (-u_resolution.xy + 2.0*gl_FragCoord.xy) / u_resolution.y;
    float eyer = 2.0;
    float eyea = -((u_mouse.x + 80.5) / u_resolution.x) * 3.1415926 * 2.0;
    float eyef = ((u_mouse.y / u_resolution.y)-0.24) * 3.1415926 * 2.0;
    
	vec3 cam = vec3(
        eyer * cos(eyea) * sin(eyef),
        eyer * cos(eyef),
        eyer * sin(eyea) * sin(eyef));
    
    ROT(cam.xz, (0.25) * (u_time + 15.0));
    
	vec3 front = normalize(- cam);
	vec3 left = normalize(cross(normalize(vec3(0.25,1,-0.01)), front));
	vec3 up = normalize(cross(front, left));
	vec3 v = normalize(front*1.75 + left*pp.x + up*pp.y);
    
    vec3 p = cam;
    
    float dt = 0.03;
    float cor = 0.0;
    A = sqrt(pow(2. / (float(n) * a0), 3.) * (JC(n - l - 1) / (2.0 * float(n) * JC(n + l))));
    Y0 = (1. / sqrt(2. * 3.1415926)) * sqrt(((2. * float(l) + 1.) / 2.0) * (JC(l - m) / JC(l + m)));
    
    for(int i = 0; i < 100; i ++)
    {
        p += v * dt;
        
		if(mapcor(p * 500., cor))
            break;
    }
    vec4 color = vec4(cor,cor,cor,1.0);
	
    gl_FragColor = color;
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
    <mesh ref={mesh} position={[0, 0, 0]} scale={1}>
      <planeGeometry args={[1, 1, 100, 100]} />
      <shaderMaterial
        fragmentShader={fragmentShader2}
        vertexShader={vertexShader}
        uniforms={uniforms}
        wireframe={false}
      />
    </mesh>
  );
};
const CanvasContainer = styled(Canvas)`
display: flex;
position: absolute;
height: 100vh;
width: 100vw;
flex:1; 
`
 
export default function Home() {

  return <CanvasContainer camera={{ position: [0.0, 0.0, 1.5] }}>
      <Gradient />
    </CanvasContainer>;
};
