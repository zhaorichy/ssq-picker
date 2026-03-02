// 双色球选号器逻辑

class SSQPicker {
    constructor() {
        this.redBalls = [];
        this.blueBall = null;
        this.history = this.loadHistory();
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderHistory();
    }

    bindEvents() {
        document.getElementById('generateBtn').addEventListener('click', () => {
            this.generateRandom();
        });

        document.getElementById('luckyBtn').addEventListener('click', () => {
            this.generateLucky();
        });

        document.getElementById('clearBtn').addEventListener('click', () => {
            this.clearHistory();
        });
    }

    // 生成随机号码
    generateRandom() {
        this.animateBalls(() => {
            // 生成6个不重复的红球 (1-33)
            this.redBalls = this.generateUniqueNumbers(6, 1, 33);
            // 生成1个蓝球 (1-16)
            this.blueBall = this.generateUniqueNumbers(1, 1, 16)[0];
            
            this.displayBalls();
            this.addToHistory('随机');
        });
    }

    // 生成幸运号码（带一些趣味性）
    generateLucky() {
        this.animateBalls(() => {
            // 幸运模式：优先选择常见"幸运数字"
            const luckyNumbers = [6, 8, 9, 16, 18, 19, 26, 28, 29, 33];
            const pool = [...luckyNumbers];
            
            // 从幸运数字中选3个
            const luckyRed = [];
            for (let i = 0; i < 3 && pool.length > 0; i++) {
                const idx = Math.floor(Math.random() * pool.length);
                luckyRed.push(pool.splice(idx, 1)[0]);
            }
            
            // 剩余3个从全部红球中选（排除已选的）
            const remaining = this.generateUniqueNumbersFromRange(3, 1, 33, luckyRed);
            this.redBalls = [...luckyRed, ...remaining].sort((a, b) => a - b);
            
            // 蓝球也优先幸运数字
            const luckyBlue = [6, 8, 9, 16];
            this.blueBall = luckyBlue[Math.floor(Math.random() * luckyBlue.length)];
            
            this.displayBalls();
            this.addToHistory('幸运');
        });
    }

    // 生成不重复随机数
    generateUniqueNumbers(count, min, max) {
        const numbers = [];
        while (numbers.length < count) {
            const num = Math.floor(Math.random() * (max - min + 1)) + min;
            if (!numbers.includes(num)) {
                numbers.push(num);
            }
        }
        return numbers.sort((a, b) => a - b);
    }

    // 从指定范围生成不重复随机数（排除某些数字）
    generateUniqueNumbersFromRange(count, min, max, exclude) {
        const numbers = [];
        while (numbers.length < count) {
            const num = Math.floor(Math.random() * (max - min + 1)) + min;
            if (!numbers.includes(num) && !exclude.includes(num)) {
                numbers.push(num);
            }
        }
        return numbers.sort((a, b) => a - b);
    }

    // 球体动画
    animateBalls(callback) {
        const container = document.querySelector('.balls-display');
        container.classList.add('shaking');
        
        // 显示问号
        this.showPlaceholders();
        
        setTimeout(() => {
            container.classList.remove('shaking');
            callback();
        }, 500);
    }

    // 显示占位符
    showPlaceholders() {
        const redContainer = document.getElementById('redBalls');
        const blueContainer = document.getElementById('blueBall');
        
        redContainer.innerHTML = Array(6).fill('<div class="ball red-ball placeholder">?</div>').join('');
        blueContainer.innerHTML = '<div class="ball blue-ball-single placeholder">?</div>';
    }

    // 显示球号
    displayBalls() {
        const redContainer = document.getElementById('redBalls');
        const blueContainer = document.getElementById('blueBall');
        
        // 显示红球
        redContainer.innerHTML = this.redBalls.map(num => 
            `<div class="ball red-ball">${num.toString().padStart(2, '0')}</div>`
        ).join('');
        
        // 显示蓝球
        blueContainer.innerHTML = `<div class="ball blue-ball-single">${this.blueBall.toString().padStart(2, '0')}</div>`;
    }

    // 添加到历史记录
    addToHistory(type) {
        const record = {
            redBalls: [...this.redBalls],
            blueBall: this.blueBall,
            type: type,
            time: new Date().toLocaleString('zh-CN', {
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            })
        };
        
        this.history.unshift(record);
        if (this.history.length > 20) {
            this.history = this.history.slice(0, 20);
        }
        
        this.saveHistory();
        this.renderHistory();
    }

    // 渲染历史记录
    renderHistory() {
        const container = document.getElementById('historyList');
        
        if (this.history.length === 0) {
            container.innerHTML = '<p class="empty-tip">暂无选号记录</p>';
            return;
        }
        
        container.innerHTML = this.history.map((record, index) => `
            <div class="history-item">
                <div class="history-balls">
                    ${record.redBalls.map(num => 
                        `<span class="history-ball red">${num.toString().padStart(2, '0')}</span>`
                    ).join('')}
                    <span class="history-ball blue">${record.blueBall.toString().padStart(2, '0')}</span>
                </div>
                <span class="history-time">${record.time}</span>
            </div>
        `).join('');
    }

    // 清空历史
    clearHistory() {
        if (this.history.length === 0) return;
        
        if (confirm('确定要清空所有选号记录吗？')) {
            this.history = [];
            this.saveHistory();
            this.renderHistory();
        }
    }

    // 保存到本地存储
    saveHistory() {
        try {
            localStorage.setItem('ssq_history', JSON.stringify(this.history));
        } catch (e) {
            console.log('无法保存历史记录');
        }
    }

    // 加载历史记录
    loadHistory() {
        try {
            const saved = localStorage.getItem('ssq_history');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    new SSQPicker();
});
