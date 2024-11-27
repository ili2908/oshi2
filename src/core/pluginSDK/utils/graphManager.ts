import { BaseGraph } from "../../simpleGraphs/BaseImplementations";
import { IBaseConnection, IBaseNode } from "../../simpleGraphs/interfaces";

export class GraphManager {
    static graphs: {[key: string]: BaseGraph<IBaseNode, IBaseConnection<IBaseNode>>} = {}
    static is(identifier: string, graph2: BaseGraph<IBaseNode, IBaseConnection<IBaseNode>>) {
        graph2.identifier = identifier;
        GraphManager.graphs[identifier] = graph2;
    }
    static get(identifier: string): BaseGraph<IBaseNode, IBaseConnection<IBaseNode>> {
        return GraphManager.graphs[identifier];
    }
}