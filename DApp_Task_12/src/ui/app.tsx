/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { useCallback, useEffect, useState } from 'react';
import Web3 from 'web3';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PolyjuiceHttpProvider } from '@polyjuice-provider/web3';
import { AddressTranslator } from 'nervos-godwoken-integration';

import { OwnERC20TokenWrapper } from '../lib/contracts/OwnERC20TokenWrapper';
import { CONFIG } from '../config';
import { Button, Form, Alert, Container, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

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

export function App() {
    const [web3, setWeb3] = useState<Web3>(null);
    const [contract, setContract] = useState<OwnERC20TokenWrapper>();
    const [accounts, setAccounts] = useState<string[]>();
    const [l2Balance, setL2Balance] = useState<bigint>();
    const [existingContractIdInputValue, setExistingContractIdInputValue] = useState<string>();
    const [deployTxHash, setDeployTxHash] = useState<string | undefined>();
    const [polyjuiceAddress, setPolyjuiceAddress] = useState<string | undefined>();
    const [transactionInProgress, setTransactionInProgress] = useState(false);
    const toastId = React.useRef(null);
    const [depositAddress, setDepositAddress] = useState<string>();
    const [tokenName, setTokenName] = useState<string | undefined>();
    const [tokenSymbol, setTokenSymbol] = useState<string | undefined>();
    const [totalSupplyToken, setTotalSupplyToken] = useState<string | undefined>();
    const [toAddressInputValue, setToAddressInputValue] = useState<string>();
    const [amountInputValue, setAmountInputValue] = useState<number>();

    useEffect(() => {
        (async () => {
            if (accounts?.[0]) {
          
                const addressTranslator = new AddressTranslator();// add address Translator
                const _polyjuiceAddress = addressTranslator.ethAddressToGodwokenShortAddress(
                    accounts?.[0]
                );
                setPolyjuiceAddress(_polyjuiceAddress);
            } else {
                setPolyjuiceAddress(undefined);
            }
        })();
    }, [accounts?.[0]]);
    useEffect(() => {
        if (transactionInProgress && !toastId.current) {
            toastId.current = toast.info(
                'Transaction in progress. Confirm MetaMask signing dialog and please wait...',
                {
                    position: 'top-right',
                    autoClose: false,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    closeButton: false
                }
            );
        } else if (!transactionInProgress && toastId.current) {
            toast.dismiss(toastId.current);
            toastId.current = null;
        }
    }, [transactionInProgress, toastId.current]);

    const account = accounts?.[0];

    async function deployContract() {
        const _contract = new OwnERC20TokenWrapper(web3);

        try {
            setDeployTxHash(undefined);
            setTransactionInProgress(true);

            const transactionHash = await _contract.deploy(account);
            setDeployTxHash(transactionHash);

            setExistingContractAddress(_contract.address);
            toast(
                'Successfully deployed a smart-contract. You can now proceed to get or set the value in a smart contract.',
                { type: 'success' }
            );
        } catch (error) {
            console.error(error);
            toast.error(
                'There was an error sending your transaction. Please check developer console.'
            );
        } finally {
            setTransactionInProgress(false);
        }
    }

    async function setExistingContractAddress(contractAddress: string) {
        const _contract = new OwnERC20TokenWrapper(web3);
        _contract.useDeployed(contractAddress.trim());

        setContract(_contract);
    }

    async function getTotalSupplyToken() {
        const value = await contract.getTotalSupply();
        setTotalSupplyToken(value);
    }

    async function getTokenSymbolValue() {
        const value = await contract.getTokenSymbol();
        setTokenSymbol(value);
    }

    async function getTokenNameValue() {
        const value = await contract.getTokenName();
        setTokenName(value);
    }

    async function setTransferTokenAmount() {
        try {
            setTransactionInProgress(true);
            await contract.setTransferToken(account, toAddressInputValue, amountInputValue);
            toast('Successfully transfered token', { type: 'success' });
        } catch (error) {
            console.error(error);
            toast.error(
                'There was an error sending your transaction. Please check developer console.'
            );
        } finally {
            setTransactionInProgress(false);
        }
    }

    useEffect(() => {
        if (web3) {
            return;
        }

        (async () => {
            const _web3 = await createWeb3();
            setWeb3(_web3);

            const _accounts = [(window as any).ethereum.selectedAddress];
            setAccounts(_accounts);
            console.log({ _accounts });

            if (_accounts && _accounts[0]) {
                const _l2Balance = BigInt(await _web3.eth.getBalance(_accounts[0]));
                setL2Balance(_l2Balance);
                const addressTranslator = new AddressTranslator();
                const _depositAddress = (
                    await addressTranslator.getLayer2DepositAddress(_web3, _accounts[0])
                ).addressString;
                setDepositAddress(_depositAddress);
                console.log(_depositAddress);
            }
        })();
    });

    const LoadingIndicator = () => <span className="rotating-icon">⚙️</span>;

    return (
        <div>
            <Container>
                <Alert className="text-center" variant={'success'}>
                    <h2>
                        {' '}
                        <b> Bayou Nervos Decentralized App</b>{' '}
                    </h2>
                </Alert>
            </Container>
            <Container>
                <Row>
                    <Col>
                        Your ETH address: <b> {accounts?.[0]}</b>
                    </Col>
                    <Col>
                        Your Polyjuice address: <b>{polyjuiceAddress || ' - '}</b>
                    </Col>
                </Row>
                <br></br>
                <Row>
                    <Col>
                        <b> Your Layer 2 deposit address:</b>
                        <br />
                        {depositAddress ? (
                            <Form.Control type={'text'} value={depositAddress || ''} />
                        ) : (
                            <LoadingIndicator />
                        )}
                    </Col>
                    <Col />
                </Row>
                <br />
                {depositAddress && (
                    <Button
                        href={`https://force-bridge-test.ckbapp.dev/bridge/Ethereum/Nervos?xchain-asset=0x0000000000000000000000000000000000000000&recipient=${depositAddress}`}
                    >
                        deposit via Force Bridge
                    </Button>
                )}
                <br />
                <Row>
                    <Col></Col>
                    <Col>
                        Nervos Layer 2 balance:{' '}
                        <b>
                            {l2Balance ? (l2Balance / 10n ** 8n).toString() : <LoadingIndicator />}{' '}
                            CKB
                        </b>
                    </Col>

                    <Col></Col>
                </Row>
                <Row>
                    <br></br>
                </Row>
                <Row>
                    <Col>
                        Deployed contract address: <b>{contract?.address || '-'}</b> <br />
                    </Col>
                    <br></br>
                    <Col>
                        Deploy transaction hash: <b>{deployTxHash || '-'}</b>
                    </Col>
                </Row>
            </Container>
            <br></br>
            <br></br>
            <Container>
                <Alert variant={'info'}>
                    The button below will deploy your own ERC20 smart contract where you can get a
                    Token Name, Token Symbol, Total Supply and transfer an amount to a specific Address.
                    You can do that using the interface below.
                </Alert>
            </Container>
            <Container>
                
                            <Button
                                variant="primary"
                                onClick={deployContract}
                                disabled={!l2Balance}
                            >
                                Deploy contract
                            </Button>
                
                    <Row>
                        <Col></Col>
                        <Col>&nbsp;or&nbsp;</Col>
                        <Col></Col>
                    </Row>
                    <Row>
                        <Col>
                            <Form.Control className='auto'
                                placeholder="Existing contract id"
                                onChange={e => setExistingContractIdInputValue(e.target.value)}
                            />
                        </Col>
                    </Row>
                
                <br/>
                <br/>
                

                
                        <Button
                            disabled={!existingContractIdInputValue || !l2Balance}
                            onClick={() => setExistingContractAddress(existingContractIdInputValue)}
                        >
                            Use existing contract
                        </Button>
               
                <br />
                <br />

                <Button onClick={getTokenNameValue} disabled={!contract}>
                    Get Token Name
                </Button>
                <Alert> {tokenName ? <>&nbsp;&nbsp;Token Name: {tokenName} </> : null}</Alert>
                <Button onClick={getTokenSymbolValue} disabled={!contract}>
                    Get token symbol
                </Button>
                {tokenSymbol ? <>&nbsp;Token Symbol: {tokenSymbol}</> : null}
                <br />
                <br />
                <Button onClick={getTotalSupplyToken} disabled={!contract}>
                Get total supply
            </Button>
            {totalSupplyToken ? (
                <>&nbsp;Total Supply: {web3.utils.fromWei(totalSupplyToken)}</>
            ) : null}
            <br />
            <br />
            <Form.Control
                type="text"
                placeholder="To Address"
                onChange={e => setToAddressInputValue(e.target.value)}
            />{' '}
            <Form.Control
                type="text"
                placeholder="Amount"
                onChange={e => setAmountInputValue(Number(e.target.value))}
            />{' '}
            <Button onClick={setTransferTokenAmount} disabled={!contract}>
                Transfer
            </Button>

            </Container>

            <br />
            <br />

            <hr />
            <Container>
                <Alert variant={'warning'}>
                    The contract is deployed on Nervos Layer 2 - Godwoken + Polyjuice. After each
                    transaction you might need to wait up to 120 seconds for the status to be
                    reflected.
                </Alert>
            </Container>
            <ToastContainer />
        </div>
    );
}

