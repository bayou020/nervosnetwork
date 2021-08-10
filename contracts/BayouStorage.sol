//SPDX-License-Identifier: gnu 3.0
pragma solidity >=0.8.0;

contract BayouStorage {
  uint storedData;

  constructor() payable {
    storedData = 777;
  }

  function set(uint x) public payable {
    storedData = x;
  }

  function get() public view returns (uint) {
    return storedData;
  }
}