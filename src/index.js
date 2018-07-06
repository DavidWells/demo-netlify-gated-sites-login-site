import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

console.log('document.referrer', document.referrer)

ReactDOM.render(<App />, document.getElementById('root'));
