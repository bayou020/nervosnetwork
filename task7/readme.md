# 💎 Port An Existing Ethereum DApp To Polyjuice
### 1- DApp Screenshots running on GodWoken testnet
![Screenshot from 2021-08-21 11-25-17](https://user-images.githubusercontent.com/28756413/130318914-689e279e-24a9-4a8d-9aa6-b00d2c576fb2.png)
![Screenshot from 2021-08-21 11-25-52](https://user-images.githubusercontent.com/28756413/130318916-8229467f-f8ad-4756-9a19-2d7846f90401.png)
![Screenshot from 2021-08-21 11-26-14](https://user-images.githubusercontent.com/28756413/130318917-14e21497-9dbd-470d-91b3-5a8237b7bc41.png)
![Screenshot from 2021-08-21 16-55-26](https://user-images.githubusercontent.com/28756413/130327666-65407ff6-3b02-4235-b296-40f6e8786a69.png)


### 2-DApp Github Link
[Link](https://github.com/bayou020/nervosnetwork/tree/main/DApp)
### 3-1 deployed SmartContract address 
```
 0x798e6E191414dc4f1a33836eFF0119C002B00CB2
 ```
 ### 3-2 deployed transaction Hash
 ```
0xa7728962fca8035fd854fa40f058abf869d1c59faa93e5fb7e3988e7ad788693

  ```
  ### 3-3 ABI deployed of the smart contract
  
  ```javascript 
"abi": [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "document",
          "type": "string"
        }
      ],
      "name": "notarize",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "document",
          "type": "string"
        }
      ],
      "name": "checkDocument",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ],
  ```
 
