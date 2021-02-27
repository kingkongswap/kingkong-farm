const hre = require('hardhat')
const fs = require('fs')
const { BigNumber } = require('ethers')

var accounts = null

async function main() {
    accounts = await hre.ethers.getSigners()
    
    let factoryAbi = getAbi('./artifacts/contracts/LossFactory.sol/LossFactory.json')
    let factoryAddress = '0xc20da87779ac7c9ff764667f6b81c46a0a0131e0' //okex_testnet
    const factory = new ethers.Contract(factoryAddress, factoryAbi, accounts[0])
    console.log('LossFactory now feeTo:', await factory.feeTo())
    console.log('INIT_CODE_PAIR_HASH:', await factory.INIT_CODE_PAIR_HASH())

    let allPairsLength = await factory.allPairsLength()
    console.log('allPairsLength:', allPairsLength.toNumber())

    let pairAddress = await factory.allPairs(allPairsLength.toNumber() - 1)
    console.log('pairAddress:', pairAddress)

    let pairAbi = getAbi('./artifacts/contracts/LossPair.sol/LossPair.json')
    const pair = new ethers.Contract(pairAddress, pairAbi, accounts[0])
    let reserves = await pair.getReserves()
    console.log('reserves:', reserves[0].toNumber(), reserves[1].toNumber(), reserves[2])

    console.log('done')
}


function getAbi(jsonPath) {
    let file = fs.readFileSync(jsonPath)
    let abi = JSON.parse(file.toString()).abi
    return abi
}


main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })