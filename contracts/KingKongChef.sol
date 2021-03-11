// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./KingKongToken.sol";

import "hardhat/console.sol";

contract KingKongChef is Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    struct PoolInfo {
        IERC20 rewardToken;
        uint256 rewardPerBlock;
        uint256 lastRewardBlock;
        uint256 accPerShare;
        uint256 balance;
        uint256 amount;
    }

    //active pools, cap limited 9
    address[] public activeArr = new address[](9);

    IERC20 public kkt;

    address public devaddr;

    //user->rewardToken->rewardDebt
    mapping (address => mapping (address => uint256)) public rewardDebt;

    mapping (address => PoolInfo) public poolMap;

    mapping (address => uint256) public balanceOf;

    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    event Harvest(address indexed user, address indexed rewardToken, uint256 amount, address indexed to);


    constructor(IERC20 _kkt) public {
        kkt = _kkt;
        devaddr = address(msg.sender);
    }


    function addPool(IERC20 _rewardToken, uint256 _rewardPerBlock, uint256 _amount) public onlyOwner {
        require(_rewardPerBlock > 0, 'addPool: rewardPerBlock error');
        require(_amount > 0, 'addPool: amount error');

        PoolInfo memory pool = poolMap[address(_rewardToken)];
        require(address(pool.rewardToken) == address(0), 'addPool: already exist');

        _rewardToken.safeTransferFrom(address(msg.sender), address(this), _amount);

        bool success = false;
        address[] memory actives = activeArr;
        for (uint8 i = 0; i < actives.length; i++) {
            address rewardAddress = actives[i];
            if (rewardAddress == address(0)) {
                activeArr[i] = address(_rewardToken);
                success = true;
                break;
            }
        }

        require(success, 'addPool: active full');

        pool = PoolInfo(_rewardToken, _rewardPerBlock, block.number, 0, _amount, _amount);
        poolMap[address(_rewardToken)] = pool;
    }


    function removePool(IERC20 _rewardToken) public onlyOwner {
        PoolInfo memory pool = poolMap[address(_rewardToken)];
        require(address(pool.rewardToken) != address(0), 'removePool: not exist');

        //无人领取的rewardToken，转给开发者
        uint256 balance = pool.rewardToken.balanceOf(address(this));
        if (balance >= pool.balance && pool.balance > 0) {
            pool.rewardToken.safeTransfer(devaddr, pool.balance);
        }

        delete poolMap[address(_rewardToken)];

        address[] memory actives = activeArr;
        for (uint8 i = 0; i < actives.length; i++) {
            address rewardAddress = actives[i];
            if (rewardAddress == address(_rewardToken)) {
                delete activeArr[i];
                break;
            }
        }
    }


    function getMultiplier(uint256 _from, uint256 _to) public pure returns (uint256) {
        return _to.sub(_from);
    }


    function pendingReward(address _user, address _rewardAddress) public view returns (uint256) {
        PoolInfo memory pool = poolMap[_rewardAddress];
        if (address(pool.rewardToken) == address(0)) {
            return 0;
        }
        
        uint256 accPerShare = pool.accPerShare;
        uint256 supply = kkt.balanceOf(address(this));
        if (block.number > pool.lastRewardBlock && supply != 0) {
            uint256 multiplier = getMultiplier(pool.lastRewardBlock, block.number);
            uint256 reward = multiplier.mul(pool.rewardPerBlock);
            accPerShare = accPerShare.add(reward.mul(1e12).div(supply));

            // console.log('pendingReward supply', supply);
            // console.log('pendingReward multiplier', multiplier);
            // console.log('pendingReward reward', reward);
            // console.log('pendingReward accPerShare', accPerShare);
        }
        
        uint256 myKKT = balanceOf[_user];
        uint256 myRewardDebt = rewardDebt[_user][_rewardAddress];
        // console.log('pendingReward myKKT', myKKT);
        // console.log('pendingReward myRewardDebt', myRewardDebt);

        return myKKT.mul(accPerShare).div(1e12).sub(myRewardDebt);
    }


    function massUpdatePools() public {
        address[] memory actives = activeArr;
        uint256 supply = kkt.balanceOf(address(this));

        for (uint8 i = 0; i < actives.length; i++) {
            address rewardAddress = actives[i];
            if (rewardAddress != address(0)) {

                PoolInfo memory pool = poolMap[rewardAddress];
                if (block.number <= pool.lastRewardBlock) {
                    continue;
                }
                if (supply == 0) {
                    pool.lastRewardBlock = block.number;
                    continue;
                }
                uint256 multiplier = getMultiplier(pool.lastRewardBlock, block.number);
                uint256 reward = multiplier.mul(pool.rewardPerBlock);
                pool.accPerShare = pool.accPerShare.add(reward.mul(1e12).div(supply));
                pool.lastRewardBlock = block.number;

                poolMap[rewardAddress] = pool;
                // console.log('updatePool', pool.accPerShare, pool.lastRewardBlock);
            }
        }
    }


    function deposit(uint256 _amount) public {
        require(_amount > 0, 'deposit: not good');

        uint256 myKKT = balanceOf[msg.sender];
        if (myKKT == 0) {
            massUpdatePools();
        } else {
            harvestAll();
        }

        kkt.safeTransferFrom(msg.sender, address(this), _amount);
        uint256 myKKT_after = myKKT.add(_amount);
        balanceOf[msg.sender] = myKKT_after;

        if (myKKT == 0) {
            address[] memory actives = activeArr;
            for (uint8 i = 0; i < actives.length; i++) {
                address rewardAddress = actives[i];
                if (rewardAddress != address(0)) {
                    PoolInfo memory pool = poolMap[rewardAddress];
                    rewardDebt[msg.sender][rewardAddress] = myKKT_after.mul(pool.accPerShare).div(1e12);
                }
            }
        }

        emit Deposit(msg.sender, _amount);
    }


    function withdraw(uint256 _amount) public {
        require(balanceOf[msg.sender] >= _amount && _amount > 0, 'withdraw: not good');

        harvestAll();

        balanceOf[msg.sender] = balanceOf[msg.sender].sub(_amount);
        kkt.safeTransfer(msg.sender, _amount);

        emit Withdraw(msg.sender, _amount);
    }


    function harvestAll() public {
        massUpdatePools();

        address[] memory actives = activeArr;
        for (uint8 i = 0; i < actives.length; i++) {
            address rewardAddress = actives[i];
            if (rewardAddress != address(0)) {
                harvest(rewardAddress, msg.sender);
            }
        }
    }


    function harvest(address _rewardAddress, address to) internal {
        uint256 myKKT = balanceOf[msg.sender];
        uint256 pending = pendingReward(msg.sender, _rewardAddress);
        PoolInfo memory pool = poolMap[_rewardAddress];

        if (pending > 0) {
            pool.rewardToken.safeTransfer(to, pending);
            pool.balance = pool.balance.sub(pending);
            poolMap[_rewardAddress] = pool;
            rewardDebt[msg.sender][_rewardAddress] = myKKT.mul(pool.accPerShare).div(1e12);
            emit Harvest(msg.sender, _rewardAddress, pending, to);
        }
    }
}