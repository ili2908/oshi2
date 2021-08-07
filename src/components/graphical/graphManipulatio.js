import { fabric } from 'fabric';
import {NonDirectionalGraph,BaseNode} from '../../graphs'
import {State} from './utils/StateMachine'
let graph = new NonDirectionalGraph();
let nodeCount=0;
function createNode(x,y){
    let nn = new BaseNode(nodeCount++,{x,y});
    graph.addV(nn);
    let gn = new fabric.Circle({
        radius: 20, fill: 'green',top:y-20,left:x-20,hasBorders:false,hasControls:false
    });
    gn.node = nn;
    return gn;
}
const getCentre =(circle)=>{
    let {tl,br} = circle.aCoords;
    return [
        (tl.x+br.x)/2,
        (tl.y+br.y)/2
    ]

}


let canvas;
//======================================================================
let selected;
let line;
//======================================================================
const statesNames = [
    "objectNotSelected",
    "objectSelectedNode"
]
const states = statesNames.reduce((acc,state)=>{
    acc[state]=new State();
    return acc;
},{});

states["objectNotSelected"].on(["down:nothing","down:node"],({pointer,target})=>{
    selected = target;
    if(!selected)selected = createNode(Math.floor(pointer.x),Math.floor(pointer.y));
    line=new fabric.Line([...getCentre(selected),Math.floor(pointer.x)-2,Math.floor(pointer.y)-2],{
        stroke: 'red',
        hasBorders:false,
        hasControls:false,
        evented:false
    });
    return states["objectSelectedNode"];
});
states["objectSelectedNode"].on("down:nothing",({pointer})=>{
    newNode = createNode(Math.floor(pointer.x),Math.floor(pointer.y));
    
    selected = newNode;
    line=new fabric.Line([...getCentre(selected),Math.floor(pointer.x)-2,Math.floor(pointer.y)-2],{
        stroke: 'red',
        hasBorders:false,
        hasControls:false,
        evented:false
    });
    line.end={}
    line.end[newNode.identifier] = true; 
    graph.connect(selected.node.identifier,newNode.node.identifier,{
        line
    });
    canvas.add(line).renderAll();
});
states["objectSelectedNode"].on("down:node",({target})=>{
    let centre = getCentre(e.target);
    line.set({x2:centre[0],y2:centre[1]}).setCoords();
    canvas.renderAll();
    graph.connect(selected.node.identifier,target.node.identifier);
    states["objectNotSelected"]
});
states["objectSelectedNode"].on("down:selected",()=>{
    return states["objectSelectedNode"];
});
states["objectSelectedNode"].on("move:mouseUp",({pointer})=>{
    line.set(
        {
            x2:Math.floor(pointer.x)-2,
            y2:Math.floor(pointer.y)-2
        }).setCoords();
    canvas.sendToBack(line).renderAll();
});
states["objectSelectedNode"].on("move:mouseDown",({pointer})=>{
    const identifier = selected.node.identifier;
    const [x,y] = [Math.floor(pointer.x)-2,Math.floor(pointer.y)-2]
    graph.connections[identifier].forEach(connection => {
        const line = connection.data.line;
        line.set(line.end[identifier]?
            {x2:x,y2:y}:
        {x1:x,y1:y}
        ).setCoords();
    });
    selected.set({
        left:x-selected.radius,
        top:y-selected.radius
    }).setCoords();
    canvas.sendToBack(line).renderAll();
});
//=========================================================================
function initializeEvents(_canvas){
    canvas=_canvas;
    let mouseUp = true;
    let currentState = states["objectNotSelected"];
    canvas.on('mouse:down',({target,pointer})=>{ 
        mouseUp=false;
        currentState = currentState.pass(`down:${
            target==selected?
                "selected":
            target&&target.node?
                "node":
            "nothing"
        }`,{target,pointer});
    });
    canvas.on('mouse:move',({pointer})=>{     
        currentState = currentState.pass(`move:${
            mouseUp?
                "mouseUp":
            "mouseDown"
        }`,{target,pointer});
    });
    canvas.on('mouse:up',({pointer})=>{
        mouseUp=true;             
    });

}
export default {
    initializeEvents
}