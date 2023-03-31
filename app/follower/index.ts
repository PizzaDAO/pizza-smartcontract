#!/usr/bin/env ts-node
import 'dotenv/config'
import { Command, Option } from 'commander'
import {
  ListenOptions,
  listenRequests,
  fetchRequests,
  renderRequests,
  RenderRequestOptions,
  FetchOptions,
  checkStatus,
  fulfullRequest,
  FulfillRequestOptions,
} from './commands'

//interface Program extends Command, Options {}

const program = new Command() // as Program;

const commonOptions = {
  url: new Option(
    '-u, --base-url <baseUrl>',
    'the base URL of the api to post request data to',
  ).default('http://localhost:8000'),
  apiVersion: new Option(
    '-a, --apiVersion <apiVersion>',
    'API version, to use when contructing URI to post request data to',
  ).default('v1'),
}

program
  .version('0.0.1', '-v --version', 'output the current version')
  .description(
    'A blockchain event processor which fetchs events in batches and saves ' +
    'relevant data to file, post saved data to an API, or run as a service ' +
    'to process events as they are emitted and post them to an API live.',
  )

program
  .command('fulfill')
  .description(
    'Fulfill a completed request',
  )
  .option(
    '-t, --tokenId [tokenId]',
    'single token id to be pushed to the API from the data directory rather than all tokens',
    parseInt,
  )
  .action(async (options: FulfillRequestOptions) => {
    console.log('Fulfilling request...')
    await fulfullRequest(options)
  })

program
  .command('listen', { isDefault: true })
  .description(
    'Listens for events from the blockchain, saves them to file,' +
    ' and posts them to the API',
  )
  .addOption(commonOptions.url)
  .addOption(commonOptions.apiVersion)
  .action(async (options: ListenOptions) => {
    console.log('Listening for events...')
    await listenRequests(options)
  })

program
  .command('render')
  .description(
    'Pushes data in the data directory to the API.' +
    ' Can push all data or a specific file.',
  )
  .addOption(commonOptions.url)
  .addOption(commonOptions.apiVersion)
  .option(
    '-t, --tokenId [tokenId]',
    'single token id to be pushed to the API from the data directory rather than all tokens',
    parseInt,
  )
  .action(async (options: RenderRequestOptions) => {
    console.log('Pushing data to API...')
    await renderRequests(options)
  })

program
  .command('status')
  .description('Checks the status of the order and updates it in the database.')
  .addOption(commonOptions.url)
  .addOption(commonOptions.apiVersion)
  .option(
    '-t, --tokenId [tokenId]',
    'single token id to be pushed to the API from the data directory rather than all tokens',
    parseInt,
  )
  .action(async (options: RenderRequestOptions) => {
    console.log('Checking order status...')
    await checkStatus(options)
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
