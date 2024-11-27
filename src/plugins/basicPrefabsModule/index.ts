import { GraphSdk } from "../../core/pluginSDK/plugin.sdk.interface";

let sdk: GraphSdk;



export const getSdk = () => sdk;
export const init = (_sdk: GraphSdk) => {

    sdk = _sdk
};