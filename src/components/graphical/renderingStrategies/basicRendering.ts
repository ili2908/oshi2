
import { fabric } from 'fabric';
import { BaseGraph, BaseNode } from '../../simple_graphs/BaseImplementations';
import { BasicGConnection, BasicGNode, GGraph } from '../classes/basic';
import { ConnectionData, GConnection, GNode, NodeData } from '../types';
import { graphs, setActiveGraph, setGraphs } from '../utils/graphsState';
import { getCentre, UndoOperations } from '../utils/utils';
import appState from '../../../utils/appState';
import { GraphManager } from './graphManager';
import { operation } from 'retry';


let NODE_SIZE = 15;
let NODE_FILL = 'green';
const LINE_FILL = 'black';
export class BasicOperations {
    canvas: fabric.Canvas;
    public undoOperations: UndoOperations = new UndoOperations();
    constructor(canvas: fabric.Canvas) { 
        this.canvas =  canvas;
    }
    addGraph(graph: GGraph, index = -1) {
        graphs.splice(index>-1?index:graphs.length,0, graph);
        setGraphs(graphs);
        setActiveGraph(graph);
        GraphManager.is(graph.identifier, graph)
        this.undoOperations.push(()=>{
            graphs.splice(index>-1?index:graphs.length-1,1);
            setGraphs([...graphs]);
            setActiveGraph(graphs.at(-1)!);
        })
    }

    paintNode(node: BasicGNode, color: string, resize = node.graphical.circle.radius){
        const centerX = node.graphical.circle.left! + node.graphical.circle.radius!;
        const centerY = node.graphical.circle.top! + node.graphical.circle.radius!;
        const prevColor = node.graphical.circle.fill;
        const prevSize = node.graphical.circle.radius;

        
        node.graphical.circle.set({
            fill: color,
            radius: resize,
            left: centerX - resize!,
            top: centerY - resize!
        }).setCoords();
        node.data.marked = true;
        this.undoOperations.push(()=>{
            node.data.marked = false;
            const centerX = node.graphical.circle.left! + node.graphical.circle.radius!;
            const centerY = node.graphical.circle.top! + node.graphical.circle.radius!;
            node.graphical.circle.set({
                fill: prevColor,
                radius: prevSize,
                left: centerX - prevSize!,
                top: centerY - prevSize!
            }).setCoords();

            this.canvas.renderAll();
        })
        
    }

    drawGraph(graph: BaseGraph<GNode, GConnection>) {}

    addNode(graph: GGraph, data: NodeData, x: number,y: number, identifier?: string): BasicGNode {
       this.undoOperations.txOpen();
        const circle = new fabric.Circle({
            radius: NODE_SIZE,  fill: data.marked? "red": NODE_FILL,top: y - NODE_SIZE,left: x - NODE_SIZE,
            hasBorders:false,
            hasControls:false, 
        });
        circle.canvas = this.canvas;
        circle.data = {node:this};
        const newNode = new BasicGNode(data, {circle}, graph, identifier);
        graph.addV(newNode);
        this.undoOperations.push(()=>{
            this.undoAddNode(newNode);
        });
        if(appState.autoLabeling()) {
            this.renameNode(newNode, data.label || newNode.identifier);
        }
        this.canvas.add(newNode.graphical.circle);
       
        this.undoOperations.txClose();
        return newNode;

    }
    
