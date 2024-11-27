
const callBacks: {[key: string]: any[]} = {};

const uniqueIds: any[] = [];

const state: {[key: string]: any} = {};

const subscribe = <T>(stateName: string, callback: (newState: T)=>void, uniqueId?: string) => {
    if(!callBacks[stateName]) callBacks[stateName] = [];
    if(uniqueId)uniqueIds.push(uniqueId);
    callBacks[stateName].push(callback);
}

const updateState = <T>(stateName: string, value: T) => {
    state[stateName] = value;
    (callBacks[stateName] || []).forEach((call)=>call(value));
}

const getState = <T>(stateName: string): T =>{ 
    return state[stateName]; 
};

const unsubscribe = (stateName: string, callback: (newState: any)=>void, uniqueId?: string) =>{
    if(uniqueId)uniqueIds.filter((id)=>id!=uniqueId);
    callBacks[stateName] = callBacks[stateName].filter(call=>call !== callback);
}

export default {
    subscribe,
    updateState,
    unsubscribe,
    getState
}