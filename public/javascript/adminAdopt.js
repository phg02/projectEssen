let reportBtns = document.querySelectorAll('.dropdown button');
let reports = document.querySelectorAll('.report');
let body = document.querySelector('body');

reportBtns.forEach(function(btn, index) {
  btn.addEventListener('click', function(event) {
    event.stopPropagation();
    reports[index].classList.toggle('hidden');
  });
});

body.addEventListener('click', function(event) {
  reports.forEach(function(report) {
    if (!report.contains(event.target)) {
      report.classList.add('hidden');
    }
  });
});

const openModalButtons = document.querySelectorAll('[data-modal-target]')
const closeModalButtons = document.querySelectorAll('[data-close-button]')
const cancelButton = document.querySelectorAll('.cancelBtn')
const overlay = document.getElementById('overlay')

openModalButtons.forEach(button => {
  button.addEventListener('click', () => {
    const modal = document.querySelector(button.dataset.modalTarget)
    openModal(modal)
  })
})

overlay.addEventListener('click', () => {
  const modals = document.querySelectorAll('.modal.active')
  modals.forEach(modal => {
    closeModal(modal)
  })
})

closeModalButtons.forEach(button => {
  button.addEventListener('click', () => {
    const modal = button.closest('.modal')
    closeModal(modal)
  })
})

cancelButton.forEach(button => {
  button.addEventListener('click', () => {
    const modal = button.closest('.modal')
    closeModal(modal)
  })
})

function openModal(modal) {
  if (modal == null) return
  modal.classList.add('active')
  overlay.classList.add('active')
  document.body.classList.add('modal-open');
}

function closeModal(modal) {
  if (modal == null) return
  modal.classList.remove('active')
  overlay.classList.remove('active')
  document.body.classList.remove('modal-open');
}