import { init } from "./index";
import { PluginConfig } from "../../core/pluginSDK/plugin.sdk.interface";
import { rightMenuConfig } from "./rightMenuConfig";
import { leftMenuConfig } from "./leftMenuConfig";
import { rightClickMenuConfig } from "./rightClickMenuConfig";

export default {
    pluginName: "Basic Algorithms",
    pluginVersion: "0.5.0",
    rightPanels: [rightMenuConfig],
    leftPanels: [leftMenuConfig],
    rightClickPanels: [rightClickMenuConfig],
    init
    
} as PluginConfig;