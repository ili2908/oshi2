import { fabric } from 'fabric';

import { Node } from './nodes';
import { BasicGConnection, BasicGNode, GGraph} from './classes/basic'
import { State } from './utils/StateMachine'
import { BasicOperations } from './renderingStrategies/basicRendering';
import { getCentre } from './utils/utils';
import { customContextMenu } from './contextMenus';
import { createCycle, createFullGraph, createK, createLadder, createPeterson, createPrisma, createWheel } from './graphPrephabs/graphs1';
import { graph, graphs, multipleSelection, setActiveGraph, setGraphs, setSelection, _setIndex } from './utils/graphsState';
import { ConnectionData, GConnection, GNode } from './types';
import appState from '../../utils/appState';
import { GraphManager } from './renderingStrategies/graphManager';
let operations: BasicOperations;
export let canvas: fabric.Canvas;
let selected: BasicGNode|BasicGConnection|null;
let line: fabric.Line | null;
let keyPressed: any[] = [];
let currentState: any;

const statesNames = [
    "objectNotSelected",
    "objectSelectedNode",
    "objectDragging",
    "ctrlPressed",
    "lineSelected",
    "multiSelected"
]
const states = statesNames.reduce((acc, state) => {
    acc[state] = new State(state);
    return acc;
}, {} as {[key: string]: State});

