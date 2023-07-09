import { useFrame } from '@react-three/fiber'
import React, { useRef, useState, Suspense, useCallback, useEffect, useMemo } from 'react'
import { Vector2 } from "three";
import PeriodicTableJSON from '../../public/PeriodicTable.json'
import { CanvasContainer, CanvasContainerAtom, HTMLContainer } from '../styles/Styles'
function Cell(props) {
    return (
        <div
            key={props.number}
            className="cell"
            data-category={props.category}
            style={{
                gridRowStart: props.ypos,
                gridColumnStart: props.xpos,
                visibility: props.visible ? "visible" : "hidden"
            }}
        >

            <span className="number">{props.number}</span>
            <span className="symbol">{props.symbol}</span>
            <span className="name">{props.name}</span>
        </div>
    );
}


export
const PeriodicTableComponet = () => {
    const [state, setState] = useState(
        PeriodicTableJSON.elements.reduce(
            (state, { category }) => Object.assign(state, { [category]: true }),
            {}
        )
    );
    return <div>
        <CanvasContainer camera={{ position: [0.0, 0.0, 3] }}>
            {/* <Orbital n={7} l={1} m={0} /> */}
            <Orbital n={7} l={1} m={0} position={[0, 0, 0]} />
            <Orbital n={5} l={1} m={1} position={[2, 0, 0]} />
            <Orbital n={6} l={2} m={0} position={[-2, 0, 0]} />
            
            <HTMLContainer position={[-4,2,0]}>
                <div className="table"> 
                    <div className="cells">
                        {PeriodicTableJSON.elements.map(e =>
                            Cell({
                                ...e,
                                visible: state[e.category]
                            })
                        )}

                    </div>
                </div>
            </HTMLContainer>
        </CanvasContainer>

        {/* <div className="categories">
                {Object.keys(state).map(category => (
                    <span key={category}>
                        <input
                            key={category}
                            type="checkbox"
                            name={category}
                            checked={state[category]}
                            onChange={event =>
                                setState({
                                    ...state,
                                    ...{ [category]: event.target.checked }
                                })
                            }
                        />
                        {category}
                    </span>
                ))}
            </div> */}
    </div>
}


interface IOrbitalProps {
    n: number;
    l: number;
    m: number;
    position?: [number, number, number];
}
const Orbital = ({ n, l, m ,position}: IOrbitalProps) => {
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
            n: {
                value: n ?? 6
            },
            l: {
                value: l ?? 3
            },
            m: {
                value: m ?? 1
            },
        }),
        [n, l, m]
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
        <mesh ref={mesh} position={[0,0,0]} scale={1}>
            <planeGeometry args={[1, 1, 200, 200]} />
            <shaderMaterial
                fragmentShader={fragmentShader}
                vertexShader={vertexShader}
                uniforms={uniforms}
                wireframe={false}
            />
        </mesh>
    );
};
export default PeriodicTableComponet

// const fragmentShader = /*glsl*/`
// #ifdef GL_ES
// precision mediump float;
// #endif

// uniform vec2 u_resolution;
// uniform float u_time;
// uniform vec2 u_mouse;

//  #define ROT(p, a) p=cos(a)*p+sin(a)*vec2(p.y, -p.x)

// float a0 = 5.1;
// uniform int  n;
// uniform int  l;
// uniform int  m;
// float A = 0.;
// float Y0 = 0.;

// float JC(int x)
// {
//     float v = 1.;
//     for (int i = 1; i <= x; i++)
//     {
//         v *= float(i);
//     }
//     return v;
// }
// int powN1(int n)
// {
//     return n % 2 == 0 ? 1 : -1;
// }
// float Cmn(int n, int m)
// {
//     return JC(n) / (JC(m) * JC(n - m));
// }
// float laguerreL(int n, int m, float x)
// {
//     float sum = 0.;
//     for (int k = 0; k <= n; k++)
//     {
//         sum += float(powN1(k))* Cmn(n + m, n - k)* pow(x, float(k)) / JC(k);
//     }
//     return sum;
// }
// float PML(float m, float l, float x)
// {
//     float A1 = pow(1. - x * x, m / 2.);
//     float sum = 0.;
//     int kl = int((l - m) / 2.);
//     for (int k = 0; k <= kl; k++)
//     {
//         float jk = JC(k);
//         float jk2 = JC(int(l) - k);
//         float jk3 = JC(int(l) - 2 * k - int(m));
//         float B = pow(2., l) * jk * jk2 * jk3;

