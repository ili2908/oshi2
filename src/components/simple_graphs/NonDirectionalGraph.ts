import { BaseConnection, Graph } from "./BaseImplementations";

export class NonDirectionalGraph extends Graph{
    connect(id1:string,id2:string,data?:any){
        //[id1,id2] = this.sortIds(id1,id2);
        super.connect(id1,id2,data);
        this.connections[id2][id1]=this.connections[id1][id2];
        //this.inboundConnections[id1][id2]=this.connections[id1][id2];
    }
    disconnect(id1:string,id2:string){
        super.disconnect(id1,id2);
        delete this.connections[id2][id1];
        //delete this.inboundConnections[id1][id2]
    }
}