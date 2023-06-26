import styled from 'styled-components'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import React, { useRef, useState, Suspense } from 'react'
import PeriodicTableJSON from "./periodictable.json";
import { OrbitControls } from "@react-three/drei";
import { Vector2, Color } from "three";

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

function PeriodicTable(props) {
    const [state, setState] = useState(
        props.elements.reduce(
            (state, { category }) => Object.assign(state, { [category]: true }),
            {}
        )
    );
    return (
        <div className="table">
            <div className="cells">
                {props.elements.map(e =>
                    Cell({
                        ...e,
                        visible: state[e.category]
                    })
                )}
            </div>
            <div className="categories">
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
            </div>
        </div>
    );
}


// const PeriodicTable = () => {

//     return <div>
//         <h1>Periodic Table</h1>
//         <GridTable>
//             <table>
//                 <tbody>
//                     <tr>
//                         <td>H</td>
//                         <td colSpan={16}>A</td>
//                         <td>He</td>
//                     </tr>
//                     <tr>
//                         <td>Li</td>
//                         <td>Be</td>
//                         <td colSpan={10}></td>
//                         <td>B</td>
//                         <td>C</td>
//                         <td>N</td>
//                         <td>O</td>
//                         <td>F</td>
//                         <td>Ne</td>
//                     </tr>
//                     <tr>
//                         <td>Na</td>
//                         <td>Mg</td>
//                         <td colSpan={10}></td>
//                         <td>Al</td>
//                         <td>Si</td>
//                         <td>P</td>
//                         <td>S</td>
//                         <td>Cl</td>
//                         <td>Ar</td>
//                     </tr>
//                 </tbody>
//             </table>

//             <Element/>
//         </GridTable>
//     </div>
// }

const PeriodicTableComponet = () => {
    return <div>
        <Suspense fallback={null}>
            {PeriodicTableJSON ?
                <div>
                    <PeriodicTable elements={PeriodicTableJSON.elements} />
                    <Canvas camera={{ position: [0.0, 10.0, 10.0] }}>
                        <Cube />
                    </Canvas>
                </div>
                : null}
        </Suspense>
    </div>
}
const fragmentShader = /*glsl*/` 
mat2 cx(vec2 b) {
    return mat2(b.x, -b.y, b.y, b.x);
}

mat2 ei(float a) {
    return cx(vec2(cos(a), sin(a)));
}  

uniform vec3 u_resolution;
uniform vec4 u_mouse;
uniform float u_time;

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
    o *= pow(-1.,m)*sqrt((2.*l+1.)/(4.*3.14159265359)*factorial(l-m)/factorial(l+m));
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

    return dot(u,u)*(0.5+0.5*normalize(sin(atan(u.y,u.x)+vec4(1,4,4,4))));
}
void main() {
     vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    uv = 2.*(uv-0.5*u_resolution.xy)/u_resolution.xy.y;
    vec3 p = vec3(0,0,-60);
    vec3 d = normalize(vec3(uv,1));
    vec2 t = vec2(u_time);
    if (u_mouse.z>0.0)
        t = 6.2*u_mouse.xy/u_resolution.xy.x;
    p.xy *= ei(t.x);
    p.yz *= ei(t.y);
    d.xy *= ei(t.x);
    d.yz *= ei(t.y);
    vec4 glFragColor = vec4(0);
    
    float n = 5., l = 2., m = 0.;
    for (int i = 0; i < 100; i++) {
        vec2 psi = 35.*hydrogen(p,n,l,m);
        float ro = dot(psi,psi);
        p += 3.*d*exp(-200.*ro);
        glFragColor += color(psi);
    } 
    gl_FragColor = glFragColor;
}
  
`;


const Cube = () => {
    const mesh = useRef(null);

    return (
        <mesh ref={mesh}>
            <shaderMaterial
                fragmentShader={fragmentShader}
            />
        </mesh>
    );
};
export default PeriodicTableComponet