import Phaser from 'phaser';

export default class Player extends Phaser.Physics.Arcade.Sprite {

	constructor(scene, x, y) {

		super(scene, x, y, 'player', 0);

		scene.add.existing(this);
		scene.physics.add.existing(this);

		this.setScale(4);

		this.setCollideWorldBounds(true);

		this.speed = 150;

		this.canMove = true;

		this.isKnockedBack = false;

	}

	update(cursors, keys, joystick) {

		const joystickVector = joystick
			? joystick.getVector()
			: { x: 0, y: 0 };

		if (!this.canMove) {

			if (this.isKnockedBack) {
				return;
			}

			this.setVelocity(0);

			this.stop();

			return;
		}

		this.setVelocity(0);

		if (
			cursors.left.isDown ||
			keys.A.isDown ||
			joystickVector.x < -0.2
		) {

			this.setVelocityX(-this.speed);

			this.play('walk-left', true);

		}

		else if (
			cursors.right.isDown ||
			keys.D.isDown ||
			joystickVector.x > 0.2
		) {

			this.setVelocityX(this.speed);

			this.play('walk-right', true);

		}

		else if (
			cursors.up.isDown ||
			keys.W.isDown ||
			joystickVector.y < -0.2
		) {

			this.setVelocityY(-this.speed);

			this.play('walk-up', true);

		}

		else if (
			cursors.down.isDown ||
			keys.S.isDown ||
			joystickVector.y > 0.2
		) {

			this.setVelocityY(this.speed);

			this.play('walk-down', true);

		}

		else {

			this.stop();

		}

	}

}