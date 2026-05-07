// Check login status on page load
function checkLoginStatus() {
    const loggedInUser = localStorage.getItem('cdrmmo_user');
    const userRole = localStorage.getItem('cdrmmo_role');
    
    if (!loggedInUser) {
        // User is not logged in, redirect to login page
        window.location.href = 'login.html';
        return false;
    }
    
    return true;
}

let isAdmin = localStorage.getItem('cdrmmo_role') === 'admin'; 
let searchTerm = "";
let fleet = JSON.parse(localStorage.getItem('cdrmmo_fleet')) || [];

function save() { localStorage.setItem('cdrmmo_fleet', JSON.stringify(fleet)); }

function handleAuth() {
    // Logout function
    if (confirm("Are you sure you want to logout?")) {
        localStorage.removeItem('cdrmmo_user');
        localStorage.removeItem('cdrmmo_role');
        localStorage.removeItem('cdrmmo_displayName');
        localStorage.removeItem('cdrmmo_loginTime');
        window.location.href = 'login.html';
    }
}

function filterFleet() {
    searchTerm = document.getElementById('searchInput').value.toLowerCase();
    render();
}

function render() {
    const tableBody = document.getElementById('vehicleTableBody');
    tableBody.innerHTML = "";
    let counts = { Available: 0, "On-Going": 0, Maintenance: 0 };

    fleet.forEach((v, index) => {
        if (v.plate.toLowerCase().includes(searchTerm) || v.driver.toLowerCase().includes(searchTerm)) {
            counts[v.status === "On-Going Ride" ? "On-Going" : v.status]++;
            let sClass = "status-" + v.status.toLowerCase().replace(/ /g, '-');
            tableBody.innerHTML += `
                <tr>
                    <td>${v.plate}</td>
                    <td>${v.type}</td>
                    <td>${v.driver}</td>
                    <td><b>${v.fuel || 0}L</b></td>
                    <td class="${sClass}">${v.status}</td>
                    <td>${v.lastUpdate}</td>
                    <td>
                        <button class="btn-log" onclick="showLogs(${index})">History</button>
                        ${isAdmin ? `<button class="btn-edit" onclick="openEditModal(${index})">Edit / Update</button>
                        <button class="btn-delete" onclick="removeVehicle(${index})">🗑️</button>` : ''}
                    </td>
                </tr>`;
        }
    });

    document.getElementById('totalCount').innerText = fleet.length;
    document.getElementById('availCount').innerText = counts.Available;
    document.getElementById('ongoingCount').innerText = counts["On-Going"];
    document.getElementById('maintCount').innerText = counts.Maintenance;
}

function addVehicle() {
    const p = document.getElementById('newPlate');
    const t = document.getElementById('newType');
    const d = document.getElementById('newDriver');
    const f = document.getElementById('newFuel');

    if (!p.value || !d.value) return alert("Plate and Driver are required!");

    fleet.push({
        plate: p.value.toUpperCase(),
        type: t.value || "Ambulance",
        driver: d.value,
        fuel: f.value || 0,
        status: 'Available',
        lastUpdate: new Date().toLocaleTimeString(),
        history: [{ status: `Registered with ${f.value || 0}L fuel`, time: new Date().toLocaleString() }]
    });

    p.value = ""; t.value = ""; d.value = ""; f.value = "";
    save(); render();
}

function openEditModal(index) {
    document.getElementById('editIndex').value = index;
    document.getElementById('editPlate').value = fleet[index].plate;
    document.getElementById('editDriver').value = fleet[index].driver;
    document.getElementById('editFuel').value = fleet[index].fuel || 0;
    document.getElementById('editStatus').value = fleet[index].status;
    document.getElementById('editModal').style.display = 'flex';
}

function closeEditModal() { document.getElementById('editModal').style.display = 'none'; }

function saveEdit() {
    const idx = document.getElementById('editIndex').value;
    const oldStatus = fleet[idx].status;
    const newStatus = document.getElementById('editStatus').value;

    fleet[idx].plate = document.getElementById('editPlate').value.toUpperCase();
    fleet[idx].driver = document.getElementById('editDriver').value;
    fleet[idx].fuel = document.getElementById('editFuel').value;
    
    if (oldStatus !== newStatus) {
        fleet[idx].status = newStatus;
        fleet[idx].lastUpdate = new Date().toLocaleTimeString();
        fleet[idx].history.push({ status: `Moved to ${newStatus}`, time: new Date().toLocaleString() });
    }
    save(); render(); closeEditModal();
}

function showLogs(index) {
    document.getElementById('modalTitle').innerText = `History: ${fleet[index].plate}`;
    document.getElementById('logList').innerHTML = fleet[index].history.map(h => 
        `<div style="padding:5px; border-bottom:1px solid #334155;"><small>${h.time}</small><br><b>${h.status}</b></div>`
    ).reverse().join('');
    document.getElementById('logModal').style.display = 'flex';
}

function closeModal() { document.getElementById('logModal').style.display = 'none'; }
function removeVehicle(index) { if(confirm("Delete?")) { fleet.splice(index, 1); save(); render(); } }

function exportToCSV() {
    if (fleet.length === 0) return alert("Nothing to export!");
    let csv = "Plate #,Type,Driver,Fuel (L),Status,Last Update\n";
    fleet.forEach(v => { csv += `${v.plate},${v.type},${v.driver},${v.fuel || 0},${v.status},${v.lastUpdate}\n`; });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "CDRMMO_Fleet_Report.csv";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
}

// Initialize login status and display
document.addEventListener('DOMContentLoaded', function() {
    if (!checkLoginStatus()) return;
    
    const displayName = localStorage.getItem('cdrmmo_displayName') || 'User';
    const loginTime = localStorage.getItem('cdrmmo_loginTime') || '';
    
    document.getElementById('adminDisplay').innerText = displayName;
    document.getElementById('authBtn').innerText = "Logout";
    document.getElementById('adminForm').style.display = isAdmin ? "block" : "none";
    
    render();
});