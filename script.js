document.addEventListener('DOMContentLoaded', function() {
    populateTimeSelectors();
    showTask();
    renderCalendar();

    flatpickr("#date-select", {
        locale: "en",
        dateFormat: "d/m/Y"
    });

    flatpickr("#modal-date-select", {
        locale: "en",
        dateFormat: "d/m/Y"
    });
});

const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

function openModal() {
    const modal = document.getElementById("taskModal");
    modal.style.display = "block";
    document.getElementById("modal-input-box").value = "";
    document.getElementById("modal-priority-select").value = "Low";
    document.getElementById("modal-hour-select").value = "00";
    document.getElementById("modal-minute-select").value = "00";
    document.getElementById("modal-category-select").value = "Others";
    document.getElementById("modal-date-select").value = "";
}

function closeModal() {
    const modal = document.getElementById("taskModal");
    modal.style.display = "none";
}

function saveTask() {
    const taskText = document.getElementById("modal-input-box").value;
    const priority = document.getElementById("modal-priority-select").value;
    const reminder = `${document.getElementById("modal-hour-select").value}:${document.getElementById("modal-minute-select").value}:00`;
    const category = document.getElementById("modal-category-select").value;
    const date = document.getElementById("modal-date-select").value;

    if (taskText) {
        const task = {
            text: taskText,
            category: category,
            priority: priority,
            reminder: reminder,
            date: date
        };
        taskList.push(task);
        saveData();
        showTask();
        showSuccessNotification("Your task has been added successfully!");
        closeModal();
        renderCalendar();
    } else {
        alert("You must write something!");
    }
}

function addTask() {
    if (inputBox.value === '') {
        alert("You must write something!");
    } else {
        const task = {
            text: inputBox.value,
            category: categorySelect.value,
            priority: prioritySelect.value,
            reminder: `${hourSelect.value}:${minuteSelect.value}:00`,
            date: dateSelect.value
        };
        taskList.push(task);
        updateTaskList();
        inputBox.value = "";
        hourSelect.value = "00";
        minuteSelect.value = "00";
        dateSelect.value = "";
        saveData();
        showSuccessNotification("Your task has been added successfully!");
        renderCalendar();
    }
}

document.querySelector(".close").onclick = function() {
    closeModal();
}

window.onclick = function(event) {
    const modal = document.getElementById("taskModal");
    if (event.target === modal) {
        closeModal();
    }
}

const inputBox = document.getElementById("input-box");
const prioritySelect = document.getElementById("priority-select");
const hourSelect = document.getElementById("hour-select");
const minuteSelect = document.getElementById("minute-select");
const workList = document.getElementById("work-list");
const personalList = document.getElementById("personal-list");
const schoolList = document.getElementById("school-list");
const othersList = document.getElementById("others-list");
const categorySelect = document.getElementById("category-select");
const dateSelect = document.getElementById("date-select");
const notificationContainer = document.getElementById("notification-container");
const notificationSound = document.getElementById("notification-sound");
let taskList = JSON.parse(localStorage.getItem("taskList")) || [];

function populateTimeSelectors() {
    for (let i = 0; i < 24; i++) {
        const hourOption = document.createElement("option");
        hourOption.value = hourOption.textContent = i.toString().padStart(2, '0');
        hourSelect.appendChild(hourOption);
        document.getElementById("modal-hour-select").appendChild(hourOption.cloneNode(true));
    }

    for (let i = 0; i < 60; i++) {
        const minuteOption = document.createElement("option");
        minuteOption.value = minuteOption.textContent = i.toString().padStart(2, '0');
        minuteSelect.appendChild(minuteOption);
        document.getElementById("modal-minute-select").appendChild(minuteOption.cloneNode(true));
    }
}

