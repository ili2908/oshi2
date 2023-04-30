import { fabric } from 'fabric';
import { NonDirectionalGraph, BaseNode } from '../simple_graphs'

let nodeCount = 1000;
export class Node extends fabric.Circle {
    constructor(x, y, graph, canvas) {
        super({
            radius: 20,
            fill: 'green',
            top: y - 20,
            left: x - 20,
            hasBorders: false,
            hasControls: false,
        });
        this.node = new BaseNode(nodeCount++, { x, y, n: this });
        graph.addV(this.node);
        this.tokens = [];
        this.centreX = x;
        this.centreY = y;
        this.canvas = canvas;
        canvas.add(this);
    }
}