    deleteNode(node: BasicGNode) {
        this.undoOperations.txOpen();
        if(node.graphical.text) {
            this.canvas.remove(node.graphical.text)
        }
        const connections = node.graph.neighbours(node.identifier).map((other)=>{
            return node.graph.getConnection(node.identifier, other.identifier);
        }).map(res=>({
            node0Id: res?.node0.identifier,
            node1Id: res?.node1.identifier,
            data: {
                label: res!.data.label,
                directions: [...res!.data.directions],
            }
        }));
        const graphId = node.graph.identifier;
        this.undoOperations.push(()=>{ 
            const graph = GraphManager.get(graphId);
            node.graph = graph;
            graph.addV(node);      
            this.canvas.add(node.graphical.circle);
            if(node.data.label) { 
                this.renameNode(node, node.data.label || node.identifier);
                this.undoOperations.pop();
            } else {
                //this.undoOperations.pop()
            }
            
            connections.forEach((connection)=>{
                this.addConnection(connection!.data!, graph.nodes[connection.node0Id!] || node, graph.nodes[connection.node1Id!] || node);
                this.undoOperations.pop()
            });
        });
        
        node.graph.neighbours(node.identifier).map((other)=>{
            const connection = node.graph.getConnection(node.identifier, other.identifier);
            this.undoAddConnection(connection! as BasicGConnection, {directions: [...connection?.data.directions!]});
        })
        this.undoAddNode(node);
        this.undoOperations.txClose();

       
    }

    deleteConnection(connection: BasicGConnection) {   
        const durections = [...connection!.data.directions]
        this.undoOperations.push(()=>{ 
            this.addConnection({
                label: connection!.data.label,
                directions: durections,
            }, connection.node0, connection.node1, false);
        });
        this.undoAddConnection(connection, {directions: [...connection?.data.directions!]});

    }

    moveNode(node: BasicGNode, fromX: number,fromY: number,toX: number,toY: number) {
        if(node.graphical.text) {
            node.graphical.text.set({
                top: getCentre(node.graphical.circle as fabric.Circle)[1]-40,
                left: getCentre(node.graphical.circle as fabric.Circle)[0]-40,
            }).setCoords();
        }
        Object.entries({...node.graph.connections[node.identifier] }).forEach(([_, connection]) => {
            this.moveConnection(connection);
        });
    }

    renameNode(node: BasicGNode, input: string) {
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
    }

    addConnection(data: ConnectionData, node0: BasicGNode, node1: BasicGNode, push = true): BasicGConnection {
        this.undoOperations.txOpen()
        if((node0.graph as GGraph).identifier !== (node1.graph as GGraph).identifier) {
            this.merge(node0.graph as GGraph, node1.graph as GGraph);
        }
        const graph = node0.graph;
        const current = graph.getConnection(node0.identifier, node1.identifier);

        if(current) {
            if(node0.identifier !== current.node0.identifier) {
                data.directions.forEach(direction => {
                    direction.zeroToOne = direction.zeroToOne === undefined ?undefined:false;
                })
            }
            node0 = current.node0;
            node1 = current.node1;
            
        }
        const graphicals = data.directions.map(({zeroToOne},j)=>{
            const i = (current?.data.directions.length || 0) + j;
            const [newPath, newHead] = node1.identifier===node0.identifier? this.drawLoop(zeroToOne!,i,node0,node1): this.drawLine(zeroToOne!,i,node0,node1);

            if(zeroToOne === undefined) {
                return [newPath!];   
            }
            return [newPath!, newHead!]

        });
        const dataCopy = JSON.parse(JSON.stringify(data));
        const gid = node0.graph.identifier;
        if(push) {
            this.undoOperations.push(()=>{ 
                this.undoAddConnection(GraphManager.get(gid).getConnection(node0.identifier, node1.identifier)!, dataCopy);
            });
        }
        if(current) {
            data.directions.forEach(direction=>current.data.directions.push(direction));
            const length = Object.keys(current.graphical).filter((key)=>key.includes('path')).length;
            graphicals.forEach(([path,head],i)=>{
                const id = length + i;
                path.data = {connection: current}
                current.graphical[`path${id}`] = path;
                if(head){
                    current.graphical[`head${id}`] = head;
                }
            });
            this.undoOperations.txClose()
            return current;

        }
        graph.connect(node0.identifier, node1.identifier, {
            data,
            graphical: graphicals.reduce((obj: any, [path,head,id], i)=>{
                obj[`path${i}`] = path;
                if(head){
                    obj[`head${i}`] = head;
                }
                return obj;
            }, {}),
        });

        this.undoOperations.txClose()

        return graph.getConnection(node0.identifier, node1.identifier)!;
    }

