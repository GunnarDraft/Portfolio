import { useFrame } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { Vector2 } from "three";
import { Box, Content, Svg, SvgIn, SvgBehance, HomeContent, CanvasContainer, Heading, Typo, Typo2, Typo3, WarningBox, Path } from '../styles/Styles'
import React from 'react'
import { periodicTableFragmentShader, vertexShader } from "@/componets/shaders";

const line1 = "M0 0L550 0L600 50L600 600L50 600L0 550Z";

const PeriodicTableShader = () => {
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
    
    const handleResize = () => {
      if (mesh.current) {
        mesh.current.material.uniforms.u_resolution.value = new Vector2(
          window.innerWidth,
          window.innerHeight
        );
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("mousemove", updateMousePosition, false);
      window.removeEventListener("resize", handleResize);
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
        fragmentShader={periodicTableFragmentShader}
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
      <PeriodicTableShader />
    </CanvasContainer>
  );
};


export default function PeriodicTable() {
  const linkedIn = () => {
    const url = 'https://www.linkedin.com/in/gunnarmedina';
    window.open(url, '_blank');
  }
  const behance = () => {
    const url = 'https://www.behance.net/gunnarvalgeir';
    window.open(url, '_blank');
  }
  return <div>
    <Scene />
    <HomeContent>
      <Content>
        <Box >
          <br />
          <Typo>
            Interactive Quantum Visualization
          </Typo>
          <Heading>
            Periodic Table
          </Heading>
          <Typo2>Electron Orbital Density Visualization</Typo2>
          <Typo3>
            This visualization renders all 118 elements of the periodic table using 
            real quantum mechanical wavefunctions. Each atom displays its electron 
            orbital probability density based on quantum numbers (n, l, m, s). 
            The colors represent the actual macroscopic appearance of each element.
            Use your mouse to rotate the view.
          </Typo3>
        </Box>
        <SvgIn
          version="1.1"
          id="linkedin"
          xmlns="http://www.w3.org/2000/svg"
          x="0px"
          y="0px"
          viewBox={"0 0 20 20"}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 1 }}
          onClick={linkedIn}
        >
          <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"></path>
        </SvgIn>
        <SvgBehance version="1.1"
          id="linkedin"
          xmlns="http://www.w3.org/2000/svg"
          x="0px"
          y="0px"
          viewBox={"0 0 152.5 28.2"}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 1 }}
          onClick={behance}
        >
          <path d="M13.1 0c1.3 0 2.5.1 3.6.4 1.1.2 2 .6 2.8 1.1.8.5 1.4 1.2 1.8 2.1.4.9.6 2 .6 3.2 0 1.4-.3 2.6-1 3.5-.6.9-1.6 1.7-2.8 2.3 1.7.5 3 1.4 3.8 2.6.8 1.2 1.3 2.7 1.3 4.4 0 1.4-.3 2.6-.8 3.6s-1.3 1.9-2.2 2.5c-.9.6-2 1.1-3.2 1.4-1.2.3-2.4.5-3.6.5H0V0h13.1zm-.8 11.2c1.1 0 2-.3 2.7-.8.7-.5 1-1.4 1-2.5 0-.6-.1-1.2-.3-1.6-.2-.4-.5-.7-.9-1-.4-.2-.8-.4-1.3-.5-.5-.1-1-.1-1.6-.1H6.1v6.5h6.2zm.3 11.8c.6 0 1.2-.1 1.7-.2s1-.3 1.4-.6c.4-.3.7-.6 1-1.1.2-.5.4-1.1.4-1.8 0-1.4-.4-2.4-1.2-3.1-.8-.6-1.9-.9-3.2-.9H6.1V23h6.5zm19.3-.1c.8.8 2 1.2 3.6 1.2 1.1 0 2.1-.3 2.9-.8.8-.6 1.3-1.2 1.5-1.8h4.9c-.8 2.4-2 4.1-3.6 5.2-1.6 1-3.5 1.6-5.8 1.6-1.6 0-3-.3-4.3-.8-1.3-.5-2.3-1.2-3.2-2.2-.9-.9-1.6-2-2-3.3-.5-1.3-.7-2.7-.7-4.3 0-1.5.2-2.9.7-4.2.5-1.3 1.2-2.4 2.1-3.4.9-.9 2-1.7 3.2-2.2 1.3-.5 2.6-.8 4.2-.8 1.7 0 3.2.3 4.5 1 1.3.7 2.3 1.5 3.1 2.7.8 1.1 1.4 2.4 1.8 3.8.2 1.4.3 2.8.2 4.4H30.5c0 1.6.6 3.1 1.4 3.9zm6.3-10.5c-.7-.7-1.8-1.1-3.1-1.1-.9 0-1.6.2-2.2.5-.6.3-1 .7-1.4 1.1-.4.4-.6.9-.7 1.4-.1.5-.2.9-.2 1.3h9c-.2-1.5-.7-2.5-1.4-3.2zM52.8 0v10.4h.1c.7-1.2 1.6-2 2.7-2.5s2.1-.8 3.2-.8c1.5 0 2.7.2 3.6.6.9.4 1.7 1 2.2 1.7.5.7.9 1.6 1.1 2.6.2 1 .3 2.1.3 3.4v12.3h-5.5V16.4c0-1.7-.3-2.9-.8-3.7-.5-.8-1.4-1.2-2.7-1.2-1.5 0-2.6.5-3.2 1.3-.7.9-1 2.4-1 4.4v10.5h-5.5V0h5.5zM70 10.6c.6-.9 1.3-1.5 2.2-2.1.9-.5 1.9-.9 3-1.1 1.1-.2 2.2-.3 3.3-.3 1 0 2 .1 3.1.2 1 .1 2 .4 2.8.8.9.4 1.5 1 2.1 1.7.5.7.8 1.7.8 2.9v10.5c0 .9.1 1.8.2 2.6s.4 1.5.7 1.9h-5.6c-.2-.2-.3-.6-.4-.9-.1-.3-.1-.7-.1-1-.9.9-1.9 1.5-3.1 1.9-1.2.4-2.4.5-3.6.5-1 0-1.8-.1-2.7-.4-.8-.2-1.5-.6-2.2-1.1-.6-.5-1.1-1.1-1.5-1.9-.3-.8-.5-1.6-.5-2.7s.2-2.1.6-2.8c.4-.7.9-1.3 1.5-1.8.6-.4 1.4-.8 2.2-1 .8-.2 1.6-.4 2.5-.5l2.4-.3c.8-.1 1.5-.2 2.1-.3.6-.2 1.1-.4 1.5-.7.4-.3.5-.7.5-1.3 0-.6-.1-1.1-.3-1.4-.2-.3-.5-.6-.8-.8-.3-.2-.7-.3-1.1-.4-.4-.1-.9-.1-1.4-.1-1.1 0-1.9.2-2.5.7-.6.5-1 1.3-1.1 2.3h-5.5c0-1.2.4-2.3.9-3.1zm10.9 7.8c-.3.1-.7.2-1.1.3-.4.1-.8.1-1.3.2-.4.1-.9.1-1.3.2l-1.2.3c-.4.1-.8.3-1 .5-.3.2-.5.5-.7.8-.3.4-.3.8-.3 1.3s.1.9.3 1.2c.2.3.4.6.7.8.3.2.7.3 1.1.4.4.1.8.1 1.3.1.7 0 1.3-.1 1.8-.3.5-.2.9-.5 1.2-.8.3-.3.5-.7.6-1.1.1-.4.2-.8.2-1.2v-2.5c-.3.2-.6.4-.9.5-.2.1-.5.2-.9.3h-.5zm17.2-9.3v3.7h-4v8.2c0 .4.1.7.2.9.1.2.3.4.5.5.2.1.4.2.7.2s.6 0 1 0h1.5v4.2c-.5 0-1.1.1-1.7.1s-1.2.1-1.8.1c-1 0-1.9-.1-2.6-.2-.8-.1-1.4-.4-1.9-.7-.5-.4-.9-.9-1.2-1.5-.3-.6-.4-1.4-.4-2.4V13h-3.4V9.1h3.4V4.3h5.6v4.8H98z"></path>
          <rect x="113.3" y="2.5" width="11" height="3"/>
          <path d="M115.3 27.6c-1.6 0-2.9-.3-4.1-.8-1.2-.6-2.2-1.3-3-2.2-.8-.9-1.4-2-1.9-3.2-.4-1.2-.6-2.5-.6-3.9s.2-2.7.6-3.9c.4-1.2 1.1-2.3 1.9-3.3.8-.9 1.8-1.7 3-2.2 1.2-.6 2.6-.8 4.1-.8s2.9.3 4.1.8c1.2.6 2.2 1.3 3 2.2.8.9 1.4 2 1.9 3.2.4 1.2.6 2.5.6 3.9s-.2 2.7-.6 3.9c-.4 1.2-1.1 2.3-1.9 3.2-.8.9-1.8 1.7-3 2.2-1.2.6-2.5.9-4.1.9zm0-4.2c.8 0 1.5-.2 2.1-.5.6-.4 1.1-.8 1.5-1.4.4-.6.7-1.2.8-1.9.2-.7.3-1.4.3-2.2 0-.7-.1-1.4-.3-2.2-.2-.7-.5-1.4-.8-1.9-.4-.6-.9-1.1-1.5-1.4-.6-.4-1.3-.5-2.1-.5-.8 0-1.5.2-2.1.5-.6.4-1.1.8-1.5 1.4-.4.6-.7 1.2-.8 1.9-.2.7-.3 1.4-.3 2.2 0 .7.1 1.4.3 2.2.2.7.5 1.4.8 1.9.4.6.9 1.1 1.5 1.4.6.3 1.3.5 2.1.5zm17.8-14.2c.6-.9 1.3-1.5 2.2-2.1.9-.5 1.9-.9 3-1.1 1.1-.2 2.2-.3 3.3-.3 1 0 2 .1 3.1.2 1 .1 2 .4 2.8.8.9.4 1.5 1 2.1 1.7.5.7.8 1.7.8 2.9v10.5c0 .9.1 1.8.2 2.6s.4 1.5.7 1.9h-5.6c-.2-.2-.3-.6-.4-.9-.1-.3-.1-.7-.1-1-.9.9-1.9 1.5-3.1 1.9-1.2.4-2.4.5-3.6.5-1 0-1.8-.1-2.7-.4-.8-.2-1.5-.6-2.2-1.1-.6-.5-1.1-1.1-1.5-1.9-.3-.8-.5-1.6-.5-2.7s.2-2.1.6-2.8c.4-.7.9-1.3 1.5-1.8.6-.4 1.4-.8 2.2-1 .8-.2 1.6-.4 2.5-.5l2.4-.3c.8-.1 1.5-.2 2.1-.3.6-.2 1.1-.4 1.5-.7.4-.3.5-.7.5-1.3 0-.6-.1-1.1-.3-1.4-.2-.3-.5-.6-.8-.8-.3-.2-.7-.3-1.1-.4-.4-.1-.9-.1-1.4-.1-1.1 0-1.9.2-2.5.7-.6.5-1 1.3-1.1 2.3h-5.5c.1-1.3.4-2.3 1-3.2zm10.8 7.8c-.3.1-.7.2-1.1.3-.4.1-.8.1-1.3.2-.4.1-.9.1-1.3.2l-1.2.3c-.4.1-.8.3-1 .5-.3.2-.5.5-.7.8-.3.4-.3.8-.3 1.3s.1.9.3 1.2c.2.3.4.6.7.8.3.2.7.3 1.1.4.4.1.8.1 1.3.1.7 0 1.3-.1 1.8-.3.5-.2.9-.5 1.2-.8.3-.3.5-.7.6-1.1.1-.4.2-.8.2-1.2v-2.5c-.3.2-.6.4-.9.5-.2.1-.5.2-.9.3h-.5z"></path>
        </SvgBehance>
        <Svg
          version="1.1"
          id="Capa_1"
          xmlns="http://www.w3.org/2000/svg"
          x="0px"
          y="0px"
          viewBox={"0 0 600 600"}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 1 }}
        >
          <Path d={line1} />
        </Svg>
      </Content>
      <WarningBox > 
        <Typo>Warning!</Typo>
        <Typo2>This visualization contains animated elements and may cause visual discomfort. The shader renders 118 quantum orbital calculations in real-time.</Typo2>
      </WarningBox>
    </HomeContent>
  </div>;
};
