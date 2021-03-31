import React from 'react';
import ReactDOM from 'react-dom';
import TouchEmulator from 'hammer-touchemulator';
import { RootComponent } from './root-component';
import '../../styles/base.scss';
import '../styles/base.scss';

TouchEmulator();

const container = document.getElementById('app');
container.innerHTML = '';
ReactDOM.render(React.createElement(RootComponent, {}), container);
