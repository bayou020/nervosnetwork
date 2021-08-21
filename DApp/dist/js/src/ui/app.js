"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
const react_1 = __importStar(require("react"));
const web3_1 = __importDefault(require("web3"));
const react_toastify_1 = require("react-toastify");
require("react-toastify/dist/ReactToastify.css");
const web3_2 = require("@polyjuice-provider/web3");
const nervos_godwoken_integration_1 = require("nervos-godwoken-integration");
const NotarizingDocumentWrapper_1 = require("../lib/contracts/NotarizingDocumentWrapper");
const config_1 = require("../config");
const react_bootstrap_1 = require("react-bootstrap");
require("bootstrap/dist/css/bootstrap.min.css");
async function createWeb3() {
    // Modern dapp browsers...
    if (window.ethereum) {
        const godwokenRpcUrl = config_1.CONFIG.WEB3_PROVIDER_URL;
        const providerConfig = {
            rollupTypeHash: config_1.CONFIG.ROLLUP_TYPE_HASH,
            ethAccountLockCodeHash: config_1.CONFIG.ETH_ACCOUNT_LOCK_CODE_HASH,
            web3Url: godwokenRpcUrl
        };
        const provider = new web3_2.PolyjuiceHttpProvider(godwokenRpcUrl, providerConfig);
        const web3 = new web3_1.default(provider || web3_1.default.givenProvider);
        try {
            // Request account access if needed
            await window.ethereum.enable();
        }
        catch (error) {
            // User denied account access...
        }
        return web3;
    }
    console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    return null;
}
function App() {
    const [web3, setWeb3] = react_1.useState(null);
    const [contract, setContract] = react_1.useState();
    const [accounts, setAccounts] = react_1.useState();
    const [l2Balance, setL2Balance] = react_1.useState();
    const [existingContractIdInputValue, setExistingContractIdInputValue] = react_1.useState();
    const [notarizedResponse, setnotarizedResponse] = react_1.useState();
    const [deployTxHash, setDeployTxHash] = react_1.useState();
    const [polyjuiceAddress, setPolyjuiceAddress] = react_1.useState();
    const [transactionInProgress, setTransactionInProgress] = react_1.useState(false);
    const toastId = react_1.default.useRef(null);
    const [newStoredNumberInputValue, setNewStoredNumberInputValue] = react_1.useState();
    const [notarizedDocument, setNotarizedDocument] = react_1.useState();
    const [checkedDocument, setCheckedDocument] = react_1.useState();
    react_1.useEffect(() => {
        if (accounts?.[0]) {
            const addressTranslator = new nervos_godwoken_integration_1.AddressTranslator();
            setPolyjuiceAddress(addressTranslator.ethAddressToGodwokenShortAddress(accounts?.[0]));
        }
        else {
            setPolyjuiceAddress(undefined);
        }
    }, [accounts?.[0]]);
    react_1.useEffect(() => {
        if (transactionInProgress && !toastId.current) {
            toastId.current = react_toastify_1.toast.info('Transaction in progress. Confirm MetaMask signing dialog and please wait...', {
                position: 'top-right',
                autoClose: false,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                closeButton: false
            });
        }
        else if (!transactionInProgress && toastId.current) {
            react_toastify_1.toast.dismiss(toastId.current);
            toastId.current = null;
        }
    }, [transactionInProgress, toastId.current]);
    const account = accounts?.[0];
    const document = '111';
    async function deployContract() {
        const _contract = new NotarizingDocumentWrapper_1.NotarizingDocumentWrapper(web3);
        try {
            setDeployTxHash(undefined);
            setTransactionInProgress(true);
            const transactionHash = await _contract.deploy(account);
            setDeployTxHash(transactionHash);
            setExistingContractAddress(_contract.address);
            react_toastify_1.toast('Successfully deployed a smart-contract. You can now proceed to get or set the value in a smart contract.', { type: 'success' });
        }
        catch (error) {
            console.error(error);
            react_toastify_1.toast.error('There was an error sending your transaction. Please check developer console.');
        }
        finally {
            console.log(_contract.checkDocument(document, account));
            setTransactionInProgress(false);
        }
    }
    async function checkDocument() {
        const value = await contract.checkDocument(checkedDocument, account);
        react_toastify_1.toast('Successfully read latest stored value.', { type: 'success' });
        // setStoredValue(value);
        console.log(value);
    }
    async function setExistingContractAddress(contractAddress) {
        const _contract = new NotarizingDocumentWrapper_1.NotarizingDocumentWrapper(web3);
        _contract.useDeployed(contractAddress.trim());
        setContract(_contract);
    }
    async function notarize() {
        try {
            setTransactionInProgress(true);
            await contract.notarize(notarizedDocument, account);
            react_toastify_1.toast('Successfully set latest stored value. You can refresh the read value now manually.', { type: 'success' });
        }
        catch (error) {
            console.error(error);
            react_toastify_1.toast.error('There was an error sending your transaction. Please check developer console.');
        }
        finally {
            setTransactionInProgress(false);
        }
    }
    react_1.useEffect(() => {
        if (web3) {
            return;
        }
        (async () => {
            const _web3 = await createWeb3();
            setWeb3(_web3);
            const _accounts = [window.ethereum.selectedAddress];
            setAccounts(_accounts);
            console.log({ _accounts });
            if (_accounts && _accounts[0]) {
                const _l2Balance = BigInt(await _web3.eth.getBalance(_accounts[0]));
                setL2Balance(_l2Balance);
            }
        })();
    });
    const LoadingIndicator = () => react_1.default.createElement("span", { className: "rotating-icon" }, "\u2699\uFE0F");
    return (react_1.default.createElement("div", null,
        react_1.default.createElement(react_bootstrap_1.Container, null,
            react_1.default.createElement(react_bootstrap_1.Alert, { className: "text-center", variant: 'success' },
                react_1.default.createElement("h2", null,
                    "  ",
                    react_1.default.createElement("b", null, "  Bayou Nervos Decentralized App"),
                    " "))),
        react_1.default.createElement(react_bootstrap_1.Container, null,
            react_1.default.createElement(react_bootstrap_1.Row, null,
                react_1.default.createElement(react_bootstrap_1.Col, null,
                    "Your ETH address: ",
                    react_1.default.createElement("b", null,
                        " ",
                        accounts?.[0])),
                react_1.default.createElement(react_bootstrap_1.Col, null,
                    "Your Polyjuice address: ",
                    react_1.default.createElement("b", null, polyjuiceAddress || ' - '))),
            react_1.default.createElement("br", null),
            react_1.default.createElement(react_bootstrap_1.Row, null,
                react_1.default.createElement(react_bootstrap_1.Col, null),
                react_1.default.createElement(react_bootstrap_1.Col, null,
                    "Nervos Layer 2 balance:",
                    ' ',
                    react_1.default.createElement("b", null,
                        l2Balance ? (l2Balance / 10n ** 8n).toString() : react_1.default.createElement(LoadingIndicator, null),
                        ' ',
                        "CKB")),
                react_1.default.createElement(react_bootstrap_1.Col, null)),
            react_1.default.createElement(react_bootstrap_1.Row, null,
                react_1.default.createElement("br", null)),
            react_1.default.createElement(react_bootstrap_1.Row, null,
                react_1.default.createElement(react_bootstrap_1.Col, null,
                    "Deployed contract address: ",
                    react_1.default.createElement("b", null, contract?.address || '-'),
                    " ",
                    react_1.default.createElement("br", null)),
                react_1.default.createElement("br", null),
                react_1.default.createElement(react_bootstrap_1.Col, null,
                    "Deploy transaction hash: ",
                    react_1.default.createElement("b", null, deployTxHash || '-')))),
        react_1.default.createElement("br", null),
        react_1.default.createElement("br", null),
        react_1.default.createElement(react_bootstrap_1.Container, null,
            react_1.default.createElement(react_bootstrap_1.Alert, { variant: 'info' }, "The button below will deploy BayouStorage smart contract where you can store a number value. By default the initial stored value is equal to 777 (you can change that in the Solidity smart contract). After the contract is deployed you can either read stored value from smart contract or set a new one. You can do that using the interface below.")),
        react_1.default.createElement(react_bootstrap_1.Container, null,
            react_1.default.createElement(react_bootstrap_1.Col, null,
                react_1.default.createElement(react_bootstrap_1.Row, null,
                    react_1.default.createElement(react_bootstrap_1.Col, null),
                    react_1.default.createElement(react_bootstrap_1.Col, null,
                        react_1.default.createElement(react_bootstrap_1.Button, { variant: "primary", onClick: deployContract, disabled: !l2Balance }, "Deploy contract")),
                    react_1.default.createElement(react_bootstrap_1.Col, null)),
                react_1.default.createElement(react_bootstrap_1.Row, null,
                    react_1.default.createElement(react_bootstrap_1.Col, null),
                    react_1.default.createElement(react_bootstrap_1.Col, null, "\u00A0or\u00A0"),
                    react_1.default.createElement(react_bootstrap_1.Col, null)),
                react_1.default.createElement(react_bootstrap_1.Row, null,
                    react_1.default.createElement(react_bootstrap_1.Col, null,
                        react_1.default.createElement(react_bootstrap_1.Form.Control, { placeholder: "Existing contract id", onChange: (e) => setExistingContractIdInputValue(e.target.value) })))),
            react_1.default.createElement("br", null),
            react_1.default.createElement(react_bootstrap_1.Row, null,
                react_1.default.createElement(react_bootstrap_1.Col, null),
                react_1.default.createElement(react_bootstrap_1.Col, null,
                    react_1.default.createElement(react_bootstrap_1.Button, { disabled: !existingContractIdInputValue || !l2Balance, onClick: () => setExistingContractAddress(existingContractIdInputValue) }, "Use existing contract")),
                react_1.default.createElement(react_bootstrap_1.Col, null)),
            react_1.default.createElement("br", null),
            react_1.default.createElement("br", null),
            react_1.default.createElement(react_bootstrap_1.Row, null,
                react_1.default.createElement(react_bootstrap_1.Col, null,
                    react_1.default.createElement(react_bootstrap_1.Form.Control, { onChange: (e) => setCheckedDocument(e.target.value) })),
                react_1.default.createElement(react_bootstrap_1.Col, null,
                    react_1.default.createElement(react_bootstrap_1.Button, { onClick: checkDocument, disabled: !contract }, "Get stored value")),
                react_1.default.createElement(react_bootstrap_1.Col, null)),
            react_1.default.createElement(react_bootstrap_1.Alert, null,
                "   ",
                notarizedResponse ? react_1.default.createElement(react_1.default.Fragment, null,
                    "\u00A0\u00A0Stored value: ",
                    notarizedResponse.toString,
                    " ") : null),
            react_1.default.createElement("br", null),
            react_1.default.createElement("br", null),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { onChange: (e) => setNotarizedDocument(e.target.value) }),
            react_1.default.createElement(react_bootstrap_1.Button, { onClick: notarize, disabled: !contract }, "Notrize the Document")),
        react_1.default.createElement("br", null),
        react_1.default.createElement("br", null),
        react_1.default.createElement("br", null),
        react_1.default.createElement("br", null),
        react_1.default.createElement("hr", null),
        react_1.default.createElement(react_bootstrap_1.Container, null,
            react_1.default.createElement(react_bootstrap_1.Alert, { variant: 'warning' }, "The contract is deployed on Nervos Layer 2 - Godwoken + Polyjuice. After each transaction you might need to wait up to 120 seconds for the status to be reflected.")),
        react_1.default.createElement(react_toastify_1.ToastContainer, null)));
}
exports.App = App;
//# sourceMappingURL=app.js.map