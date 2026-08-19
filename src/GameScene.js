import Phaser from 'phaser';
import Player from './Player';

export default class GameScene extends Phaser.Scene {
	constructor() {
		super('GameScene');
	}

	preload() {

		this.load.atlasXML(
			'tiles',
			'assets/spritesheet.png',
			'assets/spritesheet-tiles-default.xml'
		);

		this.load.spritesheet(
			'player',
			'assets/character.png',
			{
				frameWidth: 16,
				frameHeight: 16
			}
		);

		this.load.tilemapTiledJSON(
			'level_001',
			'assets/maps/level_001.tmj'
		);

	}

	create() {

		this.gameWon = false;

		this.createWorld();

		this.createMap();

		this.createPlayer();

		this.createEnemy();

		this.createScore();

		this.createLives();

		this.createCoins();

		this.overlabCoins();

		this.createChest();

		this.createInput();

		this.createAnimations();

	}

	update() {

		this.player.update(
			this.cursors,
			this.keys
		);

		this.enemyMovement();

	}

	createWorld() {
		this.physics.world.setBounds(0, 0, 1500, 1000);
		this.cameras.main.setBounds(0, 0, 1500, 1000);

	}

	createMap() {
		this.map = this.make.tilemap({
			key: 'level_001'
		});

		const tileset = this.map.addTilesetImage(
			'World',
			'tiles'
		);

		this.groundLayer = this.map.createLayer(
			'Ground',
			tileset
		);

		this.wallLayer = this.map.createLayer(
			'Walls',
			tileset
		);

		this.wallLayer.setCollisionByExclusion([-1]);

		this.wallLayer.renderDebug(
			this.add.graphics(),
			{
				tileColor: null,
				collidingTileColor: new Phaser.Display.Color(255, 0, 0, 100),
				faceColor: new Phaser.Display.Color(0, 255, 0, 255)
			}
		);
	}

	createPlayer() {

		this.player = new Player(
			this,
			200,
			490
		);

		this.playerLives = 3;

		this.playerCanMove = true;

		this.cameras.main.startFollow(
			this.player,
			true,
			0.1,
			0.1
		);

		this.physics.add.collider(
			this.player,
			this.wallLayer
		);

	}

	createCoins() {

		this.coins = this.physics.add.group();

		const objectLayer = this.map.getObjectLayer('Objects');

		objectLayer.objects.forEach(obj => {

			if (obj.type === 'coin') {

				this.coins.create(
					obj.x + obj.width / 2,
					obj.y - obj.height / 2,
					'tiles',
					'coin_gold'
				);

			}

		});

		this.totalCoins = this.coins.countActive();
	}

	createLives() {

		this.livesText = this.add.text(
			20,
			60,
			'Жизни: ❤️ ❤️ ❤️',
			{
				fontSize: '28px',
				color: '#ffffff'
			}
		);

		this.livesText.setScrollFactor(0);

		this.livesText.setDepth(1000);
	}

	updateLives() {

		let hearts = '';

		for (let i = 0; i < this.playerLives; i++) {
			hearts += '❤️ ';
		}

		this.livesText.setText(
			'Жизни: ' + hearts
		);

	}

	createAnimations() {

		this.anims.create({
			key: 'walk-down',
			frames: this.anims.generateFrameNumbers('player', {
				start: 0,
				end: 3
			}),
			frameRate: 8,
			repeat: -1
		});

		this.anims.create({
			key: 'walk-up',
			frames: this.anims.generateFrameNumbers('player', {
				start: 4,
				end: 7
			}),
			frameRate: 8,
			repeat: -1
		});

		this.anims.create({
			key: 'walk-right',
			frames: this.anims.generateFrameNumbers('player', {
				start: 8,
				end: 11
			}),
			frameRate: 8,
			repeat: -1
		});

		this.anims.create({
			key: 'walk-left',
			frames: this.anims.generateFrameNumbers('player', {
				start: 12,
				end: 15
			}),
			frameRate: 8,
			repeat: -1
		});

	}

	createInput() {

		this.cursors = this.input.keyboard.createCursorKeys();

		this.keys = this.input.keyboard.addKeys({
			W: Phaser.Input.Keyboard.KeyCodes.W,
			A: Phaser.Input.Keyboard.KeyCodes.A,
			S: Phaser.Input.Keyboard.KeyCodes.S,
			D: Phaser.Input.Keyboard.KeyCodes.D
		});

	}

