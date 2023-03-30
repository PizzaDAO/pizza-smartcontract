#!/usr/bin/env ts-node
import 'dotenv/config'
import { Command } from 'commander'
import {
  ListenOptions,
  listenRequests,
  fetchRequests,
  FetchOptions,
  renderRequests,
} from './commands'
import { RenderRequestOptions } from './types'

//interface Program extends Command, Options {}

const program = new Command() // as Program;

program
  .version('0.0.1', '-v --version', 'output the current version')
  .description(
    'A blockchain event processor which fetchs events in batches and saves ' +
      'relevant data to file, post saved data to an API, or run as a service ' +
      'to process events as they are emitted and post them to an API live.',
  )

program
  .command('listen', { isDefault: true })
  .description(
    'Listens for events from the blockchain, saves them to file,' +
      ' and posts them to the API',
  )
  .action((options: ListenOptions) => {
    console.log('Listening for events...')
    listenRequests(options)
  })

program
  .command('render')
  .description(
    'Pushes data in the data directory to the API.' +
      ' Can push all data or a specific file.',
  )
  .option(
    '-u, --url [url]',
    'URL of the api to post request data to',
    'http://localhost:8000',
  )
  .option(
    '-a, --apiVersion <apiVersion>',
    'API version, to use when contructing URI to post request data to',
    'v1',
  )
  .action(async (options: RenderRequestOptions) => {
    console.log('Pushing data to API...')
    await renderRequests(options)
  })

program
  .command('fetch')
  .description(
    'Fetches data from the API and saves it to the data directory. ' +
      'Can fetch from a specified block number or a high-water mark block ' +
      'specified in the fromBlock.json file.',
  )
  .option(
    '-f, --file [file]',
    'fromBlock value to be used, supplied by a file for persistance',
    'fromBlock.json',
  )
  .option(
    '-b, --block [block]',
    'fromBlock value if latestBlock.json not found, otherwise zero if neither value is provided',
    '0',
  )
  .action(async (options: FetchOptions) => {
    console.log('Fetching data from blockchain...')
    await fetchRequests(options)
  })

program.parse()
