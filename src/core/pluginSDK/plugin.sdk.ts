import { GraphSdk } from "./plugin.sdk.interface";
import appState from "../appState/appState";
import { UndoOperations } from "../../utils/undoOperations";
import { getCentre } from "../../utils/getCentre";
import { BasicGConnection, BasicGNode, ConnectionData, GGraph, NodeData } from "../classes/graphs";
import { fabric } from 'fabric';

const LINE_FILL = 'black';


export class PluginSdk implements GraphSdk {
  public undoOperations = new UndoOperations();
  private static instance = new PluginSdk();
  private importedGraphsCount = 0;
  public static getSdk() {
    return this.instance;
  }
  private constructor() {}

  public getCurrentSelection() {
    return (
      appState.getState<(BasicGNode | BasicGConnection)[]>("selection") || []
    );
  }

  public getCanvas(): fabric.Canvas {
    return appState.getState("canvas");
  }

  public updateState<T>(key: string, val: T) {
    return appState.updateState<T>(key, val);
  }

  public getState<T>(key: string) {
    return appState.getState<T>(key);
  }

  public select(objects?: (BasicGNode | BasicGConnection)[], unselect = true) {
    if (!objects) return;
    const graphicalObjects = objects as unknown as (
      | BasicGConnection
      | BasicGNode
    )[];
    const keysPressed = appState.getState<string[]>("keyPresses") || [];

    if (!keysPressed.includes("Control") && unselect) {
      this.unselect();
    }
    const selection = this.getCurrentSelection() as unknown as (
      | BasicGConnection
      | BasicGNode
    )[];
    appState.updateState("selection", [
      ...graphicalObjects.filter(
        ({ identifier }) =>
          !selection.map(({ identifier }) => identifier).includes(identifier)
      ),
      ...selection,
    ]);

    graphicalObjects.map((selected) => {
      Object.entries(selected.graphical).forEach(([key, graphical]) => {
        (graphical as fabric.Object).set({
          strokeWidth: 2,
          stroke: "blue",
        });
      });
    });
  }

  public unselect(objects?: (BasicGNode | BasicGConnection)[] | undefined) {
    const graphicalObjects = objects as unknown as (
      | BasicGConnection
      | BasicGNode
    )[];
    if (objects) {
      graphicalObjects.forEach((target) => {
        Object.entries(target.graphical).forEach(([key, graphical]) => {
          (graphical as fabric.Object).set({
            stroke: graphical?.data?.connection ? "black" : undefined,
          });
        });
      });
      const selection = this.getCurrentSelection() as unknown as (
        | BasicGConnection
        | BasicGNode
      )[];
      appState.updateState(
        "selection",
        selection.filter(
          ({ identifier }) =>
            !graphicalObjects
              .map(({ identifier }) => identifier)
              .includes(identifier)
        )
      );
    } else {
      const selection = this.getCurrentSelection() as unknown as (
        | BasicGConnection
        | BasicGNode
      )[];
      if (!selection || selection.length == 0) return;
      this.unselect(selection);
    }
  }

  public addGraph(graph: GGraph, index = -1) {
    const graphs = appState.getState<GGraph[]>("graphs") || [];
    const newGraphs = [...graphs];
    newGraphs.splice(index > -1 ? index : graphs.length, 0, graph);

    appState.updateState("graphs", newGraphs);
    this.setActiveGraph(graph);

    this.undoOperations.push(() => {
      appState.updateState(
        "graphs",
        [...graphs].splice(index > -1 ? index : graphs.length - 1, 1)
      );
      this.setActiveGraph(graphs.at(-1)!);
    });
    return graph;
  }

  public deleteGraph(graph: GGraph) {
    const graphs = appState.getState<GGraph[]>("graphs") || [];
    if (graphs.length === 1) {
      return graph;
    }
    this.startTransaction();

    [...graph.getConnections(), ...graph.getNodes()].forEach((target) => {
      if ((target as BasicGConnection).node0) {
        this.deleteConnection(target as BasicGConnection);
      } else {
        this.deleteNode(target as BasicGNode);
      }
    });

    const index = graphs.indexOf(graph);

    const isDeletedCurrent =
      this.getCurrentGraph().identifier === graph.identifier;

    appState.updateState(
      "graphs",
      graphs.filter(({ identifier }) => identifier !== graph.identifier)
    );
    if (isDeletedCurrent) {
      console.log("HERE");
      this.setActiveGraph(this.getCurrentGraphs()!.at(-1)!);
    }
    this.undoOperations.push(() => {
      this.startExclusionFromUndoList();
      this.addGraph(graph, index);
      this.closeExclusionFromUndoList();
    });
    this.closeTransaction();
    return graph;
  }

  public setActiveGraph(graph: GGraph): number {
    const graphs = appState.getState<GGraph[]>("graphs") || [];
    const index = graphs.findIndex(
      ({ identifier }) => graph.identifier === identifier
    );
    if (index == -1) return index;
    appState.updateState("activeGraph", index);
    return index;
  }

  public getCurrentGraph() {
    const activeGraphIndex = appState.getState<number>("activeGraph") || 0;
    const graphs = appState.getState<GGraph[]>("graphs") || [];
    console.log(activeGraphIndex, graphs);
    return graphs[activeGraphIndex];
  }

  public getCurrentGraphs() {
    return appState.getState<GGraph[]>("graphs") || [];
  }

  public startExclusionFromUndoList() {
    this.undoOperations.openExclusion();
  }

  public closeExclusionFromUndoList() {
    this.undoOperations.closeExclusion();
  }

  public startTransaction() {
    this.undoOperations.openTransaction();
  }

  public closeTransaction() {
    this.undoOperations.closeTransaction();
  }

  public undo() {
    if (this.undoOperations.empty()) return;
    const res = this.undoOperations.pop();
    res!();
  }

  public addNode(
    graph: GGraph,
    data: NodeData,
    x: number,
    y: number,
    identifier?: string
  ) {
    this.startTransaction();
    const graphicalGraph = graph as unknown as GGraph;

    const defaultNodeSize = appState.getState<number>("size") || 10;
    const defaultNodeFill = appState.getState<string>("color") || "green";

    const circle = new fabric.Circle({
      radius: defaultNodeSize,
      fill: data.marked ? "red" : defaultNodeFill,
      top: y - defaultNodeSize,
      left: x - defaultNodeSize,
      hasBorders: false,
      hasControls: false,
    });

    circle.canvas = appState.getState<fabric.Canvas>("canvas")!;
    circle.data = { node: this };

    const newNode = new BasicGNode(
      data,
      { circle },
      graphicalGraph,
      identifier
    );

    graph.addV(newNode);

    this.undoOperations.push(() => {
      const nodeToRemove = newNode.graph.nodes[newNode.identifier];
      appState
        .getState<fabric.Canvas>("canvas")
        .remove(newNode.graphical.circle);
      if (nodeToRemove.graphical.text) {
        appState
          .getState<fabric.Canvas>("canvas")
          .remove(nodeToRemove.graphical.text);
      }
      nodeToRemove.graph.deleteV(nodeToRemove.identifier);
    });
    if (appState.getState("autoLabeling")) {
      this.renameNode(newNode, data.label || newNode.identifier);
    }
    appState.getState<fabric.Canvas>("canvas").add(newNode.graphical.circle);

    this.closeTransaction();
    return newNode;
  }

  public renameNode(node: BasicGNode, newName: string) {
    const graphicalNode = node as unknown as BasicGNode;
    const previousInput = graphicalNode.data.label;

    graphicalNode.data.label = newName;

    if (!graphicalNode.graphical.text) {
      graphicalNode.graphical.text = new fabric.Text(
        graphicalNode.data.label || graphicalNode.identifier,
        {
          fontFamily: "Calibri",
          fontSize: 20,
          fontStyle: "italic",
          textAlign: "center",
          left:
            getCentre(graphicalNode.graphical.circle as fabric.Circle)[0] - 40,
          top:
            getCentre(graphicalNode.graphical.circle as fabric.Circle)[1] - 40,
          hasControls: false,
          hasRotatingPoint: false,
          hasBorders: false,
          selectable: false,
        }
      );
    } else {
      graphicalNode.graphical.text.set({ text: newName });
    }
    appState
      .getState<fabric.Canvas>("canvas")
      .add(graphicalNode.graphical.text);
    appState.getState<fabric.Canvas>("canvas").renderAll();
    this.undoOperations.push(() => {
      if (previousInput) {
        graphicalNode.data.label = previousInput;
        graphicalNode.graphical.text!.set({ text: previousInput });
      } else {
        delete graphicalNode.data.label;
        appState
          .getState<fabric.Canvas>("canvas")
          .remove(graphicalNode.graphical.text!);
      }
      appState.getState<fabric.Canvas>("canvas").renderAll();
    });
    return node;
  }

  public colorNode(
    node: BasicGNode,
    newColor: string | fabric.Pattern | fabric.Gradient
  ) {
    const graphicalNode = node as unknown as BasicGNode;
    const prevColor = graphicalNode.graphical.circle.fill!;

    graphicalNode.graphical.circle
      .set({
        fill: newColor,
      })
      .setCoords();
    this.undoOperations.push(() => {
      this.undoOperations.openExclusion();
      this.colorNode(graphicalNode, prevColor);
      this.undoOperations.closeExclusion();
      this.render();
    });

    return node;
  }

  public markNode(node: BasicGNode) {
    this.startTransaction();
    const graphicalNode = node as unknown as BasicGNode;
    graphicalNode.data.marked = !graphicalNode.data.marked;
    this.undoOperations.push(() => {
      graphicalNode.data.marked = !graphicalNode.data.marked;
    });
    this.colorNode(node, "red");
    this.closeTransaction();
  }

  public resizeNode(node: BasicGNode, newSize: number) {
    const graphicalNode = node as unknown as BasicGNode;
    const prevSize = graphicalNode.graphical.circle.radius!;
    const centerX = graphicalNode.graphical.circle.left! + +prevSize;
    const centerY = graphicalNode.graphical.circle.top! + +prevSize;

    graphicalNode.graphical.circle
      .set({
        radius: newSize,
        left: centerX - newSize!,
        top: centerY - newSize!,
      })
      .setCoords();

    this.undoOperations.push(() => {
      this.undoOperations.openExclusion();
      this.resizeNode(graphicalNode, prevSize);
      this.undoOperations.closeExclusion();
      this.render();
    });
    return node;
  }

  public addConnection(
    nodeA: BasicGNode,
    nodeB: BasicGNode,
    data: ConnectionData
  ) {
    this.startTransaction();
    let [node0, node1] = [nodeA, nodeB] as unknown as [BasicGNode, BasicGNode];
    if (
      (node0.graph as GGraph).identifier !== (node1.graph as GGraph).identifier
    ) {
      this.mergeGraphs([node0.graph as GGraph, node1.graph as GGraph]);
    }
    const graph = node0.graph;
    const current = graph.getConnection(node0.identifier, node1.identifier);

    if (current) {
      if (node0.identifier !== current.node0.identifier) {
        data.directions.forEach((direction) => {
          direction.zeroToOne =
            direction.zeroToOne === undefined ? undefined : false;
        });
      }
      node0 = current.node0;
      node1 = current.node1;
    }
    const graphicals = data.directions.map(({ zeroToOne }, j) => {
      const i = (current?.data.directions.length || 0) + j;
      const [newPath, newHead] =
        node1.identifier === node0.identifier
          ? this.drawLoop(zeroToOne!, i, node0, node1)
          : this.drawLine(zeroToOne!, i, node0, node1);

      if (zeroToOne === undefined) {
        return [newPath!];
      }
      return [newPath!, newHead!];
    });
    const dataCopy = JSON.parse(JSON.stringify(data));

    this.undoOperations.push(() => {
      this.undoAddConnection(
        graph.getConnection(node0.identifier, node1.identifier)!,
        dataCopy
      );
    });

    if (current) {
      data.directions.forEach((direction) =>
        current.data.directions.push(direction)
      );
      const length = Object.keys(current.graphical).filter((key) =>
        key.includes("path")
      ).length;
      graphicals.forEach(([path, head], i) => {
        const id = length + i;
        path.data = { connection: current };
        current.graphical[`path${id}`] = path;
        if (head) {
          current.graphical[`head${id}`] = head;
        }
      });
      this.closeTransaction();
      return current;
    }
    graph.connect(node0.identifier, node1.identifier, {
      data,
      graphical: graphicals.reduce((obj: any, [path, head, id], i) => {
        obj[`path${i}`] = path;
        if (head) {
          obj[`head${i}`] = head;
        }
        return obj;
      }, {}),
    });

    this.closeTransaction();

    return graph.getConnection(
      node0.identifier,
      node1.identifier
    )! as unknown as BasicGConnection;
  }

  private undoAddConnection(
    connection: BasicGConnection,
    data: ConnectionData
  ) {
    data.directions.forEach(({ zeroToOne }) => {
      const id = connection.data.directions.length - 1;
      appState
        .getState<fabric.Canvas>("canvas")
        .remove(connection.graphical[`path${id}`]);
      delete connection.graphical[`path${id}`];
      if (zeroToOne === undefined) {
        connection.data.directions.pop();
        return;
      }
      appState
        .getState<fabric.Canvas>("canvas")
        .remove(connection.graphical[`head${id}`]);
      delete connection.graphical[`head${id}`];
      connection.data.directions.pop();
    });
    appState
      .getState<fabric.Canvas>("canvas")
      .remove(connection.graphical.text);
    if (connection.data.directions.length === 0) {
      connection.node0.graph.disconnect(
        connection.node0.identifier,
        connection.node1.identifier
      );
    }
  }

  private drawLine(
    zeroToOne: boolean,
    i: number,
    node0: BasicGNode,
    node1: BasicGNode
  ): [fabric.Path, fabric.Triangle?] {
    const [x0, y0] = getCentre(node0.graphical.circle);
    const [x1, y1] = getCentre(node1.graphical.circle);
    const mx = (x0 + x1) / 2;
    const my = (y0 + y1) / 2;
    const px = -(y1 - y0);
    const py = x1 - x0;
    const curvatureCoefficient =
      (i % 2 === 1 ? 1 : -1) * Math.ceil(i / 2) * 0.1;
    const cx = mx - px * curvatureCoefficient; //(i%2===1?1:-1*i * 0.1 * 2);
    const cy = my - py * curvatureCoefficient; //(i%2===1?1:-1*i * 0.1 * 2);

    const path = new fabric.Path(`M ${x0} ${y0} Q ${cx}, ${cy}, ${x1}, ${y1}`, {
      fill: "",
      stroke: LINE_FILL,
      strokeWidth: 2,
      perPixelTargetFind: true,
      hasBorders: false,
      hasControls: false,
      selectable: false,
    });
    appState.getState<fabric.Canvas>("canvas").add(path);
    appState.getState<fabric.Canvas>("canvas").sendToBack(path);

    if (zeroToOne === undefined) {
      return [path];
    }

    const ang = zeroToOne
      ? Math.atan2(y1 - cy, x1 - cx)
      : Math.atan2(cy - y0, cx - x0);
    const head = new fabric.Triangle({
      width: 10,
      height: 15,
      fill: LINE_FILL,
      left: zeroToOne
        ? x1 +
          5 * Math.sin(ang) -
          (appState.getState<number>("size") || 10) * Math.cos(ang)
        : x0 -
          5 * Math.sin(ang) +
          (appState.getState<number>("size") || 10) * Math.cos(ang),
      top: zeroToOne
        ? y1 -
          5 * Math.cos(ang) -
          (appState.getState<number>("size") || 10) * Math.sin(ang)
        : y0 +
          5 * Math.cos(ang) +
          (appState.getState<number>("size") || 10) * Math.sin(ang),
      angle: (ang * 180) / Math.PI + (zeroToOne ? 90 : -90),
      hasBorders: false,
      evented: false,
      selectable: false,
    });
    appState.getState<fabric.Canvas>("canvas").add(head);
    appState.getState<fabric.Canvas>("canvas").sendToBack(head);

    return [path, head];
  }

  private drawLoop(
    zeroToOne: boolean,
    i: number,
    node0: BasicGNode,
    node1: BasicGNode
  ): [fabric.Path | fabric.Circle, fabric.Triangle?] {
    const [x0, y0] = getCentre(node0.graphical.circle);

    var path = new fabric.Circle({
      radius: (appState.getState<number>("size") || 10) + 4 * i,
      left: x0 - (appState.getState<number>("size") || 10) + 4 * i,
      top: y0,
      stroke: "#000",
      strokeWidth: 2,
      perPixelTargetFind: true,
      hasBorders: false,
      hasControls: false,
      fill: "",
      selectable: false,
    });
    appState.getState<fabric.Canvas>("canvas").add(path);
    appState.getState<fabric.Canvas>("canvas").sendToBack(path);
    if (zeroToOne === undefined) {
      return [path];
    }
    const head = new fabric.Triangle({
      width: 10,
      height: 15,
      fill: LINE_FILL,
      left: x0 + 9,
      top: y0 - 5 + 2 * ((appState.getState<number>("size") || 10) + 4 * i),
      angle: 90,
      hasBorders: false,
      evented: false,
      selectable: false,
    });
    appState.getState<fabric.Canvas>("canvas").add(head);
    appState.getState<fabric.Canvas>("canvas").sendToBack(head);

    return [path, head];
  }

  public deleteConnection(
    connection: BasicGConnection,
    subConnections?: number[] | undefined
  ) {
    const graphicalConnection = connection as unknown as BasicGConnection;
    const directions = [...graphicalConnection!.data.directions];
    this.undoOperations.push(() => {
      this.startExclusionFromUndoList();
      this.addConnection(graphicalConnection.node0, graphicalConnection.node1, {
        label: graphicalConnection!.data.label,
        directions: directions,
        weight: graphicalConnection.data.weight,
      });
      this.closeExclusionFromUndoList();
    });
    this.undoAddConnection(graphicalConnection, {
      directions: [...graphicalConnection?.data.directions!],
    });
    return connection;
  }

  public deleteNode(node: BasicGNode) {
    this.startTransaction();
    const graphicalNode = node as unknown as BasicGNode;
    if (graphicalNode.graphical.text) {
      appState
        .getState<fabric.Canvas>("canvas")
        .remove(graphicalNode.graphical.text);
    }
    const connections = graphicalNode.graph
      .neighbours(node.identifier)
      .map((other) => {
        return graphicalNode.graph.getConnection(
          node.identifier,
          other.identifier
        );
      })
      .map((res) => ({
        node0Id: res?.node0.identifier,
        node1Id: res?.node1.identifier,
        data: {
          label: res!.data.label,
          directions: [...res!.data.directions],
        },
      }));
    this.undoOperations.push(() => {
      const graph = graphicalNode.graph;
      graph.addV(graphicalNode);
      appState
        .getState<fabric.Canvas>("canvas")
        .add(graphicalNode.graphical.circle);
      if (graphicalNode.data.label) {
        this.renameNode(
          graphicalNode,
          graphicalNode.data.label || node.identifier
        );
        this.undoOperations.pop();
      } else {
        //this.undoOperations.pop()
      }

      connections.forEach((connection) => {
        this.addConnection(
          graph.nodes[connection.node0Id!] || node,
          graph.nodes[connection.node1Id!] || node,
          connection!.data!
        );
        this.undoOperations.pop();
      });
    });

    graphicalNode.graph.neighbours(node.identifier).map((other) => {
      const connection = graphicalNode.graph.getConnection(
        node.identifier,
        other.identifier
      );
      this.undoAddConnection(connection! as BasicGConnection, {
        directions: [...connection?.data.directions!],
      });
    });

    appState
      .getState<fabric.Canvas>("canvas")
      .remove(graphicalNode.graphical.circle);
    if (graphicalNode.graphical.text) {
      appState
        .getState<fabric.Canvas>("canvas")
        .remove(graphicalNode.graphical.text);
    }
    graphicalNode.graph.deleteV(graphicalNode.identifier);
    this.closeTransaction();
    return node;
  }

  public moveNode(node: BasicGNode, x?: number, y?: number) {
    const graphicalNode = node as unknown as BasicGNode;
    if (x) {
      graphicalNode.graphical.circle.set({
        left: x - (appState.getState<number>("size") || 10),
      });
    }
    if (y) {
      graphicalNode.graphical.circle.set({
        top: y - (appState.getState<number>("size") || 10),
      });
    }
    if (x || y) {
      graphicalNode.graphical.circle.setCoords();
    }

    if (graphicalNode.graphical.text) {
      graphicalNode.graphical.text
        .set({
          top:
            getCentre(graphicalNode.graphical.circle as fabric.Circle)[1] - 40,
          left:
            getCentre(graphicalNode.graphical.circle as fabric.Circle)[0] - 40,
        })
        .setCoords();
    }
    Object.entries({
      ...graphicalNode.graph.connections[node.identifier],
    }).forEach(([_, connection]) => {
      this.moveConnection(connection);
    });
    return node;
  }

  public mergeGraphs(graphs: GGraph[]) {
    const [firstGraph, ...otherGraphs] = graphs;
    otherGraphs.forEach((graph) => firstGraph.merge(graph));
    const allGraphs = appState.getState<GGraph[]>("graphs") || [];
    appState.updateState(
      "graphs",
      allGraphs.filter(
        ({ identifier }) =>
          !otherGraphs.map(({ identifier }) => identifier).includes(identifier)
      )
    );

    this.undoOperations.push(() => {
      this.startExclusionFromUndoList();
      otherGraphs.map((graph) => {
        firstGraph.donate(
          graph
            .getNodes()
            .map(({ identifier }) => firstGraph.nodes[identifier]),
          graph
        );
      });
      this.closeExclusionFromUndoList();
    });
    this.setActiveGraph(firstGraph);

    return firstGraph;
  }

  public separateGraphs(nodes: BasicGNode[]): GGraph {
    const graphicalNodes = nodes as unknown as BasicGNode[];
    this.startTransaction();
    const graph = graphicalNodes[0]!.graph;

    graphicalNodes.map((node) => {
      const neighbors = graph.neighbours(node.identifier);

      neighbors.forEach(({ identifier }) => {
        if (nodes.map(({ identifier }) => identifier).includes(identifier)) {
          return;
        }

        const connection = graph.getConnection(identifier, node.identifier);
        this.deleteConnection(connection!);
      });
    });
    const newGraph = graph.separate(graphicalNodes);

    this.undoOperations.push(() => {
      this.startExclusionFromUndoList();
      this.mergeGraphs([graph, newGraph]);
      const allGraphs = appState.getState<GGraph[]>("graphs") || [];
      appState.updateState(
        "graphs",
        allGraphs.filter(({ identifier }) => identifier !== newGraph.identifier)
      );
      this.closeExclusionFromUndoList();
    });

    this.addGraph(newGraph);
    this.closeTransaction();
    return newGraph;
  }

  public getSubgraph(nodes: BasicGNode[]): GGraph {
    const newGraph = new GGraph();
    const currentGraph = nodes[0].graph;
    const toConnect = currentGraph
      .getConnections()
      .filter(({ node0, node1 }) => {
        return (
          nodes
            .map(({ identifier }) => identifier)
            .includes(node0.identifier) &&
          nodes.map(({ identifier }) => identifier).includes(node1.identifier)
        );
      });
    nodes.forEach((node) => {
      newGraph.addV(node);
    });
    toConnect.forEach((connection: any) => {
      newGraph.connect(connection.node0.identifier, connection.node1.identifier, {
        data: connection.data,
        graphical: connection.graphical,
      });
    });
    return newGraph;
  } 

  public render() {
    appState.getState<fabric.Canvas>("canvas").renderAll();
  }

  private moveConnection(con: BasicGConnection) {
    const { node0, node1 } = con;
    const middleX =
      getCentre(con.node0.graphical.circle as fabric.Circle)[0] +
      getCentre(con.node1.graphical.circle as fabric.Circle)[0];
    const middleY =
      getCentre(con.node0.graphical.circle as fabric.Circle)[1] +
      getCentre(con.node1.graphical.circle as fabric.Circle)[1];
    if (con.graphical.text) {
      (con.graphical.text as fabric.Text)
        .set({
          top: middleY / 2,
          left: middleX / 2,
        })
        .setCoords();
    }

    con.data.directions.map(({ zeroToOne }, i) => {
      const path = con.graphical[`path${i}`] as fabric.Path;
      appState.getState<fabric.Canvas>("canvas").remove(path);
      const [newPath, newHead] =
        node1.identifier === node0.identifier
          ? this.drawLoop(zeroToOne!, i, node0, node1)
          : this.drawLine(zeroToOne!, i, node0, node1);
      newPath.data = { connection: con };
      con.graphical[`path${i}`] = newPath;

      if (zeroToOne === undefined) {
        return;
      }

      const head = con.graphical[`head${i}`] as fabric.Triangle;
      appState.getState<fabric.Canvas>("canvas").remove(head);
      con.graphical[`head${i}`] = newHead!;
    });
  }

  public graphToJson(graph: GGraph) {
    const json = JSON.stringify({
      identifier: `D:${graph.identifier}`,
      connections: graph.getConnections().map((connection) => {
        return {
          identifier: `D:${connection.identifier}`,
          node0: `D:${connection.node0.identifier}`,
          node1: `D:${connection.node1.identifier}`,
          data: connection.data,
        };
      }),
      nodes: graph.getNodes().map((node) => {
        return {
          identifier: `D:${node.identifier}`,
          data: node.data,
          coords: getCentre(node.graphical.circle),
        };
      }),
    });

    return json;
  }

  public jsonToGraph(json: any): GGraph {
    this.startTransaction();

    const newGraph = new GGraph();
    const importCount = this.importedGraphsCount++;
    newGraph.identifier = importCount + ":i:" + json.identifier;
    json.nodes.forEach((node: any) => {
      this.addNode(
        newGraph,
        node.data,
        node.coords[0],
        node.coords[1],
        importCount + ":i:v" + node.identifier
      );
    });
    json.connections.forEach((connection: any) => {
      this.addConnection(
        newGraph.nodes[importCount + ":i:v" + connection.node0],
        newGraph.nodes[importCount + ":i:v" + connection.node1],
        connection.data
      );
    });
    this.closeTransaction();
    return newGraph;
  }
}
