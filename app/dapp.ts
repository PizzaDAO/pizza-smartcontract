import { Contract, providers, Signer, utils, BigNumber } from "ethers"
//import WalletConnectProvider from "@walletconnect/web3-provider";
import { abi } from '../artifacts/contracts/token/RarePizzas.sol/RarePizzas.json';

declare var document: any;
declare var navigator: any;
declare var window: any;

// Addresses for the pizza contract
const rinkebyAddress = '0x4bC497fF4ccaA5C3E052Fe47179bd68CA551B347'
const mainnetAddress = ''
// Addresses for the box contract
const boxRinkebyAddress = "0x8f5AE25105C3c03Bce89aE3b5ed1E30456755fAb"
const boxMainnetAddress = "0x4ae57798AEF4aF99eD03818f83d2d8AcA89952c7"

// This dapp connects primarily to the pizza contract
// and brokers most read values through there since some
// box methods are passed through, but for certain things
// like subscribing to events it uses the box contract directly
// the distinction is wether or not a user context is needed.
// all user context events happen through the pizza contract.

const defaultGasLimit: number = 300000

const ethSymbol = 'Ξ'
const btcSymbol = '₿'

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
        countTotal: TokenSupply
        price: number
        btcPrice: number
        ethPrice: number
        boxSaleIsActive: boolean
        pizzaSaleIsActive: boolean
        statusMessage: string
        remainingBoxCount: Function
        unredeemedBoxCount: Function
    }
    contract: Contract | undefined
    boxContract: Contract | undefined
    provider: providers.Web3Provider | undefined
    user: {
        balance: UserBalance
        boxTokens: BoxToken[]
        pizzaTokens: number[]
        unredeemedBoxTokens: Function
    }
    wallet: {
        address: string | undefined
        contract: Contract | undefined
        signer: Signer | undefined
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
        remainingBoxCount: () => (state.app.countTotal.totalBoxes - state.app.countTotal.existingBoxes),
        unredeemedBoxCount: () => (state.app.countTotal.existingBoxes - state.app.countTotal.existingPizzas)
    },
    contract: undefined,
    boxContract: undefined,
    provider: undefined,
    user: {
        balance: {
            boxTokenCount: 0,
            pizzaTokenCount: 0
        },
        boxTokens: [],
        pizzaTokens:[],
        unredeemedBoxTokens: () => state.user.boxTokens.filter((box, i, arr) => {
            return box.isRedeemed == false
        })
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
        boxAddress: document.querySelector('#contractLabel'),
    },
    labels: {
        // TODO: real values for all these labels
        // they are wrong
        dappHeader: document.querySelector('#app-header'),
        connectLabel: document.querySelector('#connect-button-label'),
        remainingBoxes: document.querySelector('#amountAvail'),
        redeemedPizzas: document.querySelector('#pizza-quantity'),
        redeemPizzaTextLabel: document.querySelector('#quantity-subheader'),
        errorLabel: document.querySelector('#errorText'),
        buyLabel: document.querySelector('#mint-button-header'),
        
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

        // Box availability
        if (context.app.countTotal.totalBoxes === 0) {
            DOM.labels.remainingBoxes.innerHTML = "????"
        } else {
            const remaining = context.app.remainingBoxCount()
            if (remaining <= 1) {
                DOM.labels.remainingBoxes.innerHTML = `0`
            } else {
                DOM.labels.remainingBoxes.innerHTML = `${remaining}`
            }
        }

        // Pizzas redeemed
        if (context.app.pizzaSaleIsActive) {
            DOM.labels.redeemPizzaTextLabel.innerHTML = "Redeem Pizza!"
        } else {
            DOM.labels.redeemPizzaTextLabel.innerHTML = "Redeeming pizzas is not Active"
        }

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

        const userUnredeemedBoxes = context.user.unredeemedBoxTokens()

        // redeem button
        if (context.app.pizzaSaleIsActive && context.wallet.address && context.wallet.contract && userUnredeemedBoxes.length > 0) {
            DOM.buttons.redeem.disabled = false
        } else {
            DOM.buttons.redeem.disabled = true
        }

        // redeem query selector
        // TODO: specify the array of box id's that can be redeemed

        // available recipes query selector
        // TODO: specify the recipes

        // contract
        if (context.contract === undefined) {
            console.log("refresh no contract")
            DOM.contract.address.innerHTML = "Not Connected"
        } else {
            DOM.contract.address.textContent = context.contract.address
        }

        // box contract
        if (context.boxContract === undefined) {
            console.log("refresh no box contract")
            DOM.contract.boxAddress.innerHTML = "Not Connected"
        } else {
            DOM.contract.boxAddress.textContent = context.boxContract.address
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
        // is a box redeemed
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
        // address of whoever redeemed a box
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
        // purchase a box
        purchase: async () => {
            if (!actions.contract.isConnected()) {
                return
            }

            console.log(`purchase: purchase box`)
            const price = await state.contract?.getPrice()
            state.app.price = price

            const quantity = 1;//DOM

            const amount = price.mul(quantity)

            let estimatedGas = await state.contract?.estimateGas.purchase()
            if (estimatedGas.lt(defaultGasLimit)) {
                estimatedGas = BigNumber.from(defaultGasLimit)
            }

            // TODO: callstatic?

            await state.wallet.contract?.purchase({ value: amount, gasLimit: estimatedGas })
            await actions.contract.refreshContract()
        },
        // redeem a box for a pizza
        redeemBox: async (boxTokenId: number, desiredRecipe: number) => {
            if (!actions.contract.isConnected()) {
                return
            }

            if (await state.contract?.isRedeemed(boxTokenId)) {
                state.app.statusMessage = "box already redeemed"
                DOM.refreshState(state)
                return
            }

            console.log(`redeem: redeem a box`)

            let estimatedGas = await state.contract?.estimateGas.redeemRarePizzasBox(boxTokenId, desiredRecipe)
            if (estimatedGas.lt(defaultGasLimit)) {
                estimatedGas = BigNumber.from(defaultGasLimit)
            }

            // TODO: callstatic?

            await state.wallet.contract?.redeemRarePizzasBox(boxTokenId, desiredRecipe, { gasLimit: estimatedGas })
            await actions.contract.refreshContract()
        }
    },
    contract: {
        isConnected: () => {
            const contract = state.contract
            if (contract === undefined) {
                console.log('contract: pizza contract not connected')
                return false
            }
            return true
        },
        isBoxConnected: () => {
            const contract = state.boxContract
            if (contract === undefined) {
                console.log('contract: box contract not connected')
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

            // connect pizza
            const contractAddress = chainId === '0x4' ? rinkebyAddress : mainnetAddress
            console.log(`contract pizza connect: ${contractAddress}`)
            const contract = new Contract(contractAddress, abi, state.provider)
            state.contract = contract

            // connect box
            const boxContractAddress = chainId === '0x4' ? boxRinkebyAddress : boxMainnetAddress
            console.log(`contract box connect: ${boxContractAddress}`)
            // note the abi here is the pizza abi, which has functions not on the box
            // but since it inherits, it works wihtout adding redundant data to the page
            const boxContract = new Contract(boxContractAddress, abi, state.provider)
            state.boxContract = boxContract

            actions.events.subscribeContractEvents();
            actions.events.subscribeTokenEvents() 
        },
        refreshContract: async () => {
            if (!actions.contract.isConnected()) {
                return
            }
            console.log("refreshContract")
            await actions.contract.isSaleActive()
            await actions.contract.refreshPrice()
            await actions.contract.refreshSupply()
            await actions.user.refreshUserBalance()
            DOM.refreshState(state)
        },
        isSaleActive: async () => {
            if (!actions.contract.isConnected()) {
                return false
            }

            try {
                const active = await state.contract?.isSaleActive()
                state.app.pizzaSaleIsActive = active
                console.log(`isSaleActive: ${active}`)
                DOM.refreshState(state)
                return active
            } catch (error) {
                console.log(error)
                state.app.statusMessage = error
                DOM.refreshState(state)
                return false
            }
        },
        refreshPrice: async () => {
            if (!actions.contract.isConnected()) {
                BigNumber.from(state.app.price)
            }
            // TODO: fixme
            const price = await state.contract?.price()
            state.app.price = price
            console.log(`refreshPrice: ${price}`)
            DOM.refreshState(state)
            return BigNumber.from(state.app.price)
        },
        refreshSupply: async () => {
            if (!actions.contract.isConnected()) {
                return
            }
            console.log("refresh supply")
            const maxSupply = await state.contract?.maxSupply()
            const boxTotalSupply = await state.contract?.boxTotalSupply()
            const pizzaTotalSupply = await state.contract?.totalSupply()
            console.log(`maxSupply: ${maxSupply} boxTotalSupply: ${boxTotalSupply} pizzaTotalSupply: ${pizzaTotalSupply}` )

            state.app.countTotal = {
                existingBoxes: boxTotalSupply,
                existingPizzas: pizzaTotalSupply,
                totalBoxes: maxSupply,
                totalPizzas: maxSupply
            }

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
            state.contract?.on('SaleActive', actions.contract.refreshContract)
            // TODO: verify if we even need this it might be redundant since transfer fires
            state.contract?.on('InternalArtworkAssigned', actions.contract.refreshContract)
            state.boxContract?.on('InternalArtworkAssigned', actions.contract.refreshContract)
        },
        subscribeTokenEvents: () => {
            state.contract?.on('Transfer', actions.events.handlers.tokenTransferred)
            state.boxContract?.on('Transfer', actions.events.handlers.tokenTransferred)
        },
        subscribeWalletEvents: () => {
            window.ethereum.on("accountsChanged", actions.events.handlers.accountsChanged)
            window.ethereum.on("chainChanged", actions.events.handlers.chainChanged)
            window.ethereum.on("disconnect", actions.events.handlers.accountsDisconnect)
        },
        unsubscribeContractEvents: () => {
            state.contract?.off('SaleActive', actions.contract.refreshContract)
            state.contract?.off('InternalArtworkAssigned', actions.contract.refreshContract)
        },
        unsubscribeTokenEvents: () => {
            state.contract?.off('Transfer', actions.events.handlers.tokenTransferred)
            state.boxContract?.off('Transfer', actions.events.handlers.tokenTransferred)
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
            const pizzaTokenBalance = await state.wallet.contract?.balanceOf(state.wallet.address)
            console.log(`boxTokenBalance: ${boxTokenBalance}`)
            console.log(`pizzaTokenBalance: ${pizzaTokenBalance}`)
            state.user.balance = {
                boxTokenCount: boxTokenBalance,
                pizzaTokenCount: pizzaTokenBalance
                //tokenCount: token_balance,
            }

            // TODO: iterate through the collections and get the user's id's

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

DOM.contract.boxAddress.addEventListener('click', async () => {
    state.app.statusMessage = ""
    DOM.refreshState(state)

    if (state.contract !== undefined) {
        const contract = state.boxContract?.address
        const subdomain = contract === boxRinkebyAddress ? "rinkeby" : "www"
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

DOM.buttons.redeem.addEventListener('click', async () => {
    state.app.statusMessage = ""
    DOM.refreshState(state)

    // TODO: read query selector values

    const boxTokenId = 1
    const desiredRecipe = 3

    if (actions.wallet.isConnected()) {
        await actions.app.redeemBox(boxTokenId, desiredRecipe)
    } else {
        actions.wallet.requestAccess()
    }
})

window.addEventListener('load', async () => {
    await actions.events.onLoad()
}, { once: true })