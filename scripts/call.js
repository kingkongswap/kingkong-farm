const hre = require('hardhat')
const fs = require('fs')
const { BigNumber } = require('ethers')

const kktAAddress = '0xAc8cD27c2e74DfCCD8B01aeEF84aC47d1629C6b0'
const chefAAddress = '0x60c186Fc32f29906655Df54f2bB5E0f11C04a3c9'

async function main() {
    const accounts = await hre.ethers.getSigners()
    const devAddress = accounts[1].address

    let KKTabi = getAbi('./artifacts/contracts/KingKongToken.sol/KingKongToken.json')
    const kkt = new ethers.Contract(kktAAddress, KKTabi, accounts[0])

    let chefabi = getAbi('./artifacts/contracts/MasterChef.sol/MasterChef.json')
    const chef = new ethers.Contract(chefAAddress, chefabi, accounts[0])

    // console.log('MasterChef owner is:', await chef.owner())
	// console.log('MasterChef dev is:', await chef.devaddr())
    console.log('kktPerBlock:', d(await chef.kktPerBlock()))
    
    // await chef.setKKTPerBlock(m(30))
    // console.log('MasterChef setKKTPerBlock')


    //一种token对应一个池子，不能重复开池子，否则会混乱
    // let lpTokenAddress = kktAAddress
    // await chef.add(m(1), lpTokenAddress, true)
    // console.log('add pool')

    // let poolLength = await chef.poolLength()
    // console.log('poolLength:', poolLength.toNumber())
    // if (poolLength == 0) {
    //     return
    // }
    // let pid = 0

    // let pool = await chef.poolInfo(pid)
    // console.log('pool:', pool.lpToken, d(pool.allocPoint), d(pool.accKKTPerShare), pool.lastRewardBlock.toNumber())

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


main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })