import { fabric } from 'fabric';
import {NonDirectionalGraph,BaseNode} from '../simple_graphs'

let nodeCount = 1000;

const getCentre =(circle)=>{
    let {tl,br} = circle.aCoords;
    return [
        (tl.x+br.x)/2,
        (tl.y+br.y)/2
    ]

}

export class Node extends fabric.Circle {
    constructor(x,y,graph,canvas){
        super({
            radius: 20, fill: 'green',top:y-20,left:x-20,
            hasBorders:false,
            hasControls:false,
        });
        this.node = new BaseNode(nodeCount++,{x,y});
        graph.addV(this.node);
        this.tokens = [];
        this.centreX = x;
        this.centreY = y; 
        this.canvas = canvas;
        canvas.add(this);
    }
    addToken(color){
        console.log(color);
        this.tokens.push({
            circle:new fabric.Circle({
                radius: 5,
                fill: fabric.Color.fromRgb(`rgb(${(14%color)*10},${(14%(color+2))*10},${(14%(color+4))*10})`),
                top:10,
                left:10,
                hasBorders:false,
                hasControls:false,
            }),
            color
        });
        this._updateTokens();
        this.tokens.forEach(({circle})=>this.canvas.add(circle))
    }
    _updateTokens(){
        const [x,y]=getCentre(this);
        this.setCoords();
        this.tokens.forEach(({circle},i)=>{
            circle.set({
                left:x-5+Math.sin(2*Math.PI*i/(this.tokens.length-1))*10,
                top:y-5+Math.cos(2*Math.PI*i/(this.tokens.length-1))*10
            }).setCoords();
            
            this.canvas.bringToFront(circle);
            this.canvas.renderAll();
        });
    }


}

