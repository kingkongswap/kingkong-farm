// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import './KingChef.sol';

contract Deployer {

    address[] public allChefs;
    uint256 public allChefsLength;

    event ChefCreated(uint256 indexed id, address chef);

    constructor() public {
    }

    function createChef(address _stakeToken, address _owner) external returns (address chefAddress) {
        KingChef chef = new KingChef(_stakeToken);
        chefAddress = address(chef);
        chef.transferOwnership(_owner);
        
        allChefs.push(chefAddress);
        emit ChefCreated(allChefsLength, chefAddress);
        allChefsLength++;
    }

}
