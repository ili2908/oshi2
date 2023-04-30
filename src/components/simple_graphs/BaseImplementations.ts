import {IBaseConnection,IBaseNode,IBaseGraph} from './interfaces';

export class BaseNode implements IBaseNode{
    identifier:string;
    data?:any;
    constructor(identifier:string="",data?:any){
        this.identifier=identifier;
        this.data=data;
    }
}
export class BaseConnection implements IBaseConnection<BaseNode>{
    
    node0:BaseNode;
    node1:BaseNode;
    data?:any;
    constructor(n0:BaseNode,n1:BaseNode,data?:any){
        this.node0=n0;
        this.node1=n1;
        this.data=data;
    }
}
export type PseudoDirectionalData = {
    from0To1?: boolean;
}
export class PseudoDirectionalConnection<T extends BaseNode> implements IBaseConnection<T>{
    
    node0:T;
    node1:T;
    data?: PseudoDirectionalData[];
    constructor(n0:T,n1:T,data?:PseudoDirectionalData[]){
        this.node0=n0;
        this.node1=n1;
        this.data=data;
    }
}

export class MultiGraphConnection implements IBaseConnection<BaseNode>{
    
    node0:BaseNode;
    node1:BaseNode;
    data?:any;
    constructor(n0:BaseNode,n1:BaseNode,data?:any){
        this.node0=n0;
        this.node1=n1;
        this.data=data;
    }
}
let graphCount = 0;
//directed but not multigraph
export abstract class BaseGraph<Node extends IBaseNode,Connection extends IBaseConnection<Node>> implements IBaseGraph<Node,Connection>{
    public nodes:{[name:string]:Node}={};
    public connections:{[v1:string]:{[v2:string]:Connection}}={};
    
    neighbours(id1:string):Node[]{
        let cons = this.connections;
        if(!(id1 in cons))return [];//maybe should throw error
        let res:Node[] = [];
        for(let v2 in cons[id1])res.push(this.nodes[v2]);
        return res;
    }
    connected(id1:string,id2:string):boolean{
        let cons = this.connections;
        if(!(id1 in cons))return false;//maybe should throw error
        return !!cons[id1][id2];
    }
    getConnection(id1:string,id2:string):Connection|null{
        let cons = this.connections;
        if(!(id1 in cons))return null;
        return cons[id1][id2];
    }

    deleteV(id1:string){
        let cons = this.connections;
        if(!(id1 in this.nodes))return;
        delete this.nodes[id1];
        delete cons[id1];
        for(let i in cons) {
            if(cons[i][id1]) {
                delete cons[i][id1];
            }
        }
    }
    addV(vertex:Node){
        this.nodes[vertex.identifier]=vertex;
    }
    
    connect(id1:string,id2:string,data?:any){
        if(!(id1 in this.nodes && id2 in this.nodes))return;
        this.connections[id2] = this.connections[id2] || {}
        this.connections[id1] = this.connections[id1] || {}
        this.connections[id1][id2]=this.createConnection(this.nodes[id1],this.nodes[id2],data);
        this.connections[id2][id1]=this.connections[id1][id2];
  
    }
    abstract createConnection(n0:Node,n1:Node,data?:any):Connection;
    disconnect(id1:string,id2:string){
        let cons = this.connections;
        if(!(id1 in cons && id2 in cons[id1]))return;
        delete this.connections[id1][id2];
        delete this.connections[id2][id1];
    }

    contrapt(id1:string,id2:string){
        let cons = this.connections;
        if(!(id1 in cons && id2 in cons[id1]))return;
        this.disconnect(id1,id2);
        this.disconnect(id2,id1);
        for(let i in cons[id2])this.connect(id1,i);
        this.deleteV(id2);
    }
    GED(other:IBaseGraph<Node,Connection>):number{
        return 0;
    }
}
export class Graph extends BaseGraph<BaseNode,BaseConnection>{
    createConnection(n0:BaseNode,n1:BaseNode,data?:any):BaseConnection{
        return new BaseConnection(n0,n1,data);
    }
};

