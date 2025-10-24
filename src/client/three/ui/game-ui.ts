import { GameState } from '../game/enhanced-runner-game';

export class GameUI {
  private container!: HTMLElement;
  private scoreElement!: HTMLElement;
  private livesElement!: HTMLElement;
  private speedElement!: HTMLElement;
  private startButton!: HTMLElement;
  private pauseButton!: HTMLElement;
  private gameOverScreen!: HTMLElement;
  private instructionsScreen!: HTMLElement;
  private finalScoreElement!: HTMLElement;

  constructor() {
    this.createUI();
  }

  private createUI(): void {
    // Create main UI container
    this.container = document.createElement('div');
    this.container.id = 'game-ui';
    this.container.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      font-family: 'Arial', sans-serif;
      color: white;
      z-index: 100;
    `;

    // Game stats display
    const statsContainer = document.createElement('div');
    statsContainer.style.cssText = `
      position: absolute;
      top: 20px;
      left: 20px;
      background: rgba(0, 0, 0, 0.7);
      padding: 12px;
      border-radius: 8px;
      font-size: 14px;
      line-height: 1.4;
    `;

    this.scoreElement = document.createElement('div');
    this.scoreElement.textContent = 'Score: 0';

    this.livesElement = document.createElement('div');
    this.livesElement.textContent = 'Lives: 3';

    this.speedElement = document.createElement('div');
    this.speedElement.textContent = 'Speed: 10';

    statsContainer.appendChild(this.scoreElement);
    statsContainer.appendChild(this.livesElement);
    statsContainer.appendChild(this.speedElement);

    // Control buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
      position: absolute;
      top: 20px;
      right: 20px;
      display: flex;
      gap: 10px;
    `;

    this.startButton = this.createButton('Start Game', '#00ff88');
    this.pauseButton = this.createButton('Pause', '#ffaa00');
    this.pauseButton.style.display = 'none';

    buttonContainer.appendChild(this.startButton);
    buttonContainer.appendChild(this.pauseButton);

    // Instructions screen
    this.instructionsScreen = document.createElement('div');
    this.instructionsScreen.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.9);
      padding: 20px;
      border-radius: 12px;
      text-align: center;
      max-width: 320px;
      pointer-events: auto;
      font-size: 14px;
    `;

    this.instructionsScreen.innerHTML = `
      <h2 style="color: #ff6b35; margin-bottom: 15px; font-size: 18px;">🪔 Diwali Runner</h2>
      <div style="margin-bottom: 15px; line-height: 1.4; font-size: 13px;">
        <p><strong>Controls:</strong></p>
        <p>↑/Space: Jump | ←→/AD: Move</p>
        <p>Mobile: Tap top to jump, bottom to move</p>
        <br>
        <p><strong>🎆 Collectibles:</strong></p>
        <p>🪔 Diya: +25 | ✨ Sparkler: +15</p>
        <p>🌸 Rangoli: +30 | 🪙 Coin: +10</p>
        <p>💊 Health: Restore life</p>
        <br>
        <p style="font-size: 12px;">Avoid obstacles and celebrate Diwali!</p>
      </div>
    `;

    // Game over screen
    this.gameOverScreen = document.createElement('div');
    this.gameOverScreen.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.9);
      padding: 25px;
      border-radius: 12px;
      text-align: center;
      display: none;
      pointer-events: auto;
      font-size: 14px;
    `;

    this.finalScoreElement = document.createElement('h3');
    this.finalScoreElement.style.cssText = `
      color: #ffdd00;
      font-size: 16px;
      margin: 10px 0;
    `;

    const restartButton = this.createButton('Play Again', '#00ff88');
    restartButton.addEventListener('click', () => {
      this.hideGameOver();
      this.showGameUI(); // Show the game UI when restarting
      this.dispatchEvent('restart');
    });

    const gameOverTitle = document.createElement('h2');
    gameOverTitle.textContent = 'Game Over!';
    gameOverTitle.style.cssText = `
      font-size: 18px;
      margin: 0 0 10px 0;
      color: #ff6b35;
    `;
    
    this.gameOverScreen.appendChild(gameOverTitle);
    this.gameOverScreen.appendChild(this.finalScoreElement);
    this.gameOverScreen.appendChild(restartButton);

    // Mobile controls overlay
    const mobileControls = document.createElement('div');
    mobileControls.style.cssText = `
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 40%;
      display: none;
      pointer-events: auto;
    `;

    // Detect mobile device
    if (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    ) {
      mobileControls.style.display = 'block';

      // Add visual indicators for mobile controls
      const jumpArea = document.createElement('div');
      jumpArea.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 50%;
        background: rgba(0, 255, 136, 0.1);
        border: 2px dashed rgba(0, 255, 136, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        color: rgba(255, 255, 255, 0.7);
      `;
      jumpArea.textContent = 'TAP TO JUMP';

      const moveArea = document.createElement('div');
      moveArea.style.cssText = `
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 50%;
        display: flex;
      `;

      const leftArea = document.createElement('div');
      leftArea.style.cssText = `
        width: 50%;
        height: 100%;
        background: rgba(255, 170, 0, 0.1);
        border: 2px dashed rgba(255, 170, 0, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        color: rgba(255, 255, 255, 0.7);
      `;
      leftArea.textContent = '← LEFT';

      const rightArea = document.createElement('div');
      rightArea.style.cssText = `
        width: 50%;
        height: 100%;
        background: rgba(255, 170, 0, 0.1);
        border: 2px dashed rgba(255, 170, 0, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        color: rgba(255, 255, 255, 0.7);
      `;
      rightArea.textContent = 'RIGHT →';

      moveArea.appendChild(leftArea);
      moveArea.appendChild(rightArea);
      mobileControls.appendChild(jumpArea);
      mobileControls.appendChild(moveArea);
    }

    // Assemble UI
    this.container.appendChild(statsContainer);
    this.container.appendChild(buttonContainer);
    this.container.appendChild(this.instructionsScreen);
    this.container.appendChild(this.gameOverScreen);
    this.container.appendChild(mobileControls);

    document.body.appendChild(this.container);
  }

  private createButton(text: string, color: string): HTMLElement {
    const button = document.createElement('button');
    button.textContent = text;
    button.style.cssText = `
      background: ${color};
      color: white;
      border: none;
      padding: 10px 16px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: bold;
      cursor: pointer;
      pointer-events: auto;
      transition: all 0.2s;
    `;

    button.addEventListener('mouseenter', () => {
      button.style.transform = 'scale(1.05)';
      button.style.boxShadow = `0 4px 15px ${color}40`;
    });

    button.addEventListener('mouseleave', () => {
      button.style.transform = 'scale(1)';
      button.style.boxShadow = 'none';
    });

    return button;
  }

  private dispatchEvent(eventName: string): void {
    const event = new CustomEvent(`game-${eventName}`);
    document.dispatchEvent(event);
  }

  setupEventListeners(callbacks: {
    onStart: () => void;
    onPause: () => void;
    onRestart: () => void;
  }): void {
    this.startButton.addEventListener('click', () => {
      this.hideInstructions();
      this.showGameUI();
      callbacks.onStart();
    });

    this.pauseButton.addEventListener('click', callbacks.onPause);

    document.addEventListener('game-restart', callbacks.onRestart);
  }

  updateGameState(gameState: GameState): void {
    this.scoreElement.textContent = `🎆 Score: ${gameState.score}`;
    this.livesElement.textContent = `❤️ Lives: ${gameState.lives}`;
    this.speedElement.textContent = `⚡ Speed: ${Math.floor(gameState.speed)}`;

    if (gameState.gameOver) {
      this.showGameOver(gameState.score);
    }

    // Update pause button text
    this.pauseButton.textContent = gameState.isPaused ? 'Resume' : 'Pause';
  }

  showInstructions(): void {
    this.instructionsScreen.style.display = 'block';
  }

  hideInstructions(): void {
    this.instructionsScreen.style.display = 'none';
  }

  showGameUI(): void {
    this.startButton.style.display = 'none';
    this.pauseButton.style.display = 'block';
  }

  hideGameUI(): void {
    this.startButton.style.display = 'block';
    this.pauseButton.style.display = 'none';
  }

  showGameOver(finalScore: number): void {
    this.finalScoreElement.textContent = `Final Score: ${finalScore}`;
    this.gameOverScreen.style.display = 'block';
    this.hideGameUI();
  }

  hideGameOver(): void {
    this.gameOverScreen.style.display = 'none';
  }

  dispose(): void {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}
