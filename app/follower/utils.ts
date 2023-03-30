import fs from 'fs'
import path from 'path'
import { IOracleRequestData } from './types/IOracleRequestData'

export const dataDirectory = path.join(__dirname, 'data')
export const pendingDirectory = path.join(dataDirectory, 'pending')

export const saveRequest = (request: IOracleRequestData): void => {
  // Check if the data directory exists

  if (!fs.existsSync(pendingDirectory)) {
    fs.mkdirSync(pendingDirectory)
  }
  // Save the request to file
  console.log(`Saving request to file: ${request.token_id}.json`)
  const fileName = `${pendingDirectory}/${request.token_id}.json`
  fs.writeFileSync(fileName, JSON.stringify(request))
}

export const getPendingRequests = (
  tokenId: number | undefined,
): IOracleRequestData[] => {
  const requests: IOracleRequestData[] = []

  // parse the file or files in the pending directory
  if (typeof tokenId !== 'undefined') {
    const data = fs.readFileSync(`${pendingDirectory}/${tokenId}.json`, 'utf8')
    const request = JSON.parse(data)
    requests.push(request)
  } else {
    fs.readdirSync(`${pendingDirectory}`).map((file) => {
      const data = fs.readFileSync(`${pendingDirectory}/${file}`, 'utf8')
      const request = JSON.parse(data)
      requests.push(request)
    })
  }
  return requests
}
