import { getSdk } from ".";
import { BasicGConnection, BasicGNode, ConnectionData } from "../../core/classes/graphs";
import { RightClickMenuConfig } from "../../core/pluginSDK/plugin.sdk.interface";
import { getCentre } from "../../utils/getCentre";

export const rightClickMenuConfig: RightClickMenuConfig = {
  choices: [
    {
      name: "Delete",
      targets: ["node", "connection"],
      callBack: (event) => {
        //const target = getSdk().getCanvas().findTarget(event, true);
        getSdk().startTransaction();
        const selection = getSdk().getCurrentSelection();
        selection.forEach((obj) => {
          if ((obj as BasicGConnection).node0) {
            getSdk().deleteConnection(obj as BasicGConnection);
          } else {
            getSdk().deleteNode(obj as BasicGNode);
          }
        });
        getSdk().closeTransaction();
      },
    },
    {
      name: "Label",
      targets: ["node"],
      inputFields: ["newName"],
      callBack: (event, newName) => {
        getSdk().startTransaction();
        const selection = getSdk().getCurrentSelection();
        selection.forEach((obj) => {
          if (!(obj as BasicGConnection).node0) {
            getSdk().renameNode(obj as BasicGNode, newName);
          }
        });
        getSdk().closeTransaction();
      },
    },
    {
      name: "Copy",
      targets: ["node"],
      callBack: (event, newName) => {
        getSdk().startTransaction();
        const selection = getSdk().getCurrentSelection();
        const subgraph = getSdk().getSubgraph(
          selection.filter(
            (obj) => !(obj as BasicGConnection).node0
          ) as BasicGNode[]
        );
        subgraph.identifier = `S:` + selection[0].graph.identifier;
        console.log(getSdk().graphToJson(subgraph));
        navigator.clipboard.writeText(
          JSON.stringify(getSdk().graphToJson(subgraph))
        ).then((res)=>console.log('written'+res));
        getSdk().closeTransaction();
      },
    },
    {
      name: "Paste",
      targets: ["void"],
      callBack: (event, newName) => {
        getSdk().startTransaction();
        navigator.clipboard
          .readText()
          .then((text) => {
            getSdk().addGraph(getSdk().jsonToGraph( JSON.parse(JSON.parse(text))));
          })
          .catch((e) => console.log(e));
        getSdk().closeTransaction();
      },
    },
    {
      name: "Mark",
      targets: ["node"],

      callBack: (event) => {
        getSdk().startTransaction();
        const selection = getSdk().getCurrentSelection();
        selection.forEach((obj) => {
          if (!(obj as BasicGConnection).node0) {
            getSdk().markNode(obj as BasicGNode);
          }
        });
        getSdk().render();
        getSdk().closeTransaction();
      },
    },
    {
      name: "Separate",
      targets: ["node"],
      callBack: (event) => {
        getSdk().startTransaction();
        const selection = getSdk().getCurrentSelection();
        getSdk().separateGraphs(
          selection.filter(
            (obj) => !(obj as BasicGConnection).node0
          ) as BasicGNode[]
        );
        getSdk().closeTransaction();
      },
    },
    {
      name: "Split",
      targets: ["connection"],
      callBack: (event) => {
        getSdk().startTransaction();
        const selection = getSdk().getCurrentSelection();
        const graph = getSdk().getCurrentGraph();
        selection.forEach((target) => {
          if ((target as BasicGConnection).node0) {
            const node0 = (target as BasicGConnection).node0;
            const node1 = (target as BasicGConnection).node1;
            const [x0, y0] = getCentre(node0.graphical.circle as fabric.Circle);
            const [x1, y1] = getCentre(node1.graphical.circle as fabric.Circle);
            const node = getSdk().addNode(
              graph,
              {},
              (x0 + x1) / 2,
              (y0 + y1) / 2
            );
            const data = {
              directions: [...(target!.data! as ConnectionData).directions],
            };
            const data2 = {
              directions: [...(target!.data! as ConnectionData).directions],
            };
            getSdk().deleteConnection(target as BasicGConnection);
            getSdk().addConnection(node0 as BasicGNode, node, data);
            getSdk().addConnection(node, node1 as BasicGNode, data2);
          }
        });
        getSdk().closeTransaction();
      },
    },
    {
      name: "Contract",
      targets: ["connection"],
      callBack: (event) => {
        getSdk().startTransaction();
        const selection = getSdk().getCurrentSelection();
        const graph = getSdk().getCurrentGraph();
        selection.forEach((target) => {
          if ((target as BasicGConnection).node0) {
            const node0 = (target as BasicGConnection).node0;
            const node1 = (target as BasicGConnection).node1;
            getSdk().deleteConnection(target as BasicGConnection);
            graph.neighbours(node1.identifier).forEach((neighbor) => {
              if (
                neighbor.identifier !== node0.identifier &&
                neighbor.identifier !== node1.identifier
              ) {
                const connection = graph.getConnection(
                  neighbor.identifier,
                  node1.identifier
                );
                const data = {
                  directions: [
                    ...(connection!.data! as ConnectionData).directions,
                  ],
                };
                if (connection?.node0.identifier === neighbor.identifier) {
                  getSdk().addConnection(neighbor, node0 as BasicGNode, data);
                } else {
                  getSdk().addConnection(node0 as BasicGNode, neighbor, data);
                }
                getSdk().deleteConnection(connection!);
              }
            });
            getSdk().deleteNode(node1 as BasicGNode);
          }
        });
        getSdk().closeTransaction();
      },
    },
  ],
};