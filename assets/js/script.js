var formEl = document.querySelector("#task-form");
var tasksToDoEl = document.querySelector("#tasks-to-do");
var pageContentEl = document.querySelector("#page-content");
var tasksInProgressEl = document.querySelector("#tasks-in-progress");
var tasksCompletedEl = document.querySelector("#tasks-completed");
var taskIdCounter = 0;
var tasks = [];

var taskFormHandler = function (event) {
  event.preventDefault();
  var taskNameInput = document.querySelector("input[name='task-name']").value;
  var taskTypeInput = document.querySelector("select[name='task-type']").value;

  // check if input values are empty stirngs.
  if (!taskNameInput || !taskTypeInput) {
    alert("You need to fill out the task form!");
    return false;
  }
  formEl.reset();

  var isEdit = formEl.hasAttribute("data-task-id");

  // has a data attribute, so get task id and call function to complete edit process.
  if (isEdit) {
    var taskId = formEl.getAttribute("data-task-id");
    completedEditTask(taskNameInput, taskTypeInput, taskId);
  }
  // no data attribute, so create object as normal and pass to createTaskEl function.
  else {
    // package up data as an object.
    var taskDataObj = {
      name: taskNameInput,
      type: taskTypeInput,
      status: "to do",
    };

    // send it as an argument to createTaskE1
    createTaskEl(taskDataObj);
  }
};
var createTaskEl = function (taskDataObj) {
  // create  list item
  var listItemEl = document.createElement("li");
  listItemEl.className = "task-item";
  // add task id as a custom attribute.
  listItemEl.setAttribute("data-task-id", taskIdCounter);

  // create div to hold task info and add to list item.
  var taskInfoEl = document.createElement("div");
  // give it a class name.
  taskInfoEl.className = "task-info";

  // add HTML content to div
  taskInfoEl.innerHTML =
    "<h3 class='task-name'>" +
    taskDataObj.name +
    "</h3><span class='task-type'>" +
    taskDataObj.type +
    "</span>";
  listItemEl.appendChild(taskInfoEl);

  var taskActionsEl = createTaskActions(taskIdCounter);
  listItemEl.appendChild(taskActionsEl);

  if (taskDataObj.status === "to do") {
    listItemEl.querySelector("select[name='status-change']").selectedIndex = 0;
    tasksToDoEl.appendChild(listItemEl);
  } else if (taskDataObj.status === "in progress") {
    listItemEl.querySelector("select[name='status-change']").selectedIndex = 1;
    tasksInProgressEl.appendChild(listItemEl);
  } else if (taskDataObj.status === "completed") {
    listItemEl.querySelector("select[name='status-change']").selectedIndex = 2;
    tasksCompletedEl.appendChild(listItemEl);
  }

  // add entire list item list
  // tasksToDoEl.appendChild(listItemEl);
  // update task data object with new unique id.
  taskDataObj.id = taskIdCounter;
  tasks.push(taskDataObj);

  // save tasks to localStorage
  saveTasks();

  taskIdCounter++;
};

var createTaskActions = function (taskId) {
  var actionContainerEl = document.createElement("div");
  actionContainerEl.className = "task-actions";

  // create edit button
  var editButtonEl = document.createElement("button");
  editButtonEl.textContent = "Edit";
  editButtonEl.className = "btn edit-btn";
  editButtonEl.setAttribute("data-task-id", taskId);

  actionContainerEl.appendChild(editButtonEl);

  // create delete button
  var deleteButtonEl = document.createElement("button");
  deleteButtonEl.textContent = "Delete";
  deleteButtonEl.className = "btn delete-btn";
  deleteButtonEl.setAttribute("data-task-id", taskId);

  actionContainerEl.appendChild(deleteButtonEl);

  // create dropdown selection
  var statusSelectEl = document.createElement("select");
  statusSelectEl.className = "select-status";
  statusSelectEl.setAttribute("name", "status-change");
  statusSelectEl.setAttribute("data-task-id", taskId);

  var statusChoices = ["To Do", "In Progress", "Completed"];

  for (var i = 0; i < statusChoices.length; i++) {
    // create option element
    var statusOptionsEl = document.createElement("option");
    statusOptionsEl.textContent = statusChoices[i];
    statusOptionsEl.setAttribute("value", statusChoices[i]);
    // append to select
    statusSelectEl.appendChild(statusOptionsEl);
  }

  actionContainerEl.appendChild(statusSelectEl);

  return actionContainerEl;
};

