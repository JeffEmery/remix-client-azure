import { createRequestHandler } from 'remix-azure'

const handler = createRequestHandler({ build: require('../../build') })

export default handler
