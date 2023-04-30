import Graphical from "./components/graphical/graphical";
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import { useEffect, useRef, useState } from "react";
import { BasicGConnection, BasicGNode, GGraph } from "./components/graphical/classes/basic";
import { initialize, setActiveGraph, setGraphs } from "./components/graphical/utils/graphsState";
import './App.css'
import { canvas, createGraphFromJson, deleteGraph, finalizeStyle, selectGraph, setStyle, unselect } from "./components/graphical/graphManipulatio";
import appState from "./utils/appState";
import GraphMenu from "./components/graphMenu/graphMenu";
import { ImportButtonWithModal } from "./components/fileLoadButton/fileLoadButton";
import { GNode } from "./components/graphical/types";
import { SketchPicker } from 'react-color';
const aaaaaa = {colorPickerOpen:false, resizing:false};
function App()  {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current as any;
    if (container) {
      container.scrollTop = container.scrollHeight / 2 - container.clientHeight / 2;
      container.scrollLeft = container.scrollWidth / 2 - container.clientWidth / 2;
    }
    let colorPicker = document.getElementById('body')!;
    colorPicker.addEventListener("click", (e)=>{
      console.log(aaaaaa.colorPickerOpen, aaaaaa.resizing)
      if(!aaaaaa.colorPickerOpen && !aaaaaa.resizing) return;
      aaaaaa.colorPickerOpen = false;
      aaaaaa.resizing = false;
      finalizeStyle()
    });

  }, []); //
  const [graphs, _setGraphs] = useState<GGraph[]>([]);
  const [index, setIndex] = useState<number>(0);
  const [color, setColor] = useState('#008000');
  const [size, setSize] = useState(5);
  const [arrowsEnabled, setArrowsEnabled] = useState<boolean>(true);
  const [autoLabeling, setAutoLabeling] = useState<boolean>(true);
  const [drawMode, setDrawMode] = useState<boolean>(false);
  const fileInputRef = useRef(null);
  initialize(_setGraphs, setIndex);
  
  
  appState.initialize(setArrowsEnabled, setAutoLabeling, setDrawMode);
  return (
    <div id = 'body' style = {{height: '100%', width: '100%'}}>
      <Tabs selectedIndex={index} onSelect={(index) => {
        setIndex(index);
        unselect();
        selectGraph(graphs[index]);
      }}>
        <TabList style={{ display: 'flex', border:"5px solid", paddingLeft: 0, borderRadius: '20px'}}>
          <ImportButtonWithModal onImport={(json: any)=>{
            const newGraph = createGraphFromJson(json);
          }}></ImportButtonWithModal>
          {
            graphs.map((graph)=>{
              return <Tab key = {graph.identifier} style = {{minWidth: "100px", border:"2px solid", listStyleType: 'none'}}>
                {graph.identifier}
                <button style={{float: "right", background: 'none', border: 'none'}} onClick={()=>{
                  deleteGraph(graph);
                }}>
                  X
                </button>
              </Tab>
            })
          }
        </TabList>
        <div style={{ display: 'flex', height: "90vh"}}>
          <div style={{width:'180px', border:"5px solid"}}>
            <div style={{ display: 'flex', paddingRight: '5px'}}>
              <input type="checkbox" checked={arrowsEnabled} onChange={() => appState.setArrowsEnabled(!arrowsEnabled)} />
              <label> arrows enabled </label>
             </div>
             <div style={{ display: 'flex', paddingRight: '5px'}}>
              <input type="checkbox" checked={autoLabeling} onChange={() => appState.setAutoLabeling(!autoLabeling)} />
              <label> auto labeling </label>
             </div>
             <div style={{ display: 'flex', paddingRight: '5px'}}>
              <input type="checkbox" checked={drawMode} onChange={() =>{ 
                appState.setDrawMode(!drawMode);
                canvas.freeDrawingBrush.width = 3;
                canvas.isDrawingMode = !drawMode;
              }}/>
              <label> draw mode </label>
             </div>
             <div style={{ display: 'flex', paddingRight: '5px'}}>
              <input type="color" value={color} onInput={(e)=>{

                aaaaaa.colorPickerOpen =true;
                setStyle(color, size*3);
                setColor((e.target as any).value);
              }} />
              <label> color </label>
             </div>
             <div style={{ display: 'flex', paddingRight: '5px'}}>
                <input id='colorPicker' type="range" min={1} max={10} value={size} onChange={(e)=>{
                   aaaaaa.resizing =true;
                   console.log(333);
                   setSize(+e.target.value);
                   setStyle(color, size*3);
                }} />
                <label> size </label>
              </div>
              
          </div>
          <div  ref={containerRef} style = {{flex: 1, width:"100%", overflow:"auto", border:"5px solid"}}>
            <Graphical setGraphs={setGraphs} graphs={graphs} />
          </div>
          <div style = {{ border:"5px solid", width:"550px"}}>
          {
              graphs.map((graph)=>{
                return <TabPanel>
                  <GraphMenu graph={graph}  graphs={graphs}></GraphMenu>
                </TabPanel>
              })
          }
          </div>
        </div>
      </Tabs>
      
    </div>
  );
}

export default App;
