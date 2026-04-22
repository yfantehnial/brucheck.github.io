const CHECKS = [
    { id: 'eng', label: 'Engine Integrity', critical: true },
    { id: 'trans', label: 'Transmission System', critical: true },
    { id: 'cool', label: 'Cooling Efficiency', critical: false },
    { id: 'brake', label: 'Braking Force', critical: true },
    { id: 'susp', label: 'Suspension Setup', critical: false },
    { id: 'elec', label: 'Electronics/OBD', critical: false }
];

let db = JSON.parse(localStorage.getItem('bru_data')) || {
    model: "", vin: "", notes: "", inspector: "", results: {}
};

function enterApp(role) {
    document.getElementById('gate').classList.add('hidden');
    if (role === 'mechanic') {
        document.getElementById('mechanic-view').classList.remove('hidden');
        initMechanic();
    } else {
        document.getElementById('user-view').classList.remove('hidden');
        renderUser();
    }
}

function exit() { location.reload(); }

// MECHANIC HUB
function initMechanic() {
    const list = document.getElementById('m-checklist');
    list.innerHTML = CHECKS.map(item => `
        <label class="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-blue-500 transition cursor-pointer">
            <span class="text-sm font-bold text-slate-400">${item.label}</span>
            <input type="checkbox" class="w-6 h-6 accent-blue-500" 
                ${db.results[item.id] ? 'checked' : ''} 
                onchange="db.results['${item.id}'] = this.checked; updateScore();">
        </label>
    `).join('');
    
    document.getElementById('m-model').value = db.model;
    document.getElementById('m-vin').value = db.vin;
    document.getElementById('m-notes').value = db.notes;
    document.getElementById('m-name').value = db.inspector;
    updateScore();
}

function updateScore() {
    const passed = Object.values(db.results).filter(v => v).length;
    const score = Math.round((passed / CHECKS.length) * 100);
    
    // Determine Color based on Score
    let color = '#3b82f6'; // Default Blue
    if (score < 50) color = '#ef4444'; // Red for low health
    else if (score < 80) color = '#f59e0b'; // Amber for warning
    
    const scoreText = document.getElementById('m-score');
    const ring = document.getElementById('m-ring');
    
    scoreText.innerText = score + "%";
    scoreText.style.color = color;
    ring.style.stroke = color;
    ring.style.strokeDashoffset = 502 - (502 * score) / 100;
}

function publishReport() {
    db.model = document.getElementById('m-model').value;
    db.vin = document.getElementById('m-vin').value;
    db.notes = document.getElementById('m-notes').value;
    db.inspector = document.getElementById('m-name').value;
    localStorage.setItem('bru_data', JSON.stringify(db));
    alert("🚀 Data Sync Successful!");
}

// USER PORTAL
function renderUser() {
    const passed = Object.values(db.results).filter(v => v).length;
    const score = Math.round((passed / CHECKS.length) * 100);
    const criticalFails = CHECKS.filter(item => !db.results[item.id] && item.critical);
    
    // Determine Color
    let color = '#3b82f6';
    if (score < 50) color = '#ef4444';
    else if (score < 80) color = '#f59e0b';

    document.getElementById('u-model').innerText = db.model || "Unnamed Vehicle";
    document.getElementById('u-vin').innerText = `Verification: ${db.vin || 'N/A'}`;
    
    const percentText = document.getElementById('u-percent');
    percentText.innerText = score + "%";
    percentText.style.color = color;
    
    const ring = document.getElementById('u-ring');
    ring.style.stroke = color;
    ring.style.strokeDashoffset = 490 - (490 * score) / 100;

    const notesBox = document.getElementById('u-notes');
    if (criticalFails.length > 0) {
        notesBox.innerHTML = `<span class="text-red-200 font-black uppercase text-xs">Urgent Security Alert:</span><br> This vehicle has ${criticalFails.length} critical safety failures.`;
    } else {
        notesBox.innerText = db.notes || "Vehicle is operationally sound and meets all verification standards.";
    }

    const list = document.getElementById('u-list');
    list.innerHTML = CHECKS.map(item => {
        const ok = db.results[item.id];
        return `
            <div class="bg-white p-6 rounded-[2.2rem] border border-slate-100 flex items-center gap-4 ${!ok && item.critical ? 'ring-2 ring-red-100' : ''}">
                <div class="w-12 h-12 rounded-2xl flex items-center justify-center ${ok ? 'bg-blue-50 text-blue-500' : 'bg-red-50 text-red-400'}">
                    <i class="fa-solid ${ok ? 'fa-check' : 'fa-triangle-exclamation'}"></i>
                </div>
                <div>
                    <p class="font-black text-slate-800 text-sm tracking-tight">${item.label}</p>
                    <p class="text-[9px] uppercase font-bold tracking-widest ${ok ? 'text-blue-400' : 'text-red-300'}">
                        ${ok ? 'Condition: Optimal' : (item.critical ? 'CRITICAL FAILURE' : 'Service Due')}
                    </p>
                </div>
            </div>`;
    }).join('');

    buildPrintReport(score);
}

function buildPrintReport(score) {
    const area = document.getElementById('print-area');
    const date = new Date().toLocaleDateString('en-BN', { year:'numeric', month:'long', day:'numeric'});
    
    let color = score < 50 ? '#ef4444' : (score < 80 ? '#f59e0b' : '#3b82f6');

    area.innerHTML = `
        <div style="padding: 50px; font-family: 'Plus Jakarta Sans', sans-serif;">
            <h1 style="font-size: 26px; font-weight: 900; margin-bottom: 5px;">BRUCHECK OFFICIAL REPORT</h1>
            <p style="font-size: 10px; color: #666; margin-bottom: 40px;">REF: ${db.vin} | ISSUED: ${date}</p>
            <div style="display: flex; gap: 40px; margin-bottom: 40px;">
                <div><p style="font-size: 10px; font-weight: 800; color: #94a3b8;">MODEL</p><p style="font-size: 18px; font-weight: 900;">${db.model}</p></div>
                <div><p style="font-size: 10px; font-weight: 800; color: ${color};">HEALTH SCORE</p><p style="font-size: 18px; font-weight: 900; color: ${color};">${score}%</p></div>
            </div>
            <div style="border-top: 1px solid #eee; padding-top: 20px;">
                <h3 style="font-size: 12px; font-weight: 800; margin-bottom: 15px;">TECHNICAL STATUS</h3>
                ${CHECKS.map(i => `<div style="display: flex; font-size: 12px; margin-bottom: 8px;">
                    <span>${i.label}</span><span style="margin-left: auto; font-weight: 800; color: ${db.results[i.id] ? '#3b82f6' : '#ef4444'}">${db.results[i.id] ? 'PASS' : 'FAIL'}</span>
                </div>`).join('')}
            </div>
            <div style="margin-top: 50px; padding: 20px; background: #f8fafc; border-radius: 12px; border-left: 4px solid ${color};">
                <p style="font-size: 10px; font-weight: 800; color: ${color};">REMARKS</p>
                <p style="font-size: 12px; font-style: italic;">${db.notes || 'N/A'}</p>
            </div>
        </div>`;
}
