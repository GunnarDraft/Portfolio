import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { MathUtils } from "three";
import { OrbitControls } from "@react-three/drei";


// const Blob = () => {
//   // This reference will give us direct access to the mesh
//   const mesh = useRef(null);
//   const hover = useRef(false);

//   const uniforms = useMemo(
//     () => ({
//       u_intensity: {
//         value: 0.3,
//       },
//       u_time: {
//         value: 0.0,
//       },
//     }),
//     []
//   );

//   useFrame((state) => {
//     const { clock } = state;
//     mesh.current.material.uniforms.u_time.value = 0.4 * clock.getElapsedTime();

//     mesh.current.material.uniforms.u_intensity.value = MathUtils.lerp(
//       mesh.current.material.uniforms.u_intensity.value,
//       hover.current ? 0.85 : 0.15,
//       0.02
//     );

//   });

//   return (
//     <mesh
//       ref={mesh}
//       position={[0, 0, 0]}
//       scale={1.5}
//       onPointerOver={() => (hover.current = true)}
//       onPointerOut={() => (hover.current = false)}
//     >
//       <icosahedronGeometry args={[2, 20]} />
//       {/* <shaderMaterial
//         fragmentShader={fragmentShader}
//         vertexShader={vertexShader}
//         uniforms={uniforms}
//         wireframe={false}
//       /> */}
//     </mesh>
//   );
// };

//OrbitControls props limitan el valor minimo y maximo del zoom y limito el desplazamiento de la camara mas no la rotacion
const controls = {
  enableZoom: true,
  enablePan: true,
  minDistance: 8,
  maxDistance: 16,
}

function CanvasContainer() {
  const controlsRef = useRef(null);

  useFrame((state) => {
    const { clock } = state;
    const elapsed = clock.getElapsedTime();
    // Acceder al evento de OrbitControls a través de controlsRef.current
    const { target } = controlsRef.current;

    // Realizar acciones con el evento de OrbitControls
    if (target.x > 30) target.x = Math.min(30, 30 * (elapsed / 2));
    if (target.x < -30) target.x = -Math.min(30, 30 * (elapsed / 2));
    if (target.z > 30) target.z = Math.min(30, 30 * (elapsed / 2));
    if (target.z < -30) target.z = -Math.min(30, 30 * (elapsed / 2));
    if (target.y > 30) target.y = Math.min(30, 30 * (elapsed / 2));
    if (target.y < -30) target.y = -Math.min(30, 30 * (elapsed / 2));
  });
  return <OrbitControls ref={controlsRef} enablePan enableZoom minDistance={8} maxDistance={16} />
}

export default function Home() {

  return (
    <Canvas camera={{ position: [0.0, 0.0, 8.0] }}>
      {/* <Blob /> */}
      <axesHelper />
      <CanvasContainer/> 
    </Canvas>
  );
};
