const { expect } = require('chai');
const { BigNumber } = require('ethers');

describe('KingKongChef test', function () {
	let accounts
	let erc
	let kkt
	let chef

	before(async function () {
		accounts = await ethers.getSigners()

		const ERC = await ethers.getContractFactory('MockERC20');
		erc = await ERC.deploy('OKB', m(100), 18);
		await erc.deployed();

		const KKT = await ethers.getContractFactory('KingKongToken');
		kkt = await KKT.deploy();
		await kkt.deployed();

		const KingKongChef = await ethers.getContractFactory('KingKongChef');
		chef = await KingKongChef.deploy(kkt.address);
		await chef.deployed();
	})

	it('addPool and deposit', async function () {
		await kkt.mint(accounts[0].address, m(2))

		await erc.approve(chef.address, m(100))
		await chef.addPool(erc.address, m(1), m(100))
		
		await kkt.transfer(accounts[1].address, m(1))
		await kkt.connect(accounts[1]).approve(chef.address, m(1))
		
		await kkt.approve(chef.address, m(1))
		await chef.deposit(m(1))
		
		await print()
	})
	
	it('mining', async function () {
		await printPool()

		for (let i=0; i<10; i++) {
			await erc.approve(chef.address, m(0)) //空块
			console.log('block run', i)
		}

		await printPool()
		
		await chef.connect(accounts[0]).harvestAll()
		console.log('account0 harvestAll')
		
		await printPool()
		
		for (i=0; i<10; i++) {
			await erc.approve(chef.address, m(0)) //空块
			console.log('block run', i)
		}
		
		await printPool()
		
		await chef.connect(accounts[1]).deposit(m(1))
		console.log('account1 deposit')
		
		await printPool()
		
		for (i=0; i<10; i++) {
			await erc.approve(chef.address, m(0)) //空块
			console.log('block run', i)
		}
		
		await printPool()
		
		await chef.connect(accounts[1]).harvestAll()
		console.log('account1 harvestAll')
		
		await chef.connect(accounts[0]).harvestAll()
		console.log('account0 harvestAll')

		await printPool()
		await print()
	})

	it('removePool', async function () {
		let pool = await chef.poolMap(erc.address)
		console.log(pool.rewardToken, d(pool.rewardPerBlock), pool.lastRewardBlock.toNumber(), d(pool.balance), d(pool.amount))
		
		await chef.removePool(erc.address)

		await print()
	})

	async function printPool() {
		console.log('')
		console.log('blockNum:', await ethers.provider.getBlockNumber())
		let pool = await chef.poolMap(erc.address)
		console.log('pool:', pool.accPerShare.toNumber(), pool.lastRewardBlock.toNumber(), d(pool.balance))
		console.log('account0 rewardDebt', d(await chef.rewardDebt(accounts[0].address, erc.address)))
		console.log('account1 rewardDebt', d(await chef.rewardDebt(accounts[1].address, erc.address)))
		console.log('account0 pending', d(await chef.pendingReward(accounts[0].address, erc.address)))
		console.log('account1 pending', d(await chef.pendingReward(accounts[1].address, erc.address)))
		console.log('')
	}

	async function print() {
		console.log('')
		console.log('account0 kkt balance', d(await kkt.balanceOf(accounts[0].address)))
		console.log('account0 chef balance', d(await chef.balanceOf(accounts[0].address)))
		console.log('account0 erc balance', d(await erc.balanceOf(accounts[0].address)))
		console.log('account1 kkt balance', d(await kkt.balanceOf(accounts[1].address)))
		console.log('account1 chef balance', d(await chef.balanceOf(accounts[1].address)))
		console.log('account1 erc balance', d(await erc.balanceOf(accounts[1].address)))
		console.log('chef kkt balance', d(await kkt.balanceOf(chef.address)))
		console.log('chef erc balance', d(await erc.balanceOf(chef.address)))
		console.log('')
	}

	function m(num) {
		return BigNumber.from('1000000000000000000').mul(num)
	}
	
	function d(bn) {
		return bn.div('1000000000').toNumber() / 1000000000
	}
})
