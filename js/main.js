Vue.component('add-task', {
    template: `
    <div>
    <p v-if="errors.length">
        <b>Please correct the following error(s):</b>
        <ul>
            <li v-for="error in errors">{{ error }}</li>
        </ul>
    </p>
        <h2>Create task</h2>
        <div>
        <label>Task title:
         <input placeholder="New task" v-model="task.title">
         </label>
        <h3>Tasks</h3>
        <button @click="addSubtask">Add more tasks</button>
         <button @click="delSubtask">Less tasks</button>
        <div v-for="(subtask, index) in task.subtasks"><input placeholder="Task" v-model="subtask.title" :key="index">
        </div>
        <div>
    <input type="radio" id="yes" name="drone" v-model="task.importance" value="1"/>
    <label for="yes">Important</label>
  </div>

  <div>
    <input type="radio" id="no" name="drone" v-model="task.importance" value="0" />
    <label for="no">Common</label>
  </div>
        <button @click="addTask">add</button>
        </div>
    </div>
    `,
    methods: {
        addSubtask() {
            if (this.task.subtasks.length < 5){
            this.task.subtasks.push({title: "Task " + (this.task.subtasks.length + 1), done: false})
            }
        },
        delSubtask(index) {
            if(this.task.subtasks.length > 3){
            this.task.subtasks.pop()
            }
        },
        addTask() {
            this.errors = [];
            if (!this.task.title || this.task.subtasks.filter(subtask => subtask.title).length < 3) {
                if (!this.task.title) this.errors.push("Title required.");
                if (this.task.subtasks.filter(subtask => subtask.title).length < 3) this.errors.push("You must have at least 3 filled titles.");
                return;
            }
            let productReview = {
                title: this.task.title,
                subtasks: this.task.subtasks.filter(subtask => subtask.title),
                date: this.task.date,
                importance: this.task.importance
            };
            this.$emit('add-task', productReview);
            location.reload();
        }
    },
    data() {
        return {
            errors: [],
            task: {
                title: 'New task',
                subtasks: [
                    {title: "Task 1", done: false},
                    {title: "Task 2", done: false},
                    {title: "Task 3", done: false},
                ],
                importance: 1,
                date: new Date().toLocaleTimeString() + ' ' + new Date().toLocaleDateString(),
            }
        }
    },
})

Vue.component('column', {
    props: {
        column: {
            title: '',
            tasks: [],
            date: ''
        }
    },
    template: `
    <div class="column">
        <h2>{{column.title}}</h2>
        <div class="task">
        <task v-for="(task, index) in sortedTasks"
        :key="index"
        :task="task"
        @done-subtask="doneSubtask"
        @task-half-filled="taskHalf"
        @task-half-filled2="taskHalf2"
        @task-filled-completely="taskFilled"
        @update-task="updateTask">
    </task>
        </div>
    </div>
    `,
    updated() {
        this.$emit('save')
    },
    methods: {
        doneSubtask(subtask) {
            this.$emit('done-subtask', subtask)
        },
        taskHalf(task) {
            this.$emit('task-half-filled', {task: task, column: this.column})
        },
        taskHalf2(task) {
            this.$emit('task-half-filled2', {task: task, column: this.column})
        },
        taskFilled(task) {
            this.$emit('task-filled-completely', {task: task, column: this.column})
        },
        updateTask(task) {
            this.$emit('save');
        }
    },
    computed: {
        sortedTasks() {
            return this.column.tasks.sort((a, b) => b.importance - a.importance);
        }
    }
})

