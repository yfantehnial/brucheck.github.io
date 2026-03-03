// Global State
let currentAudit = { car: "", tier: "", currentTab: "general", results: {} };

// 1. NAVIGATION LOGIC (Makes the Bottom Bar work)
function nav(id) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    // Show selected page
    document.getElementById(id).classList.add('active');

    // Update Bottom Nav Highlighting
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    if(id === 'page-dash') document.getElementById('nav-home').classList.add('active');
    if(id === 'page-history') document.getElementById('nav-history').classList.add('active');
    if(id === 'page-settings') document.getElementById('nav-settings').classList.add('active');

    // Hide nav bar on Splash or Inspection screens to focus the user
    const isFullFrame = (id === 'page-splash' || id === 'page-report' || id === 'page-inspect');
    document.getElementById('main-nav').style.display = isFullFrame ? 'none' : 'flex';
}

// 2. INSPECTION LOGIC (Makes Engine/Interior tabs work)
const auditLibrary = {
    "general": ["OBD-II Fault Scan", "Chassis Integrity", "Exterior Paint Depth"],
    "engine": ["Oil Quality Test", "Battery Health", "Coolant Levels"],
    "interior": ["AC Temperature", "Dashboard Diagnostics", "Seatbelt Safety"]
};

function openJob(car, tier) {
    currentAudit = { car, tier, currentTab: "general", results: {} };
    document.getElementById('inspect-car-title').innerText = car;
    nav('page-inspect');
    switchTab('general');
}

function switchTab(tab) {
    currentAudit.currentTab = tab;
    document.querySelectorAll('.step-tab').forEach(t => t.classList.remove('active'));
    document.getElementById('tab-' + tab).classList.add('active');
    
    // Render the specific questions for that tab
    const list = document.getElementById('checklist-scroll');
    list.innerHTML = "";
    auditLibrary[tab].forEach((item, index) => {
        const key = tab + index;
        const status = currentAudit.results[key] || "";
        list.innerHTML += `
            <div class="audit-item">
                <strong>${item}</strong>
                <div class="btn-row">
                    <button class="audit-btn pass ${status==='PASS'?'on':''}" onclick="record('${key}', 'PASS')">PASS</button>
                    <button class="audit-btn fail ${status==='FAIL'?'on':''}" onclick="record('${key}', 'FAIL')">FAIL</button>
                </div>
            </div>`;
    });
}

function record(key, status) {
    currentAudit.results[key] = status;
    switchTab(currentAudit.currentTab); // Refresh UI
}

// 3. YOUR SUBMIT LOGIC (The Spinner)
function submitAudit() {
    const btn = document.querySelector('.footer-action .btn-main');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> SYNCING TO CLOUD...';
    btn.disabled = true;

    setTimeout(() => {
        let passes = Object.values(currentAudit.results).filter(v => v === "PASS").length;
        let total = Object.keys(currentAudit.results).length;
        let score = total === 0 ? 0 : Math.round((passes/total) * 100);

        document.getElementById('final-score').innerText = score + "%";
        document.getElementById('final-tier-name').innerText = currentAudit.tier + " AUDIT";
        
        btn.innerHTML = 'FINISH REPORT';
        btn.disabled = false;
        nav('page-report');
    }, 2000);
}
