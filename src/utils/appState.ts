

let _drawMode = false;
let _arrowsEnabled = true;
let _autoLabeling = true;
let _setArrowsEnabled: (bool: boolean) =>void;
let _setAutoLabeling: (bool: boolean) =>void;
let _setDrawMode: (bool: boolean) =>void;
let canvas;
const initialize = (setArrowsEnabled: any, setAutoLabeling: any, setDrawMode: any) => {
    _setArrowsEnabled = setArrowsEnabled;
    _setAutoLabeling = setAutoLabeling;
    _setDrawMode = setDrawMode;
}

const setArrowsEnabled = (__arrowsEnabled: boolean)=>{ 
    _arrowsEnabled = __arrowsEnabled;
    _setArrowsEnabled(_arrowsEnabled);

} 
const setAutoLabeling = (__autoLabeling: boolean)=>{ 
    _autoLabeling = __autoLabeling;
    _setAutoLabeling(__autoLabeling);

} 
const setDrawMode = (drawMode: boolean)=>{ 
    _drawMode = drawMode;
    _setDrawMode(drawMode);

} 
const drawMode = () => {
    return _drawMode;
}

const arrowsEnabled = ()=> {
    return _arrowsEnabled;
}
const autoLabeling = ()=> {
    return _autoLabeling;
}
export default {
    initialize,
    setArrowsEnabled,
    arrowsEnabled,
    setAutoLabeling,
    setDrawMode,
    drawMode,
    autoLabeling,
}