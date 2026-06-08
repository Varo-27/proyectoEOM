import type { GraphEdge } from "./GraphEdges";
import { getNodeSize, nodeBottom, nodeCenterX, nodeTop } from "./MinimalNode";

/** 7 filas: profundidad 0 (raíz) … 6 */
export const ROWS = 7;
const MAX_DEPTH = ROWS - 1;
const V_GAP = 40;
const MAX_TREE_WIDTH = 1680;
const MAX_NODES = 80;
const PER_BRANCH_MAX = 18;
/** Cadencia constante entre nodos profundos (depth ≥ 2) */
const DEEP_INTERVAL = 3;
/** Mínimo de frames tras el padre antes de que aparezca un hijo */
const MIN_PARENT_DELAY = 4;
/** Empieza a soltar nietos mientras aún entran los últimos hijos */
const DEEP_START = 62;
const HIJO_GAP = 308;

export type FlatNode = {
  id: string;
  label: string;
  depth: number;
  x: number;
  y: number;
  appearFrame: number;
  parentId?: string;
};

type InternalNode = {
  id: string;
  label: string;
  depth: number;
  targetDepth: number;
  children: InternalNode[];
  cx: number;
  y: number;
  appearFrame: number;
  localX?: number;
};

const HIJOS = [
  "",
  "",
  "",
  "",
  "",
];

const isHijo = (nodeId: string) => /^h\d+$/.test(nodeId);

const branchIndex = (nodeId: string) => {
  const m = nodeId.match(/^h(\d+)/);
  return m ? Number(m[1]) : 0;
};

const LABELS = [
  "Archivo oral",
  "Redes locales",
  "Lenguas",
  "Migración",
  "Patrimonio",
  "Cuidados",
  "Género",
  "Conflictos",
  "Educación",
  "Medicina",
  "Arte",
  "Datos",
  "Justicia",
  "Memoria",
  "Cooperativa",
  "Nodo α",
  "Nodo β",
  "Nodo γ",
  "Nodo δ",
  "Nodo ε",
  "Nodo ζ",
  "Nodo η",
  "Nodo θ",
  "Ref 01",
  "Ref 02",
  "Ref 03",
  "Ref 04",
  "Ref 05",
  "Ref 06",
  "Ref 07",
];

const hash = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

const rand = (seed: string, n = 0) => {
  const x = Math.sin(hash(`${seed}:${n}`)) * 10000;
  return x - Math.floor(x);
};

const rowY = (depth: number, rootY: number) => {
  let y = rootY;
  for (let d = 0; d < depth; d++) {
    y += getNodeSize(d).h + V_GAP;
  }
  return y;
};

let labelCursor = 0;
const nextLabel = () => LABELS[labelCursor++ % LABELS.length]!;

/** Profundidad máxima desigual pero varias ramas llegan lejos. */
const branchTarget = (hijoIndex: number) => {
  const presets = [5, 6, 5, 6, 5];
  const base = presets[hijoIndex] ?? 5;
  const jitter = rand(`branch-${hijoIndex}`, 1) > 0.75 ? 1 : 0;
  return Math.min(MAX_DEPTH, base + jitter);
};

/** Nietos (fila 2): 2–3 por cada hijo principal. Más profundo: 1–3 desigual. */
const childCount = (parentId: string, depth: number) => {
  const r = rand(parentId, depth + 50);
  if (depth === 2 && isHijo(parentId)) {
    return r < 0.45 ? 2 : 3;
  }
  if (r < 0.4) return 1;
  if (r < 0.78) return 2;
  return 3;
};

const growBranch = (
  parent: InternalNode,
  total: { n: number },
  branchBudget: { n: number },
) => {
  if (parent.depth >= parent.targetDepth || parent.depth >= MAX_DEPTH) return;
  if (total.n >= MAX_NODES || branchBudget.n >= PER_BRANCH_MAX) return;

  const nextDepth = parent.depth + 1;
  let count = childCount(parent.id, nextDepth);

  // Cada rama principal tiene al menos 2 nietos
  if (isHijo(parent.id) && parent.children.length === 0) {
    count = Math.max(count, 2);
  }

  for (let i = 0; i < count; i++) {
    if (total.n >= MAX_NODES || branchBudget.n >= PER_BRANCH_MAX) break;
    const child: InternalNode = {
      id: `${parent.id}.${i}`,
      label: nextLabel(),
      depth: nextDepth,
      targetDepth: parent.targetDepth,
      children: [],
      cx: 0,
      y: 0,
      appearFrame: 0,
    };
    parent.children.push(child);
    total.n++;
    branchBudget.n++;
  }

  for (const child of parent.children) {
    growBranch(child, total, branchBudget);
  }
};

