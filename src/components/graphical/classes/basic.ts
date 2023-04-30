import { BaseGraph, Graph } from "../../simple_graphs/BaseImplementations";
import { ConnectionData, GConnection, GNode, NodeData } from "../types";

let nodesCount = 0;

export class BasicGNode implements GNode<NodeData> {
    identifier: string;
    constructor(
        public data: NodeData,
        public graphical: { circle: fabric.Circle; text?: fabric.Text },
        public graph: GGraph,
        identifier?: string,
    ) {
        this.identifier = identifier || `${this.graph.identifier}:v${nodesCount++}`;
        graphical.circle.data.node = this;
        this.graph.addV(this);
    }
}    

let connectionsCount = 0;


export class BasicGConnection implements GConnection<ConnectionData, BasicGNode> {
    identifier: string;
    constructor(
        public data: ConnectionData,
        public graphical: { [key: string]: fabric.Path | fabric.Triangle | fabric.Circle },
        public graph: GGraph,
        public node0: BasicGNode,
        public node1: BasicGNode,
    ) {
        Object.entries(graphical).forEach(([key,graphical])=>{
            graphical.data = {...graphical.data,connection:this}
        })
        this.identifier = `G${this.graph.identifier}:c${connectionsCount++}`;
    }

}

let graphCount = 0;

export class GGraph extends BaseGraph<BasicGNode,BasicGConnection>{
    public identifier: string;

    public constructor(identifier?: string) {
        super();
        console.log('c',graphCount)
        this.identifier = identifier ?? `G${graphCount++}`;
    }

    createConnection(n0:BasicGNode,n1:BasicGNode,data?:{data: any, graphical: { [key: string]: fabric.Path | fabric.Triangle }}):BasicGConnection{
        return new BasicGConnection(data?.data, data!.graphical, this, n0,n1,);
    }

    merge(other: GGraph): GGraph {
        this.identifier = `${this.identifier}:${other.identifier}`;
        for(let vid in other.nodes) {

            other.nodes[vid].graph = this;
            this.addV(other.nodes[vid]);
        }
        for(let con of other.getConnections()) {
            this.connect(
                con.node0.identifier,
                con.node1.identifier,
                {
                    data: con.data,
                    graphical: con.graphical
                }
            )
        }
        return this;
    }

    separate(nodes: BasicGNode[]): GGraph {
        const newGraph = new GGraph();
        const toConnect = this.getConnections().filter(({node0, node1})=> {
            return nodes.map(({identifier})=>identifier).includes(node0.identifier) &&
                   nodes.map(({identifier})=>identifier).includes(node1.identifier)

        })
        nodes.forEach((node)=>{
            node.graph = newGraph;
            newGraph.addV(node);
            this.deleteV(node.identifier);
        })
        toConnect.forEach((connection)=> {
            newGraph.connect(connection.node0.identifier, connection.node1.identifier, {
                data: connection.data,
                graphical: connection.graphical
            });
        })
        return newGraph;
    }

    getNodes(): BasicGNode[] {
        const result = [];
        for(let vid in this.nodes) {
            result.push(this.nodes[vid]);
        }
        return result;
    }

    getConnections(): BasicGConnection[] {
        const result:BasicGConnection[] = [];
        for(let i in this.connections) {
            for(let j in this.connections[i]) {
                const connection = this.connections[i][j];
                if(!result.map(({identifier})=>identifier).includes(connection.identifier)) {
                    result.push(connection);
                }
            }
        }
        return result;
    }
};