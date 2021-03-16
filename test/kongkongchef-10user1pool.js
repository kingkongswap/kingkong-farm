const { expect, assert } = require('chai');
const { BigNumber } = require('ethers');

//压力测试，用100个号去1个矿池挖
describe('KingKongChef-100user-1pool', function () {
	let accounts
	let erc
	let kkt
	let chef
	let mintStart

	const ercSupply = 10000000000000
	const mintBlock = 1000
	const rewardPerBlock = ercSupply / mintBlock

	before(async function () {
		accounts = await ethers.getSigners()

		const ERC = await ethers.getContractFactory('MockERC20');
		erc = await ERC.deploy('OKB', b(ercSupply), 18);
		await erc.deployed();

		const KKT = await ethers.getContractFactory('KingKongToken');
		kkt = await KKT.deploy();
		await kkt.deployed();

		const KingKongChef = await ethers.getContractFactory('KingKongChef');
		chef = await KingKongChef.deploy(kkt.address);
		await chef.deployed();

		for (let i=1; i<=10; i++) {
			await kkt.mint(accounts[i].address, b(10))
		}
	})

	it('deposit', async function () {
		for (let i=1; i<=10; i++) {
			await kkt.connect(accounts[i]).approve(chef.address, b(2))
			await chef.connect(accounts[i]).deposit(b(2))
			console.log('account' + i + ' deposit')
		}
		
		await print()
	})
	
	it('addPool', async function () {
		await erc.transfer(chef.address, b(ercSupply))
		let blockNum = await ethers.provider.getBlockNumber()
		mintStart = blockNum + 5
		await chef.addPool(erc.address, b(rewardPerBlock), b(mintStart), b(mintStart+mintBlock), accounts[0].address)
		console.log('account0 addPool')
		
		await print()
	})

	it('after 10 block', async function () {
		for (let i=1; i<=10; i++) {
			await erc.approve(chef.address, b(0)) //空块
		}
	})

	it('harvestAll', async function () {
		for (let i=1; i<=10; i++) {
			await chef.connect(accounts[i]).harvestAll(accounts[i].address)
			console.log('account' + i + ' harvestAll')
		}
		
		await print()
	})

	it('after 10 block', async function () {
		for (let i=1; i<=10; i++) {
			await erc.approve(chef.address, b(0)) //空块
		}
	})

	it('withdraw', async function () {
		for (let i=1; i<=10; i++) {
			await chef.connect(accounts[i]).withdraw(b(1))
			console.log('account' + i + ' withdraw')
		}

		await print()
	})

	it('after 10 block', async function () {
		for (let i=1; i<=10; i++) {
			await erc.approve(chef.address, b(0)) //空块
		}
	})

	it('harvestAll', async function () {
		for (let i=1; i<=10; i++) {
			await chef.connect(accounts[i]).harvestAll(accounts[i].address)
			console.log('account' + i + ' harvestAll')
		}
		
		await print()
	})

	it('after 10 block', async function () {
		for (let i=1; i<=10; i++) {
			await erc.approve(chef.address, b(0)) //空块
		}
	})

	it('deposit', async function () {
		for (let i=1; i<=10; i++) {
			await kkt.connect(accounts[i]).approve(chef.address, b(1))
			await chef.connect(accounts[i]).deposit(b(1))
			console.log('account' + i + ' deposit')
		}

		await print()
	})

	it('after 10 block', async function () {
		for (let i=1; i<=10; i++) {
			await erc.approve(chef.address, b(0)) //空块
		}
	})

	it('deposit', async function () {
		for (let i=1; i<=10; i++) {
			await kkt.connect(accounts[i]).approve(chef.address, b(1))
			await chef.connect(accounts[i]).deposit(b(1))
			console.log('account' + i + ' deposit')
		}

		await print()
	})

	it('withdraw', async function () {
		for (let i=1; i<=10; i++) {
			await chef.connect(accounts[i]).withdraw(b(3))
			console.log('account' + i + ' withdraw')
		}

		await print()
	})

	it('removePool', async function () {
		let mintEnd = await ethers.provider.getBlockNumber()
		let minted = (mintEnd - mintStart + 1) * rewardPerBlock
		console.log('mintStart:', mintStart, 'mintEnd:', mintEnd, 'minted:', minted)
		//mintStart: 39 mintEnd: 165 minted: 1270000000000
		//ercTotal: 1269999999994 pendingTotal: 0
		//minted 和 ercTotal 有一点点误差，估计是精度问题，这个不可避免

		await chef.removePool(erc.address)
		console.log('account0 removePool')
		
		await print()
	})

	async function print() {
		// let pool = await chef.poolMap(erc.address)
		console.log('')
		
		let ercTotal = 0
		let pendingTotal = 0
		console.log('blockNum:', await ethers.provider.getBlockNumber())
		for (let i=0; i<=10; i++) {
			if (i > 0) {
				ercTotal += n(await erc.balanceOf(accounts[i].address))
				pendingTotal += n(await chef.pendingReward(accounts[i].address, erc.address))
			}
			console.log(
				'account'+i+' kkt:', n(await kkt.balanceOf(accounts[i].address)), 
				'balance_in_chef:', n(await chef.balanceOf(accounts[i].address)), 
				'erc:', n(await erc.balanceOf(accounts[i].address)),
				'pending:', n(await chef.pendingReward(accounts[i].address, erc.address))
				)
		}

		console.log('ercTotal:', ercTotal, 'pendingTotal:', pendingTotal)

		console.log(
			'chef kkt:', n(await kkt.balanceOf(chef.address)), 
			'erc:', n(await erc.balanceOf(chef.address))
			)

		console.log('')
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
		return bn.toNumber()
	}
})
