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
      <h1>PETRI KOVALENKO+CHALIUK</h1>
      <h2>left click to create node (lc on current node to disable arrow)</h2>
      <h2>left click on other node while having arrow to connect</h2>
      <h2>create opposite arrow to disconnect</h2>
      <h2>left click + number on node while not having arrow to create colored arrow</h2>
      <h2>space click + number on node while having arrow to create colored token</h2>
      <h2>q - to start simulation</h2>
      <canvas id="canvas" />
    </div>
  );
}