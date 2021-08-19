// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract OwnERC20Token is ERC20 {
    constructor() ERC20('dayaa', 'dya') {
        _mint(msg.sender, 10000000000000000000000);
    }
    //     constructor() ERC20("TOKEN_NAME", "TOKEN_SYMBOL") {
    //     _mint(msg.sender, TOTAL_SUPPLY);}
    // Add your custom Methods.
}
