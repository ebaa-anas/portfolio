// 1. Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// 2. Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAdflv_LqJKGtZdy03JmsbdCIp2B5ioV5I",
    authDomain: "dev-pulse-portfolio.firebaseapp.com",
    projectId: "dev-pulse-portfolio",
    storageBucket: "dev-pulse-portfolio.firebasestorage.app",
    messagingSenderId: "410205610294",
    appId: "1:410205610294:web:4bbd7ab7646e3267455397"
};

// 3. Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Data storage for Edit Modals
let currentProjectsData = {};
let currentExperienceData = {};
let currentVolunteerData = {};
let currentEducationData = {};
let currentCoursesData = {};

const loginSection = document.getElementById('login-section');
const dashboardSection = document.getElementById('dashboard-section');

// ==========================================
// AUTHENTICATION & NAVIGATION
// ==========================================
onAuthStateChanged(auth, (user) => {
    if (user) {
        loginSection.classList.add('d-none');
        dashboardSection.classList.remove('d-none');
        // Fetch all data when logged in
        fetchAdminProjects(); 
        fetchAdminExperience(); 
        fetchAdminVolunteer(); 
        fetchAdminEducation(); 
        fetchAdminCourses(); 
        fetchAdminProfile(); 
    } else {
        loginSection.classList.remove('d-none');
        dashboardSection.classList.add('d-none');
    }
});

document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('login-btn'); 
    btn.innerHTML = "Verifying..."; 
    btn.disabled = true;
    try {
        await signInWithEmailAndPassword(auth, document.getElementById('admin-email').value, document.getElementById('admin-password').value);
        document.getElementById('login-error').classList.add('d-none'); 
        document.getElementById('login-form').reset();
    } catch (error) { 
        document.getElementById('login-error').classList.remove('d-none'); 
    } finally { 
        btn.innerHTML = "Secure Login"; 
        btn.disabled = false; 
    }
});

document.getElementById('logout-btn')?.addEventListener('click', async () => { 
    await signOut(auth); 
});

const tabButtons = document.querySelectorAll('.tab-btn');
tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        tabButtons.forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.admin-section').forEach(sec => sec.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.getAttribute('data-target')).classList.add('active');
    });
});

// ==========================================
// 1. PROJECTS
// ==========================================
document.getElementById('add-project-form')?.addEventListener('submit', async (e) => {
    e.preventDefault(); 
    const btn = document.getElementById('save-proj-btn'); 
    btn.innerHTML = "Publishing..."; 
    btn.disabled = true;
    try {
        await addDoc(collection(db, "projects"), {
            title: document.getElementById('proj-title').value,
            description: document.getElementById('proj-desc').value,
            imageUrl: document.getElementById('proj-image').value || '',
            githubUrl: document.getElementById('proj-link').value || '',
            liveUrl: document.getElementById('proj-live-link').value || '',
            techStack: document.getElementById('proj-tech').value.split(',').map(i => i.trim()).filter(i => i)
        });
        document.getElementById('save-success').classList.remove('d-none'); 
        document.getElementById('add-project-form').reset();
        setTimeout(() => document.getElementById('save-success').classList.add('d-none'), 3000); 
        fetchAdminProjects();
    } catch (e) { 
        alert("Failed to save project."); 
    } finally { 
        btn.innerHTML = "Publish Project"; 
        btn.disabled = false; 
    }
});

async function fetchAdminProjects() {
    const list = document.getElementById('admin-projects-list'); 
    if (!list) return;
    const snap = await getDocs(collection(db, "projects")); 
    currentProjectsData = {};
    if(snap.empty) { 
        list.innerHTML = '<tr><td class="text-muted">No projects found.</td></tr>'; 
        return; 
    }
    let html = "";
    snap.forEach((doc) => {
        currentProjectsData[doc.id] = doc.data();
        html += `<tr>
                    <td><strong class="text-dark">${doc.data().title}</strong></td>
                    <td class="text-end">
                        <button class="btn btn-sm btn-outline-primary edit-proj-btn me-2" data-id="${doc.id}">Edit</button>
                        <button class="btn btn-sm btn-outline-danger delete-proj-btn" data-id="${doc.id}">Delete</button>
                    </td>
                 </tr>`;
    });
    list.innerHTML = html;
    
    // Delete Listeners
    document.querySelectorAll('.delete-proj-btn').forEach(b => b.addEventListener('click', async (e) => { 
        if(confirm("Are you sure you want to delete this project?")) { 
            await deleteDoc(doc(db, "projects", e.currentTarget.getAttribute('data-id'))); 
            fetchAdminProjects(); 
        }
    }));
    
    // Edit Listeners
    document.querySelectorAll('.edit-proj-btn').forEach(b => b.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id'); 
        const d = currentProjectsData[id];
        document.getElementById('edit-proj-id').value = id; 
        document.getElementById('edit-proj-title').value = d.title || ''; 
        document.getElementById('edit-proj-desc').value = d.description || ''; 
        document.getElementById('edit-proj-image').value = d.imageUrl || ''; 
        document.getElementById('edit-proj-link').value = d.githubUrl || ''; 
        document.getElementById('edit-proj-live-link').value = d.liveUrl || ''; 
        document.getElementById('edit-proj-tech').value = d.techStack ? d.techStack.join(', ') : '';
        new bootstrap.Modal(document.getElementById('editProjectModal')).show();
    }));
}

document.getElementById('edit-project-form')?.addEventListener('submit', async (e) => {
    e.preventDefault(); 
    const btn = document.getElementById('update-proj-btn'); 
    btn.innerHTML = "Saving..."; 
    btn.disabled = true;
    try {
        await updateDoc(doc(db, "projects", document.getElementById('edit-proj-id').value), { 
            title: document.getElementById('edit-proj-title').value, 
            description: document.getElementById('edit-proj-desc').value, 
            imageUrl: document.getElementById('edit-proj-image').value || '', 
            githubUrl: document.getElementById('edit-proj-link').value || '', 
            liveUrl: document.getElementById('edit-proj-live-link').value || '',
            techStack: document.getElementById('edit-proj-tech').value.split(',').map(i => i.trim()).filter(i => i) 
        });
        bootstrap.Modal.getInstance(document.getElementById('editProjectModal')).hide(); 
        fetchAdminProjects();
    } catch (e) { 
        alert("Failed to update project."); 
    } finally { 
        btn.innerHTML = "Save Changes"; 
        btn.disabled = false; 
    }
});

// ==========================================
// 2. EXPERIENCE
// ==========================================
document.getElementById('add-exp-form')?.addEventListener('submit', async (e) => {
    e.preventDefault(); 
    const btn = document.getElementById('save-exp-btn'); 
    btn.innerHTML = "Saving..."; 
    btn.disabled = true;
    try {
        await addDoc(collection(db, "experience"), { 
            role: document.getElementById('exp-role').value, 
            company: document.getElementById('exp-company').value, 
            period: document.getElementById('exp-period').value, 
            location: document.getElementById('exp-location').value, 
            description: document.getElementById('exp-desc').value 
        });
        document.getElementById('save-exp-success').classList.remove('d-none'); 
        document.getElementById('add-exp-form').reset(); 
        setTimeout(() => document.getElementById('save-exp-success').classList.add('d-none'), 3000); 
        fetchAdminExperience();
    } catch (e) { alert("Failed to save experience."); } finally { btn.innerHTML = "Save Experience"; btn.disabled = false; }
});

async function fetchAdminExperience() {
    const list = document.getElementById('admin-exp-list'); 
    if (!list) return;
    const snap = await getDocs(collection(db, "experience")); 
    currentExperienceData = {};
    if(snap.empty) { list.innerHTML = '<tr><td class="text-muted">No entries found.</td></tr>'; return; }
    let html = "";
    snap.forEach((doc) => { 
        currentExperienceData[doc.id] = doc.data(); 
        html += `<tr><td><strong class="text-dark">${doc.data().role}</strong><div class="small text-primary">${doc.data().company}</div></td><td class="text-end"><button class="btn btn-sm btn-outline-primary edit-exp-btn me-2" data-id="${doc.id}">Edit</button><button class="btn btn-sm btn-outline-danger delete-exp-btn" data-id="${doc.id}">Delete</button></td></tr>`; 
    });
    list.innerHTML = html;
    
    document.querySelectorAll('.delete-exp-btn').forEach(b => b.addEventListener('click', async (e) => { 
        if(confirm("Delete this experience?")) { await deleteDoc(doc(db, "experience", e.currentTarget.getAttribute('data-id'))); fetchAdminExperience(); }
    }));
    
    document.querySelectorAll('.edit-exp-btn').forEach(b => b.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id'); const d = currentExperienceData[id];
        document.getElementById('edit-exp-id').value = id; 
        document.getElementById('edit-exp-role').value = d.role; 
        document.getElementById('edit-exp-company').value = d.company; 
        document.getElementById('edit-exp-period').value = d.period; 
        document.getElementById('edit-exp-location').value = d.location; 
        document.getElementById('edit-exp-desc').value = d.description || '';
        new bootstrap.Modal(document.getElementById('editExpModal')).show();
    }));
}

