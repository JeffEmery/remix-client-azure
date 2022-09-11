# Welcome to Remix on Azure Static Web Apps

## General Setup

This project uses
[Azure Static Web Apps](https://docs.microsoft.com/en-us/azure/static-web-apps/)
and the
[Azure Function API](https://docs.microsoft.com/en-us/azure/static-web-apps/apis-functions)
to host the
[Remix Server Adapter](https://remix.run/docs/en/v1/other-api/adapter) that
handles server requests and responses. The Azure Function is implemented with
the
[Remix Server Adapter for Azure Functions](https://www.npmjs.com/package/remix-azure)
package which maps the Azure Function to the browser's
[Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API).

## Overview

The server code in `./api/request-handler/index.ts` imports the
[Remix Server Adapter for Azure Functions](https://www.npmjs.com/package/remix-azure)
and exports the `handler` that is built by _requiring_ the Remix Application
server code compiled into `./api/build`.

## Building the Remix Server for the Azure Function

The server needs the application route information, the Remix server code and
the server adapter package. These pieces create the server function that respond
to client route and data requests. The Remix Server code is built to be deployed
into the Azure Function API. The `./api` folder contains configuration data to
build the Azure Function independently of the Remix application.

### Build the Remix server code

The first step in preparing the server is to build the Remix App so the route
information and server code can be made available to the server function.

`/package.json` defines the script to build the Remix application.

```json
  "scripts": {
    "build:app": "remix build",
  },
```

Remix uses `/remix.config.js` to set the location of the server code to
`./api/build/index.js`.

```js
module.exports = {
  serverBuildPath: 'api/build/index.js',
}
```

### Build the Remix Server Azure Function

The next step is to build the Remix Server Azure Function. The `./api` folder
contains the source and configuration to build and deploy the Azure Function.
The `./api/package.json` file defines the build packages and script.

```json
  "scripts": {
    "build:api": "tsc",
  },
  "dependencies": {
    "@remix-run/node": "^1.5.1",
    "@remix-run/react": "^1.5.1",
    "@remix-run/serve": "^1.5.1",
    "remix-azure": "^0.0.1-alpha.1"
  },
```

`api/request-handler/index.ts` is the source for the Remix Server Azure
Function. The Remix application code from `./api/build/index.js` is _required_
into the Remix Server handler. The Remix Server handler is provided by
[Remix Server Adapter for Azure Functions](https://www.npmjs.com/package/remix-azure).
The `tsconfig.json` file sets the output directory to `./api/dist`.

```json
  "compilerOptions": {
    "module": "commonjs",
    "target": "es6",
    "outDir": "dist",
    "rootDir": ".",
    "sourceMap": true,
    "strict": false,
    "esModuleInterop": true
  }

```

The `./api/request-handler/function.json` file configures the Azure Function
runtime and entry point, When deployed, Azure looks for folders with a
`function.json` file and uses it to publish the function. The `scriptFile`
property defines the function entry point `../dist/request-handler/index.js`.

```json
{
  "bindings": [
    {
      "authLevel": "anonymous",
      "type": "httpTrigger",
      "direction": "in",
      "name": "req",
      "methods": ["get", "post"]
    },
    {
      "type": "http",
      "direction": "out",
      "name": "$return"
    }
  ],
  "scriptFile": "../dist/request-handler/index.js"
}
```

## Routing

Azure Static Web Apps handle routes by rewriting URLs to the Azure Function API.
Static assets have a route defined in `./public/staticwebapp.config.json`. A
wildcard route maps the rest of the application routes through the Azure
Function API.

```json
  "routes": [
    {
      "route": "/favicon.ico"
    },
    {
      "route": "/build/*"
    },
    {
      "route": "/*",
      "rewrite": "/api/request-handler"
    }
  ]
```

## Static Web App CLI

The [Azure Static Web App CLI](https://azure.github.io/static-web-apps-cli/)
allows the developer to build and debug the application locally with an
emulator. `/swa-cli.config.json` configures the SWA CLI commands for building
and running the emulator.

```json
{
  "$schema": "https://aka.ms/azure/static-web-apps-cli/schema",
  "configurations": {
    "remix-client-azure": {
      "appName": "remix-client",
      "appLocation": ".",
      "appBuildCommand": "npm run build:app",
      "appDevserverUrl": "http://localhost:3000",
      "outputLocation": "public\\build",

      "apiLocation": "api",
      "apiBuildCommand": "npm run build:api --if-present",

      "run": "npm run dev",

      "resourceGroupName": "remix-app-rg",
      "env": "preview"
    }
  }
}
```

### swa build

Running `swa build` performs the build steps defined in `/swa-cli.config.json`.
The first step [builds the Remix application](#build-the-remix-server-code) with
`npm run build:app` defined by `appBuildCommand`. Static assets are built into
`./public/build`. Server components are built into `./api/build/index.js`. The
second step
[builds the Azure Function API](#build-the-remix-server-azure-function) from the
`./api` directory with `npm run build:api`.

### swa start

Running `swa start` runs the application in an Azure SWA emulator using the
configuration from `/swa-cli.config.json`. The Remix dev environment is started
with `npm run dev` defined by `run`. The emulator proxies to the Remix dev
server set with `appDevserverUrl`. This lets the developer
[use the Remix framework](https://azure.github.io/static-web-apps-cli/docs/cli/swa-start#serve-from-a-dev-server)
for things like 'live reload' and HMR. Azure Function definitions found in
`apiLocation` are started to serve API requests.

```console
$ swa build

Welcome to Azure Static Web Apps CLI (1.0.2)

Using configuration "remix-client-azure" from file:
  C:\code\github\remix-client-azure\swa-cli.config.json

[api] Azure Functions Core Tools
[api] Core Tools Version:       4.0.4736 Commit hash: N/A  (64-bit)
[api] Function Runtime Version: 4.8.1.18957
[run]
[run] > remix-client-azure@0.0.1-alpha.0 dev
[run] > remix dev
[api]
[api] Functions:
[api]
[api]   request-handler: [GET,POST] http://localhost:7071/api/request-handler
[api]
[api] For detailed output, run func with --verbose flag.
[swa]
[swa] Found configuration file:
[swa]   C:\code\github\remix-client-azure\staticwebapp.config.json
[swa]
[swa] - Waiting for http://localhost:3000 to be ready
[api] [2022-09-09T20:04:32.221Z] Worker process started and initialized.
[run] Loading environment variables from .env
[run] Watching Remix app in development mode...
[run] 💿 Built in 626ms
[run] Remix App Server started at http://localhost:3000 (http://192.168.86.193:3000)
[swa] ✔ Connected to http://localhost:3000 successfully
[swa]
[swa] Using dev server for static content:
[swa]   http://localhost:3000
[swa]
[swa] Serving API:
[swa]   C:\code\github\remix-client-azure\api
[swa]
[swa] Azure Static Web Apps emulator started at http://localhost:4280.
```

View the Remix application running in the Azure Static Web Apps emulator from
http://localhost:4280.

## References

The
[Remix Server Adapter for Azure Functions package](https://www.npmjs.com/package/remix-azure)
provides a handler to deploy the Remix server functions to Azure Functions on
the Node runtime.

[Understanding Remix Server Adapters](https://remix.run/docs/en/v1/other-api/adapter)
and how
[Remix runs on the server](https://remix.run/docs/en/v1/pages/technical-explanation#http-handler-and-adapters)
(The Remix team does not intend to maintain their own Azure Functions adapter.)

[Azure Functions](https://docs.microsoft.com/en-us/azure/azure-functions/functions-reference-node)
provides the Node server environment to handle route and data requests and
responses.

The [Static Web Apps CLI](https://azure.github.io/static-web-apps-cli/) for
development.

## _~fin~_
