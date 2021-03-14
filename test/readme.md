# 测试说明
### 以下测试使用hardhat测试通过
### 命令 npx hardhat test，将会自动运行test/下所有的*.js，想跳过的js可以把.js后缀改掉
## KingKongChef Test:
### 观察数据后，把正确的数值写在js脚本的最后环节，这样改动.sol的时候，跑一下脚本，全部打勾通过就OK
1. kingkongchef-1user1pool-1 模拟1个用户挖1种币的基本情况，主要是测试接口的基本功能
2. kingkongchef-1user1pool-2 稍复杂点的测试，穿插了withdraw deposit harvestAll
3. kingkongchef-10user1pool 模拟10个用户挖1种币，中间也有各种穿插，重点是看最后挖到的数量，和理论值是否一致，有个位数误差，估计是精度问题，这个不可避免
4. kingkongchef-2user1pool-1 模拟2个用户挖1种币，中间也有各种穿插，互相影响彼此的收益
5. kingkongchef-2user2pool-1 在2user1pool的基础上增加1种币，看各阶段的数值是否正确
6. kingkongchef-error-1 测试addPool后，再removePool，再addPool挖同一种币，主要考验的是数据结构设计，为此还专门写了个PoolTest.sol来研究，solidity有个坑，多联mapping的数据不能清空，所以removePool的时候rewardDebt不能清空，addPool的时候数据还在，造成数据错误，所以用blockNum作为pool的唯一id，确保addPool的时候不会和老的pool关联
7. kingkongchef-error-2 把stakeToken添加到矿池，测试抵押KKT挖KKT
8. kingkongchef-error-3 测试9个矿池的情况，中间添加删除pool，观察数据的变化
### 除此以外，还测试了:
1. emergencyWithdraw() 逃生出口
2. 没有人抵押的时候，是否出矿？结果是不出，这部分矿会一直留在矿池，直到removePool原路返回给发送方
3. 没到开挖的区块高度，或者超过了，是否能收矿？结果是不能
4. 重复添加一种矿池，会怎样？结果是revert
5. 超过9个矿池，继续添加会怎样？结果是revert
6. 开始挖矿的区块高度，最小值是当前区块高度+2，因为调用addPool的时候+1，再+1才是大于addPool时候的高度，否则revert
7. 用户pending的收益不及时收矿，过了结束高度，还能收矿吗？结果是不能，这部分矿就留在矿池了，直到removePool原路返回给发送方
### 未测试的:
1. gas消耗，目前gas消耗比较大，还有一些优化空间 


