import React from "react";
import { download } from "../../utils/download";
import { BasicGConnection, BasicGNode, GGraph } from "../graphical/classes/basic";
import { expand, findArticulationEdgeDirected, findArticulationEdges, findArticulationPoints, findArticulationPointsDirected, findMetric, findPath, fromAdjacencyMatrix, getAdjMatrix, graphColoring, inverseGraph, joinGraphs, labelAllNodesInGraph, lineGraph, select, shrink, transposeGraph, unselect } from "../graphical/graphManipulatio";
import { GConnection, GNode } from "../graphical/types";
import { multipleSelection, setActiveGraph, setGraphs } from "../graphical/utils/graphsState";
import { getCentre } from "../graphical/utils/utils";

export default class GraphMenu extends React.Component<{graph: GGraph, graphs: GGraph[]}>{
  graph: GGraph;
  graphs: GGraph[];
  public constructor(props: {graph: GGraph, graphs: GGraph[]}) {
    super(props);
    const {graph, graphs} = props;
    this.graph = graph;
    this.graphs = graphs;
    graph.nodes = new Proxy(graph.nodes, {
        set: (target, property, value) => {
            target[property as string] = value;
            this.forceUpdate();
            return true;
        },
        deleteProperty: (target, property) => {
            delete target[property as string];
            this.forceUpdate();
            return true;
        }
    })
  }
  render() {

    return(
        <div id="div" style={{height:"100%", display: "flex", flexDirection: "column"}}>
            <h1>{this.graph.identifier}</h1>
            <div style = {{display: 'flex', paddingLeft:'7%'}}>
            <button style = {{marginRight: '3%'}} onClick = {() => {
                const json = JSON.stringify({
                    identifier: `D:${this.graph.identifier}`,
                    connections: this.graph.getConnections().map((connection)=>{
                        return {
                            identifier: `D:${connection.identifier}`,
                            node0: `D:${connection.node0.identifier}`,
                            node1: `D:${connection.node1.identifier}`,
                            data: connection.data
                        }
                    }),
                    nodes:this. graph.getNodes().map((node)=>{
                        return {
                            identifier: `D:${node.identifier}`,
                            data: node.data,
                            coords: getCentre(node.graphical.circle)
                        }
                    })
                })
                download(json, `${this.graph.identifier}.json`, "text/plain");
            }}>
                Export
            </button>
            <button style = {{marginRight: '3%'}} onClick = {() => {
                labelAllNodesInGraph(this.graph);
            }}>
                Assign labels
            </button>
            <button style = {{marginRight: '3%'}} onClick = {() => {
                inverseGraph(this.graph);
            }}>
                Invert Graph
            </button>
            <button style = {{marginRight: '3%'}} onClick = {() => {
                transposeGraph(this.graph);
            }}>
                Transpose Graph
            </button>
            
            </div>
            <div style = {{display: 'flex', marginTop:'1%', paddingLeft:'7%'}}>
                <button style = {{marginRight: '3%'}} onClick = {() => {
                    lineGraph(this.graph);
                }}>
                    Line Graph
                </button>
                <button style = {{marginRight: '3%'}} onClick = {() => {
                    expand(this.graph);
                }}>
                    Expand Graph
                </button>
                <button style = {{marginRight: '3%'}} onClick = {() => {
                    shrink(this.graph);
                }}>
                    Shrink Graph
                </button>
                <button style = {{marginRight: '3%'}} onClick = {() => {
                    graphColoring(this.graph);
                }}>
                    Color
                </button>
                
            </div>
            <div style = {{display: 'flex', marginTop:'1%', paddingLeft:'7%'}}>
                <button onClick = {() => {
                    var e = document.getElementById("join");
                    joinGraphs(this.graph, this.graphs.find(({identifier})=>identifier === (e as HTMLInputElement).value)!);
                }}>
                    Join with:
                </button>
                <select name="join" id="join" >
                    {
                        this.graphs.filter(({identifier})=>identifier!=this.graph.identifier).map(({identifier})=>{
                            
                            return (<option key = {identifier} value={identifier}>{identifier}</option>)
                        })
                    }
                </select>
            </div>
            <div style = {{display: 'flex', marginTop:'1%', paddingLeft:'7%'}}>
                <button onClick = {() => {
                    var e1 =  document.getElementById("path1");
                    var e2 = document.getElementById("path2");
                    findPath(
                        this.graph, 
                        multipleSelection()?.["0"]?.identifier || (e1 as HTMLInputElement).value, 
                        multipleSelection()?.at(-1)?.identifier || (e2 as HTMLInputElement).value);
                }}>
                    Find path between:
                </button>
                <select name="path1" id="path1">
                    {
                        this.graph.getNodes().map(({identifier})=>{
                            
                            return (<option key = {identifier} value={identifier}>{identifier}</option>)
                        })
                    }
                </select>
                <select name="path2" id="path2">
                    {
                        this.graph.getNodes().map(({identifier})=>{
                            
                            return (<option key = {identifier} value={identifier}>{identifier}</option>)
                        })
                    }
                </select>
            </div>
            <div style = {{display: 'flex', marginTop:'1%', paddingLeft:'7%'}}>
                <button onClick = {() => {
                    var e1 =  document.getElementById("metric1");
                    var e2 = document.getElementById("metric2");
                    findMetric(
                        this.graph, 
                        multipleSelection()?.["0"]?.identifier || (e1 as HTMLInputElement).value, 
                        multipleSelection()?.at(-1)?.identifier || (e2 as HTMLInputElement).value);
                }}>
                    Find metric between:
                </button>
                <select name="metric1" id="metric1">
                    {
                        this.graph.getNodes().map(({identifier})=>{
                            
                            return (<option key = {identifier} value={identifier}>{identifier}</option>)
                        })
                    }
                </select>
                <select name="metric2" id="metric2">
                    {
                        this.graph.getNodes().map(({identifier})=>{
                            
                            return (<option key = {identifier} value={identifier}>{identifier}</option>)
                        })
                    }
                </select>
               
            </div> 
            <div style = {{display: 'flex', marginTop:'1%', paddingLeft:'7%'}}>
                <button style = {{marginRight: '3%'}} onClick = {() => {
                    findArticulationPoints(this.graph); //Tarjan's algorithm
                }}>
                    Articulation points
                </button>
                <button style = {{marginRight: '3%'}} onClick = {() => {
                    findArticulationEdges(this.graph); //Tarjan's algorithm
                }}>
                    Articulation edges
                </button>
            </div>
            <hr/>
            <div style = {{display: 'flex', marginTop:'1%', paddingLeft:'7%'}}>
                <button style = {{marginRight: '3%'}} onClick = {() => {
                    const obj = getAdjMatrix(this.graph);
                    const stringifyMatrix = (matrix: number[][]) => {
                        let result = "[\n";
                        for (let i in matrix) {
                            result += `[ `;
                            for (let cell in matrix[i]) {
                            
                                result += matrix[i][cell] 
                                if(+cell !== matrix.length - 1) {
                                    result += ", ";
                                }
                               
                            }
                            result += `]${+i!== matrix.length - 1?',':''}\n`;

                        }
                        return result+']';
                    };
                    let e1 = document.getElementById("adjInput");
                    (e1 as HTMLInputElement).value = stringifyMatrix(obj.matrix);
                
                }}>
                    Adj matrix 
                </button>
                <button style = {{marginRight: '3%'}} onClick = {() => {
                    var e1 = document.getElementById("adjInput");
                    try{
                        const newGraph = fromAdjacencyMatrix(JSON.parse((e1 as HTMLInputElement).value));
                        if(!this.graph) return;
                    } catch(e) { console.log(e)}
                
                }}>
                    From adj matrix 
                </button>
                
            </div>
            <div style = {{overflow: "scroll", marginTop:'3%', paddingLeft:'7%', paddingRight:'7%', maxWidth: "500px", height:"200px"}}>
                <textarea cols={100} rows={100} style={{
                    width: "100%",
                    height: "100%",
                    whiteSpace: "nowrap",
                    boxSizing: "border-box",
                    resize: "none",
                }} id="adjInput">
                </textarea>
            </div>
        </div>
    );
  }
}