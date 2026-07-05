export {
  dagToGraph,
  findFunction,
  nodesByLabel,
  planFunction,
  reachableFrom,
  type DagNode,
  type DagNodeKind,
  type ExecutionDag,
} from "./plan";
export { detectMapM, exprLabel } from "./mapm";
export { freeVarsExpr } from "./free-vars";