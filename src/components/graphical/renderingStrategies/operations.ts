/*import fabric from "fabric/fabric-impl";
import appState from "../../../utils/appState";
import { BasicGNode, GGraph } from "../classes/basic";
import { NodeData } from "../types";
import { setGraphs, graphs, graph, setActiveGraph, getActiveGraph } from "../utils/graphsState";
import { UndoOperations, getCentre } from "../utils/utils";
import { GraphManager } from "./graphManager";

let NODE_SIZE = 15;
let NODE_FILL = 'green';
const LINE_FILL = 'black';

export class BasicOperations {
    canvas: fabric.Canvas;
    public undoOperations: UndoOperations = new UndoOperations();
    constructor(canvas: fabric.Canvas) { 
        this.canvas =  canvas;
    }

    addGraph(graph: GGraph) {
        this.undoOperations.txOpen()
        this._addGraph(graph);
        this.undoOperations.push(()=>{
            this._deleteGraph(graph.identifier);
        })
        this.undoOperations.txClose()
    }

    deleteGraph(deleteIdentifier: string) {

    }

    _addGraph(graph: GGraph) {
        setGraphs([...graphs, graph]);
        setActiveGraph(graph);
        GraphManager.is(graph.identifier, graph)
    }

    _deleteGraph(deleteIdentifier: string) {
        setGraphs([...graphs.filter(({identifier})=>identifier !== deleteIdentifier)]);
        if(getActiveGraph().identifier === deleteIdentifier) { 
            setActiveGraph(graphs.at(-1)!);
        }
    }

    _deleteNode(node:BasicGNode) {

    }

    _addNode(graph: GGraph, data: NodeData, x: number,y: number, identifier?: string) {
        const circle = new fabric.Circle({
            radius: NODE_SIZE,  fill: data.marked? "red": NODE_FILL,top: y - NODE_SIZE,left: x - NODE_SIZE,
            hasBorders:false,
            hasControls:false, 
        });
        circle.data = {node:this};
        const newNode = new BasicGNode(data, {circle}, graph, identifier);
        graph.addV(newNode);
        if(appState.autoLabeling()) {
            this.renameNode(newNode, data.label || newNode.identifier);
        }
        this.canvas.add(newNode.graphical.circle);
        return newNode;
       
    }

    renameNode(node: BasicGNode, input: string) {
        this.undoOperations.txOpen()
        const previousInput = node.data.label;
        node.data.label = input;
        if(!node.graphical.text) {
            node.graphical.text = new fabric.Text(node.data.label || node.identifier, {
                fontFamily: 'Calibri',
                fontSize: 20,
                fontStyle: 'italic',
                textAlign: 'center',
                left: getCentre(node.graphical.circle as fabric.Circle)[0]-40,
                top: getCentre(node.graphical.circle as fabric.Circle)[1]-40,
                hasControls: false,
                hasRotatingPoint: false,
                hasBorders: false,
                selectable: false,
            });
        } else {
            node.graphical.text.set({text: input});
        }
        this.canvas.add(node.graphical.text);
        this.canvas.renderAll();
        this.undoOperations.push((()=>{
            
            if(previousInput){
                node.data.label = previousInput;
                node.graphical.text!.set({text: previousInput});
            } else {
                delete node.data.label;
                this.canvas.remove(node.graphical.text!);
            }
            this.canvas.renderAll();
        }))
        this.undoOperations.txClose()
    }
}*/

export {}