var taskButtonHandler = function (event) {
  // get target element from event
  var targetEl = event.target;

  // edit button was clicked
  if (targetEl.matches(".edit-btn")) {
    var taskId = targetEl.getAttribute("data-task-id");
    editTask(taskId);
  }
  // delete button was clicked.
  else if (targetEl.matches(".delete-btn")) {
    var taskId = targetEl.getAttribute("data-task-id");
    deleteTask(taskId);
  }
};
var deleteTask = function (taskId) {
  var taskSelected = document.querySelector(
    ".task-item[data-task-id='" + taskId + "']"
  );
  taskSelected.remove();
  // create new array to hold updated list of tasks.
  var updatedTaskArr = [];

  // loop through current tasks.
  for (var i = 0; i < tasks.length; i++) {
    // if tasks[i].id doesn't match the value of taskId, let's keep that task and push it into the new array
    if (tasks[i].id != parseInt(taskId)) {
      updatedTaskArr.push(tasks[i]);
    }
  }
  // reassign tasks array top be the same as updatedTaskArr.
  tasks = updatedTaskArr;

  saveTasks();
};
var editTask = function (taskId) {
  // get task list item element
  var taskSelected = document.querySelector(
    ".task-item[data-task-id='" + taskId + "']"
  );

  // get content from task name and type.
  var taskName = taskSelected.querySelector("h3.task-name").textContent;
  var taskType = taskSelected.querySelector("span.task-type").textContent;

  document.querySelector("input[name='task-name']").value = taskName;
  document.querySelector("select[name='task-type']").value = taskType;

  document.querySelector("#save-task").textContent = "Save Task";

  formEl.setAttribute("data-task-id", taskId);
};
var completedEditTask = function (taskName, taskType, taskId) {
  var taskSelected = document.querySelector(
    ".task-item[data-task-id='" + taskId + "']"
  );

  // set new values
  taskSelected.querySelector("h3.task-name").textContent = taskName;
  taskSelected.querySelector("span.task-type").textContent = taskType;
  // alert("Task Updated");

  // loop through tasks array and task object with new content.
  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].id === parseInt(taskId)) {
      tasks[i].name = taskName;
      tasks[i].type = taskType;
    }
  }
  saveTasks();

  formEl.removeAttribute("data-task-id");
  document.querySelector("#save-task").textContent = "Add Task";
};

var taskStatusChangeHandler = function (event) {
  // get the task items id
  var taskId = event.target.getAttribute("data-task-id");

  // get the currently selected option's value and convert to lowercase.
  var statusValue = event.target.value.toLowerCase();

  // find the parent task item element based on the id
  var taskSelected = document.querySelector(
    ".task-item[data-task-id='" + taskId + "']"
  );

  if (statusValue === "to do") {
    tasksToDoEl.appendChild(taskSelected);
  } else if (statusValue === "in progress") {
    tasksInProgressEl.appendChild(taskSelected);
  } else if (statusValue === "completed") {
    tasksCompletedEl.appendChild(taskSelected);
  }

  // update task's in tasks array
  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].id === parseInt(taskId)) {
      tasks[i].status = statusValue;
    }
  }
  saveTasks();
};
var saveTasks = function () {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};
var loadTask = function () {
  var savedTasks = localStorage.getItem("tasks");

  if (savedTasks === null) {
    return false;
  }
  savedTasks = JSON.parse(savedTasks);

  // loop through savedTasks array
  for (var i = 0; i < savedTasks.length; i++) {
    // pass each task object into the 'createTaskEl() function'.
    createTaskEl(savedTasks[i]);
  }

  /* for (var i = 0; i < tasks.length; i++) {
    taskIdCounter = tasks[i].id;
    // console.log(tasks[i]);

    var listItemEl = document.createElement("li");
    listItemEl.className = "task-item";
    listItemEl.setAttribute("data-task-id", tasks[i].id);
    // console.log(listItemEl);

    var taskInfoEl = document.createElement("div");
    taskInfoEl.className = "task-info";
    taskInfoEl.innerHTML =
      "<h3 class='task-name'>" +
      tasks[i].name +
      "</h3><span class='task-type'>" +
      tasks[i].type +
      "</span>";

    // Append task info to list element.
    listItemEl.appendChild(taskInfoEl);

    // create task action buttons.
    var taskActionsEl = createTaskActions(tasks[i].id);

    // append task action buttons to list item element.
    listItemEl.appendChild(taskActionsEl);

    if (tasks[i].status === "to do") {
      listItemEl.querySelector(
        "select[name='status-change']"
      ).selectedIndex = 0;
      tasksToDoEl.appendChild(listItemEl);
    } else if (tasks[i].status === "in progress") {
      listItemEl.querySelector(
        "select[name='status-change']"
      ).selectedIndex = 1;
      tasksInProgressEl.appendChild(listItemEl);
    } else if (tasks[i].status === "completed") {
      listItemEl.querySelector(
        "select[name='status-change']"
      ).selectedIndex = 2;
      tasksCompletedEl.appendChild(listItemEl);
    }
    taskIdCounter++;
    
    // console.log(listItemEl);
  }*/
};

formEl.addEventListener("submit", taskFormHandler);

// event delegation /event bubbling
pageContentEl.addEventListener("click", taskButtonHandler);

pageContentEl.addEventListener("change", taskStatusChangeHandler);
loadTask();
