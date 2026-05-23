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
  </div>;
};
