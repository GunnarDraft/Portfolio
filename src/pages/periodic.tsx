import { useFrame } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { Vector2 } from "three";
import { CanvasContainer } from '../styles/Styles'
import React from 'react'
import { fragmentShader, vertexShader } from "@/componets/orbitalShader";

const PeriodicTableShader = () => {
  const mesh = useRef(null);
  const mousePosition = useRef({ x: 0, y: 0 });

  const updateMousePosition = useCallback((e) => {
    mousePosition.current = { x: e.pageX, y: e.pageY };
  }, []);

  const uniforms = useMemo(
    () => ({
      u_time: { value: 0.0 },
      u_mouse: { value: new Vector2() },
      u_resolution: { value: new Vector2(window.innerWidth, window.innerHeight) },

      // Configuración Global
      u_layout_mode: { value: 0 },       // 0: Tabla, 1: Cuántico
      u_filter_active: { value: 0 },     // 0: Inactivo, 1: Activo
      u_color_mode: { value: 0 },        // 0: Espín, 1: Visible, 2: Absorción, 3: Real


      // Filtros Dinámicos (Rangos Inclusivos)
      // u_enable_id_filter: { value: 0 }, u_filter_id_start: { value: 0 }, u_filter_id_end: { value: 0 },
      // u_enable_l_filter: { value: 1 }, u_filter_l_start: { value: 0 }, u_filter_l_end: { value: 3 },
      // u_enable_n_filter: { value: 0 }, u_filter_n_start: { value: 0 }, u_filter_n_end: { value: -1 },
      // u_enable_spin_filter: { value: 0 }, u_filter_spin_start: { value: 1 }, u_filter_spin_end: { value: 1 },
      // u_enable_m_filter: { value: 0 }, u_filter_m_start: { value: 0 }, u_filter_m_end: { value: -1 }
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
        fragmentShader={fragmentShader}
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
  return <div>
    <Scene />
  </div>;
};
