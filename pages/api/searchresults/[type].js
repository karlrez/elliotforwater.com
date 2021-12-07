import getBingApi from '../../../helpers/_httpExpress'
import { SEARCH_MAX_RESULTS } from '../../../appConfig'
import rateLimit from '../../../helpers/_rateLimit'

const limiter = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 500, // Max 500 users per second
})

function objectToStringParams(params) {
  const qs = Object.keys(params)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&')

  return qs
}

async function handler(req, res) {
  try {
    await limiter.check(res, 3, 'CACHE_TOKEN') // 10 requests per minute
    console.log('rate limit ok')

    const { type, query, adultContentFilter, pageIndex } = req.query
    const params = {
      q: query,
      safeSearch: adultContentFilter,
      count: SEARCH_MAX_RESULTS[type],
      offset: pageIndex || 0,
    }

    const fullQuery = objectToStringParams(params)
    const results = await getBingApi(type, fullQuery, req.headers)

    res.json(results)
  } catch {
    console.log('rate limit exceeded')
    res.status(429).json({ error: 'Rate limit exceeded' })
  }
}

export default handler
