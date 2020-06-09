import React, { useMemo, useRef } from 'react';
import { useUpdate, extend } from 'react-three-fiber';
import SimplexNoise from 'simplex-noise';
import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper';

extend({ VertexNormalsHelper });

const generateTerrain = (simplex, size, height, levels, scale, offset) => {
  const noise = (level, x, z) =>
    simplex.noise2D(
      offset.x * scale + scale * level * x,
      offset.z * scale + scale * level * z
    ) /
      level +
    (level > 1 ? noise(level / 2, x, z) : 0);
  return Array.from({ length: size ** 2 }, (_, i) => {
    let x = (i % size) / size - 0.5;
    let z = Math.floor(i / size) / size - 0.5;
    return {
      x: (offset.x + x) * scale,
      y: noise(2 ** levels, x, z) * height,
      z: (offset.z + z) * scale,
    };
  });
};

const Terrain = ({
  seed,
  size,
  height,
  levels = 8,
  scale = 1,
  offset = { x: 0, z: 0 },
}) => {
  const meshRef = useRef();

  const simplex = useMemo(() => new SimplexNoise(seed), [seed]);

  const geometryRef = useUpdate(
    (geometry) => {
      geometry.vertices = generateTerrain(
        simplex,
        size,
        height,
        levels,
        scale,
        offset
      );
      geometry.elementsNeedUpdate = true;
      geometry.calculateVertexNormals();
    },
    [size, height, levels, scale, offset, seed]
  );

  return (
    <group>
      <mesh ref={meshRef}>
        <planeGeometry
          attach="geometry"
          args={[undefined, undefined, size - 1, size - 1]}
          ref={geometryRef}
        />
        <meshBasicMaterial attach="material" color="black" wireframe />
      </mesh>
      <vertexNormalsHelper args={meshRef} />
    </group>
  );
};

export default Terrain;
