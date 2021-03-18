const hre = require('hardhat')
const fs = require('fs')
const { BigNumber } = require('ethers')

var accounts = null

async function main() {
    accounts = await hre.ethers.getSigners()

    let chefAbi = getAbi('./artifacts/contracts/MasterChef.sol/MasterChef.json')
    let chefAddress = '0xE73d4CE78e14B6c65DC8dC25d3fBE20dcfcfF6c3'
    const chef = new ethers.Contract(chefAddress, chefAbi, accounts[0])

    let kktAbi = getAbi('./artifacts/contracts/KingKongToken.sol/KingKongToken.json')
    let kktAddress = '0x4888097d1B29b439C55C6d3E44031eE658237dE3'
    const kkt = new ethers.Contract(kktAddress, kktAbi, accounts[0])

    let addressArr = []

    console.log('start..')
    // let eventArr = await chef.queryFilter('Deposit', 1079020, 'latest')
    let start = 1079020
    // let start = 1122820
    // let start = 1143100
    let end = 1403872
    let i = start
    let str = ''
    while (true) {
        try {
            let eventArr = await chef.queryFilter('Deposit', i, i + 100)
            for (let event of eventArr) {
                let address = event.args.user
                if (addressArr.indexOf(address) == -1) {
                    addressArr.push(address)
                    let bal = n(await kkt.balanceOf(address))
                    if (bal > 0) {
                        str += 'address:' + address + ', kkt:' + bal + '\n'
                        await saveFile(str)
                    }
                }
            }
            console.log('queryFilter end, addressArr.length:', addressArr.length, 'from:', i, 'to:', i + 100)
    
            if (i + 100 > end) {
                break
            } else {
                i += 100
            }
        } catch (error) {
            console.log('重试..')
        }
    }

    console.log('done')
}

async function saveFile(str) {
    return new Promise((ok, err) => {
        // console.log("准备写入文件")
        fs.writeFile('address.txt', str, function (e) {
            if (e) {
                err(e)
            }
            console.log("数据写入成功")
            ok()
        })
    })
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

function b(num) {
    return BigNumber.from(num)
}

function n(bn) {
    return bn.div('1000000000000000000').toNumber()
}

async function delay(sec) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, sec * 1000);
    })
}


main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })