import { fabric } from 'fabric';
import { createIncrementalCompilerHost } from 'typescript';
import { Graph, BaseNode } from '../simple_graphs'
import { Node } from './nodes';
import { State } from './utils/StateMachine'
import kazka from './kazka.json';
let graph = new Graph();
let nodeCount = 0;
let canvas;
let selected;
let line;
let keyPressed = [];
const createNode = (x, y) => {
    let gn = keyPressed.includes("a") ?
        new fabric.Rect({
            width: 40,
            height: 40,
            fill: 'red',
            top: y - 20,
            left: x - 20,
            hasBorders: false,
            hasControls: false
        }) :
        new Node(x, y, graph, canvas);
    gn.isRect = keyPressed.includes("a");
    if (gn.isRect) {
        let nn = new BaseNode(nodeCount++, { x, y ,node:gn});
        graph.addV(nn);
        gn.node = nn;
    }
    gn.tokens = [];
    canvas.add(gn)
    return gn;
}

const createLine = ([x1, y1, x2, y2], color) => {
    var triangle = new fabric.Triangle({
        width: 10,
        height: 15,
        fill: `rgb(${(17%color)*30},${(17%(+color+2))*30},${(17%(+color+4))*30})`,
        left: x2,
        top: y2,
        angle: Math.atan((x2 - x1) / (y2 - y1)) * 180 / Math.PI,
        hasBorders: false,
        hasas: false,
        evented: false,
        selectable: false
    });
    const line = new fabric.Line([x1, y1, x2, y2], {
        stroke: `rgb(${(17%color)*30},${(17%(+color+2))*30},${(17%(+color+4))*30})`,
        hasBorders: false,
        hasas: false,
        evented: false,
        selectable: false
    });
    line.triangle = triangle;
    line.color = color||0;
    canvas.add(line);
    canvas.add(triangle);
    return line;

}
const getCentre = (circle) => {
    let { tl, br } = circle.aCoords;
    return [
        (tl.x + br.x) / 2,
        (tl.y + br.y) / 2
    ]

}
const deleteLine = () => {
    if (line) {
        canvas.remove(line.triangle);
        canvas.remove(line).renderAll();
    }
    line = null;
}
const adjastMousePointer = (pointer) => {
    return [Math.floor(pointer.x) - 2, Math.floor(pointer.y) - 2];
}

const moveToken = (token, line2, frame) => {
    const x1 = line2.x1;
    const x2 = line2.x2;
    const y1 = line2.y1;
    const y2 = line2.y2;
    const len = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    const move = len / 100 * frame;
    const ang = Math.atan2((y2 - y1), (x2 - x1))
    token.set({
        top: move * Math.sin(ang) - 5 * Math.cos(ang) + y1,
        left: move * Math.cos(ang) + 5 * Math.sin(ang) + x1
    }).setCoords();
    canvas.renderAll();
}


//======================================================================
const statesNames = [
    "objectNotSelected",
    "objectSelectedNode",
    "objectDragging",
    "ctrlPressed",
]
const states = statesNames.reduce((acc, state) => {
    acc[state] = new State();
    return acc;
}, {});