	createScore() {
		this.score = 0;

		this.scoreText = this.add.text(
			20,
			20,
			'Монеты: 0',
			{
				fontSize: '34px',
				color: '#ffffff'
			}
		);

		this.scoreText.setScrollFactor(0);
		this.scoreText.setDepth(1000);
	}

	createEnemy() {

		this.enemy = this.physics.add.sprite(
			600,
			300,
			'tiles',
			'hud_player_helmet_purple'
		);

		this.physics.add.collider(
			this.enemy,
			this.wallLayer
		);

		this.enemyPatrolSpeed = 80;
		this.enemyChaseSpeed = 120;

		this.enemyDirection = 1;

		this.enemyPatrolMinX = 450;
		this.enemyPatrolMaxX = 750;

		this.enemyVisionRadius = 250;

		this.enemyState = 'patrol';

		this.enemyIgnorePlayer = false;

		this.enemyHitCooldown = false;

		this.physics.add.collider(
			this.player,
			this.enemy,
			this.hitByEnemy,
			null,
			this
		);
	}

	createChest() {

		const objectLayer = this.map.getObjectLayer('Objects');

		const chestObject = objectLayer.objects.find(
			obj => obj.type === 'chest'
		);

		if (!chestObject) {
			console.warn('Сундук не найден');
			return;
		}

		this.chest = this.physics.add.sprite(
			chestObject.x + chestObject.width / 2,
			chestObject.y - chestObject.height / 2,
			'tiles',
			'door_closed_top'
		);

		this.chest.setImmovable(true);

		this.chestOpened = false;
		this.chestUnlocked = false;

		this.physics.add.collider(
			this.player,
			this.chest
		);

		this.physics.add.overlap(
			this.player,
			this.chest,
			this.openChest,
			null,
			this
		);

	}

	openChest(player, chest) {

		if (
			this.gameWon ||
			this.chestOpened ||
			!this.chestUnlocked
		) {
			return;
		}

		this.chestOpened = true;
		this.gameWon = true;

		player.canMove = false;
		player.setVelocity(0);

		this.enemy.setVelocity(0);

		this.openChestAnimation();
	}

	unlockChest() {

		if (this.chestUnlocked) {
			return;
		}

		this.chestUnlocked = true;

		this.chest.setFrame(
			'door_open_top'
		);

		// Небольшая анимация,
		// показывающая, что сундук разблокирован
		this.tweens.add({

			targets: this.chest,

			scale: 1.25,

			duration: 250,

			yoyo: true,

			repeat: 1,

			ease: 'Sine.easeInOut'

		});

	}

	openChestAnimation() {

		this.tweens.add({

			targets: this.chest,

			scale: 1.4,

			duration: 250,

			yoyo: true,

			repeat: 2,

			ease: 'Back.easeOut',

			onComplete: () => {

				this.chest.setFrame(
					'door_open_top'
				);

				this.createTreasureEffect();

			}

		});

	}

	createTreasureEffect() {

		const coins = [];

		for (let i = 0; i < 12; i++) {

			const coin = this.add.sprite(
				this.chest.x,
				this.chest.y,
				'tiles',
				'coin_gold'
			);

			coin.setScale(1);
			coin.setDepth(1500);

			coins.push(coin);

			const angle = Phaser.Math.DegToRad(i * 30);

			const distance = 100;

			const targetX =
				this.chest.x + Math.cos(angle) * distance;

			const targetY =
				this.chest.y + Math.sin(angle) * distance;

			this.tweens.add({

				targets: coin,

				x: targetX,
				y: targetY,

				duration: 1000,

				ease: 'Cubic.easeOut'

			});

		}

		// Ждём пока монетки разлетятся
		this.time.delayedCall(1200, () => {

			coins.forEach(coin => {
				coin.destroy();
			});

			this.showWinScreen();

		});

	}

	collectCoin(player, coin) {

		coin.destroy();

		this.score++;

		this.scoreText.setText(
			'Монеты: ' + this.score
		);

		if (this.score >= this.totalCoins) {

			this.unlockChest();

		}

	}

	overlabCoins() {
		this.physics.add.overlap(
			this.player,
			this.coins,
			this.collectCoin,
			null,
			this
		);
	}

