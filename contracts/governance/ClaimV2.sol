// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "hardhat/console.sol";

//用于分红的合约，把ERC20代币打给本合约，各个股东通过harvest获取分红
contract ClaimV2 is Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    struct UserInfo {
        uint256 rewardDebt;
        uint256 point; //股份
    }

    mapping (address => UserInfo) public userInfo;

    uint256 public totalPoint; //总股份 = 所有股东的point股份相加

    uint256 public totalReleased;

    uint256 public lastTotal;

    IERC20 public rewardToken;

    uint256 public accPerShare;

    event SetUser(address indexed wallet, uint256 point);
    event Harvest(address indexed wallet, uint256 amount, address indexed to);


    constructor(address _rewardAddress) public {
        rewardToken = IERC20(_rewardAddress);
    }

    //股东管理
    function setUser(address _wallet, uint256 _point) public onlyOwner {
        UserInfo storage user = userInfo[_wallet];

        if (_point == 0) { //移除
            _harvest(_wallet, _wallet);
            totalPoint = totalPoint.sub(user.point);
            delete userInfo[_wallet];
            emit SetUser(_wallet, _point);
            return;
        }

        if (user.point == 0) { //新增
            update();
            totalPoint = totalPoint.add(_point);
            uint256 myRewardDebt = _point.mul(accPerShare).div(1e12);
            userInfo[_wallet] = UserInfo(myRewardDebt, _point);
            emit SetUser(_wallet, _point);
            return;
        }

        _harvest(_wallet, _wallet);
        totalPoint = totalPoint.add(_point).sub(user.point);
        user.point = _point;
        user.rewardDebt = _point.mul(accPerShare).div(1e12);
        emit SetUser(_wallet, _point);
    }


    function update() internal {
        if (totalPoint == 0) {
            return;
        }
        uint256 balance = rewardToken.balanceOf(address(this));
        uint256 reward = totalReleased + balance - lastTotal;
        accPerShare = accPerShare.add(reward.mul(1e12).div(totalPoint));
        lastTotal = totalReleased + balance;
    }


    function harvest(address _to) public {
        _harvest(msg.sender, _to);
    }


    function _harvest(address _wallet, address _to) internal {
        UserInfo storage user = userInfo[_wallet];
        if (user.point == 0) {
            return;
        }

        update();

        uint256 pending = pendingReward(_wallet);

        if (pending > 0) {
            // user.rewardDebt = user.rewardDebt.add(pending);
            user.rewardDebt = user.point.mul(accPerShare).div(1e12);
            totalReleased = totalReleased.add(pending);
            rewardToken.safeTransfer(_to, pending);
            emit Harvest(_wallet, pending, _to);
        }
    }


    function pendingReward(address _wallet) public view returns (uint256) {
        UserInfo memory user = userInfo[_wallet];

        uint256 balance = rewardToken.balanceOf(address(this));
        uint256 reward = totalReleased + balance - lastTotal;
        uint256 acc = accPerShare.add(reward.mul(1e12).div(totalPoint));
        return user.point.mul(acc).div(1e12).sub(user.rewardDebt);
    }

}