const buildStructure = (): InternalNode => {
  labelCursor = 0;

  const root: InternalNode = {
    id: "root",
    label: "",
    depth: 0,
    targetDepth: MAX_DEPTH,
    children: [],
    cx: 0,
    y: 0,
    appearFrame: 0,
  };

  const total = { n: 1 };

  HIJOS.forEach((label, i) => {
    const hijo: InternalNode = {
      id: `h${i}`,
      label,
      depth: 1,
      targetDepth: branchTarget(i),
      children: [],
      cx: 0,
      y: 0,
      appearFrame: 0,
    };
    root.children.push(hijo);
    total.n++;
    growBranch(hijo, total, { n: 1 });
  });

  return root;
};

const leafUnit = () => {
  let maxW = 0;
  for (let d = 2; d < ROWS; d++) {
    maxW = Math.max(maxW, getNodeSize(d).w);
  }
  return maxW + 32;
};

/** Hijos alineados bajo la raíz; nietos+ solo dentro de cada columna de rama. */
const layoutTree = (root: InternalNode, centerX: number, rootY: number) => {
  root.cx = centerX;
  root.y = rowY(0, rootY);

  const hijoCount = root.children.length;
  const hijoSpan = (hijoCount - 1) * HIJO_GAP;

  root.children.forEach((hijo, i) => {
    hijo.cx = centerX - hijoSpan / 2 + i * HIJO_GAP;
    hijo.y = rowY(1, rootY);
    layoutBranchUnder(hijo);
  });

  // Compresión global suave si el árbol desborda (sin mover la fila de hijos)
  let minX = Infinity;
  let maxX = -Infinity;
  const measure = (node: InternalNode) => {
    const half = getNodeSize(node.depth).w / 2;
    minX = Math.min(minX, node.cx - half);
    maxX = Math.max(maxX, node.cx + half);
    node.children.forEach(measure);
  };
  measure(root);

  const span = maxX - minX;
  if (span > MAX_TREE_WIDTH) {
    const scale = MAX_TREE_WIDTH / span;
    const squash = (node: InternalNode, anchor: number, depth: number) => {
      if (depth >= 2) {
        node.cx = anchor + (node.cx - anchor) * scale;
      }
      node.y = rowY(node.depth, rootY);
      node.children.forEach((c) => squash(c, node.cx, depth + 1));
    };
    root.y = rowY(0, rootY);
    root.children.forEach((hijo, i) => {
      hijo.cx = centerX - hijoSpan / 2 + i * HIJO_GAP;
      hijo.y = rowY(1, rootY);
      squash(hijo, hijo.cx, 2);
    });
  } else {
    const applyY = (node: InternalNode) => {
      node.y = rowY(node.depth, rootY);
      node.children.forEach(applyY);
    };
    applyY(root);
  }
};

/** Layout por hojas relativo al hijo ancla; nietos centrados en su rama. */
const layoutBranchUnder = (hijo: InternalNode) => {
  if (hijo.children.length === 0) return;

  const leaf = { i: 0 };

  const assignLocal = (node: InternalNode): number => {
    if (node.children.length === 0) {
      node.localX = leaf.i;
      leaf.i++;
      return node.localX;
    }
    const xs = node.children.map(assignLocal);
    node.localX = (xs[0]! + xs[xs.length - 1]!) / 2;
    return node.localX;
  };

  hijo.children.forEach(assignLocal);

  let minL = Infinity;
  let maxL = -Infinity;
  const measure = (node: InternalNode) => {
    if (node.localX !== undefined) {
      minL = Math.min(minL, node.localX);
      maxL = Math.max(maxL, node.localX);
    }
    node.children.forEach(measure);
  };
  hijo.children.forEach(measure);

  const spread = Math.max(maxL - minL, 0.001);
  const step = Math.min(leafUnit(), (HIJO_GAP * 0.88) / spread);
  const midL = (minL + maxL) / 2;

  const apply = (node: InternalNode) => {
    if (node.localX !== undefined) {
      node.cx = hijo.cx + (node.localX - midL) * step;
    }
    node.children.forEach(apply);
  };
  hijo.children.forEach(apply);
};

