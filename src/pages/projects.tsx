import Head from 'next/head'
import React, { useRef, useState, Suspense, useCallback, useEffect, useMemo } from 'react'
import { Box, ContentBox } from "../styles/Styles"
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { OrbitControls, ScrollControls, Html, Scroll, Environment, useGLTF, ContactShadows, Image, PresentationControls, useScroll } from '@react-three/drei'
import * as THREE from 'three'
import Netflix from './netflix'
import styled from 'styled-components'
import { matrixFragmentShader, vertexShader } from '@/componets/shaders'
const ContainerNetflix = styled.div`
    z-index: 11 !important; 
    max-width: 334px !important;
    max-height: 216px !important;
    box-sizing:border-box; 
    `
const HTMLContainer = styled(Html)`
    z-index: 11 !important;
    max-width: 334px !important;
    max-height: 216px !important; 
    box-sizing:border-box; 
`
const BottomComponet = styled.div`
    position:fixed;
    bottom: 0;
    left:0;
    z-index:20;
    width:calc(100vw - 64px) !important;
    max-width:100vw !important;
    height:min-content; 
    background: #00553e40;
  backdrop-filter: blur(8px) brightness(1.4);
  display: flex;

  font-family: IMB, sans-serif;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  flex-flow: column;
  color: #66ff00ef;
  text-shadow: 1px 1px 3px #77ee11;
  padding: 32px;
  margin:32px;
  overflow: visible;
`

const Matrix = () => {
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
            u_mouse: { value: new THREE.Vector2(0, 0) },
            u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },

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
        mesh.current.material.uniforms.u_mouse.value = new THREE.Vector2(
            mousePosition.current.x,
            mousePosition.current.y
        );
    });

    return (
        <mesh ref={mesh} position={[0, 0, 5]} rotation={[0, Math.PI, 0]} scale={40}>
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
const rsqw = (t, delta = 0.1, a = 1, f = 1 / (2 * Math.PI)) => (a / Math.atan(1 / delta)) * Math.atan(Math.sin(2 * Math.PI * t * f) / delta)

function LapTop(props) {
    const group = useRef<THREE.Group>(null)
    const pantalla = useRef<THREE.Group>(null)
    const { nodes, materials } = useGLTF('./mac-draco.glb') as any
    // const scroll = useScroll()
    // const r1 = scroll.range(0 / 4, 1 / 4)
    // const r2 = scroll.range(1 / 4, 1 / 4)
   
    useFrame((state) => {
        // const y = scroll.offset
        const t = state.clock.getElapsedTime()
        group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, Math.cos(t / 1) / 20 + 0.25, 0.1)
        group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, Math.sin(t / 2) / 20, 0.1)
        group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, Math.sin(t / 4) / 20, 0.1)
        group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, (-2 + Math.sin(t / 2)) / 2, 0.1)
        // pantalla.current.rotation.x = y * 3 >= Math.PI / 2 ? Math.PI / 2 : t >= Math.PI / 2 ? y * 3 : Math.PI / 2 - t
        // pantalla.current.rotation.x = Math.PI / 2 - rsqw(r1) + r2 * 0.33
        
    })
    return (
        <group rotation={[0, Math.PI, 0]} position={[0, 0, 0]}>
            <group ref={group} {...props} dispose={null}>
                <group ref={pantalla} rotation-x={-0.125} position={[0, -0.04, 0.41]}>
                    <group position={[0, 2.96, -0.13]} rotation={[Math.PI / 2, 0, 0]}>
                        <mesh material={materials.aluminium} geometry={nodes['Cube008'].geometry} />
                        <mesh material={materials['matte.001']} geometry={nodes['Cube008_1'].geometry} />
                        <mesh geometry={nodes['Cube008_2'].geometry}>
                            <HTMLContainer rotation-x={-Math.PI / 2} position={[0, 0.05, -0.09]} transform occlude zIndexRange={[11, 12]}>
                                <ContainerNetflix onPointerDown={(e) => e.stopPropagation()}>
                                    <Netflix />
                                </ContainerNetflix>
                            </HTMLContainer>
                        </mesh>
                    </group>
                </group>
                <mesh material={materials.keys} geometry={nodes.keyboard.geometry} position={[1.79, 0, 3.45]} />
                <group position={[0, -0.1, 3.39]}>
                    <mesh material={materials.aluminium} geometry={nodes['Cube002'].geometry} />
                    <mesh material={materials.trackpad} geometry={nodes['Cube002_1'].geometry} />
                </group>
                <mesh material={materials.touchbar} geometry={nodes.touchbar.geometry} position={[0, -0.03, 1.2]} />
            </group>
        </group>
    )
}

function IPhone(props) {
    const group = useRef<THREE.Group>(null)
    // const { nodes, materials } = useGLTF('./mac-draco.glb') as any
    useFrame((state) => {
        const t = state.clock.getElapsedTime()
    })
    return (
        <group rotation={[0, 0, 0]} position={[0, 0, 0]}>

        </group>
    )
}

const Description = () => {
    return <>
        <BottomComponet>
            Development of a billing solution for thousands of users in Latin America.
            <br/>
            My focus was on implementing a smooth and practical user experience using ReactJS. I developed the front-end of the site, incorporating form validation with React Hook Forms and ensuring data integrity with Yup schemas. In addition, we integrated Google reCAPTCHA v3 for additional security.

        </BottomComponet>
    </>
}
export default function Projects() {
    return (
        <>
            <Head>
                <title>Projects</title>
                <meta name="projects" content="drafts" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main>
                <Canvas camera={{ position: [0, 0, -15], fov: 55 }}>
                    <Matrix />
                    <pointLight position={[10, 10, 10]} intensity={1.5} />
                    <Suspense fallback={null}>
                         
                            <LapTop /> 
                    </Suspense>
                </Canvas>
                <Description />
            </main>
        </>

    )
}

