export interface IBaseNode{
    readonly identifier:string;
}
export interface IBaseConnection<T extends IBaseNode>{
    readonly node0:T;
    readonly node1:T;
    
}
export interface IBaseGraph<T extends IBaseNode,C extends IBaseConnection<T>>{
    nodes:{[name:string]:T};
    connections:{[v1:string]:{[v2:string]:C}}

    
    neighbours:{(id1:string):T[]}
    connected:{(id1:string,id2:string):boolean}
    getConnection:{(id1:string,id2:string):C|null}

    deleteV:{(id1:string):void}
    addV:{(vertex:T):void}
    
    connect:{(id1:string,id2:string,data?:any):void}
    disconnect:{(id1:string,id2:string):void}

    contrapt:{(id1:string,id2:string):void}
    GED:{(other:IBaseGraph<T,C>):number}
}

export type Metric = {(id1:string,id2:string):number};
export interface IMetricGraph<T extends IBaseNode,C extends IBaseConnection<T>> extends IBaseGraph<T,C>{
    metric:Metric;
}


export interface BinOpMethod<T>{
    (other:T):T
}
export interface UnOpMethod<T>{
    ():T
}
export interface IMathematicalGraph<T extends IBaseNode,C extends IBaseConnection<T>> extends IBaseGraph<T,C>{        
    //basic unary Operations
    complementary:UnOpMethod<IMathematicalGraph<T,C>>;
    edgeGraph:UnOpMethod<IMathematicalGraph<T,C>>;
    
    //basic binary Operations 
    union: BinOpMethod<IMathematicalGraph<T,C>>;
    intersection: BinOpMethod<IMathematicalGraph<T,C>>;
    join: BinOpMethod<IMathematicalGraph<T,C>>;
    strongProduct: BinOpMethod<IMathematicalGraph<T,C>>;
    cartezianProduct: BinOpMethod<IMathematicalGraph<T,C>>;
}