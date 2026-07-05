import type { DoBlock, DoStatement, Expression, Program } from "@moon/ast";
import { freeVarsExpr } from "./free-vars";
import { detectMapM, exprLabel } from "./mapm";

export type DagNodeKind = "action" | "bind" | "mapM" | "mapM_join" | "storm";

export interface DagNode {
  id: string;
  kind: DagNodeKind;
  label: string;
  dependencies: string[];
  bindVar?: string;
  mapMListVar?: string;
  mapMFunc?: string;
  stmtIndex: number;
}

export interface ExecutionDag {
  functionName: string;
  nodes: DagNode[];
}

export function findFunction(program: Program, name: string): DoBlock | null {
  for (const decl of program.declarations) {
    if (decl.kind !== "Function") continue;
    for (const eq of decl.decl.equations) {
      if (eq.name === name && "statements" in eq.body) {
        return eq.body;
      }
    }
  }
  return null;
}

export function planFunction(program: Program, functionName = "main"): ExecutionDag | null {
  const block = findFunction(program, functionName);
  if (!block) return null;

  const nodes: DagNode[] = [];
  const varDefs = new Map<string, string>();
  let counter = 0;

  const addNode = (node: Omit<DagNode, "id">): string => {
    const id = `n${counter++}`;
    nodes.push({ id, ...node });
    return id;
  };

  for (let i = 0; i < block.statements.length; i++) {
    const stmt = block.statements[i]!;
    const deps = collectDependencies(stmt, varDefs);

    if (stmt.kind === "Storm") {
      const id = addNode({
        kind: "storm",
        label: stmt.pattern.kind === "PVar" ? stmt.pattern.name : `storm_${i}`,
        dependencies: deps,
        bindVar: stmt.pattern.kind === "PVar" ? stmt.pattern.name : undefined,
        stmtIndex: i,
      });
      if (stmt.pattern.kind === "PVar") {
        varDefs.set(stmt.pattern.name, id);
      }
      continue;
    }

    if (stmt.kind === "Bind") {
      const mapM = detectMapM(stmt.expr);
      if (mapM) {
        const listDep = varDefs.get(mapM.listVar);
        const mapDeps = listDep ? [...deps] : deps;
        if (listDep && !mapDeps.includes(listDep)) {
          mapDeps.push(listDep);
        }

        const mapId = addNode({
          kind: "mapM",
          label: stmt.pattern.kind === "PVar" ? stmt.pattern.name : `mapM_${i}`,
          dependencies: mapDeps,
          bindVar: stmt.pattern.kind === "PVar" ? stmt.pattern.name : undefined,
          mapMListVar: mapM.listVar,
          mapMFunc: exprLabel(mapM.func),
          stmtIndex: i,
        });

        const joinId = addNode({
          kind: "mapM_join",
          label: `${mapId}_join`,
          dependencies: [mapId],
          bindVar: stmt.pattern.kind === "PVar" ? stmt.pattern.name : undefined,
          mapMListVar: mapM.listVar,
          stmtIndex: i,
        });

        if (stmt.pattern.kind === "PVar") {
          varDefs.set(stmt.pattern.name, joinId);
        }
        continue;
      }

      const id = addNode({
        kind: "bind",
        label: stmt.pattern.kind === "PVar" ? stmt.pattern.name : `bind_${i}`,
        dependencies: deps,
        bindVar: stmt.pattern.kind === "PVar" ? stmt.pattern.name : undefined,
        stmtIndex: i,
      });

      if (stmt.pattern.kind === "PVar") {
        varDefs.set(stmt.pattern.name, id);
      }
      continue;
    }

    const id = addNode({
      kind: "action",
      label: exprLabel(stmt.expr),
      dependencies: deps,
      stmtIndex: i,
    });

    if (stmt.kind === "Let" && stmt.pattern.kind === "PVar") {
      varDefs.set(stmt.pattern.name, id);
    }
  }

  return { functionName, nodes };
}

function collectDependencies(
  stmt: DoStatement,
  varDefs: Map<string, string>,
): string[] {
  const expr = stmt.kind === "Let"
    ? stmt.expr
    : stmt.kind === "Storm"
      ? stmt.input
      : stmt.expr;
  const free = freeVarsExpr(expr);
  if (stmt.kind === "Storm" || stmt.kind === "Bind" || stmt.kind === "Action") {
    for (const item of stmt.config) {
      for (const v of freeVarsExpr(item.value)) free.add(v);
    }
  }
  const deps: string[] = [];

  for (const v of free) {
    const dep = varDefs.get(v);
    if (dep && !deps.includes(dep)) {
      deps.push(dep);
    }
  }

  return deps;
}

export function dagToGraph(dag: ExecutionDag): Record<string, string[]> {
  const graph: Record<string, string[]> = {};
  for (const node of dag.nodes) {
    graph[node.id] = [...node.dependencies];
  }
  return graph;
}

export function reachableFrom(dag: ExecutionDag, startIds: string[]): Set<string> {
  const graph = dagToGraph(dag);
  const visited = new Set<string>();
  const stack = [...startIds];

  while (stack.length > 0) {
    const id = stack.pop()!;
    if (visited.has(id)) continue;
    visited.add(id);
    for (const dep of graph[id] ?? []) {
      stack.push(dep);
    }
  }

  return visited;
}

export function nodesByLabel(dag: ExecutionDag, label: string): DagNode[] {
  return dag.nodes.filter((n) => n.label === label || n.bindVar === label);
}