const createLine = ([x1, y1, x2, y2]: [...number[], number, number]) => {
    let triangle = new fabric.Triangle({
        width: 10,
        height: 15,
        fill: `black`,
        left: x2,
        top: y2,
        angle: Math.atan((x2 - x1) / (y2 - y1)) * 180 / Math.PI,
        hasBorders: false,
        evented: false,
        selectable: false
    });
    const line = new fabric.Line([x1, y1, x2, y2], {
        stroke: `black`,
        hasBorders: false,
        evented: false,
        selectable: false
    });
    line.data = {triangle};
    canvas.add(line);
    canvas.add(triangle);
    return line;

}
const deleteLine = () => {
    if (line) {
        canvas.remove(line.data.triangle);
        canvas.remove(line).renderAll();
    }
    line = null;
}
const adjustMousePointer = (pointer: { x: number; y: number; }): [number, number] => {
    return [Math.floor(pointer.x) - 2, Math.floor(pointer.y) - 2];
}
export const unselect = (target?: BasicGNode | BasicGConnection) => {
    if(keyPressed.includes('Control')) {
        return;
    }
    if(target){
        Object.entries(target.graphical).forEach(([key, graphical])=>{
            (graphical as fabric.Object).set({
                stroke:graphical?.data?.connection? "black": undefined,
            })
        })
        setSelection(multipleSelection().filter(({identifier})=>target!.identifier!==identifier));
        if(target.identifier === selected?.identifier) {
            selected = null;
        }
    } else {
        multipleSelection().forEach(target=>{
            unselect(target);
        })
        setSelection([]);
        selected = null;

    }

    
    
}
export const select = (obj: BasicGNode|BasicGConnection, toUnselect = true) => {
    setActiveGraph(obj.graph);
    if(!keyPressed.includes('Control') && toUnselect) {
        unselect();
    }
    selected = obj;
    setSelection([...multipleSelection(), selected]);
    Object.entries(selected.graphical).forEach(([key, graphical])=>{
        (graphical as fabric.Object).set({
            strokeWidth:2,
            stroke:"blue",
        })
    })
    if(multipleSelection().length > 1) {
        currentState = states["multiSelected"]
    }
    canvas.renderAll()
    
}
export const selectGraph = (graph: GGraph) => {
    setActiveGraph(graph);
    [...graph.getConnections(), ...graph.getNodes()].forEach((val)=>select(val, false));
}
export const deleteGraph = (graph: GGraph) => {
    if(graphs.length === 1) {
        return;
    }
    operations.undoOperations.txOpen();
    [...graph.getConnections(), ...graph.getNodes()].forEach((target)=>{
        if((target as GConnection).node0) {
            operations.deleteConnection(target as BasicGConnection)
        }
        else {
            operations.deleteNode(target as BasicGNode)
        }
    });
    const index = graphs.indexOf(graph);
    setGraphs(graphs.filter(({identifier})=>identifier !== graph.identifier));
    setActiveGraph(graphs.at(-1)!);
    
    operations.undoOperations.push(()=>{
        operations.addGraph(graph, index);
        operations.undoOperations.pop();
    })
    operations.undoOperations.txClose();
}
export const labelAllNodesInGraph = (graph: GGraph) => {
    operations.undoOperations.txOpen();
    graph.getNodes().forEach((node)=>operations.renameNode(node, node.identifier));
    operations.undoOperations.txClose();
}
let importCount = 0;
export const createGraphFromJson = (json: any) => {
    operations.undoOperations.txOpen();

    const newGraph = new GGraph();
    newGraph.identifier = importCount+json.identifier;
    json.nodes.forEach((node: any)=>{
        operations.addNode(newGraph, node.data, node.coords[0], node.coords[1], importCount+node.identifier)
    })
    json.connections.forEach((connection: any)=> {
        operations.addConnection(connection.data, newGraph.nodes[importCount+connection.node0], newGraph.nodes[importCount+connection.node1])
    })
    importCount++;
    operations.addGraph(newGraph);
    operations.undoOperations.txClose();
    return newGraph;

    
}
export const inverseGraph = (graph: GGraph) => {
    operations.undoOperations.txOpen();
    graph.getNodes().flatMap((aNode, i)=>{
        graph.getNodes().forEach((bNode, j)=>{
            if(j<i)return;
            
            const connection = graph.getConnection(aNode.identifier, bNode.identifier);
            if(connection) {
                operations.deleteConnection(connection);
            } else {
                operations.addConnection({directions:[{}]}, aNode, bNode)
            }
        })
    })
    canvas.renderAll();
    operations.undoOperations.txClose();
}
export const transposeGraph = (graph: GGraph) => {
    operations.undoOperations.txOpen();
    graph.getConnections().map((connection)=>{
        const data = {
            ...connection.data,
            directions: connection.data.directions.map(({zeroToOne})=>{
                if(zeroToOne === undefined){
                    return {};
                } else {
                    return {zeroToOne: !zeroToOne}
                }
            })
        }
        operations.deleteConnection(connection);
        operations.addConnection(data, connection.node0, connection.node1);
    });
    canvas.renderAll();
    operations.undoOperations.txClose();
}
export const lineGraph = (graph: GGraph) => {
    operations.undoOperations.txOpen();
    const newGraph = new GGraph();
    operations.addGraph(newGraph);
    graph.getConnections().forEach((connectionA)=>{
        const [x0,y0] = getCentre(connectionA.node0.graphical.circle as fabric.Circle);
        const [x1,y1] = getCentre(connectionA.node1.graphical.circle as fabric.Circle);
        operations.addNode(newGraph, {}, (x0+x1)/2, (y0+y1)/2, `C:${connectionA.identifier}`);
    })
    graph.getConnections().forEach((connectionA, i)=>{
        graph.getConnections().forEach((connectionB, j)=>{
            if(j<=i) return;
            if(
                connectionA.node0.identifier === connectionB.node0.identifier ||
                connectionA.node1.identifier === connectionB.node0.identifier ||
                connectionA.node0.identifier === connectionB.node1.identifier ||
                connectionA.node1.identifier === connectionB.node1.identifier
            ) {
                
                operations.addConnection(
                    {directions:[{}]},  
                    newGraph.nodes[`C:${connectionA.identifier}`], 
                    newGraph.nodes[`C:${connectionB.identifier}`]
                )
            }
        })
    })
    operations.undoOperations.txClose();
}
export const expand = (graph: GGraph) => {
    const nodes = graph.getNodes();
    let midX = 0;
    let midY = 0;
    nodes.forEach((node)=>{
        const [x,y] = [node.graphical.circle.left!, node.graphical.circle.top!];
        midX+=x; 
        midY+=y;
    });
    midX = midX / nodes.length;
    midY = midY / nodes.length;
    //return;
    nodes.forEach((node)=>{
        const [x,y] = [node.graphical.circle.left!, node.graphical.circle.top!];
        let [dx, dy] = [x - midX, y - midY];
        [dx, dy] = [dx/Math.sqrt(dx*dx+dy*dy), dy/Math.sqrt(dx*dx+dy*dy)];
        node.graphical.circle.set({
            top: y + dy * 20,
            left: x + dx * 20,
        }).setCoords();
        operations.moveNode(node,0,0,0,0);
    });
}
export const shrink = (graph: GGraph) => {
    const nodes = graph.getNodes();
    let midX = 0;
    let midY = 0;
    nodes.forEach((node)=>{
        const [x,y] = [node.graphical.circle.left!, node.graphical.circle.top!];
        midX+=x; 
        midY+=y;
    });
    midX = midX / nodes.length;
    midY = midY / nodes.length;
    nodes.forEach((node)=>{
        const [x,y] = [node.graphical.circle.left!, node.graphical.circle.top!];
        let [dx, dy] = [x - midX, y - midY];
        [dx, dy] = [dx/Math.sqrt(dx*dx+dy*dy), dy/Math.sqrt(dx*dx+dy*dy)];
        node.graphical.circle.set({
            top: y - dy * 20,
            left: x - dx * 20,
        }).setCoords();
        operations.moveNode(node,0,0,0,0);
    });
}
export const joinGraphs = (graph1:GGraph, graph2:GGraph) => {
    operations.undoOperations.txOpen();
    graph1.getNodes().forEach(node=>{
        graph2.getNodes().forEach((node2)=>{
            operations.addConnection({directions:[{zeroToOne: appState.arrowsEnabled() ? true : undefined}]}, node, node2);
        })
    })
    canvas.renderAll();
    operations.undoOperations.txClose();
}
export const getAdjMatrix = (graph: GGraph) => {
    const nodes = graph.getNodes();
    const connections = graph.getConnections();
    const matrix = Array.from({
        // generate array of length m
        length: nodes.length
        // inside map function generate array of size n
        // and fill it with `0`
      }, () => new Array(nodes.length).fill(0));
    const indices:{[key: string]: number} = nodes.reduce((val,cur, i)=>{
        return {...val, [cur.identifier]: i}
    },{})
    connections.forEach((connection)=>{
        matrix[indices[connection.node0.identifier]][indices[connection.node1.identifier]] =
            connection.data.directions.filter(({zeroToOne})=> zeroToOne || zeroToOne === undefined).length
        matrix[indices[connection.node1.identifier]][indices[connection.node0.identifier]] =
            connection.data.directions.filter(({zeroToOne})=> !zeroToOne || zeroToOne === undefined).length 
    })
   
    return {nodes: nodes.map(({identifier})=>identifier), matrix};
}

