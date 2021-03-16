const { expect, assert } = require('chai');
const { BigNumber } = require('ethers');

//测试可能出错的情况，9个矿池
describe('KingKongChef-error3', function () {
	let accounts
	let ercArr = []
	let kkt
	let chef
	let startBlock
	let rewardPerBlock = 1

	before(async function () {
		accounts = await ethers.getSigners()

		const ERC = await ethers.getContractFactory('MockERC20');
		for (let i=0; i<=9; i++) {
			let erc = await ERC.deploy('T'+i, b(10000), 18);
			await erc.deployed();
			ercArr.push(erc);
		}

		const KKT = await ethers.getContractFactory('KingKongToken');
		kkt = await KKT.deploy();
		await kkt.deployed();

		const KingKongChef = await ethers.getContractFactory('KingKongChef');
		chef = await KingKongChef.deploy(kkt.address);
		await chef.deployed();

		await kkt.mint(accounts[0].address, b(20))
		await kkt.mint(accounts[1].address, b(20))
	})

	it('deposit', async function () {
		await kkt.connect(accounts[1]).approve(chef.address, b(10))
		await chef.connect(accounts[1]).deposit(b(10))
		console.log('account1 deposit 10')

		await print()
	})

	it('addPool', async function () {
		for (let i=0; i<=7; i++) {
			let erc = ercArr[i]
			await erc.transfer(chef.address, b(10000))
			let blockNum = await ethers.provider.getBlockNumber()
			startBlock = blockNum + 2
			await chef.addPool(erc.address, b(rewardPerBlock), b(startBlock), b(startBlock+100), accounts[0].address)
			console.log('account0 addPool', erc.address)
		}

		await print()
	})

	it('removePool', async function () {
		await chef.removePool(ercArr[4].address)
		console.log('account0 removePool', ercArr[4].address)
		
		await print()
	})

	it('addPool', async function () {
		for (let i=8; i<=9; i++) {
			let erc = ercArr[i]
			await erc.transfer(chef.address, b(10000))
			let blockNum = await ethers.provider.getBlockNumber()
			startBlock = blockNum + 2
			await chef.addPool(erc.address, b(rewardPerBlock), b(startBlock), b(startBlock+100), accounts[0].address)
			console.log('account0 addPool', erc.address)
		}

		await print()
	})

	it('after 10 block', async function () {
		for (let i=0; i<10; i++) {
			await kkt.approve(chef.address, b(0)) //空块
		}
	})

	it('harvestAll', async function () {
		await chef.connect(accounts[1]).harvestAll(accounts[1].address)
		console.log('account1 harvestAll')
		
		await print()
	})

	it('after 20 block', async function () {
		for (let i=0; i<20; i++) {
			await kkt.approve(chef.address, b(0)) //空块
		}
	})

	it('harvestAll', async function () {
		await chef.connect(accounts[1]).harvestAll(accounts[1].address)
		console.log('account1 harvestAll')
		
		await print()
	})

	it('after 30 block', async function () {
		for (let i=0; i<30; i++) {
			await kkt.approve(chef.address, b(0)) //空块
		}
	})

	it('harvestAll', async function () {
		await chef.connect(accounts[1]).harvestAll(accounts[1].address)
		console.log('account1 harvestAll')
		
		await print()
	})

	it('after 30 block', async function () {
		for (let i=0; i<30; i++) {
			await kkt.approve(chef.address, b(0)) //空块
		}
	})

	it('harvestAll', async function () {
		await chef.connect(accounts[1]).harvestAll(accounts[1].address)
		console.log('account1 harvestAll')
		
		await print()
	})

	

	async function print() {
		console.log('')
		for (let i=0; i<9; i++) {
			let ercAddress = await chef.activeArr(i)
			let pool = await chef.poolMap(ercAddress)

			console.log(
				'poolId:', n(pool.poolId), 
				'rewardToken:', pool.rewardToken, 
				'accPerShare:', n(pool.accPerShare), 
				'lastRewardBlock:', n(pool.lastRewardBlock),
				'balance:', n(pool.balance),
				'amount:', n(pool.amount),
				'bonusStartBlock:', n(pool.bonusStartBlock),
				'bonusEndBlock:', n(pool.bonusEndBlock),
			)
		}
		console.log('')
	}

	function b(num) {
		return BigNumber.from(num)
	}

	function n(bn) {
		return bn.toNumber()
	}
})
