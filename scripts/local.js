const hre = require('hardhat')
const fs = require('fs')
const { BigNumber } = require('ethers')


async function main() {
    const accounts = await hre.ethers.getSigners()
    const devAddress = accounts[1].address

    let KKTabi = getAbi('./artifacts/contracts/KingKongToken.sol/KingKongToken.json')
    let kktAAddress = '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6'
    const kkt = new ethers.Contract(kktAAddress, KKTabi, accounts[1])

    let chefabi = getAbi('./artifacts/contracts/MasterChef.sol/MasterChef.json')
    let chefAAddress = '0x610178dA211FEF7D417bC0e6FeD39F05609AD788'
    const chef = new ethers.Contract(chefAAddress, chefabi, accounts[0])

    let lpTokenAddress = '0xb3398d0341b390324e80286583ec34c7b5a272cf'
    // await chef.add(m(1), lpTokenAddress, true)

    let poolLength = await chef.poolLength()
    console.log('poolLength:', poolLength.toNumber())
    if (poolLength == 0) {
        return
    }

    let pool = await chef.poolInfo(poolLength - 1)
    console.log('pool:', pool.lpToken, d(pool.allocPoint), d(pool.accKKTPerShare), d(pool.lastRewardBlock))

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