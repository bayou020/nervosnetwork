/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { useCallback, useEffect, useState } from 'react';
import Web3 from 'web3';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PolyjuiceHttpProvider } from '@polyjuice-provider/web3';
import { AddressTranslator } from 'nervos-godwoken-integration';

import { BayouStorageWrapper } from '../lib/contracts/BayouStorageWrapper';
import { CONFIG } from '../config';
import { Button, Form, Alert, Container, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as ERC20 from '../../build/contracts/ERC20.json';

async function createWeb3() {
    // Modern dapp browsers...
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
    const [contract, setContract] = useState<BayouStorageWrapper>();
    const [accounts, setAccounts] = useState<string[]>();
    const [l2Balance, setL2Balance] = useState<bigint>();
    const [existingContractIdInputValue, setExistingContractIdInputValue] = useState<string>();
    const [storedValue, setStoredValue] = useState<string | undefined>();
    const [deployTxHash, setDeployTxHash] = useState<string | undefined>();
    const [polyjuiceAddress, setPolyjuiceAddress] = useState<string | undefined>();
    const [transactionInProgress, setTransactionInProgress] = useState(false);
    const [readValueInProgress, setReadValueInProgress] = useState(false);

    const [sudtBalance, setSudtBalance] = useState<string>();
    const [depositAddress, setDepositAddress] = useState<string>();
    const toastId = React.useRef(null);
 
    const [newStringValue, setNewStringValue] = useState<string | undefined>();

    useEffect(() => {
        (async () => {
            if (accounts?.[0]) {
                const addressTranslator = new AddressTranslator();
                const _polyjuiceAddress = addressTranslator.ethAddressToGodwokenShortAddress(
                    accounts?.[0]
                )
                setPolyjuiceAddress(_polyjuiceAddress);
                console.log(
                    `Checking SUDT balance using proxy contract address: ${CONFIG.SUDT_PROXY_CONTRACT_ADDRESS}...`
                )
                const sudtContract = new web3.eth.Contract(
                    ERC20.abi as never,
                    CONFIG.SUDT_PROXY_CONTRACT_ADDRESS
                )
                const balance = await sudtContract.methods.balanceOf(_polyjuiceAddress).call({
                    from: accounts?.[0]
                })
                setSudtBalance(balance);
            } else {
                setPolyjuiceAddress(undefined);
            }
        })()
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
        const _contract = new BayouStorageWrapper(web3);

        try {
            setDeployTxHash(undefined);
            setTransactionInProgress(true);

            const transactionHash = await _contract.deploy(account);
            const { address } = _contract;
            console.log({ address, transactionHash });
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
        const _contract = new BayouStorageWrapper(web3);
        _contract.useDeployed(contractAddress.trim());

        setContract(_contract);
        setStoredValue(undefined);
    }

    const getStoredValue = useCallback(async () => {
        try {
            setReadValueInProgress(true);
            const value = await contract.getStoredValue(account);
            toast('Successfully read latest stored value.', { type: 'success' });

            setStoredValue(value);
            console.log(value)
        } catch (error) {
            console.error(error);
            toast.error('There was an error reading your storage. Please check developer console.');
        } finally {
            setReadValueInProgress(false);
        }
    }, [contract]);

    async function setNewStoredValue() {
        try {
            setTransactionInProgress(true);
            await contract.setStoredValue(newStringValue, account);
            toast(
                'Successfully set latest stored value. You can refresh the read value now manually.',
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

    useEffect(() => {
        if (web3) {
            return;
        }

        (async () => {
            const _web3 = await createWeb3();
            setWeb3(_web3);

            const _accounts = [(window as any).ethereum.selectedAddress];
            setAccounts(_accounts);
            console.log({ _accounts })

            if (_accounts && _accounts[0]) {
                const _l2Balance = BigInt(await _web3.eth.getBalance(_accounts[0]))
                setL2Balance(_l2Balance)
                const addressTranslator = new AddressTranslator()
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
                    <Form.Control
                        type={'text'}
                        value={depositAddress || ''}
                    
                    />
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
                    <b>Sudt Balance: {sudtBalance ? sudtBalance.toString() : <LoadingIndicator />} SUDT</b>
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
                    The button below will deploy BayouStorage smart contract where you can store a
                    number value. By default the initial stored value is equal to 444 (you can
                    change that in the Solidity smart contract). After the contract is deployed you
                    can either read stored value from smart contract or set a new one. You can do
                    that using the interface below.
                </Alert>
            </Container>
            <Container>
                <Col>
                    <Row>
                        <Col></Col>
                        <Col>
                            <Button
                                variant="primary"
                                onClick={deployContract}
                                disabled={!l2Balance}
                            >
                                Deploy contract
                            </Button>
                        </Col>
                        <Col></Col>
                    </Row>
                    <Row>
                        <Col></Col>
                        <Col>&nbsp;or&nbsp;</Col>
                        <Col></Col>
                    </Row>
                    <Row>
                        <Col>
                            <Form.Control
                                placeholder="Existing contract id"
                                onChange={(e) => setExistingContractIdInputValue(e.target.value)}
                            />
                        </Col>
                    </Row>
                </Col>
                <br></br>
                <Row>
                    <Col></Col>
                    <Col>
                        <Button
                            disabled={!existingContractIdInputValue || !l2Balance}
                            onClick={() => setExistingContractAddress(existingContractIdInputValue)}
                        >
                            Use existing contract
                        </Button>
                    </Col>
                    <Col></Col>
                </Row>
                <br />
                <br />
                <Row>
                    <Col></Col>
                    <Col>
                        <Button onClick={getStoredValue} disabled={!contract}>
                            Get stored value
                        </Button>
                    </Col>
                    <Col></Col>
                </Row>
                <Alert>
                    {' '}
                    {storedValue ? <>&nbsp;&nbsp;Stored value: {storedValue} </> : null}
                </Alert>
                <br />
                <br />
                <input
                    type="text"
                    onChange={(e) => setNewStringValue(e.target.value)}
                />
                <Button onClick={setNewStoredValue} disabled={!contract}>
                    Set new stored value
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
