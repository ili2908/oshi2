export class UndoOperations {
    public undoOperations: (()=>void)[] = []; 
    private cache: (()=>void)[] = []; 
    private isTx: boolean[] = [];
    private exclusionOpened = false;

    public pop(): (()=>void) {
       
        if(this.isTx.length > 0) { 
            const res = this.cache.pop()!
            return res;
        } else {
            const res =  this.undoOperations.pop()!
            return res;
        }
    }
    public push(f:()=>void) {
        if(this.exclusionOpened){
            return;
        }else if(this.isTx.length > 0) {
            this.cache.push(f)!
        } else {
            this.undoOperations.push(f)!
        }
    }
    public openTransaction() {
        this.isTx.push(true);
    }
    public closeTransaction() {
        this.isTx.pop();
        if(this.isTx.length !== 0 ) {
            return;
        }
        const funcs = [...this.cache];
        if(funcs.length) {
            this.undoOperations.push(()=>{
                funcs.reverse().forEach((f=>{
                    f();
                }))
            })
        }
        this.cache = []; 
    }
    public openExclusion() {
        this.exclusionOpened = true;
    }
    public closeExclusion() {
        this.exclusionOpened = false;
    }
    empty(): boolean {
        return !this.undoOperations.length;
    }
}