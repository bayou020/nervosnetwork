//SPDX-License-Identifier: gnu 3.0
pragma solidity >=0.8.0;

contract BayouStorage {
  string storedData;

  constructor() payable {
    storedData = '444';
  }

  function set(string memory x) public payable {
    storedData = x;
  }

  function get() public view returns (string memory) {
    return storedData;
  }
}