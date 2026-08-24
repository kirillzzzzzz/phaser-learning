import Phaser from 'phaser';

console.log("🛠️ TREASURE HUNTER — VIBRATION PATCH v1");

import './style.css';
import GameScene from './GameScene';

const config = {
	type: Phaser.AUTO,

	width: 800,
	height: 600,

	backgroundColor: '#222',

	scale: {
		mode: Phaser.Scale.RESIZE,
		autoCenter: Phaser.Scale.CENTER_BOTH
	},

	physics: {
		default: 'arcade',
		arcade: {
			debug: false
		}
	},

	scene: [GameScene]
};

new Phaser.Game(config);