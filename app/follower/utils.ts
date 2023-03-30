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

export const getFromBlock = (file: string, block: number): number => {
  console.log(`Fetching requests from block ${block} onwards...`)
  // Get the fromBlock value from the file or command line
  // Will default to 0 if neither are provided
  let fromBlock: number

  // Tries to set the fromBlock value from the provided file option
  // If the file option is not provided, it will use the block option
  // If the block option is not provided, it will default to 0
  if (file) {
    try {
      const data = JSON.parse(
        fs.readFileSync(`${dataDirectory}/${file}`, 'utf8'),
      ).fromBlock
      fromBlock = parseInt(data)

      console.log(`fromBlock value: ${fromBlock}
      retrieved from file: ${file}`)
    } catch (error) {
      console.log(
        `Error reading fromBlock file: ${error} - using fromBlock value from command line or defaulting to 0 if not provided`,
      )
      fromBlock = block
      console.log(`fromBlock value used: ${fromBlock}`)
    }
  } else {
    fromBlock = block
    console.log(`fromBlock value used: ${fromBlock}`)
  }
  return fromBlock
}
