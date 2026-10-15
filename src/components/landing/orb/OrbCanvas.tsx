"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ORB_STATES, type OrbStateId } from "./orb-states";

/* ── Shaders ──────────────────────────────────────────────────────────
   Vertex: two octaves of simplex noise displace an icosphere along its
   normals on top of a breathing scale — the "living" surface.
   Fragment: strictly monochrome. Deep-ink core luminance + ivory fresnel
   rim + faint topographic contour bands carved from displacement.      */

const SIMPLEX = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
`;

const VERTEX = /* glsl */ `
uniform float uTime;
uniform float uNoiseAmp;
uniform float uNoiseFreq;
uniform float uBreatheRate;
uniform float uBreatheDepth;
varying float vDisp;
varying vec3 vNormalV;
varying vec3 vPosV;
${SIMPLEX}
void main() {
  float breathe = 1.0 + uBreatheDepth * sin(uTime * uBreatheRate);
  vec3 pos = position * breathe;
  float n1 = snoise(pos * uNoiseFreq + vec3(0.0, 0.0, uTime * 0.34));
  float n2 = snoise(pos * uNoiseFreq * 2.15 - vec3(uTime * 0.22, 0.0, 0.0)) * 0.28;
  float disp = (n1 + n2) * uNoiseAmp;
  vDisp = disp;
  pos += normal * disp;
  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  vNormalV = normalize(normalMatrix * normal);
  vPosV = mv.xyz;
  gl_Position = projectionMatrix * mv;
}
`;

const FRAGMENT = /* glsl */ `
uniform float uRim;
uniform float uCore;
uniform float uFresnelPower;
uniform float uTime;
varying float vDisp;
varying vec3 vNormalV;
varying vec3 vPosV;
void main() {
  vec3 viewDir = normalize(-vPosV);
  vec3 n = normalize(vNormalV);
  float facing = max(dot(viewDir, n), 0.0);
  float fres = pow(1.0 - facing, uFresnelPower);

  vec3 ink   = vec3(0.055, 0.062, 0.075);
  vec3 ivory = vec3(0.957, 0.949, 0.925);

  float lum = uCore * pow(facing, 1.7) + uRim * fres;

  // Topographic contour bands carved from displacement
  float bands = smoothstep(0.38, 0.5, abs(fract(vDisp * 26.0) - 0.5));
  float bandLight = bands * 0.08 * fres;

  // Slow inner shimmer, like light moving under skin
  float shimmer = 0.028 * sin(uTime * 0.9 + vDisp * 16.0);

  vec3 col = mix(ink, ivory, clamp(lum, 0.0, 1.0));
  col += vec3(bandLight + shimmer);
  gl_FragColor = vec4(col, 1.0);
}
`;

/* ── The orb mesh ─────────────────────────────────────────────────── */

function OrbMesh({ state }: { state: OrbStateId }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const shellRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);

  // Initial uniform values — owned by the material after mount; all
  // runtime mutation happens through matRef (the ref escape hatch),
  // never by rewriting this object.
  const initialUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uNoiseAmp: { value: ORB_STATES.idle.noiseAmp },
      uNoiseFreq: { value: ORB_STATES.idle.noiseFreq },
      uBreatheRate: { value: ORB_STATES.idle.breatheRate },
      uBreatheDepth: { value: ORB_STATES.idle.breatheDepth },
      uRim: { value: ORB_STATES.idle.rim },
      uCore: { value: ORB_STATES.idle.core },
      uFresnelPower: { value: ORB_STATES.idle.fresnelPower },
    }),
    [],
  );

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = ORB_STATES[state];
    // Exponential damping — mood change, not a cut.
    const k = 1 - Math.exp(-2.6 * dt);

    const mat = matRef.current;
    if (mat) {
      const u = mat.uniforms;
      u.uTime.value += dt;
      u.uNoiseAmp.value += (t.noiseAmp - u.uNoiseAmp.value) * k;
      u.uNoiseFreq.value += (t.noiseFreq - u.uNoiseFreq.value) * k;
      u.uBreatheRate.value += (t.breatheRate - u.uBreatheRate.value) * k;
      u.uBreatheDepth.value += (t.breatheDepth - u.uBreatheDepth.value) * k;
      u.uRim.value += (t.rim - u.uRim.value) * k;
      u.uCore.value += (t.core - u.uCore.value) * k;
      u.uFresnelPower.value += (t.fresnelPower - u.uFresnelPower.value) * k;
    }

    if (meshRef.current) {
      meshRef.current.rotation.y += dt * t.speed;
      meshRef.current.rotation.x += dt * t.speed * 0.38;
      meshRef.current.rotation.z += dt * t.speed * 0.12;
    }
    if (shellRef.current) {
      shellRef.current.rotation.y -= dt * t.speed * 0.55;
      shellRef.current.rotation.x -= dt * t.speed * 0.2;
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1, 32]} />
        <shaderMaterial
          ref={matRef}
          uniforms={initialUniforms}
          vertexShader={VERTEX}
          fragmentShader={FRAGMENT}
        />
      </mesh>
      {/* Instrument shell — a sparse wireframe cage rotating against the body */}
      <mesh ref={shellRef} scale={1.34}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial
          color="#f4f2ec"
          wireframe
          transparent
          opacity={0.045}
        />
      </mesh>
    </group>
  );
}

/* ── Canvas entry (dynamically imported, client-only) ─────────────── */

export default function OrbCanvas({ state }: { state: OrbStateId }) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 3.35], fov: 42 }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      }}
      style={{ width: "100%", height: "100%" }}
    >
      <OrbMesh state={state} />
    </Canvas>
  );
}
