import React from 'react';
import ReactDOM from 'react-dom';
import twgl from 'twgl.js';

import App from './containers/App';

twgl.setAttributePrefix('a_');

ReactDOM.render(<App />, document.getElementById('main'));
