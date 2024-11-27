import { getSdk, init } from ".";
import { GGraph } from "../../core/classes/graphs";
import { PluginConfig } from "../../core/pluginSDK/plugin.sdk.interface";
import { createCycle, createFullGraph, createK, createLadder, createPeterson, createPrisma, createWheel } from "./prefabs/graphs1";

export default {
    pluginName: "Basic Prefabs",
    pluginVersion: "0.5.0",
    rightClickPanels: [{
        choices: [
            {
                name: "Add",
                targets: ["void"],
                expand: {
                    choices: [
                        {
                            name: "Node",
                            targets: [],
                            callBack: (event)=>{
                                const newGraph = new GGraph();
                                const pointer = getSdk().getCanvas().getPointer(event);
                                getSdk().startTransaction();
                                getSdk().addNode(newGraph, {}, pointer.x, pointer.y);
                                getSdk().addGraph(newGraph);
                                getSdk().closeTransaction();

                            }
                        },
                        {
                            name: "Peterson",
                            targets: [],
                            callBack: (event)=>{
                                const pointer = getSdk().getCanvas().getPointer(event);
                                createPeterson(pointer.x, pointer.y);
                            }
                        },
                        {
                            name: "Prisma",
                            inputFields: ["vertexes"],
                            targets: [],
                            callBack: (event, vertexes)=>{
                                const pointer = getSdk().getCanvas().getPointer(event);
                                createPrisma(+vertexes, pointer.x, pointer.y);
                            }
                        },
                        {
                            name: "Wheel",
                            inputFields: ["vertexes"],
                            targets: [],
                            callBack: (event, vertexes)=>{
                                const pointer = getSdk().getCanvas().getPointer(event);
                                createWheel(+vertexes, pointer.x, pointer.y);
                            }
                        },
                        {
                            name: "Cycle",
                            inputFields: ["vertexes"],
                            targets: [],
                            callBack: (event, vertexes)=>{
                                const pointer = getSdk().getCanvas().getPointer(event);
                                createCycle(+vertexes, pointer.x, pointer.y);
                            }
                        },
                        {
                            name: "Ladder",
                            inputFields: ["vertexes"],
                            targets: [],
                            callBack: (event, vertexes)=>{
                                const pointer = getSdk().getCanvas().getPointer(event);
                                createLadder(+vertexes, pointer.x, pointer.y);
                            }
                        },
                        {
                            name: "Full",
                            inputFields: ["vertexes"],
                            targets: [],
                            callBack: (event, vertexes)=>{
                                const pointer = getSdk().getCanvas().getPointer(event);
                                createFullGraph(+vertexes, pointer.x, pointer.y);
                            }
                        },
                        {
                            name: "K",
                            inputFields: ["vs1", "vs2"],
                            targets: [],
                            callBack: (event, vertexes1, vertexes2)=>{
                                const pointer = getSdk().getCanvas().getPointer(event);
                                createK(+vertexes1, +vertexes2, pointer.x, pointer.y);
                            }
                        }
                    ]
                }

            }
        ]
    }],
    init
} as PluginConfig;