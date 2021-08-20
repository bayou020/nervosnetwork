# :gem: How to An Existing Ethereum DApp To Polyjuice.
In this tutorial we will teach you how to deploy and transfer an ERC20 token using UI
## 1- Setup the Godwoken Testnet network into Metamask.
In order to communicate with Godwoken layer 2 with your Metamask wallet. You need to Configure your Metamask wallet As follows:
### 1- Go To Settings.
![Screenshot from 2021-08-19 21-25-40](https://user-images.githubusercontent.com/28756413/130139061-88bf966e-cc83-47e9-80b4-f1975785449d.png)

### 2- Select Networks-> Add a network
![Screenshot from 2021-08-19 21-27-57](https://user-images.githubusercontent.com/28756413/130139347-210c87ae-0ccb-4772-9f3f-64ec078450d6.png)

or you can Check this [Link](https://metamask.zendesk.com/hc/en-us/articles/360043227612-How-to-add-custom-Network-RPC) for more Informations

and fill the corresponding Details.
```
Network Name: Godwoken Testnet
RPC URL: https://godwoken-testnet-web3-rpc.ckbapp.dev
Chain ID: 71393
Currency Symbol: <Leave Empty>
Block Explorer URL: <Leave Empty>
```
## 2- setup the contract interface

You need to have the leastest Node version by checking it `node -v` the version must be above 14 `>=14`

Clone the following repo:
```
https://github.com/bayou020/ERC20_Token_DApp.git
cd ERC20_Token_DApp
```
then go to `contracts/OwnERC20Token.sol` and set your `TOKEN_NAME`, `TOKEN_SYMBOL` and `TOTAL_SUPPLY` Parameters into the Contract
If you want to add new methods, you'll be free to do it, Then build the contracts by running `yarn build` command
the truffle compiler will generate JSON ABI into the folder `build/contracts` and Wrappers in the folder 'src/lib/contracts`that we're going to use later
### setup imports
All DApps on the web must communicate with etherum using a library called web3.js

We need to add the Web3 library in order to communicate with Nervos network by running:
```
yarn add web3
```
then import it into our `src/ui/app.tsx` file which is our React front-end application
```javascript 
import Web3 from 'web3';
```
Also we need to import the Nervos Middleware on the web3 etherum platform by supplying a custom provider:

```
yarn add @polyjuice-provider/web3@0.0.1-rc7
```
and importing it into our `src/ui/app.tsx` file which is our React front-end application
```javascript 
import { PolyjuiceHttpProvider } from '@polyjuice-provider/web3';
```
and in the end we need to import a tool who converts etherum address into a Polyjuice ones into React front-end Application
```javascript
import { AddressTranslator } from './nervos-godwoken-integration';
```
### Create Config file between polyjuice and web3 providers
Now in order to let PolyjuiceProvider Communicate with the Web3 library we need to create a file called `config.ts` which includes the revalant Configuration Above;
```javascript

export const CONFIG = {
    WEB3_PROVIDER_URL:  'https://godwoken-testnet-web3-rpc.ckbapp.dev',
    ROLLUP_TYPE_HASH: '0x4cc2e6526204ae6a2e8fcf12f7ad472f41a1606d5b9624beebd215d780809f6a',
    ETH_ACCOUNT_LOCK_CODE_HASH: '0xdeec13a7b8e100579541384ccaf4b5223733e4a5483c3aec95ddc4c1d5ea5b22',
};
```
and later Deploy it into our React front-end Application as follows:

```javascript
import { CONFIG } from '../config';
```
then add the function above into the `app.tsx` file
```javascript
async function createWeb3() {

    if ((window as any).ethereum) {
        const godwokenRpcUrl = CONFIG.WEB3_PROVIDER_URL;
        const providerConfig = {
            rollupTypeHash: CONFIG.ROLLUP_TYPE_HASH,
            ethAccountLockCodeHash: CONFIG.ETH_ACCOUNT_LOCK_CODE_HASH,
            web3Url: godwokenRpcUrl
        };

        const provider = new PolyjuiceHttpProvider(godwokenRpcUrl, providerConfig);
        const web3 = new Web3(provider || Web3.givenProvider);

        try {
            // Request account access if needed
            await (window as any).ethereum.enable();
        } catch (error) {
            // User denied account access...
        }

        return web3;
    }

    console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    return null;
}
```
### Create Helper File
now we create a helper file called OwnERC20TokenWrapper.ts in order to use it with our web3 interface to deploy and interact with the contract, by adding functions we must include OwnERC20TokenWrapper.json ABI file generated by the Truffle compile.
```javascript
import Web3 from 'web3';
import * as OwnERC20TokenJSON from '../../../build/contracts/OwnERC20Token.json'
import { OwnERC20Token } from '../../types/OwnERC20Token';

const DEFAULT_SEND_OPTIONS = {
    gas: 6000000
};

export class OwnERC20TokenWrapper {
    web3: Web3;

    contract: OwnERC20Token;

    address: string;

    constructor(web3: Web3) {
        this.web3 = web3;
        this.contract = new web3.eth.Contract(OwnERC20TokenJSON.abi as any) as any;
    }

    get isDeployed() {
        return Boolean(this.address);
    }

    async getTotalSupply() {
        const value = await this.contract.methods.totalSupply().call();
        return value;
    }

    async getTokenSymbol() {
        const value = await this.contract.methods.symbol().call();
        return value;
    }

    async getTokenName() {
        const value = await this.contract.methods.name().call();
        return value;
    }

    async setTransferToken(fromAddress: string, toAddress: string, amount: number) {
        const tx = await this.contract.methods
            .transfer(toAddress, this.web3.utils.toWei(this.web3.utils.toBN(amount)))
            .send({
                ...DEFAULT_SEND_OPTIONS,
                from: fromAddress
            });

        return tx;
    }

    async deploy(fromAddress: string) {
        const deployTx = await (this.contract
            .deploy({
                data: OwnERC20TokenJSON.bytecode,
                arguments: []
            })
            .send({
                ...DEFAULT_SEND_OPTIONS,
                from: fromAddress,
                to: '0x0000000000000000000000000000000000000000'
            } as any) as any);

        this.useDeployed(deployTx.contractAddress);

        return deployTx.transactionHash;
    }

    useDeployed(contractAddress: string) {
        this.address = contractAddress;
        this.contract.options.address = contractAddress;
    }
}
```
then we will import it into `app.tsx` front-end application as follows:
```javascript
import { OwnERC20TokenWrapper } from '../lib/contracts/OwnERC20TokenWrapper';
```
### Integrating Polyjuice Address into the DApp
To integrate the polyjuice address into our DApp we need to call the following parameters:
```javascript
  const addressTranslator = new AddressTranslator();// add address Translator
  const _polyjuiceAddress = addressTranslator.ethAddressToGodwokenShortAddress(etherumAddress);
```
## Deploy your DApp
run on your terminal `yarn ui` to deploy the DApp on http://localhost:3000 , Once your DApp is deployed, Change the Metamask Network to Godwoken Network Testnet deployed earlier on this tutorial 💙

### Now you can interact with your DApp ❤️
![Screenshot from 2021-08-19 22-46-55](https://user-images.githubusercontent.com/28756413/130148698-e545f266-6e97-44ca-acd2-e9ee74a9d9f9.png)

## Used DApp Link 🔗
[DApp](https://github.com/bayou020/ERC20_Token_DApp)
