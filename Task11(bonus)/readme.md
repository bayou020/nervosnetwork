# Use a Tron Wallet to Execute a Smart Contract Call
### 1- A screenshot of the account created
![Screenshot from 2021-08-17 19-46-22](https://user-images.githubusercontent.com/28756413/129783296-4e405d50-0603-403c-b42b-435d34801f26.png)
### 2- A link to the Layer 1 address funded
[Link](https://explorer.nervos.org/aggron/address/ckt1qyqtra8ajj92tshyvfkdpemcwnheq4rfqntssrndss)
### 3- A screenshot of the console output immediately after successfully submitted a CKByte deposit to Tron account on Layer 2.
![Screenshot from 2021-08-17 15-52-45](https://user-images.githubusercontent.com/28756413/129783686-ce47d520-4740-4c16-9749-514a9fb8bbba.png)
### 4- A screenshot of the console output immediately after successfully issued a smart contract calls on Layer 2.
![Screenshot from 2021-08-17 16-06-42](https://user-images.githubusercontent.com/28756413/129784863-b21dc014-cd55-4f28-99a3-7166384eb448.png)
### 5- The transaction hash from the console output 
```
0xc3303009705d945dec55b4487ae82b9e66acaf7039642929a223272d5be18dc4
```
### 6- The contract address called 
```
0xe486f18464c89ac6F3167e13e626972e18CE9Dad
```
### 7- The ABI for contract made a call on

```javascript

  {
      "inputs": [],
      "stateMutability": "payable",
      "type": "constructor"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "x",
          "type": "string"
        }
      ],
      "name": "set",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "get",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
 ```
 ### 8- Tron Address
 ```
 TSSDVFvJQBtTjbDkJT6QJGkrc8WwKLcUKH
 ```
 ### 9 Console Output (screenshot)
 
 ![Screenshot from 2021-08-17 19-40-13](https://user-images.githubusercontent.com/28756413/129785458-ed800aa6-56be-4e5e-b7c1-5783144c2863.png)

 


