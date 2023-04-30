import React, { useState, useEffect } from 'react';
import { fabric } from 'fabric';
import graphManipulations from './graphManipulatio'
import './contextMenus.css'
export default function Graphical(props: any){
  useEffect(() => {
    let newCanvas = initCanvas();
    graphManipulations.initializeEvents(newCanvas);
  }, []);
  const initCanvas = () => (
    new fabric.Canvas('canvas', {
      height: 3000,
      width: 3000,
      backgroundColor: 'white',
      selection:false,
      preserveObjectStacking: true,
      targetFindTolerance: 10,
    })
  )
  return(
      <canvas id="canvas"/>
  );
}