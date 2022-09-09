import type { EntryContext, HandleDataRequestFunction } from '@remix-run/node'
import { RemixServer } from '@remix-run/react'
import { renderToString } from 'react-dom/server'

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  let markup = renderToString(
    <RemixServer context={remixContext} url={request.url} />
  )

  responseHeaders.set('Content-Type', 'text/html')
  responseHeaders.set('x-env-app', 'value')

  return new Response('<!DOCTYPE html>' + markup, {
    status: responseStatusCode,
    headers: responseHeaders,
  })
}

// this is an optional export
export const handleDataRequest: HandleDataRequestFunction = (
  response: Response,
  // same args that get passed to the action or loader that was called
  { request, params, context }
) => {
  response.headers.set('x-env-data', 'value')
  return response
}
