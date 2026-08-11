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

		this.createWorld();

		this.createMap();

		this.createPlayer();

		this.createEnemy();

		this.createScore();

		this.createCoins();

		this.overlabCoins();

		// this.createChest();

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
		this.chest = this.add.sprite(700, 550, 'tiles', 'block_exclamation_active');
	}

	collectCoin(player, coin) {

		coin.destroy();

		this.score++;

		this.scoreText.setText(
			'Монеты: ' + this.score
		);
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

}