function updateTaskList() {
    taskList.sort((a, b) => {
        const priorities = { "High": 1, "Medium": 2, "Low": 3 };
        return priorities[a.priority] - priorities[b.priority];
    });

    workList.innerHTML = "";
    personalList.innerHTML = "";
    schoolList.innerHTML = "";
    othersList.innerHTML = "";
    taskList.forEach(task => {
        let li = document.createElement("li");
        let priorityImage = '';
        switch(task.priority) {
            case "High":
                priorityImage = 'images/icons8-high-priority-48.png';
                break;
            case "Medium":
                priorityImage = 'images/icons8-medium-priority-50.png';
                break;
            case "Low":
                priorityImage = 'images/icons8-low-priority-30.png';
                break;
        }

        li.innerHTML = `
            <span class="task-text">
                ${task.text}
            </span>
            <span class="priority">
                <img src="${priorityImage}" alt="${task.priority}">
                ${task.priority}
            </span> 
            <span class="delete" onclick="deleteTask(${taskList.indexOf(task)})">\u00d7</span>
        `;
        
        switch(task.category) {
            case "Work":
                workList.appendChild(li);
                break;
            case "Personal":
                personalList.appendChild(li);
                break;
            case "School":
                schoolList.appendChild(li);
                break;
            case "Others":
                othersList.appendChild(li);
                break;
        }
        if (task.reminder) {
            scheduleNotification(task);
        }
    });
}

function scheduleNotification(task) {
    const reminderTime = new Date(task.date + 'T' + task.reminder + ':00');
    const currentTime = new Date();
    const timeToReminder = reminderTime.getTime() - currentTime.getTime();

    if (timeToReminder > 0) {
        setTimeout(() => {
            showNotification(`Reminder: ${task.text}`);
        }, timeToReminder);
    } else {
        console.warn('The reminder time has already passed for task:', task.text);
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.classList.add('notification');
    notification.innerHTML = `
        <p>${message}</p>
    `;
    notificationContainer.appendChild(notification);

    notificationSound.play();

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function showSuccessNotification(message) {
    const successNotification = document.createElement('div');
    successNotification.classList.add('notification', 'success-notification');
    successNotification.innerHTML = `
        <p>${message}</p>
    `;
    notificationContainer.appendChild(successNotification);

    setTimeout(() => {
        successNotification.remove();
    }, 3000);
}

function deleteTask(index) {
    taskList.splice(index, 1);
    updateTaskList();
    saveData();
    renderCalendar();
}

function saveData() {
    localStorage.setItem("taskList", JSON.stringify(taskList));
}

function showTask() {
    updateTaskList();
}

function renderCalendar() {
    const calendarGrid = document.getElementById("calendar-grid");
    calendarGrid.innerHTML = "";

    const month = currentMonth;
    const year = currentYear;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const monthYearString = `${months[month]} ${year}`;
    document.getElementById("calendar-month").textContent = monthYearString;

    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement("div");
        emptyCell.classList.add("calendar-day", "empty-cell");
        calendarGrid.appendChild(emptyCell);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement("div");
        dayCell.classList.add("calendar-day");
        dayCell.textContent = day;

        const tasksForDay = taskList.filter(task => {
            const taskDate = new Date(task.date);
            return taskDate.getFullYear() === year && taskDate.getMonth() === month && taskDate.getDate() === day;
        });

        if (tasksForDay.length > 0) {
            dayCell.classList.add("task-day");
            const tooltip = document.createElement("div");
            tooltip.classList.add("tooltip");

            tasksForDay.forEach(task => {
                const taskElement = document.createElement("div");
                taskElement.innerHTML = `
                    <div class="tooltip-header">
                        <img src="images/${task.category.toLowerCase()}-icon.png" alt="${task.category}">
                        <span>${task.text}</span>
                    </div>
                `;
                tooltip.appendChild(taskElement);
            });

            dayCell.appendChild(tooltip);
        }

        calendarGrid.appendChild(dayCell);
    }
}

function prevMonth() {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    renderCalendar();
}

function nextMonth() {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar();
}
