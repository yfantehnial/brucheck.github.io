let currentAudit = { car: "", tier: "", tab: "general", results: {} };

const auditItems = {
    "general": ["OBD-II Scan", "Chassis Check", "Tire Depth"],
    "engine": ["Oil Levels", "Battery Health", "Coolant Flow"],
    "interior": ["AC Check", "Dashboard Info", "Safety Belts"]
};

function nav(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    
    // Hide bottom bar only during active inspection
    document.getElementById('bottom-bar').style.display = (id === 'page-inspect') ? 'none' : 'flex';
}

function openJob(car, tier) {
    currentAudit = { car, tier, tab: "general", results: {} };
    document.getElementById('inspect-car-title').innerText = car;
    nav('page-inspect');
    switchTab('general');
}

function switchTab(t) {
    currentAudit.tab = t;
    document.querySelectorAll('.m-tab').forEach(btn => btn.classList.remove('active'));
    document.getElementById('tab-' + t).classList.add('active');
    
    const container = document.getElementById('checklist-scroll');
    container.innerHTML = "";
    
    auditItems[t].forEach((item, i) => {
        const key = t + i;
        const status = currentAudit.results[key] || "";
        container.innerHTML += `
            <div class="job-card" style="margin: 0 0 12px 0;">
                <div style="flex:1"><strong>${item}</strong></div>
                <div style="display:flex; gap:10px;">
                    <button class="status-dot ${status==='PASS'?'active-green':''}" onclick="mark('${key}','PASS')">PASS</button>
                    <button class="status-dot ${status==='FAIL'?'active-red':''}" onclick="mark('${key}','FAIL')">FAIL</button>
                </div>
            </div>
        `;
    });
}

function mark(key, val) {
    currentAudit.results[key] = val;
    switchTab(currentAudit.tab);
}

function submitAudit() {
    alert("Audit for " + currentAudit.car + " submitted successfully!");
    nav('page-dash');
}