document.getElementById('edit-exp-form')?.addEventListener('submit', async (e) => {
    e.preventDefault(); const btn = document.getElementById('update-exp-btn'); btn.innerHTML = "Saving..."; btn.disabled = true;
    try { 
        await updateDoc(doc(db, "experience", document.getElementById('edit-exp-id').value), { 
            role: document.getElementById('edit-exp-role').value, 
            company: document.getElementById('edit-exp-company').value, 
            period: document.getElementById('edit-exp-period').value, 
            location: document.getElementById('edit-exp-location').value, 
            description: document.getElementById('edit-exp-desc').value 
        }); 
        bootstrap.Modal.getInstance(document.getElementById('editExpModal')).hide(); 
        fetchAdminExperience(); 
    } catch (e) { alert("Failed to update experience."); } finally { btn.innerHTML = "Save Changes"; btn.disabled = false; }
});

// ==========================================
// 3. VOLUNTEER
// ==========================================
document.getElementById('add-vol-form')?.addEventListener('submit', async (e) => {
    e.preventDefault(); const btn = document.getElementById('save-vol-btn'); btn.innerHTML = "Saving..."; btn.disabled = true;
    try { 
        await addDoc(collection(db, "volunteer"), { 
            role: document.getElementById('vol-role').value, 
            company: document.getElementById('vol-company').value, 
            period: document.getElementById('vol-period').value, 
            location: document.getElementById('vol-location').value, 
            description: document.getElementById('vol-desc').value 
        }); 
        document.getElementById('save-vol-success').classList.remove('d-none'); 
        document.getElementById('add-vol-form').reset(); 
        setTimeout(() => document.getElementById('save-vol-success').classList.add('d-none'), 3000); 
        fetchAdminVolunteer(); 
    } catch (e) { alert("Failed to save volunteer work."); } finally { btn.innerHTML = "Save Volunteer Work"; btn.disabled = false; }
});

async function fetchAdminVolunteer() {
    const list = document.getElementById('admin-vol-list'); 
    if (!list) return;
    const snap = await getDocs(collection(db, "volunteer")); 
    currentVolunteerData = {};
    if(snap.empty) { list.innerHTML = '<tr><td class="text-muted">No entries found.</td></tr>'; return; }
    let html = "";
    snap.forEach((doc) => { 
        currentVolunteerData[doc.id] = doc.data(); 
        html += `<tr><td><strong class="text-dark">${doc.data().role}</strong><div class="small text-primary">${doc.data().company}</div></td><td class="text-end"><button class="btn btn-sm btn-outline-primary edit-vol-btn me-2" data-id="${doc.id}">Edit</button><button class="btn btn-sm btn-outline-danger delete-vol-btn" data-id="${doc.id}">Delete</button></td></tr>`; 
    });
    list.innerHTML = html;
    
    document.querySelectorAll('.delete-vol-btn').forEach(b => b.addEventListener('click', async (e) => { 
        if(confirm("Delete this volunteer work?")) { await deleteDoc(doc(db, "volunteer", e.currentTarget.getAttribute('data-id'))); fetchAdminVolunteer(); }
    }));
    
    document.querySelectorAll('.edit-vol-btn').forEach(b => b.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id'); const d = currentVolunteerData[id];
        document.getElementById('edit-vol-id').value = id; 
        document.getElementById('edit-vol-role').value = d.role; 
        document.getElementById('edit-vol-company').value = d.company; 
        document.getElementById('edit-vol-period').value = d.period; 
        document.getElementById('edit-vol-location').value = d.location; 
        document.getElementById('edit-vol-desc').value = d.description || ''; 
        new bootstrap.Modal(document.getElementById('editVolModal')).show(); 
    }));
}

document.getElementById('edit-vol-form')?.addEventListener('submit', async (e) => {
    e.preventDefault(); const btn = document.getElementById('update-vol-btn'); btn.innerHTML = "Saving..."; btn.disabled = true;
    try { 
        await updateDoc(doc(db, "volunteer", document.getElementById('edit-vol-id').value), { 
            role: document.getElementById('edit-vol-role').value, 
            company: document.getElementById('edit-vol-company').value, 
            period: document.getElementById('edit-vol-period').value, 
            location: document.getElementById('edit-vol-location').value, 
            description: document.getElementById('edit-vol-desc').value 
        }); 
        bootstrap.Modal.getInstance(document.getElementById('editVolModal')).hide(); 
        fetchAdminVolunteer(); 
    } catch (e) { alert("Failed to update volunteer work."); } finally { btn.innerHTML = "Save Changes"; btn.disabled = false; }
});

