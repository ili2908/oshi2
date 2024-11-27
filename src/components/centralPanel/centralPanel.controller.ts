import { fabric } from 'fabric';

import { State } from './utils/StateMachine'
import { getCentre } from './utils/utils';
import { PluginSdk } from '../../core/pluginSDK/plugin.sdk';
import appState from '../../core/appState/appState';
import { BasicGConnection, BasicGNode, GGraph } from '../../core/classes/graphs';
import { CurrentRightClickMenus, PluginConfig } from '../../core/pluginSDK/plugin.sdk.interface';
import { createRightClickMenu } from '../rightClickMenu/rightClickMenu';
const sdk = PluginSdk.getSdk();
let line: fabric.Line | null;


const statesNames = [
    "objectNotSelected",
    "objectSelectedNode",
    "objectDragging",
    "ctrlPressed",
    "lineSelected",
    "multiSelected"
]
const states = statesNames.reduce((acc, state) => {
    acc[state] = new State(state);
    return acc;
}, {} as {[key: string]: State});

let currentState = states["objectNotSelected"];

const createLine = ([x1, y1, x2, y2]: [...number[], number, number]) => {
    let triangle = new fabric.Triangle({
        width: 10,
        height: 15,
        fill: `black`,
        left: x2,
        top: y2,
        angle: Math.atan((x2 - x1) / (y2 - y1)) * 180 / Math.PI,
        hasBorders: false,
        evented: false,
        selectable: false
    });
    const line = new fabric.Line([x1, y1, x2, y2], {
        stroke: `black`,
        hasBorders: false,
        evented: false,
        selectable: false
    });
    line.data = {triangle};
    sdk.getCanvas().add(line);
    sdk.getCanvas().add(triangle);
    return line;

}
const deleteLine = () => {
    if (line) {
        sdk.getCanvas().remove(line.data.triangle);
        sdk.getCanvas().remove(line).renderAll();
    }
    line = null;
}
const adjustMousePointer = (pointer: { x: number; y: number; }): [number, number] => {
    return [Math.floor(pointer.x) - 2, Math.floor(pointer.y) - 2];
}
//======================================================================

State.on(["down:connection"], ({ pointer, target }: { pointer:any, target: fabric.Object }) => {    
    deleteLine();
    sdk.select([target?.data?.connection], );
})

states["objectSelectedNode"].on(["down:connection"], ()=> {
    deleteLine();
    return states["objectNotSelected"];
})

states["objectNotSelected"].on(["down:nothing", "down:node", "down:selected"], ({ pointer, target }: any) => {
    deleteLine();
    sdk.unselect();
    if(target){
        sdk.select([target?.data?.node]);
    } else if(appState.getState<string[]>('keysPressed') && appState.getState<string[]>('keysPressed').length != 0) {
        return;
    } else {
        sdk.select([
            sdk.addNode(
                sdk.getCurrentGraph(), 
                {} ,
                Math.floor(pointer.x), 
                Math.floor(pointer.y)
            )
        ]);
    }
    line = createLine([...getCentre((sdk.getCurrentSelection().at(-1) as BasicGNode).graphical.circle), Math.floor(pointer.x) - 2, Math.floor(pointer.y) - 2])
    sdk.render();
    return states["objectSelectedNode"];

});

states["objectSelectedNode"].on(["down:nothing"], ({ pointer }: any) => {
    deleteLine();
    const newNode = sdk.addNode(sdk.getCurrentGraph(), {} , ...adjustMousePointer(pointer));
    sdk.addConnection(sdk.getCurrentSelection().at(-1) as BasicGNode, newNode, {
        directions: [
            appState.getState("arrowsEnabled") ? {zeroToOne: true} : {}
        ]
    });
    sdk.getCanvas().renderAll();
    sdk.select([newNode]);
    line = createLine([...getCentre((sdk.getCurrentSelection().at(-1) as BasicGNode).graphical.circle), Math.floor(pointer.x) - 2, Math.floor(pointer.y) - 2]);

}); 

states["objectSelectedNode"].on(["down:node"], ({ target }: any) => {
    deleteLine();
    sdk.addConnection(sdk.getCurrentSelection().at(-1) as BasicGNode, target.data.node, {
        directions: [
            appState.getState("arrowsEnabled") ? {zeroToOne: true} : {}
        ]
    });
    return states["objectNotSelected"];
});

states["objectSelectedNode"].on(["down:selected"], () => {
    deleteLine();
   
    sdk.addConnection(sdk.getCurrentSelection().at(-1) as BasicGNode, sdk.getCurrentSelection().at(-1) as BasicGNode, 
        {
            directions: [
                appState.getState("arrowsEnabled") ? {zeroToOne: true} : {}
            ]
        });
    sdk.unselect();
    return states["objectNotSelected"];
});

