import {  useFrame } from '@react-three/fiber'
import React, { useRef, useState, Suspense, useCallback, useEffect, useMemo } from 'react'
import { Vector2 } from "three";
import PeriodicTableJSON from '../../public/PeriodicTable.json'
import { CanvasContainerAtom, DivContainer } from '../styles/Styles'

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
            {props.n > 0 && props.m > 0 && props.l > 0 ?
                <CanvasContainerAtom camera={{ position: [0.0, 0.0, 1.5] }}>
                    <Orbital n={props.n} l={props.l} m={props.m} />
                </CanvasContainerAtom>
                : <div> </div>}
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
    );
}


const PeriodicTableComponet = () => {
    return <DivContainer>
        <PeriodicTable elements={PeriodicTableJSON.elements} />
    </DivContainer>
}


interface IOrbitalProps {
    n: number;
    l: number;
    m: number;
}
const Orbital = ({ n, l, m }: IOrbitalProps) => {
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
            u_resolution: { value: new Vector2(100, 100) },
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

        <mesh ref={mesh} position={[0, 0, 0]} scale={2}>
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

const fragmentShader = /*glsl*/`  
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time; 
uniform vec2 u_mouse; 

 #define ROT(p, a) p=cos(a)*p+sin(a)*vec2(p.y, -p.x)

float a0 = 5.1;
uniform int  n;
uniform int  l;
uniform int  m;
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

void main( )
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
	vec3 v = normalize(front*3.0 + left*pp.x + up*pp.y);
    
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

const vertexShader = /*glsl*/` 
void main() { 

  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;

  gl_Position = projectedPosition;
}

`

