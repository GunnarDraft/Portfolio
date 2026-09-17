import { useFrame } from '@react-three/fiber'
import React, { useRef, useState, Suspense, useCallback, useEffect, useMemo } from 'react'
import { Mesh, ShaderMaterial, Vector2, Vector3 } from "three";
import type { ThreeEvent } from '@react-three/fiber';
import type { RefObject } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';

const AnnotationLayer = styled.div`
    position: fixed;
    inset: 0;
    z-index: 20;
    pointer-events: none;
    overflow: hidden;
`;

const AnnotationLine = styled.div`
    position: absolute;
    height: 1px;
    transform-origin: 0 50%;
    background: rgba(190, 255, 145, 0.72);
    box-shadow: 0 0 6px rgba(150, 255, 90, 0.32);
`;

const AnnotationLabel = styled(motion.span)`
    position: absolute;
    color: #c7ff9b;
    font-family: IMB, monospace;
    font-size: 0.78rem;
    letter-spacing: 0.04em;
    text-decoration: underline;
    text-underline-offset: 0.25em;
    white-space: nowrap;
    text-shadow: 0 0 8px rgba(120, 255, 60, 0.35);
    pointer-events: auto;
    user-select: text !important;
`;

interface HoveredAtom {
    name: string;
    position: Vector3;
}

function OrbitalAnnotation({ hovered, anchorRef }: { hovered: HoveredAtom | null; anchorRef: RefObject<HTMLDivElement | null> }) {
    const lineRef = useRef<HTMLDivElement>(null);
    const labelRef = useRef<HTMLSpanElement>(null);

    useFrame(({ camera, size }) => {
        if (!hovered || !lineRef.current || !labelRef.current) return;
        const projected = hovered.position.clone().project(camera);
        const x = (projected.x * 0.5 + 0.5) * size.width;
        const y = (-projected.y * 0.5 + 0.5) * size.height;
        const labelX = Math.min(x + 46, size.width - labelRef.current.offsetWidth - 16);
        const labelY = Math.max(16, Math.min(y - 10, size.height - 24));
        const dx = labelX - x;
        const dy = labelY - y;
        const length = Math.hypot(dx, dy);
        lineRef.current.style.left = `${x}px`;
        lineRef.current.style.top = `${y}px`;
        lineRef.current.style.width = `${length}px`;
        lineRef.current.style.transform = `rotate(${Math.atan2(dy, dx)}rad)`;
        labelRef.current.style.left = `${labelX}px`;
        labelRef.current.style.top = `${labelY}px`;
    });

    return (
        <AnnotationLayer ref={anchorRef} aria-live="polite">
            <AnimatePresence>
                {hovered && (
                    <>
                        <AnnotationLine ref={lineRef} as={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
                        <AnnotationLabel ref={labelRef} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}>
                            {hovered.name}
                        </AnnotationLabel>
                    </>
                )}
            </AnimatePresence>
        </AnnotationLayer>
    );
}

const atomPosition = (position: [number, number, number] | undefined, target: Vector3) => target.set(...(position ?? [0, 0, 0]));

import PeriodicTableJSON from '../../public/PeriodicTable.json'
import { CanvasContainer, HTMLContainer } from '../styles/Styles'
import { vertexShader, atomFragmentShader } from '@/componets/shaders';
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
        const [hovered, setHovered] = useState<HoveredAtom | null>(null);
        const annotationRef = useRef<HTMLDivElement>(null);

        return <div className="periodic-visualization">
            <CanvasContainer camera={{ position: [0.0, 0.0, 3] }}>
                {/* <Orbital n={7} l={1} m={0} /> */}
                <Orbital n={7} l={1} m={0} name="Hydrogen" position={[0, 0, 0]} onHover={setHovered} />
                <Orbital n={5} l={1} m={1} name="Helium" position={[0.21, 0, 0]} onHover={setHovered} />
                <Orbital n={6} l={2} m={0} name="Carbon" position={[-0.21, 0, 0]} onHover={setHovered} />

                <OrbitalAnnotation hovered={hovered} anchorRef={annotationRef} />

                <HTMLContainer position={[-4, 2, 0]}>
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
    name: string;
    onHover: (atom: HoveredAtom | null) => void;
}
const Orbital = ({ n, l, m, position, name, onHover }: IOrbitalProps) => {
    // This reference will give us direct access to the mesh
    const mesh = useRef<Mesh>(null);
    const mousePosition = useRef({ x: 0, y: 0 });
    const worldPosition = useRef(new Vector3());

    const updateMousePosition = useCallback((e) => {
        mousePosition.current = { x: e.pageX, y: e.pageY };
    }, []);

    const uniforms = useMemo(
        () => ({
            u_time: {
                value: 0.0,
            },
            u_resolution: { value: new Vector2(200, 200) },
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

        if (mesh.current) {
            (mesh.current.material as ShaderMaterial).uniforms.u_time.value = clock.getElapsedTime();
            mesh.current.getWorldPosition(worldPosition.current);
        }

    });
    const handlePointerOver = (event: ThreeEvent<PointerEvent>) => {
        event.stopPropagation();
        mesh.current?.getWorldPosition(worldPosition.current);
        onHover({ name, position: worldPosition.current.clone() });
    };

    const handlePointerOut = (event: ThreeEvent<PointerEvent>) => {
        event.stopPropagation();
        onHover(null);
    };

    return (
        <mesh ref={mesh} position={position} scale={1} onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
            <planeGeometry args={[1, 1, 200, 200]} />
            <shaderMaterial
                fragmentShader={atomFragmentShader}
                vertexShader={vertexShader}
                uniforms={uniforms}
                wireframe={false}
            />
        </mesh>
    );
};
export default PeriodicTableComponet


