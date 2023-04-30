import { fabric } from 'fabric';

class AddNode{
    NODE_COUNT=0
    constructor(canvas,graph){
        this.canvas = canvas;
        this.graph = graph;
    }
    execute(node){
        if(!node.data.x||!node.data.y)throw "Bad node position";
        const {x, y} = node.data;
        
        this.graph.addV(node);
        let graphicalNode = {
            ...new fabric.Circle({
                radius: 20, fill: 'green',top: y -20,left: x - 20,
                hasBorders:false,
                hasControls:false, 
            }),
            node,
        };
        node.data.graphical = graphicalNode;
        node.identifier = node.identifier??this.NODE_COUNT++;
        this.canvas.add(graphicalNode)
        return graphicalNode;
    }
    undo(graphicalNode){
        if(!graphicalNode.node)return;
        this.graph.deleteV(graphicalNode.node.identifier);

    }
}
class AddConnection{
    constructor(canvas,graph){
        this.canvas = canvas;
        this.graph = graph;
    }
    execute(connection){
        

    }
    undo(connection){
        
    }
}