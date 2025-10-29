document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('signupForm');
    const interestsContainer = document.getElementById('interestsContainer');
    const submitBtn = document.getElementById('submitBtn');
    const resetBtn = document.getElementById('resetBtn');
    const successMessage = document.getElementById('successMessage');
    const passwordInput = document.getElementById('password');
    const strengthBar = document.querySelector('.password-strength-bar');
    const strengthText = document.getElementById('passwordStrength');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const termsCheckbox = document.getElementById('terms');

    let selectedInterests = new Set();
    let debounceTimer;
    let isResetting = false;
    const debounceTimeout = 500;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

    // ---------------- 重設功能 ----------------
    function resetForm() {
        isResetting = true;
        clearTimeout(debounceTimer);

        form.reset();

        // 清空錯誤訊息
        document.querySelectorAll('.error-message').forEach(e => e.textContent = '');

        // 清空自訂驗證
        form.querySelectorAll('input').forEach(i => i.setCustomValidity(''));

        // 清空密碼強度
        if (strengthBar) strengthBar.className = 'password-strength-bar';
        if (strengthText) strengthText.textContent = '';

        // 清空興趣
        document.querySelectorAll('.interest-tag').forEach(tag => tag.classList.remove('selected'));
        selectedInterests.clear();

        // 清除暫存資料
        localStorage.removeItem('signupFormData');

        setTimeout(() => { isResetting = false; }, 50);
    }

    resetBtn.addEventListener('click', e => {
        e.preventDefault();
        if (confirm('確定要重設所有欄位嗎？')) {
            resetForm();
        }
    });

    // ---------------- 自動暫存 ----------------
    function saveFormData() {
        if (isResetting) return;
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            interests: Array.from(selectedInterests),
            terms: termsCheckbox.checked
        };
        localStorage.setItem('signupFormData', JSON.stringify(formData));
    }

    function restoreFormData() {
        const savedData = localStorage.getItem('signupFormData');
        if (savedData) {
            const data = JSON.parse(savedData);
            document.getElementById('name').value = data.name || '';
            document.getElementById('email').value = data.email || '';
            document.getElementById('phone').value = data.phone || '';

            if (data.interests) {
                data.interests.forEach(interest => {
                    const tag = interestsContainer.querySelector(`[data-interest="${interest}"]`);
                    if (tag) {
                        tag.classList.add('selected');
                        selectedInterests.add(interest);
                    }
                });
            }

            termsCheckbox.checked = data.terms || false;
        }
    }

    function debounce(func) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(func, debounceTimeout);
    }

    form.querySelectorAll('input').forEach(input => {
        if (input.type !== 'checkbox') {
            input.addEventListener('input', () => debounce(saveFormData));
        } else {
            input.addEventListener('change', saveFormData);
        }
    });

    restoreFormData();

    // ---------------- 錯誤訊息處理 ----------------
    function setCustomError(el, errorId, msg) {
        el.setCustomValidity(msg);
        document.getElementById(errorId).textContent = msg;
    }

    function clearError(el, errorId) {
        el.setCustomValidity('');
        document.getElementById(errorId).textContent = '';
    }

    // 姓名
    const nameInput = document.getElementById('name');
    nameInput.addEventListener('blur', () => {
        if (!nameInput.value.trim()) setCustomError(nameInput, 'nameError', '請輸入姓名');
        else clearError(nameInput, 'nameError');
    });
    nameInput.addEventListener('input', () => {
        if (nameInput.value.trim()) clearError(nameInput, 'nameError');
    });

    // Email
    const emailInput = document.getElementById('email');
    emailInput.addEventListener('blur', () => {
        if (!emailInput.value) setCustomError(emailInput, 'emailError', '請輸入Email');
        else if (!emailInput.validity.valid) setCustomError(emailInput, 'emailError', '請輸入有效的Email格式');
        else clearError(emailInput, 'emailError');
    });
    emailInput.addEventListener('input', () => {
        if (emailInput.validity.valid) clearError(emailInput, 'emailError');
    });

    // 手機
    const phoneInput = document.getElementById('phone');
    phoneInput.addEventListener('blur', () => {
        if (!phoneInput.value) setCustomError(phoneInput, 'phoneError', '請輸入手機號碼');
        else if (!/^\d{10}$/.test(phoneInput.value)) setCustomError(phoneInput, 'phoneError', '請輸入10碼數字');
        else clearError(phoneInput, 'phoneError');
    });
    phoneInput.addEventListener('input', () => {
        if (/^\d{10}$/.test(phoneInput.value)) clearError(phoneInput, 'phoneError');
    });

    // ---------------- 密碼強度 ----------------
    function checkPasswordStrength(password) {
        if (!password) return { score: 0, text: '' };
        let score = 0;
        const checks = {
            length: password.length >= 8,
            hasLower: /[a-z]/.test(password),
            hasUpper: /[A-Z]/.test(password),
            hasNumber: /\d/.test(password),
            hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };
        score += checks.length ? 1 : 0;
        score += (checks.hasLower && checks.hasUpper) ? 1 : 0;
        score += checks.hasNumber ? 1 : 0;
        score += checks.hasSpecial ? 1 : 0;

        const strength = {
            0: { class: '', text: '' },
            1: { class: 'weak', text: '弱' },
            2: { class: 'medium', text: '中' },
            3: { class: 'medium', text: '中' },
            4: { class: 'strong', text: '強' }
        };
        return strength[score];
    }

    function updatePasswordStrength() {
        const strength = checkPasswordStrength(passwordInput.value);
        strengthBar.className = 'password-strength-bar ' + strength.class;
        strengthText.textContent = strength.text ? `密碼強度：${strength.text}` : '';
    }

    passwordInput.addEventListener('blur', () => {
        if (!passwordInput.value) setCustomError(passwordInput, 'passwordError', '請輸入密碼');
        else if (!passwordRegex.test(passwordInput.value)) setCustomError(passwordInput, 'passwordError', '密碼需至少8碼，且包含英文和數字');
        else clearError(passwordInput, 'passwordError');
        validateConfirmPassword();
    });

    passwordInput.addEventListener('input', () => {
        updatePasswordStrength();
        validateConfirmPassword();
    });

    // 確認密碼
    function validateConfirmPassword() {
        if (!confirmPasswordInput.value) setCustomError(confirmPasswordInput, 'confirmPasswordError', '請再次輸入密碼');
        else if (confirmPasswordInput.value !== passwordInput.value) setCustomError(confirmPasswordInput, 'confirmPasswordError', '密碼不一致');
        else clearError(confirmPasswordInput, 'confirmPasswordError');
    }
    confirmPasswordInput.addEventListener('blur', validateConfirmPassword);
    confirmPasswordInput.addEventListener('input', validateConfirmPassword);

    // ---------------- 興趣選擇 ----------------
    interestsContainer.addEventListener('click', e => {
        const tag = e.target;
        if (tag.classList.contains('interest-tag')) {
            tag.classList.toggle('selected');
            const interest = tag.dataset.interest;
            if (tag.classList.contains('selected')) selectedInterests.add(interest);
            else selectedInterests.delete(interest);

            if (selectedInterests.size === 0) setCustomError(interestsContainer, 'interestsError', '請至少選擇一個興趣');
            else clearError(interestsContainer, 'interestsError');
        }
    });

    // ---------------- 同意條款 ----------------
    termsCheckbox.addEventListener('change', () => {
        if (!termsCheckbox.checked) setCustomError(termsCheckbox, 'termsError', '請同意服務條款');
        else clearError(termsCheckbox, 'termsError');
    });

    // ===== 第七功能：同意條款確認對話框 =====
    termsCheckbox.addEventListener('mousedown', (event) => {
        if (!termsCheckbox.checked) {
            event.preventDefault();
            const confirmAgree = confirm('請確認您已閱讀並同意服務條款，是否確定？');
            if (confirmAgree) {
                termsCheckbox.checked = true;
                const changeEvent = new Event('change', { bubbles: true });
                termsCheckbox.dispatchEvent(changeEvent);
            }
        } else {
            event.preventDefault();
            termsCheckbox.checked = false;
            const changeEvent = new Event('change', { bubbles: true });
            termsCheckbox.dispatchEvent(changeEvent);
        }
    });

    termsCheckbox.addEventListener('keydown', (event) => {
        if (event.key === ' ' || event.key === 'Enter') {
            event.preventDefault();
            if (!termsCheckbox.checked) {
                const confirmAgree = confirm('請確認您已閱讀並同意服務條款，是否確定？');
                if (confirmAgree) {
                    termsCheckbox.checked = true;
                    const changeEvent = new Event('change', { bubbles: true });
                    termsCheckbox.dispatchEvent(changeEvent);
                }
            } else {
                termsCheckbox.checked = false;
                const changeEvent = new Event('change', { bubbles: true });
                termsCheckbox.dispatchEvent(changeEvent);
            }
        }
    });

    // ---------------- 表單送出 ----------------
    form.addEventListener('submit', async e => {
        e.preventDefault();

        if (selectedInterests.size === 0) {
            setCustomError(interestsContainer, 'interestsError', '請至少選擇一個興趣');
            return;
        }

        if (!termsCheckbox.checked) {
            setCustomError(termsCheckbox, 'termsError', '請同意服務條款');
            return;
        }

        const inputs = form.querySelectorAll('input');
        let firstInvalid = null;
        inputs.forEach(input => {
            if (!input.validity.valid && !firstInvalid) firstInvalid = input;
        });
        if (firstInvalid) {
            firstInvalid.focus();
            return;
        }
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');

        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            form.style.display = 'none';
            successMessage.classList.remove('hidden');
            // 提交成功後清除暫存資料
            clearSavedData();
        } catch (error) {
            console.error('提交失敗:', error);
            alert('提交失敗，請稍後再試');
        } finally {
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
        }
    });

    function clearSavedData() {
        localStorage.removeItem('signupFormData');
    }
});