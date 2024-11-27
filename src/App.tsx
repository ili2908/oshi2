import CentralPanel from "./components/centralPanel/centralPanel";
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import { useEffect, useRef, useState } from "react";
import './App.css'
import appState from "./core/appState/appState";
import GraphMenu from "./components/rightMenu/graphMenu";
import { ImportButtonWithModal } from "./components/fileLoadButton/fileLoadButton";

import AddPluginForm from "./components/addPlugin/addPlugin";

import basicPrefabsPlugin from "./plugins/basicPrefabsModule/metadata";
import basicAlgorithmsPlugin from "./plugins/basicMenuModule/metadata";
import animations from "./core/animationsModule/animationsModule";

import { LeftMenuConfig, PluginConfig, RightClickMenuConfig, RightMenuConfig } from "./core/pluginSDK/plugin.sdk.interface";
import React from "react";
import LeftPanelMenu from "./components/leftMenu/leftMenuPanel";
import { GGraph } from "./core/classes/graphs";
import { PluginSdk } from "./core/pluginSDK/plugin.sdk";
import { getCentre } from "./utils/getCentre";
import { download } from "./utils/download";
export default class Apps extends React.Component<
  {},
  {
    graphs: GGraph[];
    selectedTab: number;
    plugins: PluginConfig[];
    zoom: number;
  }
> {
  myRef: React.RefObject<HTMLDivElement>;


  public constructor(props: {}) {
    super(props);
    const basicPlugins = [basicAlgorithmsPlugin, basicPrefabsPlugin];
    basicPlugins.forEach((plugin) => plugin.init(PluginSdk.getSdk()));
    this.myRef = React.createRef();

    this.state = {
      graphs: appState.getState("graphs"),
      selectedTab: 0,
      plugins: basicPlugins,
      zoom: 30,
    };
    appState.updateState("plugins", [
      basicAlgorithmsPlugin,
      basicPrefabsPlugin,
    ]);

    appState.subscribe<GGraph[]>("graphs", (newGraphs) => {
      console.log("GRAPHS UPDATED", newGraphs);
      this.setState({
        graphs: [...newGraphs],
      });
    });

    appState.subscribe<PluginConfig[]>("plugins", (newPlugins) => {
      this.setState({
        plugins: [...newPlugins],
      });
    });

    appState.subscribe<number>("activeGraph", (activeGraph) => {
      this.setState({
        selectedTab: activeGraph,
      });
    });
  }

  public render() {
    const { selectedTab, graphs, plugins } = this.state;
    const sdk = PluginSdk.getSdk();

    const rightPanelsAccumulator: any = {};
    const leftPanelsAccumulator: any = {};

    plugins
      .flatMap(({ rightPanels }) => rightPanels)
      .filter((val) => val)
      .forEach((rightPanel) => {
        if (!rightPanelsAccumulator[rightPanel!.identifier]) {
          rightPanelsAccumulator[rightPanel!.identifier] = {};
        }
        rightPanelsAccumulator[rightPanel!.identifier] = {
          ...rightPanelsAccumulator[rightPanel!.identifier],
          ...rightPanel!,
        };
      });

    plugins
      .flatMap(({ leftPanels }) => leftPanels)
      .filter((val) => val)
      .forEach((leftPanel) => {
        if (!leftPanelsAccumulator[leftPanel!.identifier]) {
          leftPanelsAccumulator[leftPanel!.identifier] = {};
        }
        leftPanelsAccumulator[leftPanel!.identifier] = {
          ...leftPanelsAccumulator[leftPanel!.identifier],
          ...leftPanel!,
        };
      });
    console.log(leftPanelsAccumulator, rightPanelsAccumulator);

    const rightPanels: RightMenuConfig[] = Object.values(
      rightPanelsAccumulator
    );
    const leftPanels: LeftMenuConfig[] = Object.values(leftPanelsAccumulator);

    return (
      <div id="body" style={{ height: "100%", width: "100%" }}>
        <Tabs
          selectedIndex={selectedTab}
          onSelect={(index) => {
            sdk.unselect();
            sdk.setActiveGraph(graphs[index]);
            sdk.select(sdk.getCurrentGraph().getNodes());
            sdk.render();
          }}
        >
          <TabList
            style={{
              display: "flex",
              background: "#49524c",
              margin: "0 0 5px 0",
              padding: 0,
              boxShadow: "0 0 5px 0",
              height: "50px",
            }}
          >
            <ImportButtonWithModal
              onImport={(json: any) => {
                const newGraph = sdk.jsonToGraph(json);
                sdk.addGraph(newGraph);
              }}
            ></ImportButtonWithModal>
            <button
              style={{
                background: "#49524c",
                border: "none",
                color: "#93a399",
              }}
              onClick={() => {
                const graph = PluginSdk.getSdk().getCurrentGraph();

                download(
                  PluginSdk.getSdk().graphToJson(graph),
                  `${graph.identifier}.json`,
                  "text/plain"
                );
              }}
            >
              Export
            </button>
            {graphs.map((graph) => {
              return (
                <Tab
                  key={graph.identifier}
                  style={{
                    minWidth: "100px",
                    listStyleType: "none",
                    textAlign: "left",
                    padding: "15px 5px 15px 15px",
                  }}
                >
                  {graph.identifier}
                  <div
                    style={{
                      float: "right",
                      display: "flex",
                      borderRight: "1px solid #93a399",
                      paddingRight: "5px",
                    }}
                  >
                    <button
                      style={{
                        float: "right",
                        background: "none",
                        border: "none",
                      }}
                      onClick={() => {
                        sdk.deleteGraph(graph);
                      }}
                    >
                      X
                    </button>
                  </div>
                </Tab>
              );
            })}
            <AddPluginForm />
          </TabList>

          <div style={{ display: "flex", height: "calc(100vh - 50px)" }}>
            <div
              style={{
                width: "180px",
                margin: "-6px 5px -5px 0",
                boxShadow: "0 3px 2px -2px, 0 2px 3px 0",
                padding: "3px",
              }}
            >
              <div style={{ display: "flex", paddingRight: "5px" }}>
                zoom
                <input
                  type="range"
                  min={15}
                  max={45}
                  value={this.state.zoom}
                  onChange={(e) => {
                    const container = this.myRef.current as any;
                    const newZoom = +e.target.value / 30;
                    if (
                      container.clientWidth > 3000 * newZoom ||
                      container.clientHeight > 3000 * newZoom
                    ) {
                      return;
                    }
                    const sdk = PluginSdk.getSdk();
                    const canvas = sdk.getCanvas();
                    const prev = canvas.getZoom();
                    this.setState({
                      zoom: +e.target.value,
                    });

                    canvas.setZoom(newZoom);
                    canvas.setHeight(3000 * newZoom);
                    canvas.setWidth(3000 * newZoom);

                    container.scrollLeft *= +e.target.value / 30 / prev;
                    container.scrollTop *= +e.target.value / 30 / prev;
                  }}
                />
              </div>
              <LeftPanelMenu leftMenuConfigs={leftPanels} />
            </div>
            <div
              ref={this.myRef}
              style={{
                flex: 1,
                width: "100%",
                overflow: "auto",
                border: "none",
                padding: "10px",
              }}
            >
              <CentralPanel />
            </div>
            <div
              style={{
                border: "none",
                width: "350px",
                margin: "-6px 0 -5px 5px",
                boxShadow: "0 3px 2px -2px, 0 2px 3px 0",
              }}
            >
              {graphs.map((graph) => {
                return (
                  <TabPanel>
                    <GraphMenu
                      graph={graph}
                      graphs={graphs}
                      rightMenuConfigs={rightPanels}
                    ></GraphMenu>
                  </TabPanel>
                );
              })}
            </div>
          </div>
        </Tabs>
      </div>
    );
  }
}


