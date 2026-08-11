import Phaser from 'phaser';

export default class Player extends Phaser.Physics.Arcade.Sprite {

	constructor(scene, x, y) {

		super(scene, x, y, 'player', 0);

		scene.add.existing(this);
		scene.physics.add.existing(this);

		this.setScale(4);

		this.setCollideWorldBounds(true);

		this.speed = 150;

	}

	update(cursors, keys) {
		this.setVelocity(0);

		if (keys.A.isDown || cursors.left.isDown) {

			this.setVelocityX(-this.speed);

			this.play('walk-left', true);

		}

		else if (keys.D.isDown || cursors.right.isDown) {

			this.setVelocityX(this.speed);

			this.play('walk-right', true);

		}

		else if (keys.W.isDown || cursors.up.isDown) {

			this.setVelocityY(-this.speed);

			this.play('walk-up', true);

		}

		else if (keys.S.isDown || cursors.down.isDown) {

			this.setVelocityY(this.speed);

			this.play('walk-down', true);

		}

		else {

			this.stop();

		}
	}

}