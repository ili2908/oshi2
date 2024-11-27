import React, { useState, useEffect } from 'react';
import { fabric } from 'fabric';
import centralPanelController from './centralPanel.controller'
import appState from '../../core/appState/appState';
export default function Graphical(){
  useEffect(() => {
    let newCanvas = initCanvas();
    appState.updateState('canvas', newCanvas);
    centralPanelController.initialize();
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