    merge(graph1: GGraph, graph2: GGraph) {
        const g1Id = graph1.identifier;
        const g2Id = graph2.identifier;
        graph1.merge(graph2);
        GraphManager.is(graph1.identifier, graph1);
        const index = graphs.findIndex((g)=>g.identifier=== graph2.identifier)
        setGraphs([...graphs.filter(({identifier})=>identifier!=graph2.identifier)]);
        this.undoOperations.push(()=>{
            const graph2 = GraphManager.get(g2Id);
            this.undoMergeOperation(g1Id, graph2.identifier, graph2.getNodes().map(({identifier})=>{
                return graph1.nodes[identifier]
            }), index);
        });
        setActiveGraph(graph1);
    }

    separate(_nodes: BasicGNode[]) {
        this.undoOperations.txOpen();
        const graph = _nodes[0].graph;
        const nodes = _nodes.map(({identifier})=>graph.nodes[identifier]);
        const id = graph.identifier;
        nodes.map((node)=>{
            const neighbors = graph.neighbours(node.identifier);
            
            neighbors.forEach(({identifier})=>{
                if(nodes.map(({identifier})=>identifier).includes(identifier)) {
                    return;
                }

                const connection = graph.getConnection(identifier, node.identifier);
                this.deleteConnection(connection!);
            })
        })
        const newGraph = graph.separate(nodes);
        const id2 = newGraph.identifier
        this.undoOperations.push(()=>{
            this.merge(GraphManager.get(id), GraphManager.get(id2));
            GraphManager.is(id, GraphManager.get(id))
            setGraphs([...graphs]);
            this.undoOperations.pop()
            
        }) 
        
        GraphManager.is(newGraph.identifier, newGraph)
        setGraphs([...graphs, newGraph]);
        setActiveGraph(newGraph);
        this.undoOperations.txClose();
    }

    private moveConnection(con: BasicGConnection) {
        const {node0, node1} = con;
        con.data.directions.map(({zeroToOne},i)=>{
            const path = con.graphical[`path${i}`] as fabric.Path;
            this.canvas.remove(path);
            const [newPath, newHead] = node1.identifier===node0.identifier? this.drawLoop(zeroToOne!,i,node0,node1): this.drawLine(zeroToOne!,i,node0,node1);
            newPath.data = {connection: con}
            con.graphical[`path${i}`] = newPath

            if(zeroToOne === undefined) {
                return;   
            }

            const head = con.graphical[`head${i}`] as fabric.Triangle;
            this.canvas.remove(head);
            con.graphical[`head${i}`] = newHead!;
            
        });

        
    }

    private drawLine(zeroToOne:boolean, i:number,node0: BasicGNode, node1: BasicGNode): [fabric.Path, fabric.Triangle?] {
        const [x0,y0] = getCentre(node0.graphical.circle);
        const [x1,y1] = getCentre(node1.graphical.circle);
        const mx = (x0 + x1) / 2;
        const my = (y0 + y1) / 2;
        const px = -(y1 - y0);
        const py = x1 - x0;
        const curvatureCoefficient = (i%2===1?1:-1)* Math.ceil(i/2)*0.1
        const cx = mx - px * curvatureCoefficient;//(i%2===1?1:-1*i * 0.1 * 2);
        const cy = my - py * curvatureCoefficient;//(i%2===1?1:-1*i * 0.1 * 2);
        
        const path = new fabric.Path(`M ${x0} ${y0} Q ${cx}, ${cy}, ${x1}, ${y1}`, { 
            fill: '', 
            stroke: LINE_FILL,
            strokeWidth:2, 
            perPixelTargetFind: true,
            hasBorders: false,
            hasControls:false, 
            selectable:false,
        });
        this.canvas.add(path);
        this.canvas.sendToBack(path);

        if(zeroToOne === undefined) {
            return [path];   
        }

        const ang = zeroToOne ? 
            Math.atan2((y1 - cy), (x1 - cx)):
            Math.atan2((cy - y0), (cx - x0)); 
        const head = new fabric.Triangle({
            width: 10,
            height: 15,
            fill: LINE_FILL,
            left:   zeroToOne?
                x1 + 5 * Math.sin(ang) - NODE_SIZE * Math.cos(ang):
                x0 - 5 * Math.sin(ang) + NODE_SIZE * Math.cos(ang),
            top:    zeroToOne?
                y1 - 5 * Math.cos(ang) - NODE_SIZE * Math.sin(ang):
                y0 + 5 * Math.cos(ang) + NODE_SIZE * Math.sin(ang),
            angle:  ang * 180 / Math.PI + (zeroToOne?90:-90),
            hasBorders: false,
            evented: false,
            selectable: false
        });
        this.canvas.add(head);
        this.canvas.sendToBack(head);

        return [path,head];
    } 

