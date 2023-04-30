import { GGraph } from "../classes/basic";

export class GraphManager {
    static graphs: {[key: string]:GGraph} = {}
    static is(identifier: string, graph2: GGraph) {
        graph2.identifier = identifier;
        GraphManager.graphs[identifier] = graph2;
    }
    static get(identifier: string): GGraph {
        return GraphManager.graphs[identifier];
    }
}