import { Contract, providers, Signer, utils, BigNumber } from "ethers"
//import WalletConnectProvider from "@walletconnect/web3-provider";
import { abi } from '../artifacts/contracts/token/RarePizzas.sol/RarePizzas.json';

declare var document: any;
declare var navigator: any;
declare var window: any;

// Addresses for the pizza contract
const rinkebyAddress = '0x1E01E8AfDA51C980650b66a71Ca3Bc981FF10eA7'
const mainnetAddress = '0xA4d5fB4Ff0Fa1565fb7D8f5Db88E4c0f2f445046'

const defaultGasLimit: number = 210000

type TokenSupply = {
    existingBoxes: number
    existingPizzas: number
    totalBoxes: number
    totalPizzas: number
}

type UserBalance = {
    boxTokenCount: number
    pizzaTokenCount: number
}

type BoxToken = {
    id: number,
    isRedeemed: boolean
}

type AppContext = {
    app: {
        countTotal: TokenSupply,
        price: number,
        btcPrice: number,
        ethPrice: number,
        boxSaleIsActive: boolean,
        pizzaSaleIsActive: boolean
        statusMessage: string,
        remaining: Function
    }
    contract: Contract | undefined,
    provider: providers.Web3Provider | undefined
    user: {
        balance: UserBalance, // should name refactor to boxTokenBalance?
        boxTokens: BoxToken[],
        pizzaTokens: number[]
    }
    wallet: {
        address: string | undefined
        contract: Contract | undefined,
        signer: Signer | undefined;
    }
}

let state: AppContext = {
    app: {
        price: 0,
        btcPrice: 0,
        ethPrice: 0,
        boxSaleIsActive: true,
        pizzaSaleIsActive: false,
        statusMessage: "",
        countTotal: {
            existingBoxes: 0,
            existingPizzas: 0,
            totalBoxes: 0,
            totalPizzas: 0
        },
        remaining: () => (state.app.countTotal.totalBoxes - state.app.countTotal.existingBoxes),
    },
    contract: undefined,
    provider: undefined,
    user: {
        balance: {
            boxTokenCount: 0,
            pizzaTokenCount: 0
        },
        boxTokens: [],
        pizzaTokens:[]
    },
    wallet: {
        address: undefined,
        contract: undefined,
        signer: undefined
    }
}

// Document Accessors

const DOM = {
    buttons: {
        connect: document.querySelector('#walletButton'),
        buy: document.querySelector('#buyButton'),
        redeem: document.querySelector('#redeem'),
        checkBoxIsRedeemed: document.querySelector('#checkBoxIsRedeemed'),
    },
    contract: {
        address: document.querySelector('#contractLabel'),
    },
    labels: {
        dappHeader: document.querySelector('#app-header'),
        connectLabel: document.querySelector('#connect-button-label'),
        remaining: document.querySelector('#amountAvail'),
        quantityLabel: document.querySelector('#quantity-subheader'),
        errorLabel: document.querySelector('#errorText'),
        buyLabel: document.querySelector('#mint-button-header'),
        // TODO: more labels
    },
    selectors: {
        quantity: document.querySelector('#frogQuantity'),
    },
    refreshState: (context: AppContext) => {
        console.log("refresh state")

        // Header
        if (context.app.pizzaSaleIsActive) {
            DOM.labels.dappHeader.innerHTML = "Redeem Pizza"
        }  else {
            DOM.labels.dappHeader.innerHTML = "Pizza redemption coming soon!"
        }
        
        // connect button
        if (context.wallet.address && context.wallet.contract) {
            const rhs = context.wallet.address.length - 4
            DOM.labels.connectLabel.innerHTML = `${context.wallet.address.substr(0, 5)}...${context.wallet.address.substr(rhs, 4)}`
            DOM.buttons.connect.innerHTML = "CONNECTED"
           
        } else {
            DOM.labels.connectLabel.innerHTML = "Connect Wallet:"
            DOM.buttons.connect.innerHTML = "CONNECT"
            
        }

        // availability
        //
        // is this available boxes or pizzas to mint?
        //
        if (context.app.countTotal.totalBoxes === 0) {
            DOM.labels.remaining.innerHTML = "????"
        } else {
            const remaining = context.app.countTotal.totalBoxes - context.app.countTotal.existingBoxes
            // accounting for the admin holdover
            // TODO: this may not be completetly accurate
            // since we may mint some throughout the period.
            if (remaining <= 1) {
                DOM.labels.remaining.innerHTML = `0`
            } else {
                DOM.labels.remaining.innerHTML = `${remaining}`
            }
            
        }

        // // Pizzas redeemed
        // // add data about pizzaredemptions

        // // quantity
        // if (context.app.pizzaSaleIsActive) {
        //     DOM.labels.quantityLabel.innerHTML = "Max Quantity: 20"
        // } else {
        //     DOM.labels.quantityLabel.innerHTML = "Sale is not Active"
        // }

        // error
        if (context.app.statusMessage != "") {
            DOM.labels.errorLabel.innerHTML = context.app.statusMessage
        } else {
            DOM.labels.errorLabel.innerHTML = ""
        }

        // buy button
        if (context.wallet.address && context.wallet.contract) {
            DOM.buttons.buy.disabled = false
        } else {
            DOM.buttons.buy.disabled = true
        }

        // contract
        if (context.contract === undefined) {
            console.log("refresh no contract")
            DOM.contract.address.innerHTML = "Not Connected"
        } else {
            DOM.contract.address.textContent = context.contract.address
        }
    }
}