export const findPath = (graph: GGraph, id1: string, id2: string, toSelect = true) => {
    if(toSelect) {
        unselect();
    }
    const max_value = 9007199254740992;
    const nodes = graph.getNodes();
    const src = nodes.findIndex(({identifier})=>identifier === id1);
    const dest = nodes.findIndex(({identifier})=>identifier === id2);
    const pred = new Array(nodes.length).fill(0);
    const dist = new Array(nodes.length).fill(0);
    const queue = [];
    const visited = new Array(nodes.length);
 

    for (let i = 0; i < nodes.length; i++) {
        visited[i] = false;
        dist[i] = max_value;
        pred[i] = -1;
    }

    visited[src] = true;
    dist[src] = 0;
    queue.push(src);

    while (queue.length > 0) {
        let u: any = queue[0];
        queue.shift();
        const neighbors = graph.neighbours(nodes[u].identifier).filter((node)=> {
            const connection = graph.getConnection(node.identifier, nodes[u].identifier)!
            if(connection.node0.identifier ===  nodes[u].identifier) {
                return connection.data.directions.find(({zeroToOne})=>zeroToOne || zeroToOne === undefined)
            } else {
                return connection.data.directions.find(({zeroToOne})=>!zeroToOne || zeroToOne === undefined)
            }
        });
        for (let i = 0; i < neighbors.length; i++) {
            const neighborIndex = nodes.findIndex(({identifier})=>{
                
                return neighbors[i].identifier === identifier
            });
            if (visited[neighborIndex] == false) {
                visited[neighborIndex] = true;
                dist[neighborIndex] = dist[u] + 1;
                pred[neighborIndex] = u;
                queue.push(neighborIndex);
 
                // We stop BFS when we find
                // destination.
                if (neighborIndex == dest) {
                    break;
                }
            }
        }
    }

    let path = new Array();
    let crawl = dest;
    path.push(crawl);
    while (pred[crawl] != -1) {
        path.push(pred[crawl]);
        crawl = pred[crawl];
    }
    if(path.length === 1) {
        return;
    }
    let prevNode = path.pop();
    path.reverse()
    if(toSelect) {
        select(nodes[prevNode], false);
        for(let i of path) {
            select(nodes[i], false);
            select(graph.getConnection(nodes[prevNode].identifier, nodes[i].identifier)!, false);
            prevNode = i;
        }
    }
    return path;

}

export const findMetric = (graph: GGraph, id1: string, id2: string) => {
    const d = findPath(graph, id1, id2, false);
    if(!d) return;
    graph.getNodes().forEach((node)=>{
        const d1 = findPath(graph, id1, node.identifier, false);
        const d2 = findPath(graph, node.identifier, id2, false);
        if(!d1 || !d2 ){
            return;
        }
        if((d1?.length || 0) + (d2?.length || 0) === d?.length) {
            select(node, false);
        }
    })
}

export const fromAdjacencyMatrix = (matrix: number[][])=>{
    operations.undoOperations.txOpen();
    if(matrix.length!=matrix[0].length) {
        return;
    }
    
    const newGraph = new GGraph();
    console.log(1,{...newGraph.connections});
    matrix[0].forEach((node: any, i)=>{
        const nodeX = 800 + 100 * Math.cos(2 * Math.PI * i / matrix.length);
        const nodeY = 400 + 100 * Math.sin(2 * Math.PI * i / matrix.length);
        operations.addNode(newGraph, {}, nodeX, nodeY, importCount+node.identifier)
    })
    const nodes = newGraph.getNodes();
    matrix.forEach((row, i)=>{
        row.forEach((cons, j)=>{
            if(cons) {
                operations.addConnection({directions:
                    [...Array(cons).keys()].map(()=>({zeroToOne: true}))
                }, nodes[i], nodes[j]);
                console.log(3,{...newGraph.connections});
            }
        });
    });
    operations.addGraph(newGraph);
    operations.undoOperations.txClose();
    canvas.renderAll();
    return newGraph;

}

export const findArticulationPoints = (graph: GGraph)=> {
    unselect();
    let time = 0;
    const visited = new Map();
    const low = new Map();
    const parent = new Map();
    const isArticulationPoint = new Set<string>();
  
    
  
    const  dfs =(vertex: BasicGNode) => {
      visited.set(vertex.identifier, time);
      low.set(vertex.identifier, time);
      time += 1;
      let children = 0;
      let isArticulation = false;
  
      for (const neighbor of graph.neighbours(vertex.identifier)) {
        if (!visited.has(neighbor.identifier)) {
          children += 1;
          parent.set(neighbor.identifier, vertex.identifier);
          dfs(neighbor);
  
          if (low.get(neighbor.identifier) >= visited.get(vertex.identifier)) {
            isArticulation = true;
          } else {
            low.set(vertex.identifier, Math.min(low.get(vertex.identifier), low.get(neighbor.identifier)));
          }
        } else if (neighbor.identifier !== parent.get(vertex.identifier)) {
          low.set(vertex.identifier, Math.min(low.get(vertex.identifier), visited.get(neighbor.identifier)));
        }
      }
  
      if ((parent.get(vertex.identifier) !== undefined && isArticulation) || (parent.get(vertex.identifier) === undefined && children > 1)) {
        isArticulationPoint.add(vertex.identifier);
      }
    }

    for (const vertex of graph.getNodes()) {
      if (!visited.has(vertex.identifier)) {
        dfs(vertex);
      }
    }
  
    return Array.from(isArticulationPoint).forEach((node: string)=>{
        select(graph.nodes[node], false);
    });
}

