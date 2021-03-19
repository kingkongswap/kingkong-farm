// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

import "hardhat/console.sol";

//用于分红的合约，把ERC20代币打给本合约，再调用claim进行分红
//谁创建谁是管理员，所有函数都只能管理员调用
contract Claim is Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    struct UserInfo {
        address wallet; //个人钱包地址
        uint256 point; //股份
    }

    UserInfo[] public userArr; //股东人数不能太多，否则可能会gas不足

    uint256 public totalPoint; //总股份 = 所有股东的point股份相加


    constructor() public {

    }

    //添加股东
    function addUser(address wallet, uint256 point) public onlyOwner {
        require(point > 0, 'addUser: point error');

        bool success = false;
        for (uint8 i = 0; i < userArr.length; i++) {
            UserInfo user = userArr[i];
            if (user.wallet == address(0)) {
                userArr[i] = UserInfo(wallet, point);
                totalPoint = totalPoint.add(point);
                success = true;
                break;
            } 
        }

        if (!success) {
            userArr.push(UserInfo(wallet, point));
            totalPoint = totalPoint.add(point);
        }
    }

    //移除股东
    function removeUser(address wallet) public onlyOwner {
        bool success = false;
        for (uint8 i = 0; i < userArr.length; i++) {
            UserInfo user = userArr[i];
            if (user.wallet == wallet) {
                delete userArr[i];
                totalPoint = totalPoint.sub(user.point);
                success = true;
                break;
            } 
        }

        require(success, 'removeUser: not exist');
    }

    //分红某个ERC20代币，amount分红的数量
    function claim(address tokenAddress, uint256 amount) public onlyOwner {
        require(totalPoint > 0, 'claim: totalPoint error');

        IERC20 token = IERC20(tokenAddress);
        uint256 balance = token.balanceOf(address(this));
        require(balance >= amount && amount > 0, 'claim: amount error');

        for (uint8 i = 0; i < userArr.length; i++) {
            UserInfo user = userArr[i];
            if (user.wallet == address(0)) {
                continue;
            }
            uint claimAmount = amount.mul(user.point).div(totalPoint);
            token.safeTransfer(user.wallet, claimAmount);
        }
    }

    //根据百分比分红某个ERC20代币，percent取值1-100，不支持小数
    function claimByPercent(address tokenAddress, uint256 percent) public onlyOwner {
        require(percent >= 1 && percent <= 100, 'claim: percent error');

        IERC20 token = IERC20(tokenAddress);
        uint256 balance = token.balanceOf(address(this));
        uint256 amount = balance.mul(percent).div(100);
        require(amount > 0, 'claim: amount error');

        for (uint8 i = 0; i < userArr.length; i++) {
            UserInfo user = userArr[i];
            if (user.wallet == address(0)) {
                continue;
            }
            uint claimAmount = amount.mul(user.point).div(totalPoint);
            token.safeTransfer(user.wallet, claimAmount);
        }
    }

    //万一股东数量太多，超出gas没法分红了，那只能用紧急出口把币转出去
    function emergency(address tokenAddress, address to) public onlyOwner {
        IERC20 token = IERC20(tokenAddress);
        uint256 balance = token.balanceOf(address(this));
        token.safeTransfer(to, balance);
    } 

}
