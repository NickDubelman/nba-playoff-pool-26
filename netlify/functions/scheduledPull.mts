export default async (req: Request) => {
  const url = process.env.URL

  // Make a POST request to the API /pullData endpoint

  // Include PULL_DATA_PASSWORD as a Authorization header
  const headers = { Authorization: process.env.PULL_DATA_PASSWORD || '' }

  const resp = await fetch(`${url}/pullData`, { headers, method: 'POST' })
  console.log(resp.status, resp.statusText)
}
