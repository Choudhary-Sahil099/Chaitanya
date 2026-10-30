import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import type { Group } from "three";
import { Bounds, Center, useGLTF } from "@react-three/drei";
import * as THREE from "three";


function SkinModel() {
  const { scene } = useGLTF("/models/Untitled_optimized.glb");
  const { size } = useThree();

  const modelRef = useRef<Group>(null);

  // Detect desktop versus mobile canvas.
  const isDesktop = size.width > 800;

  const model = useMemo(() => scene.clone(true), [scene]);

  useFrame((state) => {
    if (!modelRef.current) return;

    const time = state.clock.elapsedTime;

    modelRef.current.rotation.x = Math.sin(time * 0.5) * 0.12;
    modelRef.current.rotation.y = Math.sin(time * 0.35) * 0.18;
  });

  return (
    <Bounds fit clip observe margin={isDesktop ? 2.2 : 1.0}>
      <Center>
        <group ref={modelRef}>
          <primitive object={model} />
        </group>
      </Center>
    </Bounds>
  );
}


export default function SkinScene() {
  return (
    <div
      className="skin-scene"
      aria-label="Interactive 3D skin model visualization"
      role="img"
    >
      <div className="scene-glow scene-glow-one" />
      <div className="scene-glow scene-glow-two" />

      <Canvas
        className="skin-scene-canvas"
        camera={{
          position: [0, 0, 5],
          fov: 35,
          near: 0.1,
          far: 1000,
        }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
        }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.LinearToneMapping;
          gl.toneMappingExposure = Math.pow(2, -0.3);
        }}
      >
        <ambientLight color="#ffffff" intensity={0.3} />

        <directionalLight
          color="#ffffff"
          intensity={2.5}
          position={[4, 5, 6]}
        />

        <Suspense fallback={null}>
          <SkinModel />
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload("/models/Untitled_optimized.glb");