// ==========================================
// 4. EDUCATION
// ==========================================
document.getElementById('add-edu-form')?.addEventListener('submit', async (e) => {
    e.preventDefault(); const btn = document.getElementById('save-edu-btn'); btn.innerHTML = "Saving..."; btn.disabled = true;
    try { 
        await addDoc(collection(db, "education"), { 
            degree: document.getElementById('edu-degree').value, 
            university: document.getElementById('edu-uni').value, 
            period: document.getElementById('edu-period').value, 
            location: document.getElementById('edu-location').value, 
            description: document.getElementById('edu-desc').value 
        }); 
        document.getElementById('save-edu-success').classList.remove('d-none'); 
        document.getElementById('add-edu-form').reset(); 
        setTimeout(() => document.getElementById('save-edu-success').classList.add('d-none'), 3000); 
        fetchAdminEducation(); 
    } catch (e) { alert("Failed to save education."); } finally { btn.innerHTML = "Save Education"; btn.disabled = false; }
});

async function fetchAdminEducation() {
    const list = document.getElementById('admin-edu-list'); 
    if (!list) return;
    const snap = await getDocs(collection(db, "education")); 
    currentEducationData = {};
    if(snap.empty) { list.innerHTML = '<tr><td class="text-muted">No entries found.</td></tr>'; return; }
    let html = "";
    snap.forEach((doc) => { 
        currentEducationData[doc.id] = doc.data(); 
        html += `<tr><td><strong class="text-dark">${doc.data().degree}</strong><div class="small text-primary">${doc.data().university}</div></td><td class="text-end"><button class="btn btn-sm btn-outline-primary edit-edu-btn me-2" data-id="${doc.id}">Edit</button><button class="btn btn-sm btn-outline-danger delete-edu-btn" data-id="${doc.id}">Delete</button></td></tr>`; 
    });
    list.innerHTML = html;
    
    document.querySelectorAll('.delete-edu-btn').forEach(b => b.addEventListener('click', async (e) => { 
        if(confirm("Delete this education entry?")) { await deleteDoc(doc(db, "education", e.currentTarget.getAttribute('data-id'))); fetchAdminEducation(); }
    }));
    
    document.querySelectorAll('.edit-edu-btn').forEach(b => b.addEventListener('click', (e) => { 
        const id = e.currentTarget.getAttribute('data-id'); const d = currentEducationData[id]; 
        document.getElementById('edit-edu-id').value = id; 
        document.getElementById('edit-edu-degree').value = d.degree; 
        document.getElementById('edit-edu-uni').value = d.university; 
        document.getElementById('edit-edu-period').value = d.period; 
        document.getElementById('edit-edu-location').value = d.location; 
        document.getElementById('edit-edu-desc').value = d.description || ''; 
        new bootstrap.Modal(document.getElementById('editEduModal')).show(); 
    }));
}

document.getElementById('edit-edu-form')?.addEventListener('submit', async (e) => {
    e.preventDefault(); const btn = document.getElementById('update-edu-btn'); btn.innerHTML = "Saving..."; btn.disabled = true;
    try { 
        await updateDoc(doc(db, "education", document.getElementById('edit-edu-id').value), { 
            degree: document.getElementById('edit-edu-degree').value, 
            university: document.getElementById('edit-edu-uni').value, 
            period: document.getElementById('edit-edu-period').value, 
            location: document.getElementById('edit-edu-location').value, 
            description: document.getElementById('edit-edu-desc').value 
        }); 
        bootstrap.Modal.getInstance(document.getElementById('editEduModal')).hide(); 
        fetchAdminEducation(); 
    } catch (e) { alert("Failed to update education."); } finally { btn.innerHTML = "Save Changes"; btn.disabled = false; }
});

// ==========================================
// 5. COURSES / CERTIFICATIONS
// ==========================================
document.getElementById('add-course-form')?.addEventListener('submit', async (e) => {
    e.preventDefault(); const btn = document.getElementById('save-course-btn'); btn.innerHTML = "Saving..."; btn.disabled = true;
    try { 
        await addDoc(collection(db, "courses"), { 
            title: document.getElementById('course-title').value, 
            institution: document.getElementById('course-inst').value, 
            date: document.getElementById('course-date').value 
        }); 
        document.getElementById('save-course-success').classList.remove('d-none'); 
        document.getElementById('add-course-form').reset(); 
        setTimeout(() => document.getElementById('save-course-success').classList.add('d-none'), 3000); 
        fetchAdminCourses(); 
    } catch (e) { alert("Failed to save certification."); } finally { btn.innerHTML = "Save Certification"; btn.disabled = false; }
});

