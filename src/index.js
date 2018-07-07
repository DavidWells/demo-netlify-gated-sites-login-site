import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import './index.css'

console.log('document.referrer', document.referrer)

ReactDOM.render(<App />, document.getElementById('root'))
