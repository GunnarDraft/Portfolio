import { Canvas, useFrame } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef, Suspense, useState} from "react";
import { Vector2 } from "three"; 
import { Box, Path, Content, Svg, HomeContent, CanvasContainer, Heading, Typo, Typo2, Typo3 } from '../styles/Styles'
import React from 'react'  
import { matrixFragmentShader, vertexShader } from "@/componets/shaders";

const line1 = "M0 0L550 0L600 50L600 600L50 600L0 550Z";
 
const Gradient = () => { 
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
    <mesh ref={mesh} position={[0, 0, 0]} scale={3}>
      <planeGeometry args={[2, 1, 200, 200]} />
      <shaderMaterial
        fragmentShader={matrixFragmentShader}
        vertexShader={vertexShader}
        uniforms={uniforms}
        wireframe={false}
      />
    </mesh>
  );
};

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
        <Box >
          <br />
          <Typo>
            Hello, I&apos;m an indie app developer based in Mexico!
          </Typo>
          <Heading  >
            Gunnar Valgeirsson
          </Heading>
          <Typo2>Digital ( Artist / Developer / Designer )</Typo2>
          <Typo3>
            Gunnar is a freelance and a full-stack developer based in Mexico with a
            passion for building digital services/stuff he wants. He has a knack
            for all things launching products, from planning and designing all the
            way to solving real-life problems with code.
          </Typo3>
        </Box>
        <Svg
          version="1.1"
          id="Capa_1"
          xmlns="http://www.w3.org/2000/svg"
          x="0px"
          y="0px"
          viewBox={ "0 0 600 600"}
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
