import { Graph } from "simple_graphs";
import appState from "../../../utils/appState";
import { BasicGNode, GGraph } from "../classes/basic";
import { BasicOperations } from "../renderingStrategies/basicRendering";

export const createFullGraph = (n: number, x: number, y:number, operations: BasicOperations) => {
    operations.undoOperations.txOpen();
    const r = 50+ n*3;
    const graph = new GGraph();
    for (let i = 0; i < n; i++) {
        const nodeX = x + r * Math.cos(2 * Math.PI * i / n);
        const nodeY = y + r * Math.sin(2 * Math.PI * i / n);
        const node = operations.addNode(graph, {},nodeX, nodeY);
        for(const key in graph.nodes) {
            operations.addConnection({directions:[{}]},node, graph.nodes[key]);
        }
    }
    operations.addGraph(graph);
    operations.undoOperations.txClose();
    return graph;
}

export const createCycle = (n: number, x: number, y:number, operations: BasicOperations) => {
    operations.undoOperations.txOpen();
    const r = 50+ n*3;
    const graph = new GGraph();
    let firstNode: BasicGNode;
    let prevNode: BasicGNode | undefined;
    
    for (let i = 0; i < n; i++) {
        const nodeX = x + r * Math.cos(2 * Math.PI * i / n);
        const nodeY = y + r * Math.sin(2 * Math.PI * i / n);
        const node = operations.addNode(graph, {},nodeX, nodeY);
        if(prevNode) {
            operations.addConnection({directions:[{}]},node, prevNode);
        } else {
            firstNode = node;
        }
        prevNode = node;       
    }
    operations.addConnection({directions:[{}]}, firstNode!, prevNode!);
    operations.addGraph(graph);
    operations.undoOperations.txClose();
    return graph;
}

export const createWheel = (n: number, x: number, y:number, operations: BasicOperations) => {
    operations.undoOperations.txOpen();
    const graph = createCycle(n,x,y,operations);
    const node = operations.addNode(graph, {},x, y);
    for(const key in graph.nodes) {
        if(node.identifier !== graph.nodes[key].identifier) {
            operations.addConnection({directions:[{}]},node, graph.nodes[key]);
        }
    }
    operations.addGraph(graph);
    operations.undoOperations.txClose();
    return graph;
}

export const createLadder = (n: number, x: number, y:number, operations: BasicOperations) => {
    operations.undoOperations.txOpen();
    const r = 50;
    const graph = new GGraph();
    let prevNode1: BasicGNode | undefined;
    let prevNode2: BasicGNode | undefined;
    for (let i = 0; i < n; i++) {
        const nodeY = y + r * i;
        const node1 = operations.addNode(graph, {},x, nodeY);
        const node2 = operations.addNode(graph, {},x+r, nodeY);
        operations.addConnection({directions:[{}]},node1, node2);
        if(prevNode1 && prevNode2) {
            operations.addConnection({directions:[{}]},node1, prevNode1);
            operations.addConnection({directions:[{}]},node2, prevNode2);
        }
        prevNode1 = node1;
        prevNode2 = node2;
    }
    operations.addGraph(graph);
    operations.undoOperations.txClose();
    return graph;
}
export const createPrisma = (n: number, x: number, y:number, operations: BasicOperations) => {
    operations.undoOperations.txOpen();
    const r = 50+n*3;
    const bottom = createCycle(n,x,y,operations);
    const top = createCycle(n,x,y-r,operations);
    const result = bottom.merge(top);
    const topNodes = top.getNodes();
    const bottomNodes = bottom.getNodes();
    topNodes.forEach((node,i)=>{
        operations.addConnection({directions:[{}]},node, bottomNodes[i]);
    })
    operations.addGraph(result);
    operations.undoOperations.txClose();
    return result;
}

export const createPeterson = ( x: number, y:number, operations: BasicOperations) => {
    operations.undoOperations.txOpen();
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
        const node = operations.addNode(graph, {},nodeX, nodeY);
        const node2 = operations.addNode(graph, {},intX, intY);
        intNodes.push(node2);
        operations.addConnection({directions:[{}]},node, node2);
        if(prevNode) {
            operations.addConnection({directions:[{}]},node, prevNode);
        } else {
            firstNode = node;
        }
        prevNode = node;       
    }
    operations.addConnection({directions:[{}]}, intNodes[0], intNodes[3]);
    operations.addConnection({directions:[{}]}, intNodes[0], intNodes[2]);
    operations.addConnection({directions:[{}]}, intNodes[1], intNodes[4]);
    operations.addConnection({directions:[{}]}, intNodes[1], intNodes[3]);
    operations.addConnection({directions:[{}]}, intNodes[2], intNodes[4]);
    
    operations.addConnection({directions:[{}]}, firstNode!, prevNode!);
    operations.addGraph(graph);
    operations.undoOperations.txClose();
    return graph;
}

export const createK = (n: number, n2: number, x: number, y:number, operations: BasicOperations) => { 
    operations.undoOperations.txOpen();
    const r = 50;
    const graph = new GGraph();
    const right: BasicGNode[] = [];
    const left: BasicGNode[] = [];
    for (let i = 0; i < n; i++) {
        const nodeY = y + r * i;
        left.push(operations.addNode(graph, {},x, nodeY));
    }
    for (let i = 0; i < n2; i++) {
        const nodeY = y + r * i;
        right.push(operations.addNode(graph, {},x+r, nodeY));
    }
    right.forEach((first)=>{
        left.forEach(other=>{
            operations.addConnection({directions:[
                {zeroToOne: appState.arrowsEnabled() ? true: undefined}
            ]},
            first,
            other
            )
        })
    })
    operations.addGraph(graph);
    operations.undoOperations.txClose();
    return graph;
}