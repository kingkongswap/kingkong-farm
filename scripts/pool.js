const hre = require('hardhat')
const fs = require('fs')
const { BigNumber } = require('ethers')

const kktAAddress = '0xAc8cD27c2e74DfCCD8B01aeEF84aC47d1629C6b0'
const lptokenAAddress = '0x83ea6f896be89b6a2ebeb8dfa313a104ec111233'
const chefAAddress = '0x60c186Fc32f29906655Df54f2bB5E0f11C04a3c9'

async function main() {
    const accounts = await hre.ethers.getSigners()
    const devAddress = accounts[1].address

    let KKTabi = getAbi('./artifacts/contracts/KingKongToken.sol/KingKongToken.json')
    const kkt = new ethers.Contract(kktAAddress, KKTabi, accounts[0])

    let lptokenabi = getAbi('./artifacts/contracts/interfaces/IERC20.sol/IERC20.json')
    const lptoken = new ethers.Contract(lptokenAAddress, lptokenabi, accounts[0])

    let chefabi = getAbi('./artifacts/contracts/MasterChef.sol/MasterChef.json')
    const chef = new ethers.Contract(chefAAddress, chefabi, accounts[0])

    console.log('MasterChef owner is:', await chef.owner())  //okex会报错
	console.log('MasterChef dev is:', await chef.devaddr())  //okex会报错

    //一种token对应一个池子，不能重复开池子，否则会混乱
    // await chef.add(m(1), lptokenAAddress, true)
    // console.log('add pool')

    let poolLength = await chef.poolLength()
    console.log('poolLength:', poolLength.toNumber())
    if (poolLength == 0) {
        return
    }
    let pid = 1

    let pool = await chef.poolInfo(pid)
    console.log('pool:', pool.lpToken, d(pool.allocPoint), d(pool.accKKTPerShare), pool.lastRewardBlock.toNumber())

    let bal = await lptoken.balanceOf(devAddress)
    console.log('lptoken balance', d(bal))

    //投入池子
    await lptoken.connect(accounts[1]).approve(chefAAddress, m(1))
    console.log('lptoken.approve')
    await chef.connect(accounts[1]).deposit(pid, m(1), {gasLimit:BigNumber.from('8000000')})
    console.log('dev chef.deposit')
    
    console.log('done')
}


async function afterMoment() {
    const accounts = await hre.ethers.getSigners()
    const devAddress = accounts[1].address

    let lptokenabi = getAbi('./artifacts/contracts/interfaces/IERC20.sol/IERC20.json')
    const lptoken = new ethers.Contract(lptokenAAddress, lptokenabi, accounts[0])

    let chefabi = getAbi('./artifacts/contracts/MasterChef.sol/MasterChef.json')
    const chef = new ethers.Contract(chefAAddress, chefabi, accounts[1])

    let poolLength = await chef.poolLength()
    console.log('poolLength:', poolLength.toNumber())
    if (poolLength == 0) {
        return
    }
    let pid = 1

    let pool = await chef.poolInfo(pid)
    console.log('pool:', pool.lpToken, d(pool.allocPoint), d(pool.accKKTPerShare), pool.lastRewardBlock.toNumber())

    // //挖矿收益
    let kktNum = await chef.pendingKKT(pid, devAddress)
    console.log('挖矿收益', d(kktNum))
    
    let bal = await lptoken.balanceOf(devAddress)
    console.log('lptoken balance', d(bal))

    //提现
    await chef.withdraw(pid, bal, {gasLimit:BigNumber.from('8000000')})
    console.log('提现')
    
    console.log('done')
}


function getAbi(jsonPath) {
    let file = fs.readFileSync(jsonPath)
    let abi = JSON.parse(file.toString()).abi
    return abi
}


function m(num) {
    return BigNumber.from('1000000000000000000').mul(num)
}

function d(bn) {
    return bn.div('1000000000').toNumber() / 1000000000
}


afterMoment()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })