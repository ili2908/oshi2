import { BaseConnection, BaseNode, Graph } from "simple_graphs";
import { BaseGraph } from "../simple_graphs/BaseImplementations";
import { IBaseConnection, IBaseNode } from "../simple_graphs/interfaces";

export interface ConnectionData {
    label?: string;
    directions: {zeroToOne?: boolean}[]    
}

export interface NodeData {
    label?: string;
    marked?: boolean;
}
export interface GNode<T = NodeData> extends IBaseNode {
    data: T;
    graphical: {[key: string]:fabric.Object};
}

export interface GConnection<T = ConnectionData, P extends GNode = GNode> extends IBaseConnection<P> {
    data: T;
    graphical: {[key: string]:fabric.Object};
}