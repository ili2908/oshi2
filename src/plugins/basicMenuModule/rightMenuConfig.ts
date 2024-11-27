import { getSdk } from ".";
import { BasicGConnection } from "../../core/classes/graphs";
import { RightMenuConfig } from "../../core/pluginSDK/plugin.sdk.interface";
import * as algorithms from "./algorithms/algorithms";
export const rightMenuConfig: RightMenuConfig = {
    identifier: "Basic",
    choices: [{
        name: "Line Graph",
        callback: ()=>{
            const graph = getSdk().getCurrentGraph();
            algorithms.lineGraph(graph);
        }
    }, 
    {
        name: "Expand",
        callback: ()=>{
            const graph = getSdk().getCurrentGraph();
            algorithms.expand(graph);
        }
    },
    {
        name: "Label",
        callback: ()=>{
            const graph = getSdk().getCurrentGraph();
            algorithms.labelAllNodesInGraph(graph);
        }
    },
    {
        name: "Shrink",
        callback: ()=>{
            const graph = getSdk().getCurrentGraph();
            algorithms.shrink(graph);
        }
    },
    {
        name: "Articulation Edges",
        callback: ()=>{
            const graph = getSdk().getCurrentGraph();
            algorithms.findArticulationEdges(graph);
        }
    },
    {
        name: "Articulation Vertices",
        callback: ()=>{
            const graph = getSdk().getCurrentGraph();
            algorithms.findArticulationPoints(graph);
        }
    },
    {
        name: "Invert",
        callback: ()=>{
            const graph = getSdk().getCurrentGraph();
            algorithms.inverseGraph(graph);
        }
    },
    {
        name: "Color graph",
        callback: ()=>{
            const graph = getSdk().getCurrentGraph();
            algorithms.graphColoring(graph);
        }
    },
    {
        name: "Transpose",
        callback: ()=>{
            const graph = getSdk().getCurrentGraph();
            algorithms.transposeGraph(graph);
        }
    },
    {
        name: "Path",
        inputs:[{
            name:"V1",
            type:"vertexes"
        }, {
            name:"V2",
            type:"vertexes"
        }],
        callback: (v1Id, v2Id)=>{
            const selection = getSdk().getCurrentSelection().filter((object)=>!(object as BasicGConnection).node0);
            if(selection.length > 1) {
                v1Id = selection.at(-1)!.identifier;
                v2Id = selection.at(-2)!.identifier;
            }
            const graph = getSdk().getCurrentGraph();
            algorithms.findPath(graph, v1Id, v2Id, true);
        }
    },
    {
        name: "Metric",
        inputs:[{
            name:"V1",
            type:"vertexes"
        }, {
            name:"V2",
            type:"vertexes"
        }],
        callback: (v1Id, v2Id)=>{
            const selection = getSdk().getCurrentSelection().filter((object)=>!(object as BasicGConnection).node0);
            if(selection.length > 1) {
                v1Id = selection.at(-1)!.identifier;
                v2Id = selection.at(-2)!.identifier;
            }
            const graph = getSdk().getCurrentGraph();
            algorithms.findMetric(graph, v1Id, v2Id);
        }
    },
    {
        name: "Join",
        inputs:[{
            name:"G2",
            type:"graphs"
        }],
        callback: (graph2Id)=>{
            const graph2 = getSdk().getCurrentGraphs().find(({identifier})=>graph2Id==identifier)!
            const graph1 = getSdk().getCurrentGraph();
            algorithms.joinGraphs(graph1, graph2);
        }
    }]
};