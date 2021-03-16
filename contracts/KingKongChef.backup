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
        uint256 poolId;
        IERC20 rewardToken; //挖什么币
        uint256 rewardPerBlock; //每个区块出多少个币
        uint256 lastRewardBlock; //最后一次更新accPerShare的区块高度
        uint256 accPerShare; //用户持有一个stakeToken，可以挖多少个rewardToken，考虑精度，这个值要乘以1e12，随时间自增，自增即出矿
        uint256 balance; //矿池还有多少币可以挖
        uint256 amount; //创建矿池的时候投放了多少个币
        uint256 bonusStartBlock; //什么时候开始挖
        uint256 bonusEndBlock; //什么时候结束，创建矿池的时候计算出来的
        address back; //创建矿池的时候矿币从哪来的，移除矿池的时候如果有剩余的矿币就原路返回
    }

    //同时挖的矿池的地址
    address[] public activeArr = new address[](9);

    //rewardToken->PoolInfo，通过activeArr拿到矿池地址，再通过poolMap找到矿池信息
    mapping (address => PoolInfo) public poolMap;

    //poolId->user->rewardDebt，记录用户已经挖了多少，随时间自增，如果用户中途进来，那么之前错过的也算入rewardDebt
    //为什么不用rewardAddress：为了保证每个pool的rewardDebt都是独立的，即使同样矿币的pool，也有不同的id
    mapping (uint256 => mapping (address => uint256)) rewardDebt;

    //抵押币
    IERC20 public stakeToken;

    //总共抵押了多少个币，替代stakeToken.balanceOf(address(this))，避免直接transfer到合约造成数据不准
    uint256 public totalStake;

    //记录每个用户抵押了多少个币
    mapping (address => uint256) public balanceOf;

    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    event Harvest(address indexed user, address indexed rewardToken, uint256 amount, address indexed to);
    event EmergencyWithdraw(address indexed user, uint256 amount);


    constructor(IERC20 _stakeToken) public {
        stakeToken = _stakeToken;
    }


    // //查看用户在某个矿池的rewardDebt，测试的时候用
    function getRewardDebt(address _user, address _rewardAddress) public view returns (uint256) {
        //从poolMap取的pool，必须是storage，因为pool里面有mapping
        PoolInfo storage pool = poolMap[_rewardAddress];
        if (address(pool.rewardToken) == address(0)) {
            return 0;
        }
        return rewardDebt[pool.poolId][_user];
    }


    //需要把矿币approve给本合约，再由管理员调用addPool，一个矿币对应一个矿池，不能两个矿池都挖同一种币
    function addPool(IERC20 _rewardToken, uint256 _rewardPerBlock, uint256 _bonusStartBlock, uint256 _bonusEndBlock, address _from) public onlyOwner {
        require(_bonusStartBlock > block.number, 'addPool: bonusStartBlock error');

        //bonusStartBlock是可以挖的第一个区块，bonusEndBlock是结束区块，不能挖
        uint256 amount = _bonusEndBlock.sub(_bonusStartBlock).mul(_rewardPerBlock);
        require(amount > 0, 'addPool: amount error');

        PoolInfo storage pool = poolMap[address(_rewardToken)];
        require(address(pool.rewardToken) == address(0), 'addPool: already exist');

        _rewardToken.safeTransferFrom(_from, address(this), amount);

        bool success = false;
        address[] memory actives = activeArr;
        for (uint8 i = 0; i < actives.length; i++) {
            if (actives[i] == address(0)) {
                activeArr[i] = address(_rewardToken);
                success = true;
                break;
            }
        }

        require(success, 'addPool: active full');

        poolMap[address(_rewardToken)] = PoolInfo(block.number, _rewardToken, _rewardPerBlock, _bonusStartBlock-1, 0, amount, amount, _bonusStartBlock, _bonusEndBlock, _from);
    }


    //移除矿池，矿池数量上限是9个，超过就需要移除老矿池
    function removePool(IERC20 _rewardToken) public onlyOwner {
        PoolInfo storage pool = poolMap[address(_rewardToken)];
        require(address(pool.rewardToken) != address(0), 'removePool: not exist');

        //剩余的矿币，原路返回
        if (pool.balance > 0) {
            uint256 balance = pool.rewardToken.balanceOf(address(this));
            if (balance >= pool.balance) {
                pool.rewardToken.safeTransfer(pool.back, pool.balance);
            }
        }

        delete poolMap[address(_rewardToken)];

        address[] memory actives = activeArr;
        for (uint8 i = 0; i < actives.length; i++) {
            if (actives[i] == address(_rewardToken)) {
                delete activeArr[i];
                break;
            }
        }
    }


    //经过了多少个区块
    function getMultiplier(uint256 _from, uint256 _to) public pure returns (uint256) {
        if (_to > _from) {
            return _to - _from;
        }
        return 0;
    }


    //充值stakeToken
    function deposit(uint256 _amount) public {
        require(_amount > 0, 'deposit: not good');

        uint256 myStakeAmount = balanceOf[msg.sender];
        if (myStakeAmount == 0) {
            //首次充值进来，rewardDebt的更新不能用harvestAll，massUpdatePools只是做个义务劳动
            massUpdatePools();
        } else {
            //先收矿
            harvestAll(msg.sender);
        }

        //充值
        stakeToken.safeTransferFrom(msg.sender, address(this), _amount);
        uint256 myStakeAmount_after = myStakeAmount.add(_amount);
        balanceOf[msg.sender] = myStakeAmount_after;
        totalStake = totalStake.add(_amount);

        //充值提现，都要重新计算rewardDebt，当作是之前的已经结算了，根据新的stake来计算后续的产出
        address[] memory actives = activeArr;
        for (uint8 i = 0; i < actives.length; i++) {
            address rewardAddress = actives[i];
            if (rewardAddress != address(0)) {
                PoolInfo storage pool = poolMap[rewardAddress];
                //首次充值，由公式计算rewardDebt
                rewardDebt[pool.poolId][msg.sender] = myStakeAmount_after.mul(pool.accPerShare).div(1e12);
            }
        }

        emit Deposit(msg.sender, _amount);
    }


    //提现stakeToken
    function withdraw(uint256 _amount) public {
        uint256 myStakeAmount = balanceOf[msg.sender];
        require(myStakeAmount >= _amount && _amount > 0, 'withdraw: not good');

        //先收矿
        harvestAll(msg.sender);

        //提现
        uint256 myStakeAmount_after = myStakeAmount.sub(_amount);
        balanceOf[msg.sender] = myStakeAmount_after;
        totalStake = totalStake.sub(_amount);
        stakeToken.safeTransfer(msg.sender, _amount);

        //充值提现，都要重新计算rewardDebt，当作是之前的已经结算了，根据新的stake来计算后续的产出
        address[] memory actives = activeArr;
        for (uint8 i = 0; i < actives.length; i++) {
            address rewardAddress = actives[i];
            if (rewardAddress != address(0)) {
                PoolInfo storage pool = poolMap[rewardAddress];
                //首次充值，由公式计算rewardDebt
                rewardDebt[pool.poolId][msg.sender] = myStakeAmount_after.mul(pool.accPerShare).div(1e12);
            }
        }

        emit Withdraw(msg.sender, _amount);
    }


    //收矿，可以指定接收账户，一般是msg.sender自己
    function harvestAll(address to) public {
        massUpdatePools();

        address[] memory actives = activeArr;
        for (uint8 i = 0; i < actives.length; i++) {
            address rewardAddress = actives[i];
            if (rewardAddress != address(0)) {
                harvest(rewardAddress, to);
            }
        }
    }

    //收某个矿，为了避免混乱，标记为internal，只允许harvestAll
    function harvest(address _rewardAddress, address to) internal {
        uint256 myStakeAmount = balanceOf[msg.sender];
        uint256 pending = pendingReward(msg.sender, _rewardAddress);
        PoolInfo storage pool = poolMap[_rewardAddress];

        if (pending > 0) {
            pool.balance = pool.balance.sub(pending);
            rewardDebt[pool.poolId][msg.sender] = myStakeAmount.mul(pool.accPerShare).div(1e12);
            pool.rewardToken.safeTransfer(to, pending);
            emit Harvest(msg.sender, _rewardAddress, pending, to);
        }
    }


    //待收矿的数量
    function pendingReward(address _user, address _rewardAddress) public view returns (uint256) {
        PoolInfo storage pool = poolMap[_rewardAddress];
        if (address(pool.rewardToken) == address(0)) {
            return 0;
        }
        uint256 myStakeAmount = balanceOf[_user];
        if (myStakeAmount == 0) {
            return 0;
        }

        //没开始或者已经结束了
        if (block.number < pool.bonusStartBlock || block.number >= pool.bonusEndBlock) {
            return 0;
        }
        
        uint256 accPerShare = pool.accPerShare;
        if (block.number > pool.lastRewardBlock && totalStake != 0) {
            uint256 multiplier = getMultiplier(pool.lastRewardBlock, block.number);
            uint256 reward = multiplier.mul(pool.rewardPerBlock);
            accPerShare = accPerShare.add(reward.mul(1e12).div(totalStake));
        }

        uint256 myRewardDebt = rewardDebt[pool.poolId][_user];
        // console.log('[KingKongChef] pendingReward', accPerShare, myRewardDebt);
        return myStakeAmount.mul(accPerShare).div(1e12).sub(myRewardDebt);
    }


    //一次更新全部矿池的accPerShare和lastRewardBlock
    function massUpdatePools() internal {
        address[] memory actives = activeArr;
        for (uint8 i = 0; i < actives.length; i++) {
            address rewardAddress = actives[i];
            if (rewardAddress != address(0)) {

                PoolInfo storage pool = poolMap[rewardAddress];
                if (block.number < pool.bonusStartBlock || block.number >= pool.bonusEndBlock) {
                    continue;
                }
                if (block.number <= pool.lastRewardBlock) {
                    continue;
                }
                if (totalStake == 0) {
                    //特殊情况，跳过出矿
                    pool.lastRewardBlock = block.number;
                    continue;
                }
                uint256 multiplier = getMultiplier(pool.lastRewardBlock, block.number);
                uint256 reward = multiplier.mul(pool.rewardPerBlock);
                pool.accPerShare = pool.accPerShare.add(reward.mul(1e12).div(totalStake));
                pool.lastRewardBlock = block.number;
                // console.log('updatePool', pool.accPerShare, pool.lastRewardBlock);
            }
        }
    }


    // Withdraw without caring about rewards. EMERGENCY ONLY.
    function emergencyWithdraw() public {
        uint256 myStakeAmount = balanceOf[msg.sender];
        require(myStakeAmount > 0, 'withdraw: not good');
        
        //提现
        balanceOf[msg.sender] = 0;
        totalStake = totalStake.sub(myStakeAmount);
        stakeToken.safeTransfer(msg.sender, myStakeAmount);

        emit EmergencyWithdraw(msg.sender, myStakeAmount);
    }

}