document.addEventListener('DOMContentLoaded', function () {
  const taskForm = document.getElementById('task-form');
  const taskList = document.getElementById('task-list');
  const rankingList = document.getElementById('ranking-list');

  loadTasks();
  loadRanking();

  taskForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const taskInput = document.getElementById('task');
    const assignedToSelect = document.getElementById('assignedTo');

    const task = taskInput.value.trim();
    const assignedTo = assignedToSelect.value;

    if (!task || !assignedTo) {
      alert('Preencha todos os campos.');
      return;
    }

    const newTask = { task, assignedTo };

    fetch('http://localhost:3000/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTask)
    })
      .then(response => response.json())
      .then(task => {
        addTaskToList(task);
        taskInput.value = '';
        assignedToSelect.selectedIndex = 0;
      })
      .catch(error => {
        console.error('Erro ao adicionar tarefa:', error);
      });
  });


  function loadTasks() {
    fetch('http://localhost:3000/tasks')
      .then(response => response.json())
      .then(tasks => {
        tasks.forEach(task => addTaskToList(task));
      })
      .catch(error => {
        console.error('Erro ao carregar tarefas:', error);
      });
  }

  function addTaskToList(task) {
    const li = document.createElement('li');
    li.className = 'collection-item';
    li.innerHTML = `
      ${task.task} - <span class="new badge" data-badge-caption="${task.assignedTo}"></span>
      <button class="btn-small waves-effect waves-light right">
        Concluir <i class="material-icons right">done</i>
      </button>
    `;
    taskList.appendChild(li);

  
    li.querySelector('button').addEventListener('click', () => completeTask(task.id, task.assignedTo, li));
  }

  function completeTask(taskId, assignedTo, taskElement) {
    fetch(`http://localhost:3000/tasks/${taskId}`, { method: 'DELETE' })
      .then(() => {
        taskElement.remove();
        updatePoints(assignedTo, 10);
      })
      .catch(error => {
        console.error('Erro ao concluir tarefa:', error);
      });
  }


  function loadRanking() {
    fetch('http://localhost:3000/members')
      .then(response => response.json())
      .then(members => {
        members.forEach(member => addMemberToRanking(member));
      })
      .catch(error => {
        console.error('Erro ao carregar ranking:', error);
      });
  }


  function addMemberToRanking(member) {
    const li = document.createElement('li');
    li.className = 'collection-item';
    li.innerHTML = `<span class="badge">${member.points} Pontos</span> ${member.name}`;
    rankingList.appendChild(li);
  }

  function updatePoints(memberName, pointsToAdd) {
    fetch('http://localhost:3000/members')
      .then(response => response.json())
      .then(members => {
        const member = members.find(m => m.name === memberName);
        if (member) {
          const updatedPoints = member.points + pointsToAdd;

          fetch(`http://localhost:3000/members/${member.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ points: updatedPoints })
          })
            .then(() => {

              rankingList.innerHTML = '';
              loadRanking();
            })
            .catch(error => {
              console.error('Erro ao atualizar pontos:', error);
            });
        }
      })
      .catch(error => {
        console.error('Erro ao buscar membros:', error);
      });
  }
});