states["objectNotSelected"].on(["down:nothing", "down:node", "down:selected"], ({ pointer, target }) => {


    selected = target;
    if (!selected) selected = createNode(Math.floor(pointer.x), Math.floor(pointer.y));
    line = createLine([...getCentre(selected), Math.floor(pointer.x) - 2, Math.floor(pointer.y) - 2], keyPressed.find(x => x >= '0' && x <= '9'));
    return states["objectSelectedNode"];

}); //======
states["objectSelectedNode"].on(["down:nothing"], ({ target, pointer }) => {
    if ((selected.isRect && !keyPressed.includes("a")) || (!selected.isRect && keyPressed.includes("a"))) {
        let newNode = createNode(...adjastMousePointer(pointer));

        const [x, y] = getCentre(newNode);

        line.end = newNode.node.identifier;
        line.set({ x2: x, y2: y }).setCoords();
        const x1 = line.x1;
        const y1 = line.y1;
       
        const ang = Math.atan2((y - y1), (x - x1));
        line.triangle.set({
            left: x + 5 * Math.sin(ang) - (line.isRect ? (10 * Math.sqrt(2) + 15) * Math.cos(ang) : 25 /*10(radius) + 15(triangle)*/ * Math.cos(ang)),
            top: y - 5 * Math.cos(ang) - (line.isRect ? (10 * Math.sqrt(2) + 15) * Math.sin(ang) : 25 * Math.sin(ang)),
            angle: ang * 180 / Math.PI + 90
        }).setCoords();
        graph.connect(selected.node.identifier, newNode.node.identifier, {
            line
        });

        canvas.renderAll();
        selected = newNode;
        line = createLine([...getCentre(selected), Math.floor(pointer.x) - 2, Math.floor(pointer.y) - 2], keyPressed.find(x => x >= '0' && x <= '9'));
    }
}); //======
states["objectSelectedNode"].on(["down:node"], ({ target }) => {
    if ((selected.isRect && !target.isRect) || (!selected.isRect && target.isRect)) {
        const [x, y] = getCentre(target);
        const tId = target.node.identifier;
        const sId = selected.node.identifier;
        if (graph.connections[tId] && sId in graph.connections[tId]) {
            deleteLine();
            canvas.remove(graph.connections[tId][sId].data.line);
            canvas.remove(graph.connections[tId][sId].data.line.triangle);
            graph.disconnect(tId, sId);
            return states["objectNotSelected"];
        }
        if (graph.inboundConnections[tId] && sId in graph.inboundConnections[tId]) {
            deleteLine();
            return states["objectNotSelected"];
        }

        line.end = target.node.identifier

        line.set({ x2: x, y2: y }).setCoords();
        const x1 = line.x1;
        const y1 = line.y1;
        const ang = Math.atan2((y - y1), (x - x1));
        line.triangle.set({
            left: x + 5 * Math.sin(ang) - (line.isRect ? (10 * Math.sqrt(2) + 15) * Math.cos(ang) : 25 /*10(radius) + 15(triangle)*/ * Math.cos(ang)),
            top: y - 5 * Math.cos(ang) - (line.isRect ? (10 * Math.sqrt(2) + 15) * Math.sin(ang) : 25 * Math.sin(ang)),
            angle: ang * 180 / Math.PI + 90
        }).setCoords();

        canvas.renderAll();

        graph.connect(selected.node.identifier, target.node.identifier, {
            line
        });
        return states["objectNotSelected"];
    }
}); //=======
states["objectNotSelected"].on(["key:pressed"], ({ key }) => {
    if (key === "q") {
        simulation();
    }
});
states["objectSelectedNode"].on(["key:pressed"], ({ key }) => {
    if (key === " ") {
        if (selected.addToken) selected.addToken(keyPressed.find(x => x >= '0' && x <= '9'));
    }
});
states["objectSelectedNode"].on(["down:selected"], () => {
    deleteLine();
    return states["objectNotSelected"];
});
states["objectSelectedNode"].on(["move:mouse"], ({ pointer }) => {
    const [x, y] = adjastMousePointer(pointer);
    line.set({ x2: x, y2: y }).setCoords();
    const x1 = line.x1;
    const y1 = line.y1;
    const ang = Math.atan2((y - y1), (x - x1));
    
    line.triangle.set({
        left: x + 5 * Math.sin(ang), // - 10 * Math.sqrt(2) * Math.cos(ang),
        top: y - 5 * Math.cos(ang), // - 10 * Math.sqrt(2) * Math.sin(ang),
        angle: ang * 180 / Math.PI + 90
    }).setCoords();
    //line.triangle.setAngle(90);
    canvas.sendToBack(line).renderAll();
});
states["objectSelectedNode"].on(["move:node"], () => {
    return states["objectDragging"];
});
states["objectNotSelected"].on(["move:node"], () => {
    return states["objectDragging"];
});
states["objectDragging"].on(["move:node"], ({ target, pointer }) => {
    deleteLine();
    const { identifier } = target.node;
    if (target._updateTokens) {
        target._updateTokens();
    }
    canvas.sendToBack(target);
    if (!graph.connections[identifier] && !graph.inboundConnections[identifier]) return;

    const [x, y] = adjastMousePointer(pointer);
    Object.entries({...graph.connections[identifier], ...graph.inboundConnections[identifier] }).forEach(([_, connection]) => {
        const { line } = connection.data;
        line.set(line.end === identifier ? { x2: x, y2: y } : { x1: x, y1: y }).setCoords();
        const x1 = line.end === identifier ? line.x1 : line.x2;
        const y1 = line.end === identifier ? line.y1 : line.y2;
        const ang = Math.atan2((y - y1), (x - x1));
        
        line.triangle.set({
            left: (line.end === identifier ? x + 5 * Math.sin(ang) - (line.isRect ? (10 * Math.sqrt(2) + 15) * Math.cos(ang - Math) : 25 /*10(radius) + 15(triangle)*/ * Math.cos(ang)) :
                x1 - 5 * Math.sin(ang) + (line.isRect ? (10 * Math.sqrt(2) + 15) * Math.cos(ang - Math) : 25 /*10(radius) + 15(triangle)*/ * Math.cos(ang))),
            top: (line.end === identifier ? y - 5 * Math.cos(ang) - (line.isRect ? (10 * Math.sqrt(2) + 15) * Math.sin(ang) : 25 * Math.sin(ang)) :
                y1 + 5 * Math.cos(ang) + (line.isRect ? (10 * Math.sqrt(2) + 15) * Math.sin(ang) : 25 * Math.sin(ang))),
            angle: line.end === identifier ? ang * 180 / Math.PI + 90 : ang * 180 / Math.PI - 90,
        }).setCoords();
        canvas.sendToBack(line);
        canvas.sendToBack(line.triangle);
    });

    canvas.renderAll();
});
states["objectDragging"].on(["up"], () => {
    const { identifier } = selected.node;
    const [x, y] = [...getCentre(selected)]
    if (!graph.connections[identifier]) return states["objectNotSelected"];
    Object.entries({...graph.connections[identifier], ...graph.inboundConnections[identifier] }).forEach(([_, connection]) => {
        const { line } = connection.data;
        line.set(line.end === identifier ? { x2: x, y2: y } : { x1: x, y1: y }).setCoords();
        canvas.sendToBack(line)
        line.set(line.end === identifier ? { x2: x, y2: y } : { x1: x, y1: y }).setCoords();
        const x1 = line.end === identifier ? line.x1 : line.x2;
        const y1 = line.end === identifier ? line.y1 : line.y2;
        const ang = Math.atan2((y - y1), (x - x1));
        line.triangle.set({
            left: (line.end === identifier ? x + 5 * Math.sin(ang) - (line.isRect ? (10 * Math.sqrt(2) + 15) * Math.cos(ang - Math) : 25 /*10(radius) + 15(triangle)*/ * Math.cos(ang)) :
                x1 - 5 * Math.sin(ang) + (line.isRect ? (10 * Math.sqrt(2) + 15) * Math.cos(ang - Math) : 25 /*10(radius) + 15(triangle)*/ * Math.cos(ang))),
            top: (line.end === identifier ? y - 5 * Math.cos(ang) - (line.isRect ? (10 * Math.sqrt(2) + 15) * Math.sin(ang) : 25 * Math.sin(ang)) :
                y1 + 5 * Math.cos(ang) + (line.isRect ? (10 * Math.sqrt(2) + 15) * Math.sin(ang) : 25 * Math.sin(ang))),
            angle: line.end === identifier ? ang * 180 / Math.PI + 90 : ang * 180 / Math.PI - 90,
        }).setCoords();
        //line.triangle.set({
        //    left: line.end == identifier ? x + 5 * Math.sin(ang) - (line.isRect ? (10 * Math.sqrt(2) + 15) * Math.cos(ang) : 25 /*10(radius) + 15(triangle)*/ * Math.cos(ang)) : x2,
        //    top: line.end == identifier ? y - 5 * Math.cos(ang) - (line.isRect ? (10 * Math.sqrt(2) + 15) * Math.sin(ang) : 25 * Math.sin(ang)) : y2,
        //    angle: line.end == identifier ? ang * 180 / Math.PI + 90 : ang * 180 / Math.PI - 90,
        //}).setCoords();
        canvas.sendToBack(line.triangle);
    });
    if (selected._updateTokens) {
        selected._updateTokens();
    }
    canvas.renderAll();
    return states["objectNotSelected"];
})

//=========================================================================
function initializeEvents(_canvas) {

    canvas = _canvas;
    let currentState = states["objectNotSelected"];
    canvas.on('mouse:down', ({ target, pointer }) => {
        if (target && !target.node) return;
        currentState = currentState.pass(`down:${
            target===selected?
                "selected":
            target&&target.node?
                "node":
                "nothing"
        }`, { target, pointer });
    });

    canvas.on('mouse:move', ({ pointer }) => {
        currentState = currentState.pass(`move:mouse`, { pointer });
    });
    canvas.on('object:moving', ({ target, pointer }) => {
        if (target && !target.node) return;
        currentState = currentState.pass("move:node", { target, pointer })
    });

    canvas.on('mouse:up', ({ pointer }) => {
        currentState = currentState.pass(`up`, { pointer });

        document.onkeydown = function(e) {
            keyPressed.push(e.key);
            currentState = currentState.pass(`key:pressed`, { key: e.key });
        }
        document.onkeyup = function(e) {
            keyPressed = keyPressed.filter(val => e.key !== val);
        }
    });
}

const createCircle = (line2) => {
    let color = line2.color;
    let circle = new fabric.Circle({
        radius: 5,
        fill: `rgb(${(17%color)*30},${(17%(+color+2))*30},${(17%(+color+4))*30})`,
        top: line2.y1,
        left: line2.x1,

    })
    canvas.add(circle);
    return circle;
}
function shuffleArray(array) {
    array  = [].concat(array)
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    } return array;
}

function step1() {
    const result = [];
    const vertexColors = {};
    const nodes = shuffleArray(Object.entries(graph.nodes));
    nodes.filter(([_, { data: { n } }]) => !n).forEach(([vertex2,_])=>{
        if(Object.entries(graph.inboundConnections[vertex2]).every(([key,{data: { line }}])=>{
            const node = graph.nodes[key].data.n;
            const tokens = node.tokens.filter(({ color }) => color == line.color);
            if(!vertexColors[key])vertexColors[key]=[0,0,0,0,0,0,0,0,0,0];
            if(tokens.length-1>=vertexColors[key][line.color])return true;
            return false;
        })){
            Object.entries(graph.inboundConnections[vertex2]).forEach(([key,{data: { line }}])=>{
                const node = graph.nodes[key].data.n;
                const tokens = node.tokens.filter(({ color }) => color == line.color);
                result.push([tokens[vertexColors[key][line.color]].circle, line, vertex2,key]);
                vertexColors[key][line.color]++;
            });
        }

    });        
    return result;
}


const FRAME_COUNT = 100;
async function greatMove(token, line,dest) {

    return new Promise(function (resolve){
        let frame = 0;
        const interval = setInterval(() => {
            if (frame == FRAME_COUNT) {
                clearInterval(interval);
                canvas.remove(token).renderAll();
                canvas.bringToFront(graph.nodes[dest].data.node);
                resolve();
            };
            moveToken(token, line, frame++);
        }, 20);
    });
}
async function simulation() {
    while (true) {
        let associations = step1();
        
        let dests = associations.map(([_, __, dest]) => dest).filter((dest, i, arr) => arr.indexOf(dest) == i);
        dests.forEach(dest => {
            
            const res = associations.filter(([_, __, d]) => dest==d).map(([_,{color},__]) => color).sort().join(" ");
            if(kazka[dest] && kazka[dest][res])return console.log(kazka[dest][res]);
            if(!kazka[dest] && kazka.nodePlaceholder[res])return console.log(kazka.nodePlaceholder[res]);
            console.log(kazka.placeholder);
        });
        if (associations.length == 0 || keyPressed.includes('s')) break;
        console.log("then");
        await Promise.all(associations.map(async([token, line, dest, vertex]) => {
            await greatMove(token, line, dest);
            graph.nodes[vertex].data.n.removeToken(line.color);
        }));
        
        const results = await Promise.all(dests.map(dest=>Object.entries(graph.connections[dest]).map( async ([vertex,{data:{line}}])=>{
                
                const circle = createCircle(line);
                
                await greatMove(circle,line,dest);
                return [line.color,vertex];
            })
        ).flat());
        results.forEach(([color,vertex])=>{
            graph.nodes[vertex].data.n.addToken(color)
        });
    }

}
export default {
    initializeEvents
}