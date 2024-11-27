import React from "react";
import { RightMenuConfig } from "../../core/pluginSDK/plugin.sdk.interface";
import './rightMenu.css'
import { GGraph } from "../../core/classes/graphs";

export default class RightMenu extends React.Component<{
    graph: GGraph, 
    graphs: GGraph[],
    rightMenuConfig: RightMenuConfig,
}>{

    public constructor(props: {
        graph: GGraph, 
        graphs: GGraph[],
        rightMenuConfig: RightMenuConfig
    }) {
      super(props);
      const { graph } = props;

      graph.nodes = new Proxy(graph.nodes, {
          set: (target, property, value) => {
              target[property as string] = value;
              this.forceUpdate();
              return true;
          },
          deleteProperty: (target, property) => {
              delete target[property as string];
              this.forceUpdate();
              return true;
          }
      })
    }

    public render() {
      const {graph, graphs, rightMenuConfig} = this.props;
      return(
          <div id="div">
              <div className="responsive-menu">
                {
                    rightMenuConfig.choices.map((choice, index)=>(
                        <div key={index} className="menu-item">
                            <button onClick={()=>{
                                choice.callback(...(choice.inputs || []).map((_, index2)=>{
                                    const element: HTMLInputElement = document.getElementById(`${index}:${index2}`)! as HTMLInputElement;
                                    return element?.value;
                                }))
                            }}>{choice.name}</button>
                            {
                                choice.inputs?.map((input, index2)=>(
                                    <select  style = {{width:60}} name={input.name} id={`${index}:${index2}`}>
                                        {
                                            input.type === 'connections' ? 
                                            graph.getConnections().map(({identifier})=>{
                                                return (<option key = {identifier} value={identifier}>{identifier}</option>)
                                            }) : 
                                            input.type === 'graphs' ? 
                                            graphs.filter(({identifier})=>identifier!=graph.identifier).map(({identifier})=>{
                                                return (<option key = {identifier} value={identifier}>{identifier}</option>)
                                            }) :
                                            input.type === 'vertexes' ? 
                                            graph.getNodes().map(({identifier})=>{
                                                return (<option key = {identifier} value={identifier}>{identifier}</option>)
                                            }) : '' 
                                        }
                                    </select>
                                ))
                            }
                        </div>
                    ))
                }
              </div>
              
          </div>
      );
    }
  }