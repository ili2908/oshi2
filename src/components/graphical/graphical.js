import React, { useState, useEffect } from 'react';
import { fabric } from 'fabric';
import graphManipulations from './graphManipulatio'

export default function Graphical(){
  const [canvas, setCanvas] = useState('');
  useEffect(() => {
    let newCanvas = initCanvas();
    setCanvas(newCanvas);
    graphManipulations.initializeEvents(newCanvas);
  }, []);
  const initCanvas = () => (
    new fabric.Canvas('canvas', {
      height: 800,
      width: 800,
      backgroundColor: 'pink'
    })
  )
  return(
    <div>
      <h1>Fabric.js on React - fabric.Canvas('...')</h1>
      <canvas id="canvas" />
    </div>
  );
}