Vue.component('task', {
    props: {
        task: {
            title: '',
            subtasks: [],
            importance: ''
        }
    },
    data() {
        return {
            newSubtaskTitle: ''
        }
    },
    template: `
    <div>
  <h2>{{ task.title }}</h2>
  <li v-for="(subtask, index) in task.subtasks" class="subtask" :key="index" :class="{ done: subtask.done }" @click="doneSubtask(subtask)">
    {{ subtask.title }}
    <button v-if="!isLastColumn" @click.stop="deleteSubtask(index)">Удалить</button>
  </li>
  <div v-if="!isLastColumn">
    <input v-model="newSubtaskTitle" placeholder="Новая подзадача" @keyup.enter="addSubtask" />
    <button @click="addSubtask">Добавить</button>
  </div>
  <p>Дата изменения: {{ task.date }}</p>
  <p v-if="task.importance === 1">Важные задачи</p>
  <p v-else>Обычные задачи</p>
</div>
    `,
    updated() {
        if (this.half) {
            this.$emit('task-half-filled', this.task)
        }
        if (this.filled) {
            this.$emit('task-filled-completely', this.task)
        }
    },
    methods: {
        doneSubtask(subtask) {
            this.$emit('done-subtask', subtask)
        },
        addSubtask() {
            if (!this.isLastColumn && this.newSubtaskTitle.trim() !== '') {
                this.task.subtasks.push({ title: this.newSubtaskTitle.trim(), done: false });
                this.newSubtaskTitle = '';
                this.$emit('update-task', this.task);
                this.$emit('task-half-filled2', this.task);
            }
        },
        deleteSubtask(index) {
            if (this.task.subtasks.length > 1) {
                if (!this.isLastColumn) {
                    this.task.subtasks.splice(index, 1);
                    this.$emit('update-task', this.task);
                    this.$emit('task-half-filled2', this.task);
                }
            }
        }
    },
    computed: {
        isLastColumn() {
            return this.$parent.column.index === 2;
        },
        filled() {
            let arr = []
            this.task.subtasks.forEach(task => {
                if (task.done === true){
                    arr.push(task.done)
                }
            })
            return (arr.length) / this.task.subtasks.length === 1
        },
        half() {
            let arr = []
            this.task.subtasks.forEach(task => {
                if (task.done === true){
                    arr.push(task.done)
                }
            })
            return Math.ceil(this.task.subtasks.length / 2) === arr.length
        },
    }
})

let app = new Vue({
    el: '#app',
    data: {
        columns: [
            {
                disabled: false,
                index: 0,
                title: "New tasks",
                tasks: []
            },
            {
                index: 1,
                title: "Active",
                tasks: []
            },
            {
                index: 2,
                title: "Complete",
                tasks: [],
            }
        ]
    },
    mounted() {
        if (!localStorage.getItem('columns')) return
        this.columns = JSON.parse(localStorage.getItem('columns'));
    },
    methods: {
        taskHalf2(data) {
            if (data.column.index === 1) {
                if (data.task.subtasks.filter(subtask => subtask.done).length / data.task.subtasks.length < 0.5) {
                    this.move(data, this.columns[0]);
                }
            }
        },
        save() {
            localStorage.setItem('columns', JSON.stringify(this.columns))
        },
        addTask(task) {
            if ((this.columns[0].tasks.length > 2) || this.columns[0].disabled) return
            this.columns[0].tasks.push(task)
        },
        doneSubtask(subtask) {
            subtask.done = true
            this.save()
        },
        taskHalf(data) {
            if (data.column.index !== 0 || data.column.disabled) return
            if (this.columns[1].tasks.length > 4) {
                this.columns[0].disabled = true
                alert("Нельзя добавить ещё!")
                return;
            }
            this.move(data, this.columns[1])
        },
        taskFilled(data) {
            this.move(data, this.columns[2])
            this.enabled()
        },
        move(data, column) {
            data.task.date = new Date().toLocaleTimeString() + ' ' + new Date().toLocaleDateString()
            column.tasks.push(data.column.tasks.splice(data.column.tasks.indexOf(data.task), 1)[0])
        },
        enabled() {
            this.columns[0].disabled = false;
            this.columns[0].tasks.forEach(task => {
                task.subtasks = task.subtasks.filter(subtask => subtask.title);
                if (Math.ceil(task.subtasks.length / 2) === task.subtasks.filter(subtask => subtask.done).length) {
                    this.move({task: task, column: this.columns[0]}, this.columns[1]);
                }
            });
        }
    },
})