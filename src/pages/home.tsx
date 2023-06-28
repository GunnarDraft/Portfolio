import { Canvas, useFrame } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { Vector2 } from "three";
import styled from "styled-components";
import { Box, Path, Content, Svg, HomeContent } from '../styles/Styles'
import React, { Suspense } from 'react'
const line1 = "M0 0L350 0L400 50L400 400L50 400L0 350Z";

const vertexShader = /*glsl*/` 
void main() { 

  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;

  gl_Position = projectedPosition;
}

`
const fragmentShader = /*glsl*/`  
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time; 
uniform vec2 u_mouse; 

 #define ROT(p, a) p=cos(a)*p+sin(a)*vec2(p.y, -p.x)

float a0 = 5.1;
int  n = 3;
int  l = 2;
int  m = 1;
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
      u_resolution: { value: new Vector2(100, 100) },

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
const CanvasContainer = styled(Canvas)` 
position: absolute;
height: 100px !important;
width: 100px !important; 
`
const Scene = () => {
  return (
    <CanvasContainer camera={{ position: [0.0, 0.0, 1.5] }}>
      <Gradient />
    </CanvasContainer>
  );
};

export default function Home() {
  return <div>
    <Scene />
    <HomeContent>
      <Content>
        <Box>Welcome</Box>
        <Svg
          version="1.1"
          id="Capa_1"
          xmlns="http://www.w3.org/2000/svg"
          x="0px"
          y="0px"
          viewBox="0 0 400 400"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 1 }}
        >
          <Path d={line1} />
        </Svg>
      </Content>
    </HomeContent>
  </div>
    ;
};
