import { privateEncrypt } from "crypto";
import { Contract, providers, Signer, utils, BigNumber } from "ethers"
//import WalletConnectProvider from "@walletconnect/web3-provider";
import pizza from '../artifacts/contracts/token/RarePizzas.sol/RarePizzas.json';
import box from '../artifacts/contracts/token/RarePizzasBoxV2.sol/RarePizzasBoxV2.json';

declare var document: any;
declare var navigator: any;
declare var window: any;

// multi sig address
const multisigAddress = '0xBA5E28a2D1C8cF67Ac9E0dfc850DC8b7b21A4DE2'

// Addresses for the pizza contract
const rinkebyAddress = '0x7cD2730Ab11edE2b315D056bBbe3915aC0a39670'
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

const mafiaBoxCount = 1250

type Tuple = {
    key: string,
    value: string
}

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
        btcExchangeRate: BigNumber
        ethPrice: BigNumber
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
        boxContract: Contract | undefined
        signer: Signer | undefined
        balance: BigNumber | undefined
    }
}

let recipes: Tuple[] = [
    {key: "Random Pie", value: "0"},
    {key: "Cheeze Pie", value: "1"},
    {key: "Pepperoni", value: "2"},
    {key: "Hawaiian", value: "3"},
    {key: "Moon Pie", value: "4"},
    {key: "Crypto Pie", value: "5"},
    {key: "Horror Pie", value: "6"},
    {key: "80's Pie", value: "7"},
    {key: "Trippy-Shrooms Pie", value: "8"},
    {key: "Shrooms Pie", value: "9"},
    {key: "Green Salad Pie", value: "10"},
    {key: "Flower Bloom Pie", value: "11"},
    {key: "Vegan Pie", value: "12"},
    {key: "Apple Pie", value: "13"},
    {key: "Mixed Fruit Pie", value: "14"},
    {key: "Meat Lover's", value: "15"},
    {key: "Seafood Delight", value: "16"}
]

let state: AppContext = {
    app: {
        btcExchangeRate: BigNumber.from('600000000000000000'),
        ethPrice: BigNumber.from('3000000000000000000'),
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
        unredeemedBoxTokens: () => state.user.boxTokens.filter(box => {
            return !box.isRedeemed
        })
    },
    wallet: {
        address: undefined,
        contract: undefined,
        boxContract: undefined,
        signer: undefined,
        balance: undefined
    }
}

// Document Accessors

