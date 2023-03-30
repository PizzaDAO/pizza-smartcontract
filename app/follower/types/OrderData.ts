export interface OrderData {
  id: string
  data: {
    address: string
    requestor: string
    token_id: number
    recipe_id: number
  }
}
