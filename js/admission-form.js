// Admission form handling

document.addEventListener('DOMContentLoaded', () => {
  initAdmissionForm();
  initModalClose();
});

function initModalClose() {
  const modal = document.getElementById('admission-modal');
  const closeBtn = document.getElementById('modal-close');
  if (!modal) return;

  closeBtn?.addEventListener('click', () => window.TwinkleStars.closeAdmissionModal());

  modal.addEventListener('click', (e) => {
    if (e.target === modal) window.TwinkleStars.closeAdmissionModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      window.TwinkleStars.closeAdmissionModal();
    }
  });
}

function initAdmissionForm() {
  const form = document.getElementById('admission-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearFormErrors(form);

    const formData = {
      child_name: form.child_name.value.trim(),
      age: form.age.value.trim(),
      program: form.program.value,
      parent_name: form.parent_name.value.trim(),
      phone: form.phone.value.trim(),
      email: form.email.value.trim(),
      start_date: form.start_date.value || null,
      message: form.message.value.trim()
    };

    const errors = validateAdmissionForm(formData);
    if (errors.length > 0) {
      errors.forEach(({ field, message }) => showFieldError(form, field, message));
      return;
    }

    const submitBtn = form.querySelector('[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    try {
      await API.post('/admissions', formData);
      window.TwinkleStars.showToast('Application submitted! We will contact you soon. 🌟', 'success');
      form.reset();
      window.TwinkleStars.closeAdmissionModal();
    } catch (err) {
      window.TwinkleStars.showToast(err.message || 'Failed to submit. Please try again.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
}

function validateAdmissionForm(data) {
  const errors = [];

  if (!data.child_name || data.child_name.length < 2) {
    errors.push({ field: 'child_name', message: 'Please enter child\'s name (min 2 characters)' });
  }
  if (!data.age) {
    errors.push({ field: 'age', message: 'Please enter age' });
  }
  if (!data.program) {
    errors.push({ field: 'program', message: 'Please select a program' });
  }
  if (!data.parent_name || data.parent_name.length < 2) {
    errors.push({ field: 'parent_name', message: 'Please enter parent/guardian name' });
  }
  if (!data.phone || !/^[\d\s+\-()]{10,}$/.test(data.phone)) {
    errors.push({ field: 'phone', message: 'Please enter a valid phone number' });
  }
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email' });
  }

  return errors;
}

function showFieldError(form, fieldName, message) {
  const field = form[fieldName];
  if (!field) return;
  field.classList.add('error');
  const existing = field.parentElement.querySelector('.form-error');
  if (existing) existing.remove();
  const errorEl = document.createElement('div');
  errorEl.className = 'form-error';
  errorEl.textContent = message;
  field.parentElement.appendChild(errorEl);
}

function clearFormErrors(form) {
  form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
  form.querySelectorAll('.form-error').forEach(el => el.remove());
}