//         float E = pow(x, l - 2. * float(k) - m);
//         sum += (float(powN1(k)) * JC(2 * int(l) - 2 * k) / B) * E;
//     }
//     return A1 * sum;
// }

// float calcR(float r)
// {
//     float B = pow(2. * r / (float(n) * a0), float(l));
//     float C = laguerreL(n - l - 1, 2 * l + 1, 2. * r / (float(n) * a0));
//     float E = exp(-(r / (float(n) * a0)));
//     return A * B * C * E;
// }
// float calcY(float cosang)
// {
//     float pml = PML(float(m), float(l),
//                     abs(cosang)
//                    );
//     float Yml = Y0 * pml;
//     return pml * Yml;
// }
// vec2 calcF(float fai)
// {
//     return vec2(cos(float(m) * fai), sin(float(m) * fai));
// }
// bool mapcor(vec3 p, out float fcolor)
// {
// 	float r = length(p);
// 	vec3 v = p / r;
// 	vec2 xz = normalize(v.xz);
// 	float R = calcR(r);

// 	float Y = calcY(v.y / length(v));
// 	float fai = atan(-xz.y, xz.x);
//     vec2 VF = calcF(fai);

// 	float epx = R * Y * VF.x;
//     float epy = R * Y * VF.y;

// 	float nlum =  (epy*epy) * 10000.0f;
// 	fcolor += nlum * 100.0f;

// 	bool ret = fcolor >= 1.0;
// 	if (ret)
// 		fcolor = 1.0;

// 	return ret;
// }

// void main( )
// {
//     vec2 pp = (-u_resolution.xy + 2.0*gl_FragCoord.xy) / u_resolution.y;
//     float eyer = 2.0;
//     float eyea = -((u_mouse.x + 80.5) / u_resolution.x) * 3.1415926 * 2.0;
//     float eyef = ((u_mouse.y / u_resolution.y)-0.24) * 3.1415926 * 2.0;

// 	vec3 cam = vec3(
//         eyer * cos(eyea) * sin(eyef),
//         eyer * cos(eyef),
//         eyer * sin(eyea) * sin(eyef));

//     ROT(cam.xz, (0.25) * (u_time + 15.0));

// 	vec3 front = normalize(- cam);
// 	vec3 left = normalize(cross(normalize(vec3(0.25,1,-0.01)), front));
// 	vec3 up = normalize(cross(front, left));
// 	vec3 v = normalize(front*3.0 + left*pp.x + up*pp.y);

//     vec3 p = cam;

//     float dt = 0.03;
//     float cor = 0.0;
//     A = sqrt(pow(2. / (float(n) * a0), 3.) * (JC(n - l - 1) / (2.0 * float(n) * JC(n + l))));
//     Y0 = (1. / sqrt(2. * 3.1415926)) * sqrt(((2. * float(l) + 1.) / 2.0) * (JC(l - m) / JC(l + m)));

//     for(int i = 0; i < 100; i ++)
//     {
//         p += v * dt;

// 		if(mapcor(p * 500., cor))
//             break;
//     }
//     vec4 color = vec4(cor,cor,cor,1.0);

//     gl_FragColor = color;
// }

// `

