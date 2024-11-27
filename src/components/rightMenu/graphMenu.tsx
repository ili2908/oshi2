import React from "react";
import { CurrentRightMenus, RightMenuConfig } from "../../core/pluginSDK/plugin.sdk.interface";
import RightMenu from "./rightMenu";
import { GGraph } from "../../core/classes/graphs";

export default class GraphMenu extends React.Component<{
    graph: GGraph, 
    graphs: GGraph[],
    rightMenuConfigs: RightMenuConfig[],
}>{

    public constructor(props: {
        graph: GGraph, 
        graphs: GGraph[],
        rightMenuConfigs: RightMenuConfig[]
    }) {
      super(props);
      const {graph, graphs, rightMenuConfigs} = props;
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

      this.state = {
        selectedSubMenu: CurrentRightMenus.basic,
      };
    }

  render() {
    const { rightMenuConfigs, graph, graphs} = this.props;
    const { selectedSubMenu } = this.state as any;
    const submenuNames = rightMenuConfigs.map(({identifier})=>identifier)

    return(
        <div id="div" style={{padding:5, height:"100%", display: "flex", flexDirection: "column"}}>
            <h1>{graph.identifier}</h1>
            <select onChange={(event)=>this.setState({selectedSubMenu: event.target.value})} value={selectedSubMenu || ''}>
                <option value="" disabled>Select a Submenu</option>
                {submenuNames.map((submenu, index) => (
                    <option key={index} value={submenu}>{submenu}</option>
                ))}
            </select>

        {selectedSubMenu && <RightMenu graph={graph}  graphs={graphs} rightMenuConfig={rightMenuConfigs.find(({identifier})=>identifier === selectedSubMenu)!}/>}
        </div>
    );
  }
}