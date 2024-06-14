"use strict";

// List panel elements
const listsContainer = document.querySelector("[data-list]");
const newListForm = document.querySelector("[data-new-list-form]");
const newListInput = document.querySelector("[data-new-list-input]");

// Task panel elements
const listDisplayContainer = document.querySelector(
  "[data-list-display-container]"
);
const listTitleElement = document.querySelector("[data-list-title]");
const taskCountElement = document.querySelector("[data-task-count]");
const tasksContainer = document.querySelector("[data-tasks]");
const taskTemplate = document.getElementById("task-template");
const newTaskForm = document.querySelector("[data-new-task-form]");
const newTaskInput = document.querySelector("[data-new-task-input]");
const clearCompletedTasksButton = document.querySelector(
  "[data-clear-complete-tasks-button]"
);
const deleteListButton = document.querySelector("[data-delete-list-button]");

const testList = [
  {
    id: "009722633",
    name: "groceries",
    tasks: [
      { id: "123345789", name: "eggs", completed: false },
      { id: "586940306", name: "milk", completed: false },
      { id: "009824598", name: "bread", completed: false },
    ],
  },
  {
    id: "998872234",
    name: "chores",
    tasks: [
      { id: "017404729", name: "feed dog", completed: false },
      { id: "299662063", name: "take out trash", completed: false },
    ],
  },
];
const listClasses = ["list-name"];
const LOCAL_STORAGE_LISTS_KEY = "task.lists";
const LOCAL_STORAGE_SELECTED_LIST_ID_KEY = "task.selectedListId";
let lists =
  JSON.parse(localStorage.getItem(LOCAL_STORAGE_LISTS_KEY)) || testList;

/* localStorage.setItem(
  LOCAL_STORAGE_SELECTED_LIST_ID_KEY,
  JSON.stringify("test")
); */
let selectedListId = JSON.parse(
  localStorage.getItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY)
); // null if DNE

//
// Event listeners
newListForm.addEventListener("submit", handleNewList);
listsContainer.addEventListener("click", handleSelectList);
newTaskForm.addEventListener("submit", handleNewTask);
tasksContainer.addEventListener("change", handleCompleteTask);
clearCompletedTasksButton.addEventListener("click", handleClearCompletedTasks);
deleteListButton.addEventListener("click", handleDeleteList);

//
// Handle events

lists = testList;

function handleNewList(event) {
  event.preventDefault();
  const listName = newListInput.value;
  if (listName == null || listName === "") return;
  lists.push(createList(listName));
  newListInput.value = null;

  saveAndRender();
}

function handleSelectList(event) {
  event.preventDefault();
  if (
    event.target.tagName.toLowerCase() === "li" &&
    event.target.dataset.listItemId
  ) {
    selectedListId = event.target.dataset.listItemId;
    saveAndRender();
  }
}

function handleNewTask(event) {
  event.preventDefault();
  const taskName = newTaskInput.value;
  const selectedList = lists.find((list) => list.id === selectedListId);
  const tasks = selectedList.tasks;
  if (taskName == null || taskName === "") return;
  tasks.push(createTask(taskName));
  newTaskInput.value = null;
  saveAndRender();
}

function handleCompleteTask(event) {
  event.preventDefault();
  if (event.target.tagName.toLowerCase() === "input") {
    const selectedTaskId = event.target.id;
    const selectedTask = lists
      .find((list) => list.id === selectedListId)
      .tasks.find((task) => task.id === selectedTaskId);
    selectedTask.completed = event.target.checked;
    saveAndRender();
  }
}

function handleClearCompletedTasks(event) {
  const selectedList = lists.find((list) => list.id === selectedListId);
  selectedList.tasks = selectedList.tasks.filter(
    (task) => task.completed === false
  );
  saveAndRender();
}

function handleDeleteList(event) {
  lists = lists.filter((list) => list.id !== selectedListId);
  saveAndRender();
}

//
// Render functions
function saveAndRender() {
  save(LOCAL_STORAGE_LISTS_KEY, lists);
  save(LOCAL_STORAGE_SELECTED_LIST_ID_KEY, selectedListId);
  render();
}

function render() {
  renderListItems(lists, listClasses, listsContainer);

  const selectedList = lists.find((list) => list.id === selectedListId);
  if (selectedList == null) {
    listDisplayContainer.style.display = "none";
    listTitleElement.innerText = "";
  } else {
    listDisplayContainer.style.display = "";
    listTitleElement.innerText = selectedList.name;
    renderTasks(selectedList, taskTemplate, tasksContainer);
    renderTaskCount(selectedList);
  }
}

function renderListItems(items, classes, target) {
  clearElement(target);
  items.forEach((item) => {
    const element = document.createElement("li");
    element.innerText = item.name;
    element.dataset.listItemId = item.id;
    addClasses(element, classes);
    if (+item.id === +selectedListId) element.classList.add("active-list");
    target.appendChild(element);
  });
}

function renderTasks(selectedList, template, target) {
  const tasks = selectedList.tasks;

  clearElement(target);
  tasks.forEach((task) => {
    const element = template.content.cloneNode(true);
    const checkbox = element.querySelector('[type="checkbox"]');
    const label = element.querySelector("label");

    label.append(task.name);
    label.htmlFor = task.id;
    checkbox.checked = task.completed;
    checkbox.id = task.id;
    target.appendChild(element);
  });
}

function renderTaskCount(selectedList) {
  const incompleteTasksCount = selectedList.tasks.filter(
    (task) => task.completed === false
  ).length;
  const taskString = incompleteTasksCount === 1 ? "task" : "tasks";
  taskCountElement.innerText = `${incompleteTasksCount} ${taskString} remaining`;
}

//
// Create lists and tasks

function createList(name) {
  return { id: Date.now().toString(), name, tasks: [] };
}

function createTask(name) {
  return { id: Date.now().toString(), name, completed: false };
}

//
// Helper functions
function save(KEY, data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

function clearElement(element) {
  while (element.firstChild) element.removeChild(element.firstChild);
}

function addClasses(element, classes) {
  if (typeof classes === "string") {
    element.classList.add(...classes.split(" "));
  }
  if (Array.isArray(classes)) {
    element.classList.add(...classes);
  }
}

saveAndRender();
