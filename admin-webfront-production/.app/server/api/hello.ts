export default defineEventHandler((event) => {
  // get the query parameters from the event
  const query = getQuery(event)
  // extract the "from" query parameter
  const from = query.from || 'tairo'

  return `Hello ${from}!`
})
