import { BasicGConnection, BasicGNode, GGraph } from "../classes/basic";

export let graphs: GGraph[] = [];
export let graph: GGraph;
export let _multipleSelection: (BasicGNode | BasicGConnection)[] = [];
let _setGraphs: (_graphs:GGraph[]) => void;
let _setSelection: (_multipleSelection: (BasicGNode | BasicGConnection)[]) => void;
export let _setIndex: (index: number) => void;


export const initialize = (__setGraphs: any, __setIndex: any) => {
    _setGraphs = __setGraphs;
    _setIndex = __setIndex;
}

export const setSelection = (multipleSelection: (BasicGNode | BasicGConnection)[]) => {
    _multipleSelection = [...multipleSelection];
}

export const setGraphs = (_graphs: GGraph[]) => {
    graphs = _graphs;
    console.log(graphs);
    _setGraphs([...graphs]);
}

export const multipleSelection = ()=> {
    return _multipleSelection;
}

export const getActiveGraph = ()=>{
    return graph;
}

export const setActiveGraph = (_graph: GGraph)=> {
    
    graph = _graph;
    _setIndex(graphs.findIndex(({identifier})=>_graph.identifier === identifier))
}
