export interface IRenderTask {
  job_id: string
  request_token: string
  request: {
    id: string
    data: {
      bridge: string
      address: string
      token_id: number
      recipe_id: number
      requestor: string
    }
    meta: null
    responseURL: null
  }
  status: string
  timestamp: string
  random_number?: string
  metadata_hash?: string
  truncated_metadata?: string
  message?: string
}

export const exampleRenderTask: IRenderTask = {
  job_id: 'cd847e46-6d10-11ec-8b3e-0242ac120005',
  request_token: '',
  request: {
    id: 'cd847e46-6d10-11ec-8b3e-0242ac120005',
    data: {
      bridge: 'orderpizzav1',
      address: '0xC416a5c13EC95adDB74789a775e2FeF0605328AF',
      token_id: 581,
      recipe_id: 7,
      requestor: '0xbafa0ecd146c524bf4033b2ec04cb5774b08f75d',
    },
    meta: null,
    responseURL: null,
  },
  status: 'complete',
  timestamp: '2022-01-04T03:54:53.673052+00:00',
  random_number:
    'AD5C83ADB452637F2DF08A3FC251BBBC208EAD5AD1370147D41428E8255FA2B7',
  metadata_hash: 'QmZboep2VhUhfoXYxNAiGqxKeK4cERYG4J2RS3soQB6nWq',
  truncated_metadata:
    'a752616357d6edc433691cfebf1e98f69249f0d8662e03f2abb305ece37bdd5e',
  message: 'chainlink responseURL not specified',
}
