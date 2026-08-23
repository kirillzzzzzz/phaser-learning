import Phaser from 'phaser';

export default class VirtualJoystick {
	constructor(scene) {
		this.scene = scene;

		this.radius = 55;
		this.knobRadius = 25;

		this.active = false;
		this.pointerId = null;

		this.x = 0;
		this.y = 0;

		this.base = scene.add.circle(
			0,
			0,
			this.radius,
			0xffffff,
			0.18
		);

		this.knob = scene.add.circle(
			0,
			0,
			this.knobRadius,
			0xffffff,
			0.35
		);

		this.updateSize();

		this.base.setScrollFactor(0);
		this.knob.setScrollFactor(0);

		this.base.setDepth(2000);
		this.knob.setDepth(2001);

		this.setPosition();

		scene.scale.on('resize', this.handleResize, this);

		this.hide();

		scene.input.on(
			'pointerdown',
			this.onPointerDown,
			this
		);

		scene.input.on(
			'pointermove',
			this.onPointerMove,
			this
		);

		scene.input.on(
			'pointerup',
			this.onPointerUp,
			this
		);

		scene.input.on(
			'pointerupoutside',
			this.onPointerUp,
			this
		);
	}

	updateSize() {
		const width = this.scene.scale.width;
		const height = this.scene.scale.height;

		const shortestSide = Math.min(width, height);

		if (shortestSide <= 400) {
			this.radius = 45;
		}
		else if (shortestSide <= 700) {
			this.radius = 55;
		}
		else {
			this.radius = 65;
		}

		this.knobRadius = this.radius * 0.45;

		this.base.setRadius(this.radius);
		this.knob.setRadius(this.knobRadius);
	}

	setPosition() {
		const margin = 30;

		this.centerX = margin + this.radius;
		this.centerY =
			this.scene.scale.height -
			margin -
			this.radius;

		this.base.setPosition(
			this.centerX,
			this.centerY
		);

		this.knob.setPosition(
			this.centerX,
			this.centerY
		);
	}

	onPointerDown(pointer) {
		if (!this.isTouchDevice()) {
			return;
		}

		if (this.active) {
			return;
		}

		const distance = Phaser.Math.Distance.Between(
			pointer.x,
			pointer.y,
			this.centerX,
			this.centerY
		);

		if (distance > this.radius * 1.5) {
			return;
		}

		this.active = true;
		this.pointerId = pointer.id;

		this.updateFromPointer(pointer);
	}

	onPointerMove(pointer) {
		if (!this.active) {
			return;
		}

		if (pointer.id !== this.pointerId) {
			return;
		}

		this.updateFromPointer(pointer);
	}

	onPointerUp(pointer) {
		if (!this.active) {
			return;
		}

		if (pointer.id !== this.pointerId) {
			return;
		}

		this.active = false;
		this.pointerId = null;

		this.x = 0;
		this.y = 0;

		this.knob.setPosition(
			this.centerX,
			this.centerY
		);
	}

	updateFromPointer(pointer) {
		let dx = pointer.x - this.centerX;
		let dy = pointer.y - this.centerY;

		const distance = Math.sqrt(
			dx * dx + dy * dy
		);

		if (distance > this.radius) {
			dx = (dx / distance) * this.radius;
			dy = (dy / distance) * this.radius;
		}

		this.knob.setPosition(
			this.centerX + dx,
			this.centerY + dy
		);

		this.x = dx / this.radius;
		this.y = dy / this.radius;
	}

	isTouchDevice() {
		return this.scene.sys.game.device.input.touch;
	}

	hide() {
		this.base.setVisible(false);
		this.knob.setVisible(false);
	}

	show() {
		this.base.setVisible(true);
		this.knob.setVisible(true);
	}

	getVector() {
		return {
			x: this.x,
			y: this.y
		};
	}

	destroy() {

		this.scene.scale.off(
			'resize',
			this.handleResize,
			this
		);

		this.scene.input.off(
			'pointerdown',
			this.onPointerDown,
			this
		);

		this.scene.input.off(
			'pointermove',
			this.onPointerMove,
			this
		);

		this.scene.input.off(
			'pointerup',
			this.onPointerUp,
			this
		);

		this.scene.input.off(
			'pointerupoutside',
			this.onPointerUp,
			this
		);

		this.base.destroy();
		this.knob.destroy();
	}

	handleResize() {
		this.updateSize();
		this.setPosition();

		if (this.active) {
			this.x = 0;
			this.y = 0;

			this.knob.setPosition(
				this.centerX,
				this.centerY
			);

			this.active = false;
			this.pointerId = null;
		}

		console.group('📱 Joystick resize');

		console.log('Screen:', {
			width: Math.round(this.scene.scale.width),
			height: Math.round(this.scene.scale.height)
		});

		console.log('Joystick:', {
			radius: this.radius,
			centerX: Math.round(this.centerX),
			centerY: Math.round(this.centerY)
		});

		console.groupEnd();
	}
}