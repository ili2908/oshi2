import Graphical from "./components/graphical/graphical";
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import { useEffect, useRef, useState } from "react";
import { BasicGConnection, BasicGNode, GGraph } from "./components/graphical/classes/basic";
import { initialize, setActiveGraph, setGraphs } from "./components/graphical/utils/graphsState";
import './App.css'
import { canvas, createGraphFromJson, deleteGraph, finalizeStyle, selectGraph, setStyle, unselect, zoom } from "./components/graphical/graphManipulatio";
import appState from "./utils/appState";
import GraphMenu from "./components/graphMenu/graphMenu";
import { ImportButtonWithModal } from "./components/fileLoadButton/fileLoadButton";
import { GNode } from "./components/graphical/types";
import { SketchPicker } from 'react-color';
const aaaaaa = {colorPickerOpen:false, resizing:false}; 
var debounceTimer: any;
function App()  {
  const containerRef = useRef(null);

  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";
    const container = containerRef.current as any;
    if (container) {
      container.scrollTop = container.scrollHeight / 2 - container.clientHeight / 2;
      container.scrollLeft = container.scrollWidth / 2 - container.clientWidth / 2;
    }
    let colorPicker = document.getElementById('body')!;
    colorPicker.addEventListener("click", (e)=>{
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
        <TabList style={{ display: 'flex', background: "#49524c", margin: "0 0 5px 0", padding: 0,boxShadow:"0 0 5px 0", height: "50px", }}>
          <ImportButtonWithModal onImport={(json: any)=>{
            const newGraph = createGraphFromJson(json);
          }}></ImportButtonWithModal>
          {
            graphs.map((graph)=>{
              return <Tab key = {graph.identifier} style = {{minWidth: "100px", listStyleType: 'none', textAlign:"left", padding: "15px 5px 15px 15px"}}>
                {graph.identifier}
                <div  style={{float: "right", display: 'flex', borderRight:"1px solid #93a399", paddingRight:"5px"}}>
                  <button style={{float: "right", background: 'none', border: 'none'}} onClick={()=>{
                    deleteGraph(graph);
                  }}>
                    X
                  </button>
                </div>
                
                
              </Tab>
            })
          }
        </TabList>
        <div style={{ display: 'flex', height: "calc(100vh - 50px)"}}>
          <div style={{width:'180px',height:"100%", margin: "-6px 5px -5px 0", boxShadow:"0 3px 2px -2px, 0 2px 3px 0", padding:"3px"}}>
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
                   setSize(+e.target.value);
                   setStyle(color, size*3);
                }} />
                <label> size </label>
              </div>
              <div style={{ display: 'flex', paddingRight: '5px'}}>
                <input id='zoom' type="range" min={15} max={30} onChange={(e)=>{
                  const container = containerRef.current as any;
                  if(
                    container.clientWidth> 3000*+e.target.value/30 ||
                    container.clientHeight> 3000*+e.target.value/30
                  ) {
                    return;
                  }
                 
                  const [viewportWidth, viewportHeight,viewportOffsetX,viewportOffsetY, prev] = zoom(+e.target.value/30);
                  
                  /*const scrollLeft = container.scrollLeft + (focus.x * factor - focus.x) / prevZoom;
                  const scrollTop = container.scrollTop + (focus.y * factor - focus.y) / prevZoom;*/
                  container.scrollLeft *= (+e.target.value/30) /prev;
                  container.scrollTop *= (+e.target.value/30) /prev;
                 
                }} />
                <label> zoom </label>
              </div>
              
          </div>
          <div  ref={containerRef} style = {{flex: 1, width:"100%", overflow:"auto", border:"none", padding: "10px"}}>
            <Graphical setGraphs={setGraphs} graphs={graphs} />
          </div>
          <div style = {{ border:"none", width:"350px", margin: "-6px 0 -5px 5px", boxShadow:"0 3px 2px -2px, 0 2px 3px 0"}}>
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
