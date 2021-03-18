const hre = require('hardhat')
const fs = require('fs')
const { BigNumber } = require('ethers')

// lptoken: 0x695Ef962b4Ee88ED193148E486208D58d184D203 WOKT-USDT 3
// lptoken: 0xAA62cf5bf12D541335AC776eCBFd3BEBBDe5cF21 KKT-USDT 5
// lptoken: 0xa67C92B04d66aB92c587f224b37CCd4E2055aA0d KKT-WOKT 5
// lptoken: 0x2BC09D8f6bEc3C8DdccdbE18d1FdB0E615845dF3 NAS-USDT 3
// lptoken: 0x1e6A2B2701A5423930cF0Da95A7A007D9A26D2f7 OKB-USDT 2
// lptoken: 0xf0858096473087b12634999E43aC14945841bfbA BTCK-USDT 1
// lptoken: 0x8D802439F1f7Cbf93F3384d95857b61DD7FA901b ETHK-USDT 1
// lptoken: 0xF46e0C15c1aEEEB8cFd3000F1EC22Bc2D2d9641e LTCK-USDT 1
// lptoken: 0x0E4780F2462aa5a8B098eC82324352991B45BEb0 DOTK-USDT 1
// lptoken: 0x22B65C78e675083Fe9ECE0d2c5736a84307aE5A1 USDT-FILK 1
// lptoken: 0x396BB9bFe7f39e2BDa4E85C55D3d67014Bb36FFa USDK-USDT 1

const kktAAddress = '0x4962Bf3133dFb5630e3fEd6bb55AC35731BCa3fF'
const chefAAddress = '0xe5Fa42c0dEA555C65c479dd4b29CA91BE9374694'

async function main() {
    const accounts = await hre.ethers.getSigners()
    const devAddress = accounts[1].address

    let KKTabi = getAbi('./artifacts/contracts/KingKongToken.sol/KingKongToken.json')
    const kkt = new ethers.Contract(kktAAddress, KKTabi, accounts[0])

    let chefabi = getAbi('./artifacts/contracts/MasterChef.sol/MasterChef.json')
    const chef = new ethers.Contract(chefAAddress, chefabi, accounts[0])

    // console.log('MasterChef owner is:', await chef.owner())
	// console.log('MasterChef dev is:', await chef.devaddr())
    // console.log('kktPerBlock:', dpow(await chef.kktPerBlock(), 18))

    // await addPool('0x695Ef962b4Ee88ED193148E486208D58d184D203', 3)
    // await delay(10)
    // await addPool('0xAA62cf5bf12D541335AC776eCBFd3BEBBDe5cF21', 5)
    // await delay(10)
    // await addPool('0xa67C92B04d66aB92c587f224b37CCd4E2055aA0d', 5)
    // await delay(10)
    // await addPool('0x2BC09D8f6bEc3C8DdccdbE18d1FdB0E615845dF3', 3)
    // await delay(10)
    // await addPool('0x1e6A2B2701A5423930cF0Da95A7A007D9A26D2f7', 2)
    // await delay(10)
    // await addPool('0xf0858096473087b12634999E43aC14945841bfbA', 1)
    // await delay(10)
    // await addPool('0x8D802439F1f7Cbf93F3384d95857b61DD7FA901b', 1)
    // await delay(10)
    // await addPool('0xF46e0C15c1aEEEB8cFd3000F1EC22Bc2D2d9641e', 1)
    // await delay(10)
    await addPool('0x0E4780F2462aa5a8B098eC82324352991B45BEb0', 1)
    await delay(10)
    // await addPool('0x22B65C78e675083Fe9ECE0d2c5736a84307aE5A1', 1)
    // await delay(10)
    // await addPool('0x396BB9bFe7f39e2BDa4E85C55D3d67014Bb36FFa', 1)
    // await delay(10)

    console.log('done')
}


async function setKKTPerBlock() {
    const accounts = await hre.ethers.getSigners()

    let chefabi = getAbi('./artifacts/contracts/MasterChef.sol/MasterChef.json')
    const chef = new ethers.Contract(chefAAddress, chefabi, accounts[0])

    await chef.setKKTPerBlock(pow(30, 18), {gasLimit:BigNumber.from('8000000')})
    console.log('MasterChef setKKTPerBlock') 
}


async function addPool(tokenAddress, speed) {
    const accounts = await hre.ethers.getSigners()

    let chefabi = getAbi('./artifacts/contracts/MasterChef.sol/MasterChef.json')
    const chef = new ethers.Contract(chefAAddress, chefabi, accounts[0])

    //一种token对应一个池子，不能重复开池子，否则会混乱
    await chef.add(BigNumber.from(speed), tokenAddress, true, {gasLimit:BigNumber.from('8000000')})
    console.log('addPool', tokenAddress, 'speed:', speed)
}


async function viewPools() {
    const accounts = await hre.ethers.getSigners()

    let chefabi = getAbi('./artifacts/contracts/MasterChef.sol/MasterChef.json')
    const chef = new ethers.Contract(chefAAddress, chefabi, accounts[0])

    let poolLength = (await chef.poolLength()).toNumber()
    console.log('poolLength:', poolLength)

    for (let i = 0; i < poolLength; i++) {
        let pool = await chef.poolInfo(i)
        console.log('farm pool:', pool.lpToken, 'speed:', pool.allocPoint.toNumber())
    }
}


function getAbi(jsonPath) {
    let file = fs.readFileSync(jsonPath)
    let abi = JSON.parse(file.toString()).abi
    return abi
}


function pow(num, decimals) {
    return BigNumber.from(10).pow(decimals).mul(num)
}


function dpow(bn, decimals) {
    return bn.div(BigNumber.from(10).pow(decimals)).toString()
}

async function delay(sec) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, sec * 1000);
    })
}

// viewPools()
main().then(viewPools)
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })