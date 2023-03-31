// The decoded oracle request data structure

export interface IOracleRequestData {
  address: string
  blockNumber: number
  requestor: string
  requestId: string
  token_id: number
  recipe_id: number
}
