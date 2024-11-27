import { BasicGConnection, BasicGNode, ConnectionData, GGraph, NodeData } from "../classes/graphs";

export interface RightClickMenuConfig {
    choices: {
        name: string,
        targets: ('node' | 'connection' | 'drawing' | 'void' )[],
        inputFields?: string[],
        hide?: boolean,
        expand?: RightClickMenuConfig,
        callBack?: (... args: any[]) => any,
    }[]
}
export interface RightMenuConfig {
    identifier: string,
    choices: {
        name: string,
        inputs?: {
            type: ('graphs' | 'vertexes' | 'connections'| 'text' ),
            name: string
        }[],
        callback: (...args: any[])=>void
    }[]
}
export interface LeftMenuConfig {
    identifier: string,
    choices: {
        name: string,
        input: 'checkbox' | 'slider' | 'color',
        inputParams?: {
            max?: number,
            min?: number,
        },
        defaultValue: any,
        callback: (...args: any[])=>void
    }[]
}


export interface PluginConfig {
    pluginName: string,
    pluginVersion: string,
    init: (sdk: GraphSdk)=>void,
    rightPanels?: RightMenuConfig[],
    leftPanels?: LeftMenuConfig[],
    rightClickPanels?: RightClickMenuConfig[],
}

export enum CurrentRightMenus {
    basic = 'Basic'
}

export enum CurrentLeftMenus {
    basic = 'Basic'
}

export enum CurrentRightClickMenus {
    basic = 'Basic'
}

export interface GraphSdk {
  getCurrentSelection: () => (BasicGConnection | BasicGNode)[];
  getCurrentGraph: () => GGraph;
  getCurrentGraphs: () => GGraph[];
  setActiveGraph: (graph: GGraph) => number;

  getCanvas: () => fabric.Canvas;
  updateState: <T>(key: string, val: T) => void;
  getState: <T>(key: string) => T;

  select: (
    objects: (BasicGConnection | BasicGNode)[],
    unselect?: boolean
  ) => void;
  unselect: (objects?: (BasicGConnection | BasicGNode)[]) => void;

  startExclusionFromUndoList: () => void;
  closeExclusionFromUndoList: () => void;
  startTransaction: () => void;
  closeTransaction: () => void;
  undo: () => void | undefined;

  addGraph: (graph: GGraph, index?: number) => GGraph;
  deleteGraph: (graph: GGraph) => GGraph;

  addConnection: (
    nodeA: BasicGNode,
    nodeB: BasicGNode,
    data: ConnectionData
  ) => BasicGConnection;
  deleteConnection: (
    connection: BasicGConnection,
    subConnections?: number[]
  ) => BasicGConnection;

  addNode: (
    graph: GGraph,
    data: NodeData,
    x: number,
    y: number,
    identifier?: string
  ) => BasicGNode;
  deleteNode: (node: BasicGNode) => BasicGNode;

  moveNode: (node: BasicGNode, x?: number, y?: number) => BasicGNode;
  renameNode: (node: BasicGNode, newName: string) => BasicGNode;
  colorNode: (node: BasicGNode, newColor: string) => BasicGNode;
  resizeNode: (node: BasicGNode, newSize: number) => BasicGNode;
  markNode: (node: BasicGNode) => void;
  getSubgraph(nodes: BasicGNode[]): GGraph;

  mergeGraphs: (graphs: GGraph[]) => GGraph;
  separateGraphs: (nodes: BasicGNode[]) => GGraph;
  graphToJson(graph: GGraph): any;
  jsonToGraph(json: any): GGraph;
  render: () => void;
}
