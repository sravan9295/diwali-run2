/**
 * Health Bar Component - Clean version for Devvit
 */

export class HealthBar {
    constructor(options = {}) {
        this.maxHealth = options.maxHealth || 3;
        this.currentHealth = options.currentHealth || 3;
        this.element = null;
        this.init();
    }

    init() {
        this.createElement();
        this.render();
        this.attachToDOM();
    }

    createElement() {
        this.element = document.createElement('div');
        this.element.className = 'health-bar';
        this.element.style.cssText = `
            position: absolute;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 6px;
            background: rgba(0, 0, 0, 0.8);
            padding: 8px 12px;
            border-radius: 10px;
            border: 2px solid rgba(255, 107, 53, 0.3);
            backdrop-filter: blur(10px);
            z-index: 200;
            font-size: 16px;
        `;
    }

    render() {
        this.element.innerHTML = '';
        
        for (let i = 0; i < this.maxHealth; i++) {
            const heart = document.createElement('span');
            heart.textContent = i < this.currentHealth ? '❤️' : '🖤';
            heart.style.cssText = `
                transition: all 0.3s ease;
                filter: drop-shadow(0 0 4px rgba(255, 107, 53, 0.5));
            `;
            this.element.appendChild(heart);
        }
    }

    attachToDOM() {
        document.body.appendChild(this.element);
    }

    setHealth(health) {
        this.currentHealth = Math.max(0, Math.min(health, this.maxHealth));
        this.render();
        
        if (this.currentHealth < this.maxHealth) {
            this.triggerDamageEffect();
        }
        
        return this.currentHealth;
    }

    takeDamage(amount = 1) {
        return this.setHealth(this.currentHealth - amount);
    }

    heal(amount = 1) {
        return this.setHealth(this.currentHealth + amount);
    }

    getHealth() {
        return this.currentHealth;
    }

    isAlive() {
        return this.currentHealth > 0;
    }

    show() {
        this.element.style.display = 'flex';
    }

    hide() {
        this.element.style.display = 'none';
    }

    triggerDamageEffect() {
        // Simple screen flash
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(255, 68, 68, 0.3);
            pointer-events: none;
            z-index: 9999;
            opacity: 1;
            transition: opacity 0.3s ease-out;
        `;
        
        document.body.appendChild(flash);
        
        setTimeout(() => {
            flash.style.opacity = '0';
            setTimeout(() => flash.remove(), 300);
        }, 50);
    }

    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}