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

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.see-more-btn').forEach(function(button) {
        let postContent = button.parentElement.querySelector('.post-title');
      
        if (postContent.scrollWidth > postContent.clientWidth) {
            button.style.display = 'block';
        } 
        else {
            button.style.display = 'none';
        }
      
        button.addEventListener('click', function() {
            let clickedPostContent = this.parentElement.querySelector('.post-title');
            clickedPostContent.classList.toggle('expanded');

            if (clickedPostContent.classList.contains('expanded')) {
                button.textContent = 'See less';
            } 
            else {
                button.textContent = 'See more';
            }
        });
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

let commentBtn = document.querySelector('#comment-btn');

commentBtn.addEventListener('click', submitComment);
document.querySelector('.comment-input').addEventListener('keypress', function(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    submitComment();
  }
});

function autoSubmit() {
  document.querySelector("#searchform").submit();
}