    private drawLoop(zeroToOne:boolean, i:number,node0: BasicGNode, node1: BasicGNode): [fabric.Path| fabric.Circle, fabric.Triangle?] {
        const [x0,y0] = getCentre(node0.graphical.circle);
        
        var path = new fabric.Circle({
            radius: NODE_SIZE + 4*i,
            left: x0-(NODE_SIZE + 4*i),
            top: y0,
            stroke: '#000',
            strokeWidth: 2,
            perPixelTargetFind: true,
            hasBorders: false,
            hasControls:false, 
            fill: '',
            selectable: false
        });
        this.canvas.add(path);
        this.canvas.sendToBack(path);
        if(zeroToOne === undefined) {
            return [path];   
        }
        const head = new fabric.Triangle({
            width: 10,
            height: 15,
            fill: LINE_FILL,
            left: x0+9,
            top: y0-5+2*(NODE_SIZE + 4*i),
            angle:  90,
            hasBorders: false,
            evented: false,
            selectable: false
        });
        this.canvas.add(head);
        this.canvas.sendToBack(head);
    
        return [path, head];
    }
    
    undoMergeOperation(graph1Id: string, graph2Id: string, _nodes: BasicGNode[], index: number) {
        const graph = (_nodes[0].graph as GGraph);
        const nodes = _nodes.map(({identifier})=>graph.nodes[identifier]);
        const graph2 = graph.separate(nodes);
        GraphManager.is(graph1Id,graph);
        GraphManager.is(graph2Id,graph2);
        graphs.splice(index,0, graph2);
       
        setGraphs([...graphs]);
        
        
        setActiveGraph(graph);
    }
    undoAddNode(node:BasicGNode) {
        node = node.graph.nodes[node.identifier];
        this.canvas.remove(node.graphical.circle);
        if(node.graphical.text) {
            this.canvas.remove(node.graphical.text);
        }
        node.graph.deleteV(node.identifier);
    }
        
    undoAddConnection(connection: BasicGConnection, data: ConnectionData) {
        data.directions.forEach(({zeroToOne})=>{
            const id = connection.data.directions.length - 1
            this.canvas.remove(connection.graphical[`path${id}`]);
            delete connection.graphical[`path${id}`];
            if(zeroToOne === undefined) {
                connection.data.directions.pop();
                return;   
            }
            this.canvas.remove(connection.graphical[`head${id}`]);
            delete connection.graphical[`head${id}`];
            connection.data.directions.pop();
        });
        if(connection.data.directions.length === 0) {
            connection.node0.graph.disconnect(connection.node0.identifier, connection.node1.identifier);
        }
        
        
    }

    undoMoveNode(node: BasicGNode, fromX: number,fromY: number, toX: number,toY: number) {}

    undo(): void {
        if(this.undoOperations.empty()) return;
        const res = this.undoOperations.pop()
        res!();
    }
    setStyle(_NODE_FILL: string, _NODE_SIZE: number) {
        const tmpS = NODE_SIZE;
        const tmpF = NODE_FILL;
        NODE_SIZE = _NODE_SIZE;
        NODE_FILL = _NODE_FILL;
        this.undoOperations.push(()=>{
            NODE_SIZE = tmpS;
            NODE_FILL = tmpF;
        })
    }
}
    

