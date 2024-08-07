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

function clickFn(event) {
	const checkbox = event.currentTarget;
	checkbox.value = checkbox.checked ? 'dark' : 'light';
	event.currentTarget.closest('form').submit()
}

document.querySelectorAll(".drop-zone__input").forEach((inputElement) => {
	const dropZoneElement = inputElement.closest(".drop-zone");

	dropZoneElement.addEventListener("click", (e) => {
		inputElement.click();
	});

	inputElement.addEventListener("change", (e) => {
		if (inputElement.files.length) {
			updateThumbnail(dropZoneElement, inputElement.files[0]);
		}
	});

	dropZoneElement.addEventListener("dragover", (e) => {
		e.preventDefault();
		dropZoneElement.classList.add("drop-zone--over");
	});

	["dragleave", "dragend"].forEach((type) => {
		dropZoneElement.addEventListener(type, (e) => {
			dropZoneElement.classList.remove("drop-zone--over");
		});
	});

	dropZoneElement.addEventListener("drop", (e) => {
		e.preventDefault();

		if (e.dataTransfer.files.length) {
			inputElement.files = e.dataTransfer.files;
			updateThumbnail(dropZoneElement, e.dataTransfer.files[0]);
		}

		dropZoneElement.classList.remove("drop-zone--over");
	});
});

/**
 * Updates the thumbnail on a drop zone element.
 *
 * @param {HTMLElement} dropZoneElement
 * @param {File} file
 */
function updateThumbnail(dropZoneElement, file) {
	let thumbnailElement = dropZoneElement.querySelector(".drop-zone__thumb");

	// First time - remove the prompt
	if (dropZoneElement.querySelector(".drop-zone__prompt")) {
		dropZoneElement.querySelector(".drop-zone__prompt").remove();
	}

	// First time - there is no thumbnail element, so lets create it
	if (!thumbnailElement) {
		thumbnailElement = document.createElement("div");
		thumbnailElement.classList.add("drop-zone__thumb");
		dropZoneElement.appendChild(thumbnailElement);
	}

	thumbnailElement.dataset.label = file.name;

	// Show thumbnail for image files
	if (file.type.startsWith("image/")) {
		const reader = new FileReader();

		reader.readAsDataURL(file);
		reader.onload = () => {
			thumbnailElement.style.backgroundImage = `url('${reader.result}')`;
		};
	} else {
		thumbnailElement.style.backgroundImage = null;
	}
}

document.addEventListener('DOMContentLoaded', function() {
    var passwordContainers = document.querySelectorAll('.password-container');

    passwordContainers.forEach(function(container) {
        var eyeIcon = container.querySelector('.fa-eye-slash');
        var passwordInput = container.querySelector('input[type="password"]');

        eyeIcon.addEventListener('click', function() {
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                eyeIcon.classList.remove('fa-eye-slash');
                eyeIcon.classList.add('fa-eye');
            } else {
                passwordInput.type = 'password';
                eyeIcon.classList.remove('fa-eye');
                eyeIcon.classList.add('fa-eye-slash');
            }
        });
    });
});

// const usernameForm = document.querySelector('#usernameChange');
// usernameForm.addEventListener('submit', function(e) {
// 	e.preventDefault();
// 	e.stopPropagation();

// 	//document
// 	const username = document.querySelector('#username');

// 	//remove error
// 	username.classList.remove('error-input');

// 	let error = false;
// 	let errors= '';

// 	if (username.value === '' || username.value === null) {
//         error = true;
//         username.classList.add('error-input');
//         username.focus();
//         errors += '<li>Username is required.</li>';
//     }

// 	if (error == true) {
// 		document.querySelector('#usernameError').innerHTML = errors;
// 		return;
// 	} else {
// 		document.querySelector('#usernameError').innerHTML = '';
// 	}

// 	usernameForm.submit();
// });

const oldPassword = document.querySelector('#oldPassword');
oldPassword.addEventListener('focusout', function(e) {

	oldPassword.classList.remove('error-input');

	let error = false;
	let errorList = '';

	if (oldPassword.value === '' || oldPassword.value == null) {
        error = true;
        oldPassword.classList.add('error-input');
        errorList += '<li>Please enter a password.</li>';
    }

	let errors = "<ul class='error-list'>" + errorList + "</ul>";
	if (error == true) {
		document.querySelector('#oldPasswordError').innerHTML = errors;
	} else {
		document.querySelector('#oldPasswordError').innerHTML = '';
	}
});

