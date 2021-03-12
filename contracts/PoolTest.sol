// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./KingKongToken.sol";

import "hardhat/console.sol";

contract PoolInfo is Ownable {
    IERC20 public rewardToken;
    uint256 public rewardPerBlock;
    mapping (address => uint256) public rewardDebt;

    constructor(IERC20 _rewardToken, uint256 _rewardPerBlock) public {
        rewardToken = _rewardToken;
        rewardPerBlock = _rewardPerBlock;
    }

    function getRewardDebt(address _user) public view returns (uint256) {
        return rewardDebt[_user];
    }
  
    function setRewardDebt(address _user, uint256 value) public onlyOwner {
        rewardDebt[_user] = value;
    }
}


contract PoolTest is Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    mapping (address => PoolInfo) public poolMap;

    constructor() public {
    }

    function rewardDebt(address _user, IERC20 _rewardToken) public view returns (uint256) {
        PoolInfo pool = poolMap[address(_rewardToken)];
        if (address(pool) == address(0)) {
            return 0;
        }
        return pool.getRewardDebt(_user);
    }

    function addPool(IERC20 _rewardToken, uint256 _rewardPerBlock) public onlyOwner {
        PoolInfo pool = new PoolInfo(_rewardToken, _rewardPerBlock);
        poolMap[address(_rewardToken)] = pool;
    }


    function setRewardDebt(IERC20 _rewardToken, uint256 value) public {
        PoolInfo pool = poolMap[address(_rewardToken)];
        pool.setRewardDebt(msg.sender, value);
    }


    function removePool(IERC20 _rewardToken) public onlyOwner {
        delete poolMap[address(_rewardToken)];
    }

}