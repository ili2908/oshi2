export class State{
    handlers ={};
    static handlers = {};
    constructor(name) {
        this.name = name;
    }
    on(events,handler){
        events.forEach(event => {
            this.handlers[event] = handler;
        });
    }
    pass(event,eventParams)
    {
        if(!this.handlers[event]){
            if(!State.handlers[event]) {
                return this;
            }else {
                return State.handlers[event](eventParams)||this;
            }
            
        }
        const result = this.handlers[event](eventParams);
        return result||this;
    }
    static on(events,handler) {
        events.forEach(event => {
            State.handlers[event] = handler;
        });
    }
}