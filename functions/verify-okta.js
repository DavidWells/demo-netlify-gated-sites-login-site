import fetch from 'node-fetch'
// https://stackoverflow.com/questions/46333510/okta-sign-in-widget-mfa



exports.handler = (event, context, callback) => {
  const body = JSON.parse(event.body)

  console.log('Verify okta and set cookie')
  const baseURL = process.env.OKTA_BASE_URL

  const options = {
    'headers': {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `SSWS ${process.env.OKTA_API_TOKEN}`
    }
  }

  fetch(`${baseURL}/api/v1/sessions/${body.okta_id}`, options)
  .then(res => res.json())
  .then(data => {
    console.log('okta data', data)
    return callback(null, {
      statusCode: 200,
      body: JSON.stringify({
      	data: data
      })
    })
  })

  // do redirect & set cookie
  // return callback(null, {
  //   statusCode: 302,
  //   headers: {
  //     Location: process.env.URL,
  //     'Set-Cookie': myCookie,
  //     'Cache-Control': 'no-cache'
  //   }
  // })
}