const DOM = {
    buttons: {
        connect: document.querySelector('#walletButton'),
        buy: document.querySelector('#buyButton'),
        redeem: document.querySelector('#bakePizza'),
        checkBoxIsRedeemed: document.querySelector('#checkPie'),
    },
    contract: {
        address: document.querySelector('#pizzacontractLabel'),
        boxAddress: document.querySelector('#contractLabel'),
    },
    fields: {
        bakedPiecheck: document.querySelector('#bakedPieCheck')
    },
    labels: {
        // TODO: connect this one to the right id
        dappHeader: document.querySelector('#bakeHeading'),

        ethBalanceLabel: document.querySelector('#balanceLabel'),
        connectLabel: document.querySelector('#connect-button-label'),

        remainingBoxesCount: document.querySelector('#pizzasLabel'),
        redeemedPizzasCount: document.querySelector('#pizzasRedeemed'),

        btcPriceLabel: document.querySelector('#btcPriceLabel'),
        ethPriceLabel: document.querySelector('#ethPriceLabel'),

        errorLabel: document.querySelector('#errorMsg2'),

        userUnredeemedBoxCount: document.querySelector('#boxCount'),
        userPizzaCount: document.querySelector('#pizzaCount'),
        
    },
    selectors: {
        boxSelector: document.querySelector('#selectBox'),
        recipeSelector: document.querySelector('#selectRecipe'),
    },
    setStaticState: () => {
        helpers.selectorRemoveAll(DOM.selectors.recipeSelector)
        helpers.selectorAdd(DOM.selectors.recipeSelector, recipes)
    },
    refreshBoxTokenQuerySelector: (context: AppContext) => {
        // redeem query selector
        const redeemOptions: Tuple[] = []
        context.user.boxTokens.forEach(token => {
            if (!token.isRedeemed) {
                redeemOptions.push({key: token.id.toString(), value: token.id.toString()})
            }
        })

        helpers.selectorRemoveAll(DOM.selectors.boxSelector)
        helpers.selectorAdd(DOM.selectors.boxSelector, redeemOptions)
    },
    refreshState: (context: AppContext) => {
        console.log("refresh state")

        // Header
        if (context.app.pizzaSaleIsActive) {
            DOM.labels.dappHeader.innerHTML = "Bake Your Rare Pizza!"
        }  else {
            DOM.labels.dappHeader.innerHTML = "Kitchen Is Closed :-("
        }
        
        // connect button
        if (context.wallet.address && context.wallet.contract) {
            //const rhs = context.wallet.address.length - 4
            //DOM.labels.connectLabel.innerHTML = `${context.wallet.address.substr(0, 5)}...${context.wallet.address.substr(rhs, 4)}`
            DOM.buttons.connect.innerHTML = "Disconnect"
           
        } else {
            DOM.buttons.connect.innerHTML = "Connect Wallet"
        }

        // Balance
        if(context.wallet.balance === undefined) {
            DOM.labels.ethBalanceLabel.innerHTML = `-- ${ethSymbol}`
        } else {
            const balance = utils.formatEther(context.wallet.balance)
            DOM.labels.ethBalanceLabel.innerHTML = `${balance.substr(0, 5)} ${ethSymbol}`
        }

        // BTC price
        if (context.contract === undefined) {
            DOM.labels.btcPriceLabel.innerHTML = `-- ${btcSymbol}`
        }  else {

            const btcPrice = context.app.ethPrice.div(state.app.btcExchangeRate)
            const btcPriceformatted = utils.formatEther(btcPrice)
            DOM.labels.btcPriceLabel.innerHTML = `${btcPriceformatted.substr(0, 5)} ${btcSymbol}`
        }

        // ETH price
        if (context.contract === undefined) {
            DOM.labels.ethPriceLabel.innerHTML = `-- ${ethSymbol}`
        }  else {
            const ethPriceFormatted = utils.formatEther(context.app.ethPrice)
            DOM.labels.ethPriceLabel.innerHTML = `${ethPriceFormatted.substr(0, 5)} ${ethSymbol}`
        }
        
        // Box availability
        if (context.app.countTotal.totalBoxes === 0) {
            DOM.labels.remainingBoxesCount.innerHTML = "--"
        } else {
            const remaining = context.app.remainingBoxCount()
            DOM.labels.remainingBoxesCount.innerHTML = `${remaining}`
        }

        // Pizza availability
        if (context.app.countTotal.totalBoxes === 0) {
            DOM.labels.redeemedPizzasCount.innerHTML = "--"
        } else {
            const existing = context.app.countTotal.existingPizzas
            DOM.labels.redeemedPizzasCount.innerHTML = `${existing}`
        }

        // Pizzas redeemed
        const unclaimedBoxes = context.user.unredeemedBoxTokens().length
        DOM.labels.userUnredeemedBoxCount.innerHTML = `${unclaimedBoxes}`
        DOM.labels.userPizzaCount.innerHTML = context.user.balance.pizzaTokenCount

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

        // redeem button
        if (context.app.pizzaSaleIsActive && context.wallet.address && context.wallet.contract && unclaimedBoxes > 0) {
            DOM.buttons.redeem.disabled = false
        } else {
            DOM.buttons.redeem.disabled = true
        }

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
    numberWithCommas: (x: number) => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','),
    isMobile: () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    selectorAdd: (selectBox: HTMLSelectElement, values: Tuple[] ) => {
        values.forEach(item => {
            selectBox.add(new Option(item.key, item.value))
        })
    },
    selectorRemoveAll: (selectBox: HTMLSelectElement) => {
        while (selectBox.options.length > 0) {
            selectBox.remove(0);
        }
    },
    bigNumberAddPercent: (bigNum: BigNumber, pct: number) => {
        return bigNum.mul(pct).div(100)
    }
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
                if (error instanceof Error) {
                    state.app.statusMessage = error.message
                    DOM.refreshState(state)
                }
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
                if (error instanceof Error) {
                    state.app.statusMessage = error.message
                    DOM.refreshState(state)
                }
                return false
            }
        },
        // purchase a box
        purchase: async () => {
            if (!actions.contract.isBoxConnected()) {
                return
            }

            console.log(`purchase: purchase box`)
            const price: BigNumber = await state.boxContract?.getPrice()
            state.app.ethPrice = price

            const pctOver = 120 // 20%
            const amount = helpers.bigNumberAddPercent(price, pctOver)

            console.log(`purchase price: ${amount}`)

            let estimatedGas = await state.boxContract?.estimateGas.purchase({value: amount})
            if (estimatedGas === undefined || estimatedGas.lt(defaultGasLimit)) {
                console.log("using default gas limit")
                estimatedGas = BigNumber.from(defaultGasLimit)
            } else {
                estimatedGas = helpers.bigNumberAddPercent(estimatedGas, 120)
                console.log(`estimated gas: ${estimatedGas}`)
            }

            await state.wallet.boxContract?.purchase({ value: amount, gasLimit: estimatedGas })
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

            // let estimatedGas = await state.wallet.contract?.estimateGas.redeemRarePizzasBox(boxTokenId, desiredRecipe)
            // if (estimatedGas === undefined || estimatedGas.lt(defaultGasLimit)) {
            //     console.log("using default gas limit")
            //     estimatedGas = BigNumber.from(defaultGasLimit)
            // } else {
            //     estimatedGas = helpers.bigNumberAddPercent(estimatedGas, 120)
            //     console.log(`estimated gas: ${estimatedGas}`)
            // }

            // TODO: callstatic?

            await state.wallet.contract?.redeemRarePizzasBox(boxTokenId, desiredRecipe, { gasLimit: 300000 })
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
            const contract = new Contract(contractAddress, pizza.abi, state.provider)
            state.contract = contract

            // connect box
            const boxContractAddress = chainId === '0x4' ? boxRinkebyAddress : boxMainnetAddress
            console.log(`contract box connect: ${boxContractAddress}`)
            // note the abi here is the pizza abi, which has functions not on the box
            // but since it inherits, it works wihtout adding redundant data to the page
            const boxContract = new Contract(boxContractAddress, box.abi, state.provider)
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
                const active = await state.contract?.saleIsActive()
                state.app.pizzaSaleIsActive = active
                console.log(`isSaleActive: ${active}`)
                DOM.refreshState(state)
                return active
            } catch (error) {
                console.log(error)
                if (error instanceof Error) {
                    state.app.statusMessage = error.message
                    DOM.refreshState(state)
                }
                return false
            }
        },
        refreshPrice: async () => {
            if (!actions.contract.isConnected()) {
                BigNumber.from(state.app.ethPrice)
            }
            // Get the price off the bonding curve (in wei)
            const price = await state.boxContract?.getPrice()
            state.app.ethPrice = price
            console.log(`refreshPrice: eth: ${price}`)

            // Get the bitcoin price
            const bitcoinPrice = await state.boxContract?.getBitcoinPriceInWei()
            state.app.btcExchangeRate = bitcoinPrice

            console.log(`refreshPrice: btc: ${price}`)

            DOM.refreshState(state)
            return BigNumber.from(state.app.ethPrice)
        },
        refreshSupply: async () => {
            if (!actions.contract.isConnected()) {
                return
            }
            console.log("refresh supply")
            const maxSupply = await state.boxContract?.maxSupply()
            const boxTotalSupply = await state.boxContract?.totalSupply()
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
            DOM.setStaticState()
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
            console.log("refresh token balance")
            // seems we only have boxTokenBalance available
            // I don't know if this 'balance' is a count of tokens or some other measure
            // The contract code says 'Get the box balance of a user' — is that a $ value or a cardinal value?
            const boxTokenBalance: BigNumber = await state.wallet.boxContract?.balanceOf(state.wallet.address)
            const pizzaTokenBalance: BigNumber = await state.wallet.contract?.balanceOf(state.wallet.address)
            console.log(`boxTokenBalance: ${boxTokenBalance}`)
            console.log(`pizzaTokenBalance: ${pizzaTokenBalance}`)
        
            let boxTokens: BoxToken[] = []
            let pizzaTokens: number[] = []

            // iterate through the collections and get the user's id's
            for(let i = 0; i < boxTokenBalance.toNumber(); i++) {
                const id = await state.wallet.boxContract?.tokenOfOwnerByIndex(state.wallet.address, i)
                const isRedeemed = await state.wallet.contract?.isRedeemed(id)
                boxTokens.push({
                    id, isRedeemed
                })
            }
            for(let i = 0; i < pizzaTokenBalance.toNumber(); i++) {
                const id = await state.wallet.contract?.tokenOfOwnerByIndex(state.wallet.address, i)
                pizzaTokens.push(id)
            }

            state.user.boxTokens = boxTokens
            state.user.pizzaTokens = pizzaTokens

            console.log(`boxTokens: ${boxTokens}`)
            console.log(`pizzaTokens: ${pizzaTokens}`)

            // if the token counts are different make sure we update the query selector
            if (state.user.balance.boxTokenCount !== boxTokenBalance.toNumber() || state.user.balance.pizzaTokenCount !== pizzaTokenBalance.toNumber()) {
                DOM.refreshBoxTokenQuerySelector(state)
            }

            state.user.balance = {
                boxTokenCount: boxTokenBalance.toNumber(),
                pizzaTokenCount: pizzaTokenBalance.toNumber()
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
        getBalance: async (address: string | undefined) => {
            if (state.provider === undefined) {
                console.log('provider not connected')
                return
            }

            if (address === undefined) {
                address = state.wallet.address
            }

            if (address === undefined) {
                throw "wallet: address undefined"
            }

            const balance = await state.provider.getBalance(address)

            console.log(`getBalance: ${utils.formatEther(balance).substr(0, 10)}`)
            state.wallet.balance = balance
            DOM.refreshState(state)
            return balance
        },
        connect: async () => {
            if (state.provider === undefined) {
                console.log('provider not connected')
                return
            }
            console.log('connect wallet')
            const signer = state.provider.getSigner();
            const contract = state.contract?.connect(signer)
            const boxContract = state.boxContract?.connect(signer)
            const address = await signer.getAddress()

            console.log(`connected to ${address}`)

            const balance = await actions.wallet.getBalance(address)

            state.wallet = {
                address: address,
                contract: contract,
                boxContract: boxContract,
                signer: signer,
                balance: balance
            }
            if (state.wallet.balance !== undefined) {
                console.log(`connect: balance ${utils.formatEther(state.wallet.balance).substr(0, 10)}`)
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
            state.wallet.boxContract = undefined
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
        actions.wallet.resetWallet()
    } else {
        console.log("requesting access")
        actions.wallet.requestAccess()
    }
})

DOM.buttons.checkBoxIsRedeemed.addEventListener('click', async () => {
    state.app.statusMessage = ""
    DOM.refreshState(state)

    const tokenId = DOM.fields.bakedPiecheck.value

    const redeemed = await actions.app.isRedeemed(parseInt(tokenId))
    // TODO: update DOM in the right place
    DOM.labels.errorLabel.innerHTML = `token: ${tokenId} isRedeemed: ${redeemed}`
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

    const boxTokenId = DOM.selectors.boxSelector.value
    const desiredRecipe = DOM.selectors.recipeSelector.value

    if (actions.wallet.isConnected()) {
        await actions.app.redeemBox(parseInt(boxTokenId), parseFloat(desiredRecipe))
    } else {
        actions.wallet.requestAccess()
    }
})

window.addEventListener('load', async () => {
    await actions.events.onLoad()
}, { once: true })
