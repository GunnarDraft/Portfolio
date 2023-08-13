import { useFrame } from '@react-three/fiber'
import React, { useRef, useState, Suspense, useCallback, useEffect, useMemo } from 'react'
import { Vector2 } from "three";
import PeriodicTableJSON from '../../public/PeriodicTable.json'
import { CanvasContainer, CanvasContainerAtom, HTMLContainer } from '../styles/Styles'
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
    return <div>
        <CanvasContainer camera={{ position: [0.0, 0.0, 3] }}>
            {/* <Orbital n={7} l={1} m={0} /> */}
            <Orbital n={7} l={1} m={0} position={[0, 0, 0]} />
            <Orbital n={5} l={1} m={1} position={[0.21, 0, 0]} />
            <Orbital n={6} l={2} m={0} position={[-0.21, 0, 0]} />
            
            <HTMLContainer position={[-4,2,0]}>
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
}
const Orbital = ({ n, l, m ,position}: IOrbitalProps) => {
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

        mesh.current.material.uniforms.u_time.value = clock.getElapsedTime();
        
    });
    return (
        <mesh ref={mesh} position={position} scale={1}>
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


 