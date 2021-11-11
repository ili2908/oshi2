import React, { useState, useEffect } from 'react';
import { fabric } from 'fabric';
import graphManipulations from './graphManipulatio'

export default function Graphical(){
  useEffect(() => {
    let newCanvas = initCanvas();
    graphManipulations.initializeEvents(newCanvas);
  }, []);
  const initCanvas = () => (
    new fabric.Canvas('canvas', {
      height: 800,
      width: 1600,
      backgroundColor: 'white',
      selection:false,
      preserveObjectStacking: true 
    })
  )
  return(
    <div>
      <h1>Fabric.js on React - fabric.Canvas('...')</h1>
      <canvas id="canvas" />
    </div>
  );
}