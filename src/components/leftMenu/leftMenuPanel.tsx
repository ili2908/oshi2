import React from "react";
import { CurrentLeftMenus, LeftMenuConfig } from "../../core/pluginSDK/plugin.sdk.interface";
import LeftMenu from "./leftMenu";

export default class LeftPanelMenu extends React.Component<{
    leftMenuConfigs: LeftMenuConfig[],

}> {
    public constructor(props: {
        leftMenuConfigs: LeftMenuConfig[]
    }) {
        super(props);
        this.state = {
            selectedSubMenu: CurrentLeftMenus.basic,
        };
    }

    render() {
        const { leftMenuConfigs } = this.props;
        const { selectedSubMenu } = this.state as any;
        const submenuNames = leftMenuConfigs.map(({identifier})=>identifier);
        console.log(leftMenuConfigs)
    
        return(
            <div>
                <select onChange={(event)=>this.setState({selectedSubMenu: event.target.value})} value={selectedSubMenu || ''}>
                    <option value="" disabled>Select a Submenu</option>
                    {submenuNames.map((submenu, index) => (
                        <option key={index} value={submenu}>{submenu}</option>
                    ))}
                </select>
    
            {selectedSubMenu && <LeftMenu leftMenuConfig={leftMenuConfigs.find(({identifier})=>identifier === selectedSubMenu)!}/>}
            </div>
        );
      }


}