const fragmentShader = /*glsl*/ `
#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265359
/*** math heavy part for spherical harmonics ***/
#define SQRT2PI 2.506628274631

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;
uniform int n;
uniform int l;
uniform int m;
// factorial
float factorial(int n) {
    float res = 1.0;
    for (int i = n; i > 1; i--)
        res *= float(i);
    return res;
}

// double factorial
float doubleFactorial(int n) {
    float res = 1.0;
    for (int i = n; i > 1; i-=2)
        res *= float(i);
    return res;
}

// fac(l-m)/fac(l+m) but more stable
float stableFactorialRatio(int l, int m) {
    int am = abs(m);
    if (am > l)
        return 0.0;
    float res = 1.0;
    for (int i = max(l-am+1,2); i <= l+am; i++)
        res *= float(i);
    if (m < 0)
        return res;
    return 1.0 / res;
}

// complex exponential
vec2 complexExponential(vec2 c) {
    return exp(c.x)*vec2(cos(c.y), sin(c.y));
}

// complex multiplication
vec2 complexMultiply(vec2 a, vec2 b) {
    return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
}

// complex conjugation
vec2 complexConjugate(vec2 c) { return vec2(c.x, -c.y); }

// complex/real magnitude squared
float squareMagnitude(float x) { return x*x; }
float squareMagnitude(vec2 x) { return dot(x,x); }

// associated legendre polynomials
float associatedLegendrePolynomials(float x, int l, int m) {
    if (l < abs(m))
        return 0.0;
    if (l == 0)
        return 1.0;
    float mul = m >= 0 ? 1.0 : float((~m&1)*2-1)*stableFactorialRatio(l,m);
    m = abs(m);
    // recursive calculation of legendre polynomial
    float lp1 = 0.0;
    float lp2 = float((~m&1)*2-1)*doubleFactorial(2*m-1)*pow(max(1.0-x*x, 1e-7), float(m)/2.0);
    for (int i = m+1; i <= l; i++) {
        float lp = (x*float(2*i-1)*lp2 - float(i+m-1)*lp1)/float(i-m);
        lp1 = lp2; lp2 = lp;
    }
    return lp2 / mul;
}

// spherical harmonics function
vec2 sphericalHarmonics(float theta, float phi, int l, int m) {
    float abs_value = 1.0/SQRT2PI*sqrt(float(2*l+1)/2.0*stableFactorialRatio(l,m))
                        *associatedLegendrePolynomials(cos(theta), l, m);
    return complexExponential(vec2(0.0,float(m)*phi))*abs_value;
}

// associated laguerre polynomial L_s^k(x) with k > 0, s >= 0
float associatedLaguerrePolynomial(float x, int s, int k) {
    if (s <= 0)
        return 1.0;
    float lp1 = 1.0;
    float lp2 = 1.0 - x + float(k);
    for (int n = 1; n < s; n++) {
        float lp = ((float(2*n + k + 1) - x) * lp2 - float(n+k)*lp1)/float(n+1);
        lp1 = lp2; lp2 = lp;
    }
    return lp2;
}

// radius dependent term of the 1/r potential eigenstates in atomic units
float radialWavefunction(float r, int n, int l) {
    float a0 = 1.0; // atomic radius
    float rr = r / a0;
    float n2 = 2.0 / float(n) / a0;
    float n3 = n2 * n2 * n2;
    float p1 = sqrt(n3 * stableFactorialRatio(n, l) * float(n-l)/float(n));
    float p2 = exp(-rr/float(n));
    float p3 = pow(n2*r, float(l));
    float p4 = associatedLaguerrePolynomial(n2*r, n-l-1, 2*l+1);
    return p1 * p2 * p3 * p4;
}

vec2 hydrogenWavefunction(vec3 pos, int n, int l, int m) {
    float r = length(pos);
    float sin_theta = length(pos.xy);
    float phi = sin_theta > 0.0 ? atan(pos.x, pos.y) : 0.0;
    float theta = atan(sin_theta, pos.z);
    
    return sphericalHarmonics(theta, phi, l, m) * radialWavefunction(r, n, l);
}

/*** Now the rendering ***/

vec3 rotateAlongX(vec3 pos, float angle) {
    return vec3(pos.x, complexMultiply(pos.yz, complexExponential(vec2(0.,-angle))));
}
 
void getQuantumNumbers(out int n, out int l, out int m, in vec2 fragCoord) {
  n = 6;
    l = 2;
    m = 1;
}

float softPositive(float x, float s) {
    return 0.5*(x*x/(s+abs(x))+x+s);
}
float softMaximum(float a, float b, float s) {
    return a+softPositive(b-a,s);
}

#define SURFACE_LEVEL 0.3
float signedDistanceFunction(vec3 pos, out vec3 color, in vec2 fragCoord) {
    //int n, m, l;
    //getQuantumNumbers(n, l, m, fragCoord);

    // evaluate spherical harmonics
    vec2 off = complexExponential(vec2(0, u_time));
    
    vec2 H = hydrogenWavefunction(pos*float(n*n+1)*1.5, n, l, m);
    if (m != 0) H = complexMultiply(H, off);
    
    H *= float((l+1)*l+n*n)*sqrt(float(n)); // visual rescaling
    
    float crit2 = 0.3*(length(pos)+0.05);
    
    color = H.x > 0. ? vec3(1.0,0.,1.) : vec3(0.,1.,0.);
    float d = (SURFACE_LEVEL - abs(H.x))*crit2;
    if (m == 0)
        return softMaximum(d, 0.707*(pos.x+pos.y), 0.02);
    return d;
 
    float arg = atan(H.x, H.y);
    color = vec3(max(vec3(0.02),(sin(arg + vec3(0., 2.1, 4.2)))));
    return (0.20 - length(H))*crit2;
}

vec3 computeNormal(in vec3 world_point, float sd, in vec2 fragCoord) {
    const vec3 small_step = vec3(0.001, 0.0, 0.0);
    vec3 col;
    float gradient_x = signedDistanceFunction(world_point + small_step.xyy, col, fragCoord) - sd;
    float gradient_y = signedDistanceFunction(world_point + small_step.yxy, col, fragCoord) - sd;
    float gradient_z = signedDistanceFunction(world_point + small_step.yyx, col, fragCoord) - sd;
    vec3 normal = vec3(gradient_x, gradient_y, gradient_z);
    return normalize(normal);
}

vec4 calculateLighting(vec3 cp, vec3 color, vec3 normal, vec3 rdir) {
    // from https://www.shadertoy.com/view/ts3XDj
    // geometry
    vec3 ref = reflect( rdir, normal );

    // material      
    vec3 mate = color.rgb;

    float occ = clamp(length(cp)*0.7, 0.2, 0.5);
    float sss = -pow(clamp(1.0 + dot(normal, rdir), 0.0, 1.0), 1.0);

    // lights
    vec3 lin  = 2.5*occ*vec3(1.0)*(0.6 + 0.4*normal.y);
         lin += 1.0*sss*vec3(1.0,0.95,0.70)*occ;  

    // surface-light interacion
    vec3 col = mate.xyz * lin;
    return vec4(col, 1.0);
}

#define NUMBER_OF_STEPS 128
#define MINIMUM_HIT_DISTANCE 0.005
#define MAXIMUM_TRACE_DISTANCE 6.0
vec4 raymarch(in vec3 rpos, in vec3 rdir, in vec2 fragCoord) {
    float t = 0.0;
    float closest_t = 0.0;
    float closest_t_r = MAXIMUM_TRACE_DISTANCE;
    float closest_t_r2 = MAXIMUM_TRACE_DISTANCE;
    float closest_t_r3 = MAXIMUM_TRACE_DISTANCE;
    vec4 col = vec4(0,0,0,0);
    for (int i = 0; i < NUMBER_OF_STEPS; i++) {
        vec3 cp = rpos + t * rdir;
        
        vec3 color = vec3(0.0);
        float sd = signedDistanceFunction(cp, color, fragCoord);
        
        if (abs(sd) < 0.7*MINIMUM_HIT_DISTANCE) {
            vec3 normal = computeNormal(cp, sd, fragCoord);
            col = calculateLighting(cp, color, normal, rdir);
            break;
        }
        
        closest_t_r3 = closest_t_r2;
        closest_t_r2 = closest_t_r;
        if (sd < closest_t_r) {
            closest_t = t;
            closest_t_r = sd;
        }

        if (t > MAXIMUM_TRACE_DISTANCE)
            break;
        
        t += sd;
    }
    if (abs(closest_t_r3) > MINIMUM_HIT_DISTANCE) {
        return col;
    }
    vec3 cp = rpos + closest_t * rdir;
    vec3 color = vec3(0.0);
    float sd = signedDistanceFunction(cp, color, fragCoord);
    vec3 normal = computeNormal(cp, sd, fragCoord);
    float a = 1.0-abs(closest_t_r3)/MINIMUM_HIT_DISTANCE;
    vec4 col2 = calculateLighting(cp, color, normal, rdir);
    col2.a = a;
    return mix(col, col2, a);
}

void main() {
    vec2 uv = (-u_resolution.xy + 2.0*gl_FragCoord.xy) / u_resolution.y;
    float rot = 0.5*sin(u_time*0.5) * PI/3.0;

     // camera movement
    vec3 cam_pos = 3.0 * rotateAlongX(vec3(0,1,0), rot);
    vec3 look_at = vec3(0);   
    vec3 look_up = vec3(0,0,1);
    // camera matrix
    vec3 ww = normalize(look_at - cam_pos);
    vec3 uu = normalize(cross(ww, look_up));
    vec3 vv = normalize(cross(uu, ww));
    // create perspective view ray
    vec3 rpos = cam_pos;
    vec3 rdir = normalize( uv.x*uu + uv.y*vv + 2.0*ww );
    
    vec4 col = raymarch(rpos, rdir, gl_FragCoord.xy);
 //   vec3 bg = vec3(0.3) * clamp(1.0-2.6*length(fragCoord/u_resolution.xy-0.5)*0.5,0.0,1.0);
  //  col = vec4(mix(bg, col.rgb, col.a), 1.0);
    col = vec4(pow(clamp(col.rgb,0.0,1.0), vec3(0.4545)), 1.0);

    
    gl_FragColor = col;
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

