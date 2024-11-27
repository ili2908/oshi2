import { getSdk } from ".";
import { BasicGConnection, BasicGNode } from "../../core/classes/graphs";
import { LeftMenuConfig } from "../../core/pluginSDK/plugin.sdk.interface";

const overallBody = document.getElementById('root')!;


let currentlyResizing: string | null = null;
let currentlyRecoloring: string | null = null;

overallBody.addEventListener('click', ()=>{
    currentlyResizing = null;
    currentlyRecoloring = null;
});

export const leftMenuConfig: LeftMenuConfig = {
    identifier: "Basic",
    choices: [{
        name: "arrowsEnabled",
        input: 'checkbox',
        defaultValue: false,
        callback: (newValue: boolean)=>{
            const arrowsEnabled = getSdk().getState<boolean>("arrowsEnabled");
            getSdk().updateState<boolean>("arrowsEnabled", !arrowsEnabled);
        }
    },
    {
        name: "drawMode",
        input: 'checkbox',
        defaultValue: false,
        callback: (newValue: boolean)=>{
            const drawMode = getSdk().getState<boolean>("drawMode");
            getSdk().updateState<boolean>("drawMode", !drawMode);
            getSdk().getCanvas().freeDrawingBrush.width = 3;
            getSdk().getCanvas().isDrawingMode = !drawMode;

        }
    },
    {
        name: "autoLabeling",
        input: 'checkbox',
        defaultValue: false,
        callback: (newValue: boolean)=>{
            const arrowsEnabled = getSdk().getState<boolean>("autoLabeling");
            getSdk().updateState<boolean>("autoLabeling", !arrowsEnabled);
        }
    },
    {
        name: "color",
        input: "color",
        defaultValue: '#008000',
        callback: (newValue: string)=>{
            
            const selection = getSdk().getCurrentSelection();
            if(selection && selection.length>0) {
                
                selection.filter((obj)=>!(obj as BasicGConnection).node0).forEach((node)=>{
                    if(currentlyRecoloring) getSdk().startExclusionFromUndoList();
                    getSdk().colorNode(node as BasicGNode, newValue);
                    if(currentlyRecoloring) getSdk().closeExclusionFromUndoList();
                    getSdk().render();
                })
                if(!currentlyRecoloring) {
                    currentlyRecoloring = getSdk().getState<string>("color");
                }
            }
            getSdk().updateState<string>("color", newValue);
        }
    },
    {
        name: "size",
        input: "slider",
        defaultValue: 15,
        inputParams: {
            max: 30,
            min: 15,
        },
        callback: (newValue: number)=>{
            console.log(newValue);
            const selection = getSdk().getCurrentSelection();
            if(selection && selection.length>0) {
                
                selection.filter((obj)=>!(obj as BasicGConnection).node0).forEach((node)=>{
                    if(currentlyResizing) getSdk().startExclusionFromUndoList();
                    getSdk().resizeNode(node as BasicGNode, newValue);
                    if(currentlyResizing) getSdk().closeExclusionFromUndoList();
                    getSdk().render();
                })
                if(!currentlyResizing) {
                    currentlyResizing = getSdk().getState<string>("size");
                }
            }
            getSdk().updateState<number>("size", newValue);
        }
    }]
}
