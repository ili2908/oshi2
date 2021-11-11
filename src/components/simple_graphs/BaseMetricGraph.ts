import { BaseConnection, Graph, BaseNode } from "./BaseImplementations";
import {IMetricGraph,IMathematicalGraph,Metric} from "./interfaces";
/*
class MathematicalGraph extends Graph implements IMathematicalGraph<BaseNode,BaseConnection>{
    complementary():IMathematicalGraph<BaseNode,BaseConnection>{
        return null;
    };
    edgeGraph():IMathematicalGraph<BaseNode,BaseConnection>{
        return null;
    };
    union(other:IMathematicalGraph<BaseNode,BaseConnection>):IMathematicalGraph<BaseNode,BaseConnection>{
        return null;
    };
    intersection(other:IMathematicalGraph<BaseNode,BaseConnection>):IMathematicalGraph<BaseNode,BaseConnection>{
        return null;
    };
    join(other:IMathematicalGraph<BaseNode,BaseConnection>):IMathematicalGraph<BaseNode,BaseConnection>{
        return null;
    };
    strongProduct(other:IMathematicalGraph<BaseNode,BaseConnection>):IMathematicalGraph<BaseNode,BaseConnection>{
        return null;
    };
    cartezianProduct(other:IMathematicalGraph<BaseNode,BaseConnection>):IMathematicalGraph<BaseNode,BaseConnection>{
        return null;
    };

}

export class MetricGraph extends MathematicalGraph implements IMetricGraph<BaseNode,BaseConnection>{
    metric: Metric;
    constructor(metric:Metric){
        super();
        this.metric=metric;
    }
}
*/