# Keycloak OAuth Code Flow Demo

Demo application for demonstrating the exchange of an OAuth2 authorization code for actual tokens

# Getting started

- `npm install`
- copy `.env.template` to `.env`
- set all required values in `.env`:
  - `APP_PORT` defines the port where the Node app will run locally
  - `ALLOW_SELF_SIGNED_CERTS` defines whether the app will accept self-signed certificates for exchanging the authorization code for the tokens. If you want to allow this, set the value to `yes`.
  - `CORS_ORIGIN` will set the `Access-Control-Allow-Origin` header to this value. Set this value to the origin which sends you the authorization code.
  - `OAUTH_REDIRECT_PATH` sets the path the app will listen on for receiving that OAuth callback. You can set this to whatever you wish, common settings are `/oauth/redirect` or `oauth/callback`. Please note that this value must be included in the list of allowed redirect URIs in your Keycloak client configuration.
  - `OAUTH_REDIRECT_URI` sets the redirect URI property for the request that exchanges the authorization code for the tokens. Must be the same as in the original authorization request.
  - `KEYCLOAK_BASE_URL` sets the base URL for requests against Keycloak
  - `KEYCLOAK_REALM` defines the name of the realm for which the tokens should be requested
  - `KEYCLOAK_CLIENT_ID` sets the ID of the client for which the tokens should be requested
- start the app with `npm start`