	enemyMovement() {

		// Враг временно игнорирует игрока
		if (this.enemyIgnorePlayer) {

			this.enemyPatrol();

			return;
		}

		// Расстояние до игрока
		const distance = Phaser.Math.Distance.Between(
			this.enemy.x,
			this.enemy.y,
			this.player.x,
			this.player.y
		);

		// Если игрок достаточно близко —
		// начинаем преследование
		if (distance <= this.enemyVisionRadius) {

			this.enemyState = 'chase';

		} else {

			this.enemyState = 'patrol';

		}

		// Выполняем текущее состояние

		if (this.enemyState === 'patrol') {

			this.enemyPatrol();

		}

		else if (this.enemyState === 'chase') {

			this.enemyChase();

		}

	}

	enemyPatrol() {

		this.enemy.setVelocityX(
			this.enemyPatrolSpeed * this.enemyDirection
		);

		this.enemy.setVelocityY(0);

		if (this.enemy.x >= this.enemyPatrolMaxX) {

			this.enemyDirection = -1;

		}

		if (this.enemy.x <= this.enemyPatrolMinX) {

			this.enemyDirection = 1;

		}

		this.enemy.flipX =
			this.enemyDirection < 0;

	}

	enemyChase() {

		this.physics.moveToObject(
			this.enemy,
			this.player,
			this.enemyChaseSpeed
		);

		this.enemy.flipX =
			this.player.x < this.enemy.x;

	}

	hitByEnemy(player, enemy) {

		if (this.enemyHitCooldown) {
			return;
		}

		this.enemyHitCooldown = true;

		this.playerLives--;

		this.updateLives();

		if (this.playerLives <= 0) {

			this.gameOver();

			return;
		}

		// Враг перестает преследовать
		this.enemyIgnorePlayer = true;

		// Останавливаем врага
		enemy.setVelocity(0);

		// Определяем направление от врага к игроку
		const angle = Phaser.Math.Angle.Between(
			enemy.x,
			enemy.y,
			player.x,
			player.y
		);

		// Отбрасываем игрока

		const knockbackForce = 400;

		player.canMove = false;

		player.setVelocity(
			Math.cos(angle) * knockbackForce,
			Math.sin(angle) * knockbackForce
		);

		this.time.delayedCall(300, () => {

			player.setVelocity(0);

			player.canMove = true;

		});

		// Включаем мигание
		this.playerBlink();

		// Через 2 секунды возвращаем нормальное состояние
		this.time.delayedCall(2000, () => {

			this.enemyIgnorePlayer = false;

			this.enemyHitCooldown = false;

			this.player.setAlpha(1);

		});

	}

	playerBlink() {

		this.tweens.add({
			targets: this.player,
			alpha: 0,
			duration: 100,
			yoyo: true,
			repeat: 9
		});

	}

	gameOver() {

		this.player.canMove = false;

		this.enemy.setVelocity(0);

		this.add.rectangle(
			400,
			300,
			800,
			600,
			0x000000,
			0.7
		)
			.setScrollFactor(0)
			.setDepth(2000);

		this.add.text(
			400,
			250,
			'GAME OVER',
			{
				fontSize: '64px',
				color: '#ffffff'
			}
		)
			.setOrigin(0.5)
			.setScrollFactor(0)
			.setDepth(2001);

		this.add.text(
			400,
			330,
			'Игра перезапустится...',
			{
				fontSize: '24px',
				color: '#ffffff'
			}
		)
			.setOrigin(0.5)
			.setScrollFactor(0)
			.setDepth(2001);

		this.time.delayedCall(2000, () => {

			this.scene.restart();

		});

	}

	showWinScreen() {

		this.add.rectangle(
			400,
			300,
			800,
			600,
			0x000000,
			0.7
		)
			.setScrollFactor(0)
			.setDepth(2000);

		this.add.text(
			400,
			230,
			'ПОБЕДА!',
			{
				fontSize: '64px',
				color: '#ffffff'
			}
		)
			.setOrigin(0.5)
			.setScrollFactor(0)
			.setDepth(2001);

		this.add.text(
			400,
			310,
			'Ты нашёл сокровище!',
			{
				fontSize: '26px',
				color: '#ffffff'
			}
		)
			.setOrigin(0.5)
			.setScrollFactor(0)
			.setDepth(2001);

		const restartButton = this.add.text(
			400,
			390,
			'ИГРАТЬ СНОВА',
			{
				fontSize: '28px',
				color: '#ffffff',
				backgroundColor: '#444444',
				padding: {
					x: 20,
					y: 10
				}
			}
		)
			.setOrigin(0.5)
			.setScrollFactor(0)
			.setDepth(2001)
			.setInteractive({
				useHandCursor: true
			});

		restartButton.on('pointerdown', () => {

			this.scene.restart();

		});

	}

}