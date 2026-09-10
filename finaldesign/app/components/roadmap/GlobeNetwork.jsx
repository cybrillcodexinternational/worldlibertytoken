"use client";

const CX = 200;
const CY = 200;
const R = 176;

function normalize(v) {
  const len = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / len, v[1] / len, v[2] / len];
}

function midpoint(a, b) {
  return normalize([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]);
}

function rotateY(v, a) {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [v[0] * c - v[2] * s, v[1], v[0] * s + v[2] * c];
}

function rotateX(v, a) {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [v[0], v[1] * c - v[2] * s, v[1] * s + v[2] * c];
}

function buildGeodesic() {
  const t = (1 + Math.sqrt(5)) / 2;
  let verts = [
    [-1, t, 0],
    [1, t, 0],
    [-1, -t, 0],
    [1, -t, 0],
    [0, -1, t],
    [0, 1, t],
    [0, -1, -t],
    [0, 1, -t],
    [t, 0, -1],
    [t, 0, 1],
    [-t, 0, -1],
    [-t, 0, 1],
  ].map(normalize);

  let faces = [
    [0, 11, 5],
    [0, 5, 1],
    [0, 1, 7],
    [0, 7, 10],
    [0, 10, 11],
    [1, 5, 9],
    [5, 11, 4],
    [11, 10, 2],
    [10, 7, 6],
    [7, 1, 8],
    [3, 9, 4],
    [3, 4, 2],
    [3, 2, 6],
    [3, 6, 8],
    [3, 8, 9],
    [4, 9, 5],
    [2, 4, 11],
    [6, 2, 10],
    [8, 6, 7],
    [9, 8, 1],
  ];

  const cache = new Map();
  const getMid = (i, j) => {
    const key = i < j ? `${i}-${j}` : `${j}-${i}`;
    if (cache.has(key)) return cache.get(key);
    const idx = verts.length;
    verts.push(midpoint(verts[i], verts[j]));
    cache.set(key, idx);
    return idx;
  };

  for (let s = 0; s < 2; s += 1) {
    const next = [];
    cache.clear();
    faces.forEach(([a, b, c]) => {
      const ab = getMid(a, b);
      const bc = getMid(b, c);
      const ca = getMid(c, a);
      next.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]);
    });
    faces = next;
  }

  const rotY = -0.72;
  const rotX = 0.18;
  const projected = verts.map((v) => {
    const r = rotateX(rotateY(v, rotY), rotX);
    return {
      x: r[0],
      y: r[1],
      z: r[2],
      px: CX + r[0] * R,
      py: CY + r[1] * R,
    };
  });

  const edgeSet = new Set();
  const edges = [];
  faces.forEach(([a, b, c]) => {
    [
      [a, b],
      [b, c],
      [c, a],
    ].forEach(([i, j]) => {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (edgeSet.has(key)) return;
      edgeSet.add(key);
      const pa = projected[i];
      const pb = projected[j];
      if (pa.z < -0.08 && pb.z < -0.08) return;
      edges.push([i, j]);
    });
  });

  return { points: projected, edges };
}

const { points, edges } = buildGeodesic();

export default function GlobeNetwork() {
  return (
    <svg
      viewBox="0 0 400 400"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id="wltGlobeFill" cx="32%" cy="42%" r="68%">
          <stop offset="0%" stopColor="#1c1c14" />
          <stop offset="42%" stopColor="#0d0d0c" />
          <stop offset="78%" stopColor="#070706" />
          <stop offset="100%" stopColor="#050505" />
        </radialGradient>
        <radialGradient id="wltGlobeLimb" cx="18%" cy="48%" r="72%">
          <stop offset="0%" stopColor="hsla(70.79deg, 67%, 59%, 0.55)" />
          <stop offset="28%" stopColor="hsla(70.79deg, 67%, 59%, 0.12)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <filter id="wltDotGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle cx={CX} cy={CY} r={R} fill="url(#wltGlobeFill)" />
      <circle cx={CX} cy={CY} r={R} fill="url(#wltGlobeLimb)" />
      <circle
        cx={CX}
        cy={CY}
        r={R}
        fill="none"
        stroke="hsla(70.79deg, 78%, 62%, 0.9)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="210 900"
        strokeDashoffset="28"
        transform="rotate(-78 200 200)"
        opacity="0.85"
      />
      <g stroke="hsla(70.79deg, 67%, 59%, 0.42)" strokeWidth="0.7" fill="none">
        {edges.map(([a, b]) => {
          const pa = points[a];
          const pb = points[b];
          const depth = (pa.z + pb.z) / 2;
          const opacity = 0.18 + Math.max(0, depth) * 0.55;
          return (
            <line
              key={`${a}-${b}`}
              x1={pa.px}
              y1={pa.py}
              x2={pb.px}
              y2={pb.py}
              opacity={opacity}
            />
          );
        })}
      </g>
      <g filter="url(#wltDotGlow)">
        {points
          .filter((p) => p.z > -0.12)
          .map((p, i) => (
            <circle
              key={i}
              cx={p.px}
              cy={p.py}
              r={1.05 + Math.max(0, p.z) * 1.15}
              fill="hsl(70.79deg, 78%, 68%)"
              opacity={0.45 + Math.max(0, p.z) * 0.55}
            />
          ))}
      </g>
    </svg>
  );
}
