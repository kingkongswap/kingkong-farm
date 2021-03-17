// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import './KingChef.sol';

contract Deployer {

    mapping(uint256 => address) public getChef;
    address[] public allChefs;

    event ChefCreated(uint256 indexed blockNum, address chef, uint);

    constructor() public {
    }

    function allChefsLength() external view returns (uint) {
        return allChefs.length;
    }

    function createChef(address _stakeToken, address _owner) external returns (address chefAddress) {
        KingChef chef = new KingChef(_stakeToken);
        chefAddress = address(chef);
        chef.transferOwnership(_owner);
        getChef[block.number] = chefAddress;
        allChefs.push(chefAddress);
        emit ChefCreated(block.number, chefAddress, allChefs.length);
    }

}
