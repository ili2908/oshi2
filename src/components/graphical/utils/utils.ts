export const getCentre = (circle: fabric.Circle): [number, number] => {
    let { tl, br } = circle.calcCoords();
    return [
        (tl.x + br.x) / 2,
        (tl.y + br.y) / 2
    ]

}

export class UndoOperations {
    public undoOperations: (()=>void)[] = []; 
    private cache: (()=>void)[] = []; 
    private isTx: boolean[] = [];
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
        if(this.isTx.length > 0) {
            this.cache.push(f)!
        } else {
            this.undoOperations.push(f)!
        }
    }
    public txOpen() {
        this.isTx.push(true);
    }
    public txClose() {
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
    empty(): boolean {
        return !this.undoOperations.length;
    }
}