states["objectSelectedNode"].on(["move:mouse"], ({ pointer }: any) => {
    if(!line) return;
    const [x, y] = adjustMousePointer(pointer);
    line!.set({ x2: x, y2: y }).setCoords();
    const x1 = line!.x1!;
    const y1 = line!.y1!;
    const ang = Math.atan2((y - y1), (x - x1));
    
    line!.data.triangle.set({
        left: x + 5 * Math.sin(ang), // - 10 * Math.sqrt(2) * Math.cos(ang),
        top: y - 5 * Math.cos(ang), // - 10 * Math.sqrt(2) * Math.sin(ang),
        angle: ang * 180 / Math.PI + 90
    }).setCoords();
    //line.data.triangle.setAngle(90);
    sdk.getCanvas().sendToBack(line!).renderAll();
});
let deltaDrag: ([number, number] | undefined)[] = [];

State.on(["move:node"], (({target}: any) => {
    deleteLine();
    deltaDrag = sdk.getCurrentSelection().map(node=>{
        if((node as BasicGConnection).node0 || target.data.node.identifier === node.identifier) return;
        return [node.graphical.circle.left! - target.left, node.graphical.circle.top! - target.top];
        
    });
    return states["objectDragging"];
}));

states["objectDragging"].on(["move:node"], ({ target, pointer, e }: any) => {
    if(!target?.data?.node) {
        return;
    }

    deleteLine();
    const [x, y] = adjustMousePointer(pointer);
    sdk.getCurrentSelection().map((node, i)=>{
        if((node as BasicGConnection).node0 || target.data.node.identifier === node.identifier) return;
        sdk.getCanvas().sendToBack(node.graphical.circle);
        (node.graphical.circle as fabric.Circle).set({
            top: target.top! + deltaDrag[i]![1],
            left: target.left! + deltaDrag[i]![0],
        }).setCoords();
        sdk.moveNode(node as BasicGNode);
        
    })
    sdk.getCanvas().sendToBack(target);
    sdk.moveNode(target.data.node,x,y);
    sdk.getCanvas().renderAll();
});

states["objectDragging"].on(["up"], () => {
    deleteLine();
    sdk.unselect();
    sdk.getCanvas().renderAll();
    if(appState.getState<string[]>('keysPressed')?.includes('Control')){
        return states["ctrlPressed"];
    }
    return states["objectNotSelected"];
})

State.on(["key:pressed"], ({key}: { key: string}) => {
    deleteLine();
    if(key === "Control") {
        return states["ctrlPressed"];
    }
    if(appState.getState<string[]>('keysPressed')?.includes('b')) {
        sdk.undo();
    }
    /*if(appState.getState<string[]>('keysPressed').includes('a')) {
        appState.setArrowsEnabled(!appState.arrowsEnabled());
    }
    if(appState.getState<string[]>('keysPressed').includes('d')) {
        appState.setDrawMode(!appState.drawMode());
        sdk.getCanvas().freeDrawingBrush.width = 3;
        sdk.getCanvas().isDrawingMode = appState.drawMode();
    }*/
    return states["objectNotSelected"];
})
states["ctrlPressed"].on(["down:node"], ({ target, pointer }: any) => {
    sdk.select([target.data.node], false);
    sdk.render();
    return states["ctrlPressed"];
})
states["ctrlPressed"].on(["down:connection"], ({ target, pointer }: any) => {
    sdk.select([target.data.connection], false);
    sdk.render();
    return states["ctrlPressed"];
})
states["ctrlPressed"].on(["down:nothing"], () => {
    sdk.unselect();
    return states["ctrlPressed"];
})
states["ctrlPressed"].on(["key:up"], ({ key }: any) => {
    if(key === 'Control') {
        return states["multiSelected"];
    }
})
states["multiSelected"].on(["down:nothing"], ({target}: any) => {
    sdk.unselect();
    return states["objectNotSelected"];
})
states["multiSelected"].on(["down:node"], ({target, pointer}: any) => { 
    if(sdk.getCurrentSelection().map(({identifier})=>identifier).includes(target.data?.node?.identifier || target.data?.connection?.identifier)) {
        return;
    }
    sdk.unselect();
    

    if(!target?.data) {
        return states["objectNotSelected"];
    }
   
    sdk.select([target.data.node || target.data.connection]);
    line = createLine([...getCentre((sdk.getCurrentSelection().at(-1) as BasicGNode).graphical.circle), Math.floor(pointer.x) - 2, Math.floor(pointer.y) - 2])
    return states["objectSelectedNode"];
})

sdk.addGraph(new GGraph());