// functions

const helpers = {
    sleep: (ms: number) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
}

const actions = {
    app: {
        isSaleActive: async () => {
            if (!actions.contract.isConnected()) {
                return false
            }

            try {
                return await state.contract?.isSaleActive()
            } catch (error) {
                console.log(error)
                state.app.statusMessage = error
                DOM.refreshState(state)
                return false
            }
        },
        isRedeemed: async (tokenId: number) => {
            if (!actions.contract.isConnected()) {
                return false
            }

            try {
                return await state.contract?.isRedeemed(tokenId)
            } catch (error) {
                console.log(error)
                state.app.statusMessage = error
                DOM.refreshState(state)
                return false
            }
        },
        addressOfRedeemer: async (tokenId: number) => {
            if (!actions.contract.isConnected()) {
                return "0x00"
            }

            try {
                return await state.contract?.addressOfRedeemer(tokenId)
            } catch (error) {
                console.log(error)
                state.app.statusMessage = error
                DOM.refreshState(state)
                return false
            }
        },

        purchase: async () => {
            if (!actions.contract.isConnected()) {
                return
            }

            console.log(`purchase: purchase box`)
            const price = await state.contract?.getPrice()
            state.app.price = price

            const quantity = 1;//DOM

            const amount = price.mul(quantity)
            const gasLimit = defaultGasLimit * quantity

            await state.wallet.contract?.purchase({ value: amount, gasLimit: gasLimit })
            await actions.contract.refreshContract()
        },

        
    },
    contract: {
        isConnected: () => {
            const contract = state.contract
            if (contract === undefined) {
                console.log('contract: contract not connected')
                return false
            }
            return true
        },
        connect: async () => {
            if (state.provider === undefined) {
                console.log('contract: provider not connected')
                return
            }

            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            console.log(`chainId: ${chainId}`)

            const contractAddress = chainId === '0x4' ? rinkebyAddress : mainnetAddress
            console.log(`contract connect: ${contractAddress}`)
            const contract = new Contract(contractAddress, abi, state.provider)
            state.contract = contract

            actions.events.subscribeContractEvents();
            actions.events.subscribeTokenEvents() 
        },
        refreshContract: async () => {
            if (!actions.contract.isConnected()) {
                return
            }
            console.log("refreshContract")
            await actions.contract.refreshPrice()
            await actions.contract.refreshSaleState()
            await actions.contract.refreshSupply()
            await actions.user.refreshUserBalance()
            DOM.refreshState(state)
        },
        refreshPrice: async () => {
            if (!actions.contract.isConnected()) {
                BigNumber.from(state.app.price)
            }
            
            const price = await state.contract?.price()
            state.app.price = price
            console.log(`refreshPrice: ${price}`)
            DOM.refreshState(state)
            return BigNumber.from(state.app.price)
        },
        refreshSaleState: async () => {
            if (!actions.contract.isConnected()) {
                return
            }
            // TODO: pizza sale state (??)
            const presaleActive = await state.contract?.presaleIsActive()
            state.app.boxSaleIsActive = presaleActive

            const saleActive = await state.contract?.saleIsActive()
            state.app.pizzaSaleIsActive = saleActive

            console.log(`refreshSaleState: presaleIsActive ${presaleActive} saleActive ${saleActive}`)
            DOM.refreshState(state)
        },
        refreshSupply: async () => {
            if (!actions.contract.isConnected()) {
                return
            }
            console.log("refresh supply")
            //const maxMintableSupply = await state.contract?.maxMintableSupply()
            //const maxAdminSupply = await state.contract?.maxAdminSupply()
            const maxSupply = await state.contract?.maxSupply()
            const boxTotalSupply = await state.contract?.boxTotalSupply()
            console.log(`maxSupply: ${maxSupply} boxTotalSupply: ${boxTotalSupply}`)
            const existingBoxes = await state.contract?
            // what are the semantics here?
            // state.app.countTotal looks like four numbers
            // { existingBoxes, existingPizzas, totalBoxes, totalPizzas }
            // state.app.countTotal is also a TokenSupply type which is
            // type TokenSupply = {
            // existingBoxes: number
            // exisitingPizzas: number
            // totalBoxes: number
            // totalPizzas: number
            // }
            // how do these reconcile??
            state.app.countTotal = {
                //maxMintableSupply: maxMintableSupply,
                //maxAdminSupply: maxAdminSupply,
                existingBoxes: 0,
                existingPizzas: 0,
                totalBoxes: boxTotalSupply,
                totalPizzas: 0
            }

            //not sure what's wrong here
            DOM.refreshState(state)
        },
        
    },
    events: {
        handlers: {
            accountsChanged: async (accounts: string[]) => {
                console.log("accounts changed")
                console.log(accounts);
                if (accounts.length === 0) {
                    await actions.wallet.resetWallet()
                    await actions.user.resetBalances()
                } else if (accounts[0] !== state.wallet.address) {
                    await actions.wallet.connect()
                }
                await actions.contract.refreshContract()
            },
            accountsDisconnect: async (code: number, reason: string) => {
                console.log("disconnect")
                console.log(code, reason);
                await actions.wallet.resetWallet()
                await actions.user.resetBalances()
            },
            chainChanged: (chainId: number) => {
                console.log(`chain changed: chainId: ${chainId}`);
                window.location.reload();
            },
            tokenTransferred: async (operator: string, from: string, to: string, id: number, value: number) => {
                console.log('on transfer');
                await actions.contract.refreshContract()
            }
        },
        onLoad: async () => {
            await actions.provider.load()
            actions.events.subscribeWalletEvents()
            await actions.contract.connect()
            await actions.user.refreshAccounts()
            await actions.contract.refreshContract()
        },
        subscribeContractEvents: () => {
            // TODO: sale active and other events
            state.contract?.on('SaleActive', actions.contract.refreshContract)
            state.contract?.on('PresaleActive', actions.contract.refreshContract)
            state.contract?.on('PresaleLimitChanged', actions.contract.refreshContract)
        },
        subscribeTokenEvents: () => {
            state.contract?.on('Transfer', actions.events.handlers.tokenTransferred)
        },
        subscribeWalletEvents: () => {
            window.ethereum.on("accountsChanged", actions.events.handlers.accountsChanged)
            window.ethereum.on("chainChanged", actions.events.handlers.chainChanged)
            window.ethereum.on("disconnect", actions.events.handlers.accountsDisconnect)
        },
        unsubscribeTokenEvents: () => {
            state.contract?.off('Transfer', actions.events.handlers.tokenTransferred)
        }
    },
    provider: {
        hasEthereum: () => {
            return window.ethereum !== undefined
        },
        load: async () => {
            const tries = 3
            let run = 0
            while (!actions.provider.hasEthereum() && run <= tries) {
                await helpers.sleep(1000)
                run++
            }

            if (!actions.provider.hasEthereum()) {
                console.log("provider: could not load ethereum")
                return
            }

            console.log('ethereum connected')

            const provider = new providers.Web3Provider(window.ethereum);
            state.provider = provider
        }
    },
    user: {
        refreshAccounts: async () => {
            try {
                console.log('refresh accounts')
                const accounts = await window.ethereum.request({ method: 'eth_accounts' })
                await actions.events.handlers.accountsChanged(accounts)
            } catch (error) {
                console.error(error)
            }
        },
        refreshUserBalance: async () => {
            if (!actions.wallet.isConnected()) {
                return
            }
            console.log("refresh balance")
            // seems we only have boxTokenBalance available
            // I don't know if this 'balance' is a count of tokens or some other measure
            // The contract code says 'Get the box balance of a user' — is that a $ value or a cardinal value?
            const boxTokenBalance = await state.wallet.contract?.boxBalanceOf(state.wallet.address)
            console.log(`boxTokenBalance: ${boxTokenBalance}`)
            // ???
            state.user.balance = {
                boxTokenCount: boxTokenBalance,
                pizzaTokenCount: 0
                //tokenCount: token_balance,
            }
            DOM.refreshState(state)
        },
        resetBalances: async () => {
            state.user.balance = {
                boxTokenCount: 0,
                pizzaTokenCount: 0
            }
            await actions.contract.refreshContract()
        }
    },
    wallet: {
        isConnected: () => {
            const contract = state.wallet.contract
            if (contract === undefined) {
                console.log('wallet: user not connected')
                return false
            }

            const address = state.wallet.address
            if (address === undefined) {
                console.log('wallet: user address not defined')
                return false
            }
            return true
        },
        getAddress: () => {
            const address = state.wallet.address
            if (address === undefined) {
                throw "wallet: address undefined"
            }
            return address
        },
        connect: async () => {
            if (state.provider === undefined) {
                console.log('provider not connected')
                return
            }
            console.log('connect wallet')
            const signer = state.provider.getSigner();
            const contract = state.contract?.connect(signer)
            const address = await signer.getAddress()

            console.log(`connected to ${address}`)

            state.wallet = {
                address: address,
                contract: contract,
                signer: signer
            }
            DOM.refreshState(state)
            await actions.contract.refreshContract()
        },
        requestAccess: async () => {
            if (!actions.provider.hasEthereum()) {
                console.log("wallet: could not requestAccess no ethereum")
                return
            }
            try {
                console.log("user requested access")
                await window.ethereum.request({ method: 'eth_requestAccounts' })
                await actions.wallet.connect()
            } catch (error) {
                console.log("user rejected access")
                console.log(error)
            }
        },
        resetWallet: async () => {
            state.wallet.address = undefined
            state.wallet.contract = undefined
            state.wallet.signer = undefined
            await actions.contract.refreshContract()
        }
    },
}

// events

DOM.contract.address.addEventListener('click', async () => {
    state.app.statusMessage = ""
    DOM.refreshState(state)

    if (state.contract !== undefined) {
        const contract = state.contract?.address
        const subdomain = contract === rinkebyAddress ? "rinkeby" : "www"
        window.open(`https://${subdomain}.etherscan.io/address/${contract}`, "_blank");
    }
})

DOM.buttons.connect.addEventListener('click', async () => {
    state.app.statusMessage = ""
    DOM.refreshState(state)

    if (actions.wallet.isConnected()) {
        // TODO: do nothing? or disconnect?
        console.log("already connected")
    } else {
        console.log("requesting access")
        actions.wallet.requestAccess()
    }
})

DOM.buttons.buy.addEventListener('click', async () => {
    state.app.statusMessage = ""
    DOM.refreshState(state)

    if (actions.wallet.isConnected()) {
        await actions.app.purchase()
    } else {
        actions.wallet.requestAccess()
    }
})

window.addEventListener('load', async () => {
    await actions.events.onLoad()
}, { once: true })