async function fetchAdminCourses() {
    const list = document.getElementById('admin-course-list'); 
    if (!list) return;
    const snap = await getDocs(collection(db, "courses")); 
    currentCoursesData = {};
    if(snap.empty) { list.innerHTML = '<tr><td class="text-muted">No entries found.</td></tr>'; return; }
    let html = "";
    snap.forEach((doc) => { 
        currentCoursesData[doc.id] = doc.data(); 
        html += `<tr><td><strong class="text-dark">${doc.data().title}</strong><div class="small text-primary">${doc.data().institution}</div></td><td class="text-end"><button class="btn btn-sm btn-outline-primary edit-course-btn me-2" data-id="${doc.id}">Edit</button><button class="btn btn-sm btn-outline-danger delete-course-btn" data-id="${doc.id}">Delete</button></td></tr>`; 
    });
    list.innerHTML = html;
    
    document.querySelectorAll('.delete-course-btn').forEach(b => b.addEventListener('click', async (e) => { 
        if(confirm("Delete this certification?")) { await deleteDoc(doc(db, "courses", e.currentTarget.getAttribute('data-id'))); fetchAdminCourses(); }
    }));
    
    document.querySelectorAll('.edit-course-btn').forEach(b => b.addEventListener('click', (e) => { 
        const id = e.currentTarget.getAttribute('data-id'); const d = currentCoursesData[id]; 
        document.getElementById('edit-course-id').value = id; 
        document.getElementById('edit-course-title').value = d.title; 
        document.getElementById('edit-course-inst').value = d.institution; 
        document.getElementById('edit-course-date').value = d.date; 
        new bootstrap.Modal(document.getElementById('editCourseModal')).show(); 
    }));
}

document.getElementById('edit-course-form')?.addEventListener('submit', async (e) => {
    e.preventDefault(); const btn = document.getElementById('update-course-btn'); btn.innerHTML = "Saving..."; btn.disabled = true;
    try { 
        await updateDoc(doc(db, "courses", document.getElementById('edit-course-id').value), { 
            title: document.getElementById('edit-course-title').value, 
            institution: document.getElementById('edit-course-inst').value, 
            date: document.getElementById('edit-course-date').value 
        }); 
        bootstrap.Modal.getInstance(document.getElementById('editCourseModal')).hide(); 
        fetchAdminCourses(); 
    } catch (e) { alert("Failed to update certification."); } finally { btn.innerHTML = "Save Changes"; btn.disabled = false; }
});

// ==========================================
// 6. GLOBAL PROFILE (SKILLS, LANGS, BIO)
// ==========================================
async function fetchAdminProfile() {
    try {
        const snap = await getDoc(doc(db, "profile", "main"));
        if (snap.exists()) {
            const data = snap.data();
            document.getElementById('prof-phone').value = data.phone || '';
            document.getElementById('prof-website').value = data.website || '';
            document.getElementById('prof-summary').value = data.summary || '';
            document.getElementById('prof-skills').value = data.technicalSkills ? data.technicalSkills.join(', ') : '';
            document.getElementById('prof-soft-skills').value = data.softSkills ? data.softSkills.join(', ') : '';
            document.getElementById('prof-langs').value = data.languages ? data.languages.join(', ') : '';
        }
    } catch (error) { 
        console.error("Error fetching profile: ", error); 
    }
}

document.getElementById('edit-profile-form')?.addEventListener('submit', async (e) => {
    e.preventDefault(); 
    const btn = document.getElementById('update-prof-btn'); 
    btn.innerHTML = "Syncing..."; 
    btn.disabled = true;
    try {
        await setDoc(doc(db, "profile", "main"), {
            phone: document.getElementById('prof-phone').value,
            website: document.getElementById('prof-website').value,
            summary: document.getElementById('prof-summary').value,
            technicalSkills: document.getElementById('prof-skills').value.split(',').map(i => i.trim()).filter(i => i),
            softSkills: document.getElementById('prof-soft-skills').value.split(',').map(i => i.trim()).filter(i => i),
            languages: document.getElementById('prof-langs').value.split(',').map(i => i.trim()).filter(i => i)
        }, { merge: true });
        
        document.getElementById('update-prof-success').classList.remove('d-none'); 
        setTimeout(() => { document.getElementById('update-prof-success').classList.add('d-none'); }, 3000);
    } catch (e) { 
        alert("Failed to sync profile."); 
    } finally { 
        btn.innerHTML = "Sync Global Profile"; 
        btn.disabled = false; 
    }
});