const newPassword = document.querySelector('#newPassword');
newPassword.addEventListener('focusout', function() {

	newPassword.classList.remove('error-input');

	//regex
	const lowerCaseLetters = /[a-z]/;
    const upperCaseLetters = /[A-Z]/;
    const numbers = /[0-9]/;
    const specialCharacters = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;

	let error = false;
	let errorList = '';

	if (newPassword.value.length < 8) {
        error = true;
        newPassword.classList.add('error-input');
        errorList += '<li>Password must be at least 8 characters.</li>';
    }

    if (!lowerCaseLetters.test(newPassword.value)) {
        error = true;
        newPassword.classList.add('error-input');
        errorList += '<li>Password must contain at least one lowercase letter.</li>';
    }

    if (!upperCaseLetters.test(newPassword.value)) {
        error = true;
        newPassword.classList.add('error-input');
        errorList += '<li>Password must contain at least one uppercase letter.</li>';
    }

    if (!numbers.test(newPassword.value)) {
        error = true;
        newPassword.classList.add('error-input');
        errorList += '<li>Password must contain at least one number.</li>';
    }

    if (!specialCharacters.test(newPassword.value)) {
        error = true;
        newPassword.classList.add('error-input');
        errorList += '<li>Password must contain at least one special character.</li>';
    }

	let errors = "<ul class='error-list'>" + errorList + "</ul>";
	if (error == true) {
		document.querySelector('#newPasswordError').innerHTML = errors;
	} else {
		document.querySelector('#newPasswordError').innerHTML = '';
	}
});

const confirmPassword = document.querySelector('#confirmPassword');
confirmPassword.addEventListener('focusout', function() {

	confirmPassword.classList.remove('error-input');

	let error = false;
	let errorList = '';

	if (newPassword.value !== confirmPassword.value) {
		error = true;
		confirmPassword.classList.add('error-input');
		errorList += '<li>Password does not match.</li>';
	}

	let errors = "<ul class='error-list'>" + errorList + "</ul>";
	if (error == true) {
		document.querySelector('#confirmPasswordError').innerHTML = errors;
	} else {
		document.querySelector('#confirmPasswordError').innerHTML = '';
	}
});

const passwordForm = document.querySelector('#passwordChange');
passwordForm.addEventListener('submit', function(e) {
	e.preventDefault();
	e.stopPropagation();
	
	//document
	const oldPassword = document.querySelector('#oldPassword');
	const newPassword = document.querySelector('#newPassword');
	const confirmPassword = document.querySelector('#confirmPassword');

	//regex
	const lowerCaseLetters = /[a-z]/;
    const upperCaseLetters = /[A-Z]/;
    const numbers = /[0-9]/;
    const specialCharacters = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;

	let oldPasswordError = false;
	let newPasswordError = false;
	let confirmPasswordError = false;
	
	let oldPasswordErrorList = '';
	let newPasswordErrorList = '';
	let confirmPasswordErrorList = '';

	if (oldPassword.value === '' || oldPassword.value == null) {
        oldPasswordError = true;
        oldPassword.classList.add('error-input');
        oldPasswordErrorList += '<li>Please enter a password.</li>';
    }

	if (newPassword.value.length < 8) {
        newPasswordError = true;
        newPassword.classList.add('error-input');
        newPasswordErrorList += '<li>Password must be at least 8 characters.</li>';
    }

    if (!lowerCaseLetters.test(newPassword.value)) {
        newPasswordError = true;
        newPassword.classList.add('error-input');
        newPasswordErrorList += '<li>Password must contain at least one lowercase letter.</li>';
    }

    if (!upperCaseLetters.test(newPassword.value)) {
        newPasswordError = true;
        newPassword.classList.add('error-input');
        newPasswordErrorList += '<li>Password must contain at least one uppercase letter.</li>';
    }

    if (!numbers.test(newPassword.value)) {
        newPasswordError = true;
        newPassword.classList.add('error-input');
        newPasswordErrorList += '<li>Password must contain at least one number.</li>';
    }

    if (!specialCharacters.test(newPassword.value)) {
        newPasswordError = true;
        newPassword.classList.add('error-input');
        newPasswordErrorList += '<li>Password must contain at least one special character.</li>';
    }

	if (newPassword.value !== confirmPassword.value) {
		confirmPasswordError = true;
		confirmPassword.classList.add('error-input');
		confirmPasswordErrorList += '<li>Password does not match.</li>';
	}

	let oldPasswordErrors = "<ul class='error-list'>" + oldPasswordErrorList + "</ul>";
	let newPasswordErrors = "<ul class='error-list'>" + newPasswordErrorList + "</ul>";
	let confirmPasswordErrors = "<ul class='error-list'>" + confirmPasswordErrorList + "</ul>";
	
	if (oldPasswordError == true) {
		if (document.querySelector('#oldPasswordError').innerHTML === '') {
			document.querySelector('#oldPasswordError').innerHTML = oldPasswordErrors;
		}
		return;
	} else {
		document.querySelector('#oldPasswordError').innerHTML = '';
	}
	
	if (newPasswordError == true) {
		if (document.querySelector('#newPasswordError').innerHTML === '') {
			document.querySelector('#newPasswordError').innerHTML = newPasswordErrors;
		}
		return;
	} else {
		document.querySelector('#newPasswordError').innerHTML = '';
	}
	
	if (confirmPasswordError == true) {
		if (document.querySelector('#confirmPasswordError').innerHTML === '') {
			document.querySelector('#confirmPasswordError').innerHTML = confirmPasswordErrors;
		}
		return;
	} else {
		document.querySelector('#confirmPasswordError').innerHTML = '';
	}
	
	passwordForm.submit();
});