export const findArticulationEdges = (graph: GGraph) => {
    unselect();
    let time = 0;
    const visited = new Map();
    const low = new Map();
    const parent = new Map();
    const isArticulationEdge = new Set<[string,string]>();
  
    for (const vertex of graph.getNodes()) {
      if (!visited.has(vertex.identifier)) {
        dfs(vertex);
      }
    }
  
    function dfs(vertex: BasicGNode) {
      visited.set(vertex.identifier, time);
      low.set(vertex.identifier, time);
      time += 1;
  
      for (const neighbor of graph.neighbours(vertex.identifier)) {
        if (!visited.has(neighbor.identifier)) {
          parent.set(neighbor.identifier, vertex.identifier);
          dfs(neighbor);
  
          if (low.get(neighbor.identifier) > visited.get(vertex.identifier)) {
            isArticulationEdge.add([vertex.identifier, neighbor.identifier]);
          } else {
            low.set(vertex.identifier, Math.min(low.get(vertex.identifier), low.get(neighbor.identifier)));
          }
        } else if (neighbor.identifier !== parent.get(vertex.identifier)) {
          low.set(vertex.identifier, Math.min(low.get(vertex.identifier), visited.get(neighbor.identifier)));
        }
      }
    }
  
    return Array.from(isArticulationEdge).forEach(([id0, id1])=>{
        select(graph.getConnection(id0, id1)!, false);
    });
  }
  

export const findArticulationPointsDirected = (graph: GGraph) => {
    unselect();
    let index = 0;
    const visited = new Map();
    const low = new Map();
    const parent = new Map();
    const isArticulationPoint = new Set<string>();
    const sccIds = new Map();
    const stack: BasicGNode[]  = [];
  
    for (const vertex of graph.getNodes()) {
      if (!visited.has(vertex.identifier)) {
        strongConnect(vertex);
      }
    }
  
    function strongConnect(vertex: BasicGNode) {
      visited.set(vertex.identifier, index);
      low.set(vertex.identifier, index);
      index += 1;
  
      stack.push(vertex);
  
      for (const neighbor of graph.neighbours(vertex.identifier).filter(({identifier})=>{
        const connection = graph.getConnection(vertex.identifier, identifier)!;
        if(identifier === connection?.node0.identifier) {
            return connection.data.directions.some((zeroToOne)=> zeroToOne || zeroToOne === undefined);
        } else {
            return connection.data.directions.some((zeroToOne)=> !zeroToOne || zeroToOne === undefined);
        }
      })) {
        if (!visited.has(neighbor.identifier)) {
          parent.set(neighbor.identifier, vertex.identifier);
          strongConnect(neighbor);
          low.set(vertex.identifier, Math.min(low.get(vertex.identifier), low.get(neighbor.identifier)));
          if (visited.get(vertex.identifier) <= low.get(neighbor.identifier)) {
            if (parent.has(vertex.identifier) || sccSize(vertex) > 1) {
              isArticulationPoint.add(vertex.identifier);
            }
            extractSCC(vertex, neighbor);
          }
        } else if (neighbor.identifier !== parent.get(vertex.identifier)) {
          low.set(vertex.identifier, Math.min(low.get(vertex.identifier), visited.get(neighbor.identifier)));
        }
      }
  
      if (visited.get(vertex.identifier) === low.get(vertex.identifier)) {
        extractSCC(vertex, null);
      }
    }
  
    function extractSCC(vertex: BasicGNode, neighbor: BasicGNode|null) {
      const scc = [];
      let sccVertex;
      do {
        sccVertex = stack.pop();
        if(!sccVertex)break;
        scc.push(sccVertex);
        sccIds.set(sccVertex!.identifier, sccIds.size);
      } while (sccVertex!.identifier !== vertex.identifier);
  
      if (neighbor !== null && sccIds.get(neighbor.identifier) !== sccIds.get(vertex.identifier)) {
        isArticulationPoint.add(vertex.identifier);
      }
    }
  
    function sccSize(vertex: BasicGNode) {
      const sccId = sccIds.get(vertex.identifier);
      let size = 0;
      for (const v of sccIds.keys()) {
        if (sccIds.get(v) === sccId) {
          size += 1;
        }
      }
      return size;
    }
  
    return Array.from(isArticulationPoint).forEach((node: string)=>{
        select(graph.nodes[node], false);
    });
}

