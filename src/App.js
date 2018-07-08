import React, { Component } from 'react'
import netlifyIdentity from 'netlify-identity-widget'
import logo from './logo.svg'
import './App.css'

const REDIRECT_URL = 'redirect_url'

export default class App extends Component {
  constructor() {
    super()
    // start identity
    netlifyIdentity.init()
  }
  componentDidMount() {
    const parsed = getParams()
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
      doLogin(redirect_url).then((data) => {
        console.log('done', data)
      })
      //window.location.href = `https://gated-sites-demo-login-site.netlify.com/.netlify/functions/handle-login?url=${redirect_url}`
    })
    netlifyIdentity.on("logout", () => {
      // reload page
      window.location.href = window.location.href
    })
  }
  handleLogIn = () => {
    // Open login
    netlifyIdentity.open()
  }
  handleLogOut = () => {
    netlifyIdentity.logout()
  }
  renderButton() {
    const user = netlifyIdentity.currentUser()
    if (!user) {
      return (
        <button onClick={this.handleLogIn}>
          Sign up or Log in
        </button>
      )
    }
    return (
      <button onClick={this.handleLogOut}>
        Log out { user.email }
      </button>
    )
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Login Site</h1>
        </header>
        <br />
        <div>
         {this.renderButton()}
       </div>
      </div>
    )
  }
}

function doLogin(redirect_url) {
  return generateHeaders().then((headers) => {
    return fetch('/.netlify/functions/handle-login', {
      method: "POST",
      headers,
      body: JSON.stringify({
        text: 'hi',
        url: redirect_url
      })
    })
    .then(response => {
      if (!response.ok) {
        return response.text().then(err => { throw(err) })
      }
      return response.json()
    })
    .catch((err) => console.log('err', err))
  });
}

function generateHeaders() {
  const headers = { "Content-Type": "application/json" };
  if (netlifyIdentity.currentUser()) {
    return netlifyIdentity.currentUser().jwt().then((token) => {
      return { ...headers, Authorization: `Bearer ${token}` };
    })
  }
  return Promise.resolve(headers);
}

function getParams(url) {
  const urlParams = {}
  const pattern = /([^&=]+)=?([^&]*)/g
  let params
  let matches
  if (url) {
    const p = url.match(/\?(.*)/) // query
    params = (p && p[1]) ? p[1].split('#')[0] : ''
  } else {
    params = window.location.search.substring(1)
  }
  if (!params) return false
  while (matches = pattern.exec(params)) { // eslint-disable-line
    if (matches[1].indexOf('[') == '-1') { // eslint-disable-line
      urlParams[decode(matches[1])] = decode(matches[2])
    } else {
      const b1 = matches[1].indexOf('[')
      const aN = matches[1].slice(b1 + 1, matches[1].indexOf(']', b1))
      const pN = decode(matches[1].slice(0, b1))

      if (typeof urlParams[pN] !== 'object') {
        urlParams[decode(pN)] = {}
        urlParams[decode(pN)].length = 0
      }

      if (aN) {
        urlParams[decode(pN)][decode(aN)] = decode(matches[2])
      } else {
        Array.prototype.push.call(urlParams[decode(pN)], decode(matches[2]))
      }
    }
  }
  return urlParams
}

function decode(s) {
  return decodeURIComponent(s).replace(/\+/g, ' ')
}
