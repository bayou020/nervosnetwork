import React, { useEffect, useState } from "react";
import Web3 from "web3";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PolyjuiceHttpProvider } from "@polyjuice-provider/web3";
import { AddressTranslator } from "nervos-godwoken-integration";
import { NotarizingDocumentWrapper } from "../lib/contracts/NotarizingDocumentWrapper";
import { CONFIG } from "../config";
import { Button, Form, Alert, Container, Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

async function createWeb3() {
  // Modern dapp browsers...
  if ((window as any).ethereum) {
    const godwokenRpcUrl = CONFIG.WEB3_PROVIDER_URL;
    const providerConfig = {
      rollupTypeHash: CONFIG.ROLLUP_TYPE_HASH,
      ethAccountLockCodeHash: CONFIG.ETH_ACCOUNT_LOCK_CODE_HASH,
      web3Url: godwokenRpcUrl,
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

  console.log(
    "Non-Ethereum browser detected. You should consider trying MetaMask!"
  );
  return null;
}

export function App() {
  const [web3, setWeb3] = useState<Web3>(null);
  const [contract, setContract] = useState<NotarizingDocumentWrapper>();
  const [accounts, setAccounts] = useState<string[]>();
  const [l2Balance, setL2Balance] = useState<bigint>();
  const [
    existingContractIdInputValue,
    setExistingContractIdInputValue,
  ] = useState<string>();
  const [notarizedResponse, setnotarizedResponse] = useState<
    boolean | undefined
  >();
  const [deployTxHash, setDeployTxHash] = useState<string | undefined>();
  const [polyjuiceAddress, setPolyjuiceAddress] = useState<
    string | undefined
  >();
  const [transactionInProgress, setTransactionInProgress] = useState(false);
  const toastId = React.useRef(null);
  const [notarizedDocument, setNotarizedDocument] = useState<
    string | undefined
  >();
  const [checkedDocument, setCheckedDocument] = useState<string | undefined>();
  useEffect(() => {
    if (accounts?.[0]) {
      const addressTranslator = new AddressTranslator();
      setPolyjuiceAddress(
        addressTranslator.ethAddressToGodwokenShortAddress(accounts?.[0])
      );
    } else {
      setPolyjuiceAddress(undefined);
    }
  }, [accounts?.[0]]);

  useEffect(() => {
    if (transactionInProgress && !toastId.current) {
      toastId.current = toast.info(
        "Transaction in progress. Confirm MetaMask signing dialog and please wait...",
        {
          position: "top-right",
          autoClose: false,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          closeButton: false,
        }
      );
    } else if (!transactionInProgress && toastId.current) {
      toast.dismiss(toastId.current);
      toastId.current = null;
    }
  }, [transactionInProgress, toastId.current]);

  const account = accounts?.[0];
  const document = "111";

  async function deployContract() {
    const _contract = new NotarizingDocumentWrapper(web3);

    try {
      setDeployTxHash(undefined);
      setTransactionInProgress(true);

      const transactionHash = await _contract.deploy(account);

      setDeployTxHash(transactionHash);
      setExistingContractAddress(_contract.address);

      toast(
        "Successfully deployed a smart-contract. You can now proceed to Notarize a document to a smart contract.",
        { type: "success" }
      );
    } catch (error) {
      console.error(error);
      toast.error(
        "There was an error sending your transaction. Please check developer console."
      );
    } finally {
      console.log(_contract.checkDocument(document, account));
      setTransactionInProgress(false);
    }
  }

  async function checkDocument() {
    const value = await contract.checkDocument(checkedDocument, account);
    toast("Successfully Read The Document Notarization status.", {
      type: "success",
    });

    setnotarizedResponse(value);
    console.log(value);
  }

  async function setExistingContractAddress(contractAddress: string) {
    const _contract = new NotarizingDocumentWrapper(web3);
    _contract.useDeployed(contractAddress.trim());

    setContract(_contract);
  }

  async function notarize() {
    try {
      setTransactionInProgress(true);
      await contract.notarize(notarizedDocument, account);
      toast("Successfully Notrized the document, You can Check it manually.", {
        type: "success",
      });
    } catch (error) {
      console.error(error);
      toast.error(
        "There was an error sending your transaction. Please check developer console."
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
      }
    })();
  });

  const LoadingIndicator = () => <span className="rotating-icon">⚙️</span>;

  return (
    <div>
      <Container>
        <Alert className="text-center" variant={"success"}>
          <h2>
            {" "}
            <b> Nervos Notarizing Documents Decentralized App</b>{" "}
          </h2>
        </Alert>
      </Container>
      <Container>
        <Row>
          <Col>
            Your ETH address: <b> {accounts?.[0]}</b>
          </Col>
          <Col>
            Your Polyjuice address: <b>{polyjuiceAddress || " - "}</b>
          </Col>
        </Row>
        <br></br>
        <Row>
          <Col></Col>
          <Col>
            Nervos Layer 2 balance:{" "}
            <b>
              {l2Balance ? (
                (l2Balance / 10n ** 8n).toString()
              ) : (
                <LoadingIndicator />
              )}{" "}
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
            Deployed contract address: <b>{contract?.address || "-"}</b> <br />
          </Col>
          <br></br>
          <Col>
            Deploy transaction hash: <b>{deployTxHash || "-"}</b>
          </Col>
        </Row>
      </Container>
      <br></br>
      <br></br>
      <Container>
        <Alert variant={"info"}>
          The button below will deploy Notarizing Document smart contract where
          you can notarize a document. After deploying the contract, you can
          store the document that you want to Notarize then after you can check
          if the Document is notarized or not.
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
                onChange={(e) =>
                  setExistingContractIdInputValue(e.target.value)
                }
              />
            </Col>
            <Col>
              <Button
                disabled={!existingContractIdInputValue || !l2Balance}
                onClick={() =>
                  setExistingContractAddress(existingContractIdInputValue)
                }
              >
                Use existing contract
              </Button>
            </Col>
          </Row>
        </Col>
        <br />
        <br />
        <Row className="mb-3">
          <Col>
            <Form.Control
              placeholder="Enter what do you want to Notarize"
              onChange={(e) => setNotarizedDocument(e.target.value)}
            />
          </Col>
          <Col>
            <Button onClick={notarize} disabled={!contract}>
              Notrize the Document
            </Button>
          </Col>
        </Row>
        <br />
        <br />
        <Row>
          <Col>
            <Form.Control
              placeholder="Enter what do you want to check"
              onChange={(e) => setCheckedDocument(e.target.value)}
            />
          </Col>
          <Col>
            <Button onClick={checkDocument} disabled={!contract}>
              Check Notarized document
            </Button>
          </Col>
          <Col></Col>
        </Row>

        <br></br>

        <h2>
          {" "}
          {notarizedResponse ? (
            <>
              &nbsp;&nbsp;{" "}
              {notarizedResponse ? (
                <h2>The Document was Notarized</h2>
              ) : (
                <h2> The Document Wasn't Notarized</h2>
              )}{" "}
            </>
          ) : null}
        </h2>
        <br />
        <br />
      </Container>
      <br />
      <br />
      <br />
      <br />
      <hr />
      <Container>
        <Alert variant={"warning"}>
          The contract is deployed on Nervos Layer 2 - Godwoken + Polyjuice.
          After each transaction you might need to wait up to 120 seconds for
          the status to be reflected.
        </Alert>
      </Container>
      <ToastContainer />
    </div>
  );
}