const assignAppear = (root: InternalNode) => {
  root.appearFrame = 0;

  root.children.forEach((child, i) => {
    child.appearFrame = 50 + i * 4;
  });

  assignFlowingDeep(root);
};

const assignFlowingDeep = (root: InternalNode) => {
  const pending = new Map<string, InternalNode>();
  const parentOf = new Map<string, InternalNode>();

  for (const hijo of root.children) {
    for (const child of hijo.children) {
      pending.set(child.id, child);
      parentOf.set(child.id, hijo);
    }
    collectPending(hijo, pending, parentOf);
  }

  let slot = DEEP_START;
  let stalled = 0;
  const branchScheduled = [0, 0, 0, 0, 0];

  while (pending.size > 0) {
    const ready = [...pending.entries()].filter(([, node]) => {
      const parent = parentOf.get(node.id)!;
      return parent.appearFrame + MIN_PARENT_DELAY <= slot;
    });

    if (ready.length === 0) {
      slot++;
      stalled++;
      if (stalled > 300) break;
      continue;
    }

    stalled = 0;
    ready.sort((a, b) => {
      const ba = branchIndex(a[1].id);
      const bb = branchIndex(b[1].id);
      if (branchScheduled[ba] !== branchScheduled[bb]) {
        return branchScheduled[ba]! - branchScheduled[bb]!;
      }
      if (a[1].depth !== b[1].depth) return a[1].depth - b[1].depth;
      return rand(a[1].id, a[1].depth) - rand(b[1].id, b[1].depth);
    });

    const [id, node] = ready[0]!;
    node.appearFrame = slot;
    branchScheduled[branchIndex(node.id)]!++;
    pending.delete(id);
    slot += DEEP_INTERVAL;
  }
};

const collectPending = (
  node: InternalNode,
  pending: Map<string, InternalNode>,
  parentOf: Map<string, InternalNode>,
) => {
  for (const child of node.children) {
    pending.set(child.id, child);
    parentOf.set(child.id, node);
    collectPending(child, pending, parentOf);
  }
};

const flatten = (node: InternalNode, parentId?: string): FlatNode[] => {
  const size = getNodeSize(node.depth);
  const list: FlatNode[] = [
    {
      id: node.id,
      label: node.label,
      depth: node.depth,
      x: node.cx - size.w / 2,
      y: node.y,
      appearFrame: node.appearFrame,
      parentId,
    },
  ];
  for (const child of node.children) {
    list.push(...flatten(child, node.id));
  }
  return list;
};

const buildEdges = (nodes: FlatNode[]): GraphEdge[] => {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const edges: GraphEdge[] = [];

  for (const node of nodes) {
    if (!node.parentId) continue;
    const parent = byId.get(node.parentId);
    if (!parent) continue;
    edges.push({
      id: `e-${parent.id}-${node.id}`,
      x1: nodeCenterX(parent.x, parent.depth),
      y1: nodeBottom(parent.y, parent.depth),
      x2: nodeCenterX(node.x, node.depth),
      y2: nodeTop(node.y),
      appearFrame: node.appearFrame - 1,
    });
  }

  return edges;
};

export const buildRandomTree = (centerX: number, rootY: number) => {
  const root = buildStructure();
  layoutTree(root, centerX, rootY);
  assignAppear(root);

  const nodes = flatten(root);
  const edges = buildEdges(nodes);
  const graphHeight = rowY(MAX_DEPTH, rootY) + getNodeSize(MAX_DEPTH).h - rootY;

  return { nodes, edges, graphHeight, maxDepth: MAX_DEPTH };
};

export const maxVisibleDepth = (nodes: FlatNode[], frame: number) =>
  nodes.reduce(
    (max, n) => (frame >= n.appearFrame ? Math.max(max, n.depth) : max),
    0,
  );

export const lastAppearFrame = (nodes: FlatNode[]) =>
  nodes.reduce((max, n) => Math.max(max, n.appearFrame), 0);