export const findArticulationEdgeDirected = (graph: GGraph) => {
    unselect();
    let index = 0;
    const visited = new Map();
    const low = new Map();
    const isArticulationEdge = new Set<[string, string]>();
    const stack: BasicGNode[]  = [];  
    // First DFS search in the original order
    for (const vertex of graph.getNodes()) {
      if (!visited.has(vertex.identifier)) {
        strongConnect(vertex);
      }
    }
  
    // Second DFS search in the reverse order
    visited.clear();
    low.clear();
    index = 0;
    for (const vertex of stack) {
      if (!visited.has(vertex.identifier)) {
        strongConnectReverse(vertex);
      }
    }
  
    function strongConnect(vertex: BasicGNode) {
      visited.set(vertex.identifier, index);
      low.set(vertex.identifier, index);
      index += 1;
  
      stack.push(vertex);
  
      for (const neighbor of graph.neighbours(vertex.identifier).filter(({identifier})=>{
        const connection = graph.getConnection(vertex.identifier, identifier)!;
        if(identifier === connection?.node0.identifier) {
            return connection.data.directions.some((zeroToOne)=> zeroToOne || zeroToOne === undefined);
        } else {
            return connection.data.directions.some((zeroToOne)=> !zeroToOne || zeroToOne === undefined);
        }
      })) {
        if (!visited.has(neighbor.identifier)) {
          strongConnect(neighbor);
          low.set(vertex.identifier, Math.min(low.get(vertex.identifier), low.get(neighbor.identifier)));
          if (visited.get(vertex.identifier) < low.get(neighbor.identifier)) {
            isArticulationEdge.add([vertex.identifier, neighbor.identifier]);
          }
        } else {
          low.set(vertex.identifier, Math.min(low.get(vertex.identifier), visited.get(neighbor.identifier)));
        }
      }
    }
  
    function strongConnectReverse(vertex: BasicGNode) {
      visited.set(vertex.identifier, index);
      low.set(vertex.identifier, index);
      index += 1;
  
      for (const neighbor of graph.neighbours(vertex.identifier)) {
        if (!visited.has(neighbor.identifier)) {
          strongConnectReverse(neighbor);
          low.set(vertex.identifier, Math.min(low.get(vertex.identifier), low.get(neighbor.identifier)));
        } else {
          low.set(vertex.identifier, Math.min(low.get(vertex.identifier), visited.get(neighbor.identifier)));
        }
      }
  
      for (const neighbor of graph.neighbours(vertex.identifier)) {
        if (visited.get(vertex.identifier) <= visited.get(neighbor.identifier)) {
          if (low.get(neighbor.identifier) <= visited.get(vertex.identifier)) {
            isArticulationEdge.add([neighbor.identifier, vertex.identifier]);
          }
        }
      }
    }

    return Array.from(isArticulationEdge).forEach(([id0, id1])=>{
        select(graph.getConnection(id0, id1)!, false);
    });
}
 
function getColor(n: number) {
    const colors = [
        "#00FF00",
        "#0000FF",
        "#FF0000",
        "#01FFFE",
        "#FFA6FE",
        "#FFDB66",
        "#006401",
        "#010067",
        "#95003A",
        "#007DB5",
        "#FF00F6",
        "#FFEEE8",
        "#774D00",
        "#90FB92",
        "#0076FF",
        "#D5FF00",
        "#FF937E",
        "#6A826C",
        "#FF029D",
        "#FE8900",
        "#7A4782",
        "#7E2DD2",
        "#85A900",
        "#FF0056",
        "#A42400",
        "#00AE7E",
        "#683D3B",
        "#BDC6FF",
        "#263400",
        "#BDD393",
        "#00B917",
        "#9E008E",
        "#001544",
        "#C28C9F",
        "#FF74A3",
        "#01D0FF",
        "#004754",
        "#E56FFE",
        "#788231",
        "#0E4CA1",
        "#91D0CB",
        "#BE9970",
        "#968AE8",
        "#BB8800",
        "#43002C",
        "#DEFF74",
        "#00FFC6",
        "#FFE502",
        "#620E00",
        "#008F9C",
        "#98FF52",
        "#7544B1",
        "#B500FF",
        "#00FF78",
        "#FF6E41",
        "#005F39",
        "#6B6882",
        "#5FAD4E",
        "#A75740",
        "#A5FFD2",
        "#FFB167",
        "#009BFF",
        "#E85EBE",]

    if(n<colors.length){
        return colors[n];
    }
    const red = (n * 173 % 256).toString(16).padStart(2, '0');
    const green = (n * 257 % 256).toString(16).padStart(2, '0');
    const blue = (n * 401 % 256).toString(16).padStart(2, '0');
    return `"#${red}${green}${blue}`;
}

export const graphColoring = (graph : GGraph) => {
    const vertexColors = new Map();
    const uncoloredVertices = [...graph.getNodes()].map(v => v.identifier);
  
    function backtrack() {
      if (uncoloredVertices.length === 0) {
        // All vertices are colored, so the graph is successfully colored.
        return true;
      }
  
      const currentVertex = graph.nodes[uncoloredVertices[0]];
      const usedColors = new Set();
      for (const neighbor of graph.neighbours(currentVertex.identifier)) {
        const color = vertexColors.get(neighbor.identifier);
        if (color !== undefined) {
          usedColors.add(color);
        }
      }
      for (let i = 0; ; i++) {
        const color = getColor(i);
        if (!usedColors.has(color)) {
          // If the color is not used by any neighboring vertex, color the current vertex and proceed to the next vertex.
          setColor(currentVertex, color);
          uncoloredVertices.shift(); // Remove the vertex from the list of uncolored vertices.
          if (backtrack()) {
            return true;
          }
          // If the coloring of the next vertices failed, backtrack and try the next color.
          unsetColor(currentVertex);
          uncoloredVertices.unshift(currentVertex.identifier); // Add the vertex back to the list of uncolored vertices.
        }
      }
      // If no valid color is found for the current vertex, return false and backtrack.
      return false;
    }
  
    function setColor(vertex: BasicGNode, color: string) {
      vertexColors.set(vertex.identifier, color);
    }
  
    function unsetColor(vertex: BasicGNode) {
      vertexColors.delete(vertex.identifier);
    }
  
    if (backtrack()) {
      // Return the number of colors used if a valid coloring is found.
      operations.undoOperations.txOpen();
      vertexColors.forEach((val,key)=>{
        operations.paintNode(graph.nodes[key], val);
      })
      operations.undoOperations.txClose();
      canvas.renderAll();
      return vertexColors.size;
    } else {
      // Return null if a valid coloring cannot be found.
      return null;
    }
  }
let open: boolean; 
export const finalizeStyle = ()=>{
    operations.undoOperations.txClose();
    open = false;
} 

export const setStyle = (color: string, size: number) => {
    if(!open) {
        operations.undoOperations.txOpen();
        open = true;
    }
    multipleSelection().forEach((node)=>{
        if((node as GConnection).node0)return;
        operations.paintNode(node as BasicGNode, color, size);
    })
    operations.setStyle(color, size);
    canvas.renderAll();

}
//======================================================================

State.on(["down:connection"], ({ pointer, target }: { pointer:any, target: fabric.Object }) => {    
    deleteLine();
    select(target?.data?.connection);
})

states["objectSelectedNode"].on(["down:connection"], ()=> {
    deleteLine();
    return states["objectNotSelected"];
})




states["objectNotSelected"].on(["down:nothing", "down:node", "down:selected"], ({ pointer, target }: any) => {
    deleteLine();
    unselect();
    if(target){
        select(target?.data?.node);
    } else if(keyPressed.length) {
        return;
    } else {
        select(operations.addNode(graph, {} ,Math.floor(pointer.x), Math.floor(pointer.y)));
    }
    line = createLine([...getCentre((selected as BasicGNode).graphical.circle), Math.floor(pointer.x) - 2, Math.floor(pointer.y) - 2])
    canvas.renderAll();
    return states["objectSelectedNode"];

}); //======

states["objectSelectedNode"].on(["down:nothing"], ({ pointer }: any) => {
    deleteLine();
    const newNode = operations.addNode(graph, {} , ...adjustMousePointer(pointer));
    operations.addConnection({directions:[appState.arrowsEnabled()? {zeroToOne: true} : {}]},selected as BasicGNode,newNode);
    canvas.renderAll();
    select(newNode);
    line = createLine([...getCentre((selected as BasicGNode).graphical.circle), Math.floor(pointer.x) - 2, Math.floor(pointer.y) - 2]);

}); //======

states["objectSelectedNode"].on(["down:node"], ({ target }: any) => {
    deleteLine();
    operations.addConnection({directions:[appState.arrowsEnabled()? {zeroToOne: true} : {}]},selected as BasicGNode,target.data.node);
    return states["objectNotSelected"];
}); //=======
/*
states["objectNotSelected"].on(["key:pressed"], ({ key }) => {
    if (key === "q") {
        simulation();
    }
});
*/

states["objectSelectedNode"].on(["down:selected"], () => {
    deleteLine();
   
    operations.addConnection({directions:[appState.arrowsEnabled()? {zeroToOne: true} : {}]},selected as BasicGNode, selected as BasicGNode);
     unselect();
    return states["objectNotSelected"];
});

states["objectSelectedNode"].on(["move:mouse"], ({ pointer }: any) => {
    if(!line) return;
    const [x, y] = adjustMousePointer(pointer);
    line!.set({ x2: x, y2: y }).setCoords();
    const x1 = line!.x1!;
    const y1 = line!.y1!;
    const ang = Math.atan2((y - y1), (x - x1));
    
    line!.data.triangle.set({
        left: x + 5 * Math.sin(ang), // - 10 * Math.sqrt(2) * Math.cos(ang),
        top: y - 5 * Math.cos(ang), // - 10 * Math.sqrt(2) * Math.sin(ang),
        angle: ang * 180 / Math.PI + 90
    }).setCoords();
    //line.data.triangle.setAngle(90);
    canvas.sendToBack(line!).renderAll();
});
let deltaDrag: ([number, number] | undefined)[] = [];

State.on(["move:node"], (({target}: any) => {
    deleteLine();
    deltaDrag = multipleSelection().map(node=>{
        if((node as GConnection).node0 || target.data.node.identifier === node.identifier) return;
        return [node.graphical.circle.left! - target.left, node.graphical.circle.top! - target.top];
        
    });
    return states["objectDragging"];
}));

states["objectDragging"].on(["move:node"], ({ target, pointer, e }: any) => {
    if(!target?.data?.node) {
        return;
    }

    deleteLine();
    const [x, y] = adjustMousePointer(pointer);
    multipleSelection().map((node, i)=>{
        if((node as GConnection).node0 || target.data.node.identifier === node.identifier) return;
        canvas.sendToBack(node.graphical.circle);
        (node.graphical.circle as fabric.Circle).set({
            top: target.top! + deltaDrag[i]![1],
            left: target.left! + deltaDrag[i]![0],
        }).setCoords();
        operations.moveNode(node as BasicGNode,x,y,x,y);
        
    })
    canvas.sendToBack(target);
    operations.moveNode(target.data.node,x,y,x,y);
    canvas.renderAll();
});

states["objectDragging"].on(["up"], () => {
    deleteLine();
    unselect();
    canvas.renderAll();
    if(keyPressed.includes('Control')){
        return states["ctrlPressed"];
    }
    return states["objectNotSelected"];
})

State.on(["key:pressed"], ({key}: { key: string}) => {

    deleteLine();
    if(key === "Control") {
        return states["ctrlPressed"];
    }
    if(keyPressed.includes('b')) {
        operations.undo();
    }
    if(keyPressed.includes('a')) {
        appState.setArrowsEnabled(!appState.arrowsEnabled());
    }
    if(keyPressed.includes('d')) {
        appState.setDrawMode(!appState.drawMode());
        canvas.freeDrawingBrush.width = 3;
        canvas.isDrawingMode = appState.drawMode();
    }
    return states["objectNotSelected"];
})
states["ctrlPressed"].on(["down:node"], ({ target, pointer }: any) => {
    select(target.data.node, false);
    return states["ctrlPressed"];
})
states["ctrlPressed"].on(["down:nothing"], () => {
    unselect();
    return states["ctrlPressed"];
})
states["ctrlPressed"].on(["key:up"], ({ key }: any) => {
    if(key === 'Control') {
        return states["multiSelected"];
    }
})
states["multiSelected"].on(["down:nothing"], ({target}: any) => {
    unselect();
    return states["objectNotSelected"];
})
states["multiSelected"].on(["down:node"], ({target, pointer}: any) => { 
    if(multipleSelection().map(({identifier})=>identifier).includes(target.data?.node?.identifier || target.data?.connection?.identifier)) {
        return;
    }
    unselect();
    

    if(!target?.data) {
        return states["objectNotSelected"];
    }
   
    select(target.data.node || target.data.connection );
    line = createLine([...getCentre((selected as BasicGNode).graphical.circle), Math.floor(pointer.x) - 2, Math.floor(pointer.y) - 2])
    return states["objectSelectedNode"];
})

//=========================================================================
function initializeEvents(_canvas: any) {
    setActiveGraph(new GGraph());
    setGraphs([graph])
    GraphManager.is(graph.identifier, graph)
    canvas = _canvas;
    operations = new BasicOperations(canvas);
    currentState = states["objectNotSelected"];
    canvas.on('mouse:down', ({ target, e }) => {
        
        e.preventDefault();
        if(appState.drawMode())return;
        const pointer = canvas.getPointer(e)
        if (target && !target.data?.node && !target.data?.connection) return;
        currentState = currentState.pass(`down:${
            selected && target===selected?.graphical?.circle ?
                "selected":
            target&&target.data.node?
                "node":
            target&&target.data.connection?
                "connection":
                "nothing"
        }`, { target, pointer });
    });

    canvas.on('mouse:move', ({ e }) => {
        if(appState.drawMode())return;
        const pointer = canvas.getPointer(e)
        currentState = currentState.pass(`move:mouse`, { pointer });
    });
    canvas.on('object:moving', ({ target, e }) => {
        if(appState.drawMode())return;
        if(target?.data.path) {
            canvas.sendToBack(target);
        } 
        if (target?.data.node) {
            canvas.bringToFront(target);
        }
        const pointer = canvas.getPointer(e)
        if (target && !target?.data?.node) return;
        currentState = currentState.pass("move:node", { target, pointer, e })
    });
    canvas.on('path:created', ({path}: any)=>{
        if(!appState.drawMode())return;
        path.set({
            hasControls: false,
            hasBorders: false,
        })
        path.data = {path: true}
        operations.undoOperations.push(()=>{
            canvas.remove(path);
            canvas.renderAll();
        })
        // ... do something with your path
    });
    
    canvas.on('mouse:up', ({ pointer }) => {
        if(appState.drawMode())return;
        currentState = currentState.pass(`up`, { pointer });

        
    });
    document.onkeydown = function(e) {
        //e.preventDefault();
        keyPressed.push(e.key);
        currentState = currentState.pass(`key:pressed`, { key: e.key });
    }
    document.onkeyup = function(e) {
        //e.preventDefault();
        if(appState.drawMode()){
            keyPressed = [];
            return;
        }
        keyPressed = keyPressed.filter(val => e.key !== val);
        currentState = currentState.pass(`key:up`, { key: e.key });
    }
    document.oncontextmenu = function(event) {
        
        deleteLine();
        if(keyPressed.includes('Control')) {
            event.preventDefault();
            return;
        }
        currentState = states["objectNotSelected"];
        const pointer = canvas.getPointer(event);
        const target = canvas.findTarget(event, true);
        if(target?.data) {
            if(target.data.path) {
                unselect();
                customContextMenu(event, {
                    Delete: [()=>{
                        canvas.remove(target);
                        operations.undoOperations.push(()=> {
                            canvas.add(target);
                            canvas.renderAll();
                        })
                        return false;
                    }, {}]
                });
                return;
            }
            if(!multipleSelection().map(({identifier})=>identifier).includes(
                (target.data.node || target.data.connection).identifier
            )){
                select(target.data.node || target.data.connection);
            }
            customContextMenu(event, {
                Delete: [()=>{
                    operations.undoOperations.txOpen();
                    multipleSelection().forEach((target)=>{
                        if((target as GConnection).node0) {
                            operations.deleteConnection(target as BasicGConnection)
                        }
                        else {
                            operations.deleteNode(target as BasicGNode)
                        }
                    })
                    operations.undoOperations.txClose();
                    return false;
                }, {}],
                Label: [({input})=>{
                    if(!input) return;
                    multipleSelection().forEach((target)=>{
                        if(!(target as GConnection).node0) {
                            operations.renameNode(target as BasicGNode, input);
                        }
                    })
                    return false;
                }, {addInputField: true, hide:multipleSelection().every((tgt)=>!!(tgt as GConnection).node0)}],
                Mark: [()=>{
                    multipleSelection().forEach((target)=>{
                        if(!(target as GConnection).node0) {
                            (target as GNode).data.marked = !(target as GNode).data.marked; 
                            const numKey = keyPressed.find(Number.parseInt);

                            (target as BasicGNode).graphical.circle.set({
                                fill: (target as GNode).data.marked ? 
                                numKey? getColor(+numKey): 'red' : 
                                'green',
                            })
                        }
                    })
                    canvas.renderAll();
                    return false;
                }, {hide:multipleSelection().every((tgt)=>!!(tgt as GConnection).node0)}],
                Separate: [()=>{
                    operations.separate(multipleSelection().filter((target)=>{
                        return !(target as GConnection).node0;
                    }) as BasicGNode[]);
                    return false;
                }, {hide:multipleSelection().every((tgt)=>!!(tgt as GConnection).node0)}],
                Contract:[()=>{
                    multipleSelection().forEach((target)=>{
                        if((target as GConnection).node0) {
                            const node0 = (target as GConnection).node0;
                            const node1 = (target as GConnection).node1;
                            operations.deleteConnection(target as BasicGConnection);
                            graph.neighbours(node1.identifier).forEach((neighbor)=>{
                                if(neighbor.identifier!==node0.identifier && neighbor.identifier !== node1.identifier) {
                                    const connection = graph.getConnection(neighbor.identifier, node1.identifier);
                                    const data = {directions: [...(connection!.data! as ConnectionData).directions]}
                                    if(connection?.node0.identifier === neighbor.identifier) {
                                        operations.addConnection(data, neighbor, node0 as BasicGNode);
                                    } else {
                                        operations.addConnection(data, node0 as BasicGNode, neighbor)
                                    }
                                    operations.deleteConnection(connection!);
                                    
                                }
                                
                            })
                            operations.deleteNode(node1 as BasicGNode);
                        }
                    })
                    return false;
                }, {hide:multipleSelection().every((tgt)=>!(tgt as GConnection).node0)}],
                Split: [()=>{
                    multipleSelection().forEach((target)=>{
                        if((target as GConnection).node0) {
                            const node0 = (target as GConnection).node0;
                            const node1 = (target as GConnection).node1;
                            const [x0,y0] = getCentre(node0.graphical.circle as fabric.Circle);
                            const [x1,y1] = getCentre(node1.graphical.circle as fabric.Circle);
                            const node = operations.addNode(graph,{}, (x0+x1)/2, (y0+y1)/2);
                            const data = {directions: [...(target!.data! as ConnectionData).directions]}
                            const data2 = {directions: [...(target!.data! as ConnectionData).directions]}
                            operations.deleteConnection(target as BasicGConnection);
                            operations.addConnection(data, node0 as BasicGNode, node);
                            operations.addConnection(data2, node, node1 as BasicGNode);
                        }
                    });
                    return false;
                },{hide:multipleSelection().every((tgt)=>!(tgt as GConnection).node0)}]
            });
        } else {
            customContextMenu(event, {
                Add: [({e})=>{
                    customContextMenu(
                        e, {
                            Void: [()=>{
                                const newGraph = new GGraph();
                                return false;
                            },{}],
                            Node: [() => {
                                const newGraph = new GGraph();
                                operations.undoOperations.txOpen();
                                operations.addNode(newGraph, {}, pointer.x, pointer.y);
                                operations.addGraph(newGraph);
                                operations.undoOperations.txClose();
                                return false;
                            },{}],
                            Petersen: [()=>{
                                const newGraph = createPeterson(pointer.x, pointer.y, operations);
                                return false;
                            }, {}],
                            Full: [({input})=> {
                                if(!input)return;
                                const newGraph = createFullGraph(input, pointer.x, pointer.y, operations);
                                return false;
                            }, {addInputField: true}],
                            Cycle: [({input})=> {
                                if(!input)return;
                                const newGraph = createCycle(input, pointer.x, pointer.y, operations);
                                return false;
                            }, {addInputField: true}],
                            Wheel: [({input})=> {
                                if(!input)return;
                                const newGraph = createWheel(input, pointer.x, pointer.y, operations);
                                return false;
                            }, {addInputField: true}],
                            Ladder: [({input})=> {
                                if(!input)return;
                                const newGraph = createLadder(input, pointer.x, pointer.y, operations);
                                return false;
                            }, {addInputField: true}],
                            Prisma: [({input})=> {
                                if(!input)return;
                                const newGraph = createPrisma(input, pointer.x, pointer.y, operations);
                                return false;
                            }, {addInputField: true}],
                            K: [({input, input2})=> {
                                if(!input || !input2)return;
                                const newGraph = createK(input, input2, pointer.x, pointer.y, operations);
                                return false;
                            }, {addInputField: true, addInputField2: true}],

                        }
                    )   
                    return true;
                }, {}],
                Save: [()=>{
                    const a = document.createElement("a");
                    a.href = canvas.toDataURL({
                        format: "jpg"
                    });
                    
                    a.download = "canvas.png";
                    a.click();
                    return false;
                },{}]
            });
        }
        
    }
}

export default {
    initializeEvents
}
