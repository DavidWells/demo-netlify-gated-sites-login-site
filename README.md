# Login Site

This [site](https://gated-sites-demo-login-site.netlify.com/) gates multiple netlify sites via one login portal. AKA Single Sign On

> `TLDR;` You can use netlify functions + any identity provider (Auth0, Okta, Netlify identity etc) to gate as  many Netlify sites as they want!

The protected sites can only be access *after* logging in through the [Login Portal site]((https://gated-sites-demo-login-site.netlify.com/)).

## Login Portal

https://gated-sites-demo-login-site.netlify.com/

## Gated Sites

These are the sites that are protected

- [Site 1](https://gated-sites-demo-site1.netlify.com) [Repo](https://github.com/DavidWells/gated-sites-demo-site1)
- [Site 2](https://gated-sites-demo-site2.netlify.com) [Repo](https://github.com/DavidWells/gated-sites-demo-site2)


## How does it work?

We are using a combination of Netlify functions and Netlify `_redirects`.

See [the okta example for more info](https://github.com/DavidWells/netlify-gated-sites/tree/master/okta)


## Setting up Okta

// https://stackoverflow.com/questions/46333510/okta-sign-in-widget-mfa

// Then create API token https://dev-652264-admin.oktapreview.com/admin/access/api/tokens

// Then add netlify env vars
