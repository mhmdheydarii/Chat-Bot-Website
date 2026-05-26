// Toggle password visibility
function togglePw(inputId, btn) {
    const input = document.getElementById(inputId);
    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';
    btn.querySelector('svg').innerHTML = isHidden
        ? `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
         <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
         <line x1="1" y1="1" x2="23" y2="23"/>`
        : `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
}

// Password strength
function checkStrength(val) {
    const fill = document.getElementById('strengthFill');
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;

    const map = [
        { w: '0%', bg: 'transparent' },
        { w: '25%', bg: '#f87171' },
        { w: '50%', bg: '#fb923c' },
        { w: '75%', bg: '#facc15' },
        { w: '100%', bg: '#6ee7b7' },
    ];
    fill.style.width = map[score].w;
    fill.style.background = map[score].bg;
}

// Highlight mismatched password on blur
document.getElementById('id_password2').addEventListener('blur', function () {
    const p1 = document.getElementById('id_password1').value;
    const p2 = this.value;
    if (p2 && p1 !== p2) {
        this.classList.add('has-error');
    } else {
        this.classList.remove('has-error');
    }
});