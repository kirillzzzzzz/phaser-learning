import Phaser from 'phaser';

export default class DPad {
	constructor(scene) {
		this.scene = scene;

		this.buttonSize = 58;
		this.gap = 6;
		this.margin = 45;

		this.up = false;
		this.down = false;
		this.left = false;
		this.right = false;

		this.buttons = {};

		this.createButtons();

		this.updateLayout();

		scene.scale.on('resize', this.handleResize, this);
	}

	createButtons() {
		this.buttons.up = this.createButton('▲');
		this.buttons.down = this.createButton('▼');
		this.buttons.left = this.createButton('◄');
		this.buttons.right = this.createButton('►');
	}

	createButton(label) {
		const button = this.scene.add
			.rectangle(
				0,
				0,
				this.buttonSize,
				this.buttonSize,
				0x000000,
				0.4
			)
			.setOrigin(0.5)
			.setScrollFactor(0)
			.setDepth(2000)
			.setInteractive();

		button.setStrokeStyle(2, 0xffffff, 0.25);

		const arrow = this.scene.add
			.text(0, 0, label, {
				fontFamily: 'Arial',
				fontSize: '28px',
				fontStyle: 'bold',
				color: '#ffffff'
			})
			.setOrigin(0.5)
			.setScrollFactor(0)
			.setDepth(2001);

		arrow.setPosition(
			button.x,
			button.y
		);

		button.arrow = arrow;

		button.on('pointerdown', () => {
			this.setDirection(label, true);

			button.setFillStyle(0xffffff, 0.35);
			arrow.setColor('#222222');
		});

		button.on('pointerup', () => {
			this.setDirection(label, false);

			button.setFillStyle(0x000000, 0.4);
			arrow.setColor('#ffffff');
		});

		button.on('pointerout', () => {
			this.setDirection(label, false);

			button.setFillStyle(0x000000, 0.4);
			arrow.setColor('#ffffff');
		});

		button.on('pointerupoutside', () => {
			this.setDirection(label, false);

			button.setFillStyle(0x000000, 0.4);
			arrow.setColor('#ffffff');
		});

		return button;
	}

	setDirection(label, value) {
		if (label === '▲') {
			this.up = value;
		}

		if (label === '▼') {
			this.down = value;
		}

		if (label === '◄') {
			this.left = value;
		}

		if (label === '►') {
			this.right = value;
		}
	}

	updateLayout() {
		const width = this.scene.scale.width;
		const height = this.scene.scale.height;

		const size = this.buttonSize;
		const gap = this.gap;

		const step = size + gap;

		const centerX = this.margin + step;
		const centerY =
			height -
			this.margin -
			step;

		this.buttons.up.setPosition(
			centerX,
			centerY - step
		);

		this.buttons.down.setPosition(
			centerX,
			centerY + step
		);

		this.buttons.left.setPosition(
			centerX - step,
			centerY
		);

		this.buttons.right.setPosition(
			centerX + step,
			centerY
		);

		Object.values(this.buttons).forEach(button => {
			button.arrow.setPosition(
				button.x,
				button.y
			);
		});
	}

	handleResize() {
		this.updateLayout();
	}

	getVector() {
		let x = 0;
		let y = 0;

		if (this.left) {
			x -= 1;
		}

		if (this.right) {
			x += 1;
		}

		if (this.up) {
			y -= 1;
		}

		if (this.down) {
			y += 1;
		}

		return { x, y };
	}

	destroy() {
		this.scene.scale.off(
			'resize',
			this.handleResize,
			this
		);

		Object.values(this.buttons).forEach(button => {
			button.destroy();
		});
	}
}