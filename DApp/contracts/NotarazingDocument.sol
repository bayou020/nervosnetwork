//SPDX-License-Identifier: gnu 3.0

pragma solidity >=0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract NotarizingDocument is Ownable {
 mapping (bytes32 => bool) private proofs;
 // store a proof of existence in the contract state
 function storeProof(bytes32 proof) private {
 proofs[proof] = true;
 }
 // calculate and store the proof for a document
 function notarize (string memory document) public payable onlyOwner {
     
 storeProof(proofFor(document));
 }
 
 // helper function to get a document's sha256
 function proofFor(string memory document) private
 pure returns (bytes32) {
 return sha256(bytes(document));
 }
 // check if a document has been notarized
 function checkDocument(string memory document) public
 view onlyOwner returns (bool) {
 return proofs[proofFor(document)];
 }
}