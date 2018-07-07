import React, { Component } from 'react'
import logo from './logo.svg'
import netlifyIdentity from 'netlify-identity-widget'
import './App.css'

class App extends Component {
  constructor() {
    super()
    // start identity
    netlifyIdentity.init()
  }
  componentDidMount() {
     /* Register listeners on identity widget events */
    netlifyIdentity.on("login", (user) => {
      /* Close netlify identity modal on login */
      netlifyIdentity.close()
      console.log('login complete', user)
      // refresh page
      // window.location.href = window.location.href
    })
    netlifyIdentity.on("logout", () => {
      this.setState({ loggedIn: false })
      window.location.href = window.location.href
    })
  }
  handleLogIn = () => {
    // Open login
    netlifyIdentity.open()
  }
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Login Site</h1>
        </header>
        <div>
         <button onClick={this.handleLogIn}>
           Log in with netlify
         </button>
       </div>
      </div>
    )
  }
}

export default App
