import React, { Component } from 'react'
import queryString from 'query-string'
import netlifyIdentity from 'netlify-identity-widget'
import logo from './logo.svg'
import './App.css'

const REDIRECT_URL = 'redirect_url'

class App extends Component {
  constructor() {
    super()
    // start identity
    netlifyIdentity.init()
  }
  componentDidMount() {
    const parsed = queryString.parse(location.search)
    // Set redirect URL
    if (parsed.site) {
      localStorage.setItem(REDIRECT_URL, parsed.site)
    }
     /* Register listeners on identity widget events */
    netlifyIdentity.on("login", (user) => {
      /* Close netlify identity modal on login */
      netlifyIdentity.close()
      console.log('login complete', user)
      // refresh page
      const redirect_url = localStorage.getItem(REDIRECT_URL)
      console.log('Redirect', redirect_url)
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
