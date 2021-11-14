export class State{
    handlers ={};
    on(events,handler){
        events.forEach(event => {
            this.handlers[event] = handler;
        });
    }
    pass(event,eventParams)
    {
        if(!this.handlers[event])return this;
        return this.handlers[event](eventParams)||this;
    }
}