///=============================events=====================================
const isObjectNode = (target?: fabric.Object | BasicGConnection | BasicGNode)=>!!target?.data?.node || (target as BasicGNode)?.graphical?.circle;
const isObjectConnection = (target?: fabric.Object | BasicGConnection | BasicGNode)=>!!target?.data?.connection|| (target as BasicGConnection)?.node0;
const isObjectDrawing = (target?: fabric.Object| BasicGConnection | BasicGNode)=>!!target?.data?.path;

const initialize = () => {
    sdk.getCanvas().on('mouse:down', ({ target, e }) => {
        e.preventDefault();
        if(appState.getState('drawMode')) return;

        const pointer = sdk.getCanvas().getPointer(e);
        if (target && !isObjectNode(target) && !isObjectConnection(target)) return;
        const selected = sdk.getCurrentSelection()?.at(-1);
        const targetedObject = 
            selected && target===selected?.graphical?.circle ? "selected":
            isObjectNode(target) ? "node" :
            isObjectConnection(target) ? "connection" :
                "nothing";
                currentState = currentState.pass(`down:${targetedObject}`, { target, pointer });    

    });
    sdk.getCanvas().on('mouse:move', ({ e }) => {
        if(appState.getState('drawMode')) return;

        const pointer = sdk.getCanvas().getPointer(e)
        currentState = currentState.pass(`move:mouse`, { pointer });
    });
    sdk.getCanvas().on('object:moving', ({ target, e }) => {
        console.log(currentState.name);
        if(appState.getState('drawMode'))return;
        if(target?.data.path) {
            sdk.getCanvas().sendToBack(target);
        } 
        if (target?.data.node) {
            sdk.getCanvas().bringToFront(target);
        }
        const pointer = sdk.getCanvas().getPointer(e)
        if (target && !target?.data?.node) return;
        currentState = currentState.pass("move:node", { target, pointer, e })
    });
    sdk.getCanvas().on('path:created', ({path}: any)=>{
        if(!appState.getState('drawMode'))return;
        path.set({
            hasControls: false,
            hasBorders: false,
        })
        path.data = {path: true}
        sdk.undoOperations.push(()=>{
            sdk.getCanvas().remove(path);
            sdk.getCanvas().renderAll();
        })
        // ... do something with your path
    });
    sdk.getCanvas().on('mouse:up', ({ pointer }) => {
        if(appState.getState('drawMode'))return;
        currentState = currentState.pass(`up`, { pointer });
    });
}

appState.subscribe('selection', (newSelection)=>{
    if(sdk.getCurrentSelection() && sdk.getCurrentSelection().length > 0) {
        currentState = states['multiSelected']; 
    }
})

document.onkeydown = function(e) {
    //e.preventDefault();
    const keys = appState.getState<string[]>('keysPressed') || [];
    appState.updateState<string[]>('keysPressed', [e.key,...keys]);
    currentState = currentState.pass(`key:pressed`, { key: e.key });
}
document.onkeyup = function(e) {
    //e.preventDefault();
    const keys = appState.getState<string[]>('keysPressed');
    if(appState.getState('drawMode')){
        appState.updateState<string[]>('keysPressed', []);
        return;
    }
    appState.updateState<string[]>('keysPressed', keys.filter(val => e.key !== val));
    currentState = currentState.pass(`key:up`, { key: e.key });
}
document.oncontextmenu = function(event) {
    const plugins = appState.getState<PluginConfig[]>('plugins');
    deleteLine();
    console.log(appState.getState<string[]>('keysPressed'));
    if(appState.getState<string[]>('keysPressed')?.includes('Control')) {
        event.preventDefault();
        return;
    }
    currentState = states["objectNotSelected"];
    //const pointer = sdk.getCanvas().getPointer(event);
    const target = sdk.getCanvas().findTarget(event, true);
    
    const menuConfig = plugins.flatMap(({rightClickPanels})=>rightClickPanels?.flatMap((config) => config.choices) || []);


    if(isObjectNode(target) || isObjectConnection(target)) {
        sdk.select([target?.data?.node || target?.data?.connection], false);
        const selection = sdk.getCurrentSelection();
        console.log("CREATE",1);
        const relevantConfig = menuConfig.filter((config)=>{
            return selection.find(isObjectNode) && config.targets.includes('node') ||
                   selection.find(isObjectConnection) && config.targets.includes('connection');
        });

        createRightClickMenu(event, {
            choices: relevantConfig
        })
    } else if(isObjectDrawing(target)) {
        sdk.unselect();

        const relevantConfig = menuConfig.filter((config)=>{
            return config.targets.includes('drawing');
        });
        createRightClickMenu(event, {
            choices: relevantConfig
        })
        return;
    } else {
        const relevantConfig = menuConfig.filter((config)=>{
            return config.targets.includes('void');
        });

        createRightClickMenu(event, {
            choices: relevantConfig
        })
    }
}


export default{
    initialize
} 

