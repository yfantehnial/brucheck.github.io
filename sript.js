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
    document.getElementById('m-score').innerText = score + "%";
    document.getElementById('m-ring').style.strokeDashoffset = 502 - (502 * score) / 100;
}

function publishReport() {
    db.model = document.getElementById('m-model').value;
    db.vin = document.getElementById('m-vin').value;
    db.notes = document.getElementById('m-notes').value;
    db.inspector = document.getElementById('m-name').value;
    localStorage.setItem('bru_data', JSON.stringify(db));
    alert("🚀 Data Sync Successful!");
}

// USER PORTAL & PDF
function renderUser() {
    const passed = Object.values(db.results).filter(v => v).length;
    const score = Math.round((passed / CHECKS.length) * 100);
    const criticalFails = CHECKS.filter(item => !db.results[item.id] && item.critical);
    
    document.getElementById('u-model').innerText = db.model || "Unnamed Vehicle";
    document.getElementById('u-vin').innerText = `Verification: ${db.vin || 'N/A'}`;
    document.getElementById('u-percent').innerText = score + "%";
    document.getElementById('u-ring').style.strokeDashoffset = 490 - (490 * score) / 100;

    const notesBox = document.getElementById('u-notes');
    if (criticalFails.length > 0) {
        notesBox.innerHTML = `<span class="text-red-200 font-black uppercase text-xs">Urgent Security Alert:</span><br> This vehicle has ${criticalFails.length} critical safety failures that require immediate repair.`;
    } else {
        notesBox.innerText = db.notes || "Vehicle is operationally sound and meets all verification standards.";
    }

    const list = document.getElementById('u-list');
    list.innerHTML = CHECKS.map(item => {
        const ok = db.results[item.id];
        const isCritical = !ok && item.critical;
        return `
            <div class="bg-white p-6 rounded-[2.2rem] border border-slate-100 flex items-center gap-4 ${isCritical ? 'ring-2 ring-red-100' : ''}">
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
    area.innerHTML = `
        <div style="padding: 50px; font-family: 'Plus Jakarta Sans', sans-serif;">
            <h1 style="font-size: 26px; font-weight: 900; margin-bottom: 5px;">BRUCHECK OFFICIAL REPORT</h1>
            <p style="font-size: 10px; color: #666; margin-bottom: 40px;">REF: ${db.vin} | ISSUED: ${date}</p>
            <div style="display: flex; gap: 40px; margin-bottom: 40px;">
                <div><p style="font-size: 10px; font-weight: 800; color: #3b82f6;">MODEL</p><p style="font-size: 18px; font-weight: 900;">${db.model}</p></div>
                <div><p style="font-size: 10px; font-weight: 800; color: #3b82f6;">SCORE</p><p style="font-size: 18px; font-weight: 900;">${score}%</p></div>
            </div>
            <div style="border-top: 1px solid #eee; padding-top: 20px;">
                <h3 style="font-size: 12px; font-weight: 800; margin-bottom: 15px;">TECHNICAL STATUS</h3>
                ${CHECKS.map(i => `<div style="display: flex; font-size: 12px; margin-bottom: 8px;">
                    <span>${i.label}</span><span style="margin-left: auto; font-weight: 800;">${db.results[i.id] ? 'PASS' : 'FAIL'}</span>
                </div>`).join('')}
            </div>
            <div style="margin-top: 50px; padding: 20px; background: #f8fafc; border-radius: 12px;">
                <p style="font-size: 10px; font-weight: 800;">REMARKS</p>
                <p style="font-size: 12px; font-style: italic;">${db.notes || 'N/A'}</p>
            </div>
            <div style="margin-top: 60px;">
                <p style="font-size: 10px; font-weight: 800;">INSPECTOR</p>
                <p style="font-size: 14px; font-weight: 900; border-bottom: 2px solid #000; display: inline-block;">${db.inspector || 'BruCheck Lead'}</p>
            </div>
        </div>`;
}
