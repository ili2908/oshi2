import { Graph } from "simple_graphs";
import { getSdk } from "..";
import { BasicGNode, GGraph } from "../../../core/classes/graphs";

export const createFullGraph = (n: number, x: number, y:number) => {
    getSdk().startTransaction();
    const r = 50+ n*3;
    const graph = new GGraph();
    for (let i = 0; i < n; i++) {
        const nodeX = x + r * Math.cos(2 * Math.PI * i / n);
        const nodeY = y + r * Math.sin(2 * Math.PI * i / n);
        const node = getSdk().addNode(graph, {},nodeX, nodeY);
        for(const key in graph.nodes) {
            getSdk().addConnection(node, graph.nodes[key], {directions:[{}]});
        }
    }
    getSdk().addGraph(graph);
    getSdk().closeTransaction();
    return graph;
}

export const createCycle = (n: number, x: number, y:number, addGraph = true) => {
    getSdk().startTransaction();
    const r = 50+ n*3;
    const graph = new GGraph();
    let firstNode: BasicGNode;
    let prevNode: BasicGNode | undefined;
    
    for (let i = 0; i < n; i++) {
        const nodeX = x + r * Math.cos(2 * Math.PI * i / n);
        const nodeY = y + r * Math.sin(2 * Math.PI * i / n);
        const node = getSdk().addNode(graph, {},nodeX, nodeY);
        if(prevNode) {
            getSdk().addConnection(node, prevNode, {directions:[{}]});
        } else {
            firstNode = node;
        }
        prevNode = node;       
    }
    getSdk().addConnection(firstNode!, prevNode!, {directions:[{}]});
    if(addGraph) {
        getSdk().addGraph(graph);
    }
    getSdk().closeTransaction();
    return graph;
}

export const createWheel = (n: number, x: number, y:number) => {
    getSdk().startTransaction();
    const graph = createCycle(n,x,y, false);
    const node = getSdk().addNode(graph, {},x, y);
    for(const key in graph.nodes) {
        console.log(key);
        if(node.identifier !== graph.nodes[key].identifier) {
            getSdk().addConnection(node, graph.nodes[key], {directions:[{}]});
        }
    }
    getSdk().addGraph(graph);
    getSdk().closeTransaction();
    return graph;
}

export const createLadder = (n: number, x: number, y:number) => {
    getSdk().startTransaction();
    const r = 50;
    const graph = new GGraph();
    let prevNode1: BasicGNode | undefined;
    let prevNode2: BasicGNode | undefined;
    for (let i = 0; i < n; i++) {
        const nodeY = y + r * i;
        const node1 = getSdk().addNode(graph, {},x, nodeY);
        const node2 = getSdk().addNode(graph, {},x+r, nodeY);
        getSdk().addConnection(node1, node2, {directions:[{}]});
        if(prevNode1 && prevNode2) {
            getSdk().addConnection(node1, prevNode1, {directions:[{}]});
            getSdk().addConnection(node2, prevNode2, {directions:[{}]});
        }
        prevNode1 = node1;
        prevNode2 = node2;
    }
    getSdk().addGraph(graph);
    getSdk().closeTransaction();
    return graph;
}
export const createPrisma = (n: number, x: number, y:number) => {
    getSdk().startTransaction();
    const r = 50+n*3;
    const bottom = createCycle(n,x,y, false);
    const top = createCycle(n,x,y-r, false);
    const result = bottom.merge(top);
    const topNodes = top.getNodes();
    const bottomNodes = bottom.getNodes();
    topNodes.forEach((node,i)=>{
        getSdk().addConnection(node, bottomNodes[i], {directions:[{}]});
    })
    getSdk().addGraph(result);
    getSdk().closeTransaction();
    return result;
}

export const createPeterson = ( x: number, y:number) => {
    getSdk().startTransaction();
    const r = 90+ 5*3;
    const graph = new GGraph();
    let firstNode: BasicGNode;
    let prevNode: BasicGNode | undefined;
    let intNodes = [];
    for (let i = 0; i < 5; i++) {
        const nodeX = x + r * Math.cos(2 * Math.PI * i / 5);
        const nodeY = y + r * Math.sin(2 * Math.PI * i / 5);
        const intX = x + (r-40) * Math.cos(2 * Math.PI * i / 5);
        const intY = y + (r-40) * Math.sin(2 * Math.PI * i / 5);
        const node = getSdk().addNode(graph, {},nodeX, nodeY);
        const node2 = getSdk().addNode(graph, {},intX, intY);
        intNodes.push(node2);
        getSdk().addConnection(node, node2, {directions:[{}]});
        if(prevNode) {
            getSdk().addConnection(node, prevNode, {directions:[{}]});
        } else {
            firstNode = node;
        }
        prevNode = node;       
    }
    getSdk().addConnection(intNodes[0], intNodes[3], {directions:[{}]});
    getSdk().addConnection(intNodes[0], intNodes[2], {directions:[{}]});
    getSdk().addConnection(intNodes[1], intNodes[4], {directions:[{}]});
    getSdk().addConnection(intNodes[1], intNodes[3], {directions:[{}]});
    getSdk().addConnection(intNodes[2], intNodes[4], {directions:[{}]});
    
    getSdk().addConnection(firstNode!, prevNode!, {directions:[{}]});
    getSdk().addGraph(graph);
    getSdk().closeTransaction();
    return graph;
}

export const createK = (n: number, n2: number, x: number, y:number) => { 
    getSdk().startTransaction();
    const r = 100;
    const graph = new GGraph();
    const right: BasicGNode[] = [];
    const left: BasicGNode[] = [];
    for (let i = 0; i < n; i++) {
        const nodeY = y + r * i;
        left.push(getSdk().addNode(graph, {},x, nodeY));
    }
    for (let i = 0; i < n2; i++) {
        const nodeY = y + r * i;
        right.push(getSdk().addNode(graph, {},x+r, nodeY));
    }
    right.forEach((first)=>{
        left.forEach(other=>{
            getSdk().addConnection(
            first,
            other,
            {directions:[
                {zeroToOne: getSdk().getState<boolean>('arrowsEnabled') ? true: undefined}
            ]}
            )
        })
    })
    getSdk().addGraph(graph);
    getSdk().closeTransaction();
    return graph;
}