import { fabric } from 'fabric';
import { NonDirectionalGraph, BaseNode } from '../simple_graphs'
import { Node } from './nodes';
import { State } from './utils/StateMachine'
let graph = new NonDirectionalGraph();
let nodeCount = 0;
let canvas;
let selected;
let line;
let keyPressed = [];
const createNode = (x, y) => {
    let nn = new BaseNode(nodeCount++, { x, y });
    graph.addV(nn);
    let gn = keyPressed.includes("a") ?
        new fabric.Rect({
            width: 40,
            height: 40,
            fill: 'red',
            top: y - 20,
            left: x - 20,
            hasBorders: false,
            hasas: false,
        }) :
        new Node(x, y, graph, canvas);
    gn.isRect = keyPressed.includes("a");
    gn.node = nn;
    gn.tokens = [];
    canvas.add(gn)
    return gn;
}

const createLine = ([x1, y1, x2, y2], color) => {
    const line = new fabric.Line([x1, y1, x2, y2], {
        //stroke: 'red',
        hasBorders: false,
        hasas: false,
        evented: false,
        selectable: false,
        fill: `rgb(${(17%+color)*30},${(17%(+color+2))*30},${(17%(+color+4))*30})`,
    });
    console.log(color);
    canvas.add(line);
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
    if (line) canvas.remove(line).renderAll();
    line = null;
}
const adjastMousePointer = (pointer) => {
    return [Math.floor(pointer.x) - 2, Math.floor(pointer.y) - 2];
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
    if (selected.isRect && !keyPressed.includes("a") || !selected.isRect && keyPressed.includes("a")) {
        let newNode = createNode(...adjastMousePointer(pointer));

        const [x, y] = getCentre(newNode);

        line.end = newNode.node.identifier
        line.set({ x2: x, y2: y }).setCoords();

        graph.connect(selected.node.identifier, newNode.node.identifier, {
            line
        });

        canvas.renderAll();
        selected = newNode;
        line = createLine([...getCentre(selected), Math.floor(pointer.x) - 2, Math.floor(pointer.y) - 2], keyPressed.find(x => x >= '0' && x <= '9'));
    }
}); //======
states["objectSelectedNode"].on(["down:node"], ({ target }) => {
    if (selected.isRect && !keyPressed.includes("a") || !selected.isRect && keyPressed.includes("a")) {
        const [x, y] = getCentre(target);
        const tId = target.node.identifier;
        const sId = selected.node.identifier;
        console.log(graph.connections)
        if (graph.connections[tId] && sId in graph.connections[tId]) {
            deleteLine();
            canvas.remove(graph.connections[tId][sId].data.line);
            graph.disconnect(sId, tId);
            return states["objectNotSelected"];
        }
        line.end = target.node.identifier

        line.set({ x2: x, y2: y }).setCoords();

        canvas.renderAll();
        if (selected.isRect == target.isRect) {
            graph.connect(selected.node.identifier, target.node.identifier, {
                line
            });
        }
        return states["objectNotSelected"];
    }
}); //=======
states["objectSelectedNode"].on(["key:pressed"], ({ key }) => {
    if (key == " ") {
        selected.addToken(keyPressed.find(x => x >= '0' && x <= '9'));
    }
});
states["objectSelectedNode"].on(["down:selected"], () => {
    deleteLine();
    return states["objectNotSelected"];
});
states["objectSelectedNode"].on(["move:mouse"], ({ pointer }) => {
    const [x, y] = adjastMousePointer(pointer);
    line.set({ x2: x, y2: y }).setCoords();
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
    if (!graph.connections[identifier]) return;

    const [x, y] = adjastMousePointer(pointer);
    Object.entries(graph.connections[identifier]).forEach(([_, connection]) => {
        const { line } = connection.data;
        line.set(line.end == identifier ? { x2: x, y2: y } : { x1: x, y1: y }).setCoords();
        canvas.sendToBack(line)
    });

    canvas.renderAll();
});
states["objectDragging"].on(["up"], () => {
    const { identifier } = selected.node;
    const [x, y] = [...getCentre(selected)]
    if (!graph.connections[identifier]) return states["objectNotSelected"];
    Object.entries(graph.connections[identifier]).forEach(([_, connection]) => {
        const { line } = connection.data;
        line.set(line.end == identifier ? { x2: x, y2: y } : { x1: x, y1: y }).setCoords();
        canvas.sendToBack(line)
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
        currentState = currentState.pass("move:node", { target, pointer })
    });

    canvas.on('mouse:up', ({ pointer }) => {
        currentState = currentState.pass(`up`, { pointer });

        document.onkeydown = function(e) {
            keyPressed.push(e.key);
            currentState = currentState.pass(`key:pressed`, { key: e.key });
        }
        document.onkeyup = function(e) {
            keyPressed = keyPressed.filter(val => e.key != val);
        }
    });

}
export default {
    initializeEvents
}