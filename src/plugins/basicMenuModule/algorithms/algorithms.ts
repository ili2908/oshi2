import { getSdk } from "..";
import appState from "../../../core/appState/appState";
import { BasicGNode, GGraph } from "../../../core/classes/graphs";
import { getCentre } from "../../../utils/getCentre";
import { getColor } from "../utils";

export const inverseGraph = (graph: GGraph) => {
    getSdk().startTransaction();
    graph.getNodes().flatMap((aNode, i)=>{
        graph.getNodes().forEach((bNode, j)=>{
            if(j<i)return;
            
            const connection = graph.getConnection(aNode.identifier, bNode.identifier);
            if(connection) {
                getSdk().deleteConnection(connection);
            } else {
                getSdk().addConnection(aNode, bNode, {directions:[{}]})
            }
        })
    })
    getSdk().render();
    getSdk().closeTransaction();
}

export const transposeGraph = (graph: GGraph) => {
    getSdk().startTransaction();
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
        getSdk().deleteConnection(connection);
        getSdk().addConnection(connection.node0, connection.node1, data);
    });
    getSdk().render();
    getSdk().closeTransaction();
}

export const lineGraph = (graph: GGraph) => {
    getSdk().startTransaction();
    const newGraph = new GGraph();
    getSdk().addGraph(newGraph);
    graph.getConnections().forEach((connectionA)=>{
        const [x0,y0] = getCentre(connectionA.node0.graphical.circle as fabric.Circle);
        const [x1,y1] = getCentre(connectionA.node1.graphical.circle as fabric.Circle);
        getSdk().addNode(newGraph, {}, (x0+x1)/2, (y0+y1)/2, `C:${connectionA.identifier}`);
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
                
                getSdk().addConnection(
                    newGraph.nodes[`C:${connectionA.identifier}`], 
                    newGraph.nodes[`C:${connectionB.identifier}`],
                    {directions:[{}]},  
                )
            }
        })
    })
    getSdk().render();
    getSdk().closeTransaction();
}

export const expand = (graph: GGraph) => {
    getSdk().startTransaction();
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
        getSdk().moveNode(node,x + dx * 20, y + dy * 20);
    });
    getSdk().render();
    getSdk().closeTransaction();
}

export const shrink = (graph: GGraph) => {
    getSdk().startTransaction();
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
        getSdk().moveNode(node,x - dx * 20, y - dy * 20);
    });
    getSdk().render();
    getSdk().closeTransaction();
}

export const joinGraphs = (graph1:GGraph, graph2:GGraph) => {
    getSdk().startTransaction();
    graph1.getNodes().forEach(node=>{
        graph2.getNodes().forEach((node2)=>{
            getSdk().addConnection(node, node2, {directions:[{zeroToOne: appState.getState('arrowsEnabled') ? true : undefined}]});
        })
    })
    getSdk().render();
    getSdk().closeTransaction();
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
        getSdk().unselect();
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
        getSdk().select([nodes[prevNode]], false);
        for(let i of path) {
            getSdk().select([nodes[i]], false);
            getSdk().select([graph.getConnection(nodes[prevNode].identifier, nodes[i].identifier)!], false);
            prevNode = i;
        }
    }
    if(toSelect) {
        getSdk().render();
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
            getSdk().select([node], false);
        }
    })
    getSdk().render();
}

export const findArticulationPoints = (graph: GGraph)=> {
    getSdk().unselect();
    let time = 0;
    const visited = new Map();
    const low = new Map();
    const parent = new Map();
    const isArticulationPoint = new Set<string>();
  
    
  
    const  dfs = (vertex: BasicGNode) => {
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
  
    Array.from(isArticulationPoint).forEach((node: string)=>{
        getSdk().select([graph.nodes[node]], false);
    });
    getSdk().render();

}

export const findArticulationEdges = (graph: GGraph) => {
    getSdk().unselect();
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
  
    Array.from(isArticulationEdge).forEach(([id0, id1])=>{
        getSdk().select([graph.getConnection(id0, id1)!], false);
    });
    getSdk().render();
}

export const findArticulationPointsDirected = (graph: GGraph) => {
    getSdk().unselect();
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
  
    Array.from(isArticulationPoint).forEach((node: string)=>{
        getSdk().select([graph.nodes[node]], false);
    });

    getSdk().render();
}

export const findArticulationEdgeDirected = (graph: GGraph) => {
    getSdk().unselect();
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

    Array.from(isArticulationEdge).forEach(([id0, id1])=>{
        getSdk().select([graph.getConnection(id0, id1)!], false);
    });

    getSdk().render();
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
    }
  
    function setColor(vertex: BasicGNode, color: string) {
      vertexColors.set(vertex.identifier, color);
    }
  
    function unsetColor(vertex: BasicGNode) {
      vertexColors.delete(vertex.identifier);
    }
  
    if (backtrack()) {
      // Return the number of colors used if a valid coloring is found.
      getSdk().startTransaction();
      vertexColors.forEach((val,key)=>{
        getSdk().colorNode(graph.nodes[key], val);
      })
      getSdk().closeTransaction();
      getSdk().render();
      return vertexColors.size;
    } else {
      return null;
    }
}

export const labelAllNodesInGraph = (graph: GGraph) => {
    getSdk().startTransaction();
    graph.getNodes().forEach((node)=>getSdk().renameNode(node, node.identifier));
    getSdk().closeTransaction();
}
