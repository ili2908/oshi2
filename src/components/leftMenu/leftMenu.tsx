import React from "react";
import { LeftMenuConfig } from "../../core/pluginSDK/plugin.sdk.interface";
import appState from "../../core/appState/appState";

export default class LeftMenu extends React.Component<{
    leftMenuConfig: LeftMenuConfig,
}>{
    constructor(props: {
        leftMenuConfig: LeftMenuConfig,
    }) {

        super(props);
        const state: {[key: string]: any} = {};
        props.leftMenuConfig.choices.forEach((choice)=>{
            state[choice.name] = choice.defaultValue;
            appState.updateState(choice.name, choice.defaultValue);
            appState.subscribe(choice.name, (newValue)=>this.setState({
                [choice.name]: newValue,
            }));
        }) 
        this.state = state;
    }



    render() {
      const { leftMenuConfig } = this.props;
      return(<>
        {
            leftMenuConfig.choices.map((choice, index)=>(
                <div style={{ display: 'flex', paddingRight: '5px'}}>
                    {
                        choice.input === 'checkbox' ?
                            <input type="checkbox" checked={(this.state as any)[choice.name]} onChange={(e)=>choice.callback(e.target.value)} /> : 
                        choice.input === 'slider' ? 
                            <input type="range" min={choice.inputParams!.min} max={choice.inputParams!.max} value={(this.state as any)[choice.name]} onChange={(e)=>choice.callback(e.target.value)} /> :
                        choice.input === 'color' ? 
                            <input type="color" value={(this.state as any)[choice.name]} onChange={(e)=>choice.callback(e.target.value)} /> :
                        ''
                    }
                    <label> {choice.name} </label>
                </div>
            ))
        }</>);
    }
}