// AddTabForm.js
import React from 'react';
// AddTabForm.js
import appState from '../../core/appState/appState';

import './addPlugin.css';
import { GraphSdk, PluginConfig } from '../../core/pluginSDK/plugin.sdk.interface';
import { PluginSdk } from '../../core/pluginSDK/plugin.sdk';
class AddPluginForm extends React.Component<{}> {
  constructor(props: {}) {
    super(props);
    this.state = {
      newPlugin: '',
    };
  }

  handleAddTab = async () => {
    const { newPlugin } = this.state as any;
    console.log(newPlugin);
    const plugin: PluginConfig = (await import(/* webpackIgnore: true */newPlugin)).default;
    plugin.init(PluginSdk.getSdk());
    
    appState.updateState('plugins', [plugin, ...appState.getState<any[]>('plugins')]);
    
    this.setState({ newPlugin: '' });
  };

  render() {
    const { newPlugin } = this.state as any;

    return (
      <div className="add-plugin-form">
        <input
          type="text"
          placeholder="Enter plugin url to add"
          value={newPlugin}
          onChange={(e) => this.setState({ newPlugin: e.target.value })}
        />
        <button onClick={this.handleAddTab}>Add</button>
      </div>
    );
  }
}

export default AddPluginForm;
