export interface IOracleRequestEventArgs {
  specId: string
  requester: string
  requestId: string
  payment: number
  callbackAddr: string
  callbackFunctionId: string
  cancelExpiration: number
  dataVersion: number
  data: string
}
