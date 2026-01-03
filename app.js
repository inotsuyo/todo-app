class TodoApp {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentFilter = 'all';
        this.currentCategory = 'all';
        this.initializeEventListeners();
        this.renderTasks();
        this.updateCategoryFilter();
    }

    // ローカルストレージからタスクを読み込み
    loadTasks() {
        const savedTasks = localStorage.getItem('tasks');
        return savedTasks ? JSON.parse(savedTasks) : [];
    }

    // ローカルストレージにタスクを保存
    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    // イベントリスナーの初期化
    initializeEventListeners() {
        // フォーム送信
        document.getElementById('add-task-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTask();
        });

        // フィルターボタン
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.renderTasks();
            });
        });

        // カテゴリフィルター
        document.getElementById('category-filter').addEventListener('change', (e) => {
            this.currentCategory = e.target.value;
            this.renderTasks();
        });
    }

    // タスクを追加
    addTask() {
        const taskInput = document.getElementById('task-input');
        const prioritySelect = document.getElementById('priority-select');
        const dueDateInput = document.getElementById('due-date-input');
        const categoryInput = document.getElementById('category-input');

        const taskText = taskInput.value.trim();
        if (!taskText) return;

        const newTask = {
            id: Date.now(),
            text: taskText,
            completed: false,
            priority: prioritySelect.value,
            dueDate: dueDateInput.value || null,
            category: categoryInput.value.trim() || null,
            createdAt: new Date().toISOString()
        };

        this.tasks.unshift(newTask);
        this.saveTasks();
        this.renderTasks();
        this.updateCategoryFilter();

        // フォームをリセット
        taskInput.value = '';
        dueDateInput.value = '';
        categoryInput.value = '';
        prioritySelect.value = 'medium';
    }

    // タスクの完了状態を切り替え
    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.renderTasks();
        }
    }

    // タスクを削除
    deleteTask(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.saveTasks();
        this.renderTasks();
        this.updateCategoryFilter();
    }

    // フィルタリング処理
    getFilteredTasks() {
        let filtered = [...this.tasks];

        // 完了状態でフィルター
        if (this.currentFilter === 'active') {
            filtered = filtered.filter(t => !t.completed);
        } else if (this.currentFilter === 'completed') {
            filtered = filtered.filter(t => t.completed);
        }

        // カテゴリでフィルター
        if (this.currentCategory !== 'all') {
            filtered = filtered.filter(t => t.category === this.currentCategory);
        }

        return filtered;
    }

    // カテゴリフィルターのドロップダウンを更新
    updateCategoryFilter() {
        const categoryFilter = document.getElementById('category-filter');
        const categories = [...new Set(this.tasks.map(t => t.category).filter(c => c))];

        categoryFilter.innerHTML = '<option value="all">全カテゴリ</option>';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    }

    // タスクをレンダリング
    renderTasks() {
        const container = document.getElementById('tasks-container');
        const filteredTasks = this.getFilteredTasks();

        if (filteredTasks.length === 0) {
            container.innerHTML = '<div class="empty-state">タスクがありません</div>';
            return;
        }

        container.innerHTML = filteredTasks.map(task => this.createTaskHTML(task)).join('');

        // イベントリスナーを追加
        filteredTasks.forEach(task => {
            const taskElement = document.getElementById(`task-${task.id}`);

            taskElement.querySelector('.task-checkbox').addEventListener('change', () => {
                this.toggleTask(task.id);
            });

            taskElement.querySelector('.btn-delete').addEventListener('click', () => {
                this.deleteTask(task.id);
            });
        });
    }

    // タスクのHTMLを生成
    createTaskHTML(task) {
        const priorityText = {
            high: '高',
            medium: '中',
            low: '低'
        };

        const dueDateText = task.dueDate
            ? new Date(task.dueDate).toLocaleDateString('ja-JP')
            : null;

        return `
            <div class="task-item priority-${task.priority} ${task.completed ? 'completed' : ''}" id="task-${task.id}">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>

                <div class="task-details">
                    <div class="task-content">${this.escapeHtml(task.text)}</div>
                    <div class="task-meta">
                        <span class="task-priority">優先度: ${priorityText[task.priority]}</span>
                        ${dueDateText ? `<span class="task-due-date">期限: ${dueDateText}</span>` : ''}
                        ${task.category ? `<span class="task-category">${this.escapeHtml(task.category)}</span>` : ''}
                    </div>
                </div>

                <div class="task-actions">
                    <button class="btn-delete">削除</button>
                </div>
            </div>
        `;
    }

    // HTMLエスケープ処理
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// アプリを初期化
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});
