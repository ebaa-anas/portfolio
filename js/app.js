// 1. Import Firebase core and Firestore modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

console.log("App.js is successfully running!");

// 2. YOUR Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyAdflv_LqJKGtZdy03JmsbdCIp2B5ioV5I",
    authDomain: "dev-pulse-portfolio.firebaseapp.com",
    projectId: "dev-pulse-portfolio",
    storageBucket: "dev-pulse-portfolio.firebasestorage.app",
    messagingSenderId: "410205610294",
    appId: "1:410205610294:web:4bbd7ab7646e3267455397"
};

// 3. Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ---------------------------------------------------------
// SECTION A: LOAD PROJECTS (For projects.html)
// ---------------------------------------------------------
async function loadProjects() {
    const container = document.getElementById('projects-list');
    if (!container) return; 
    
    try {
        const querySnapshot = await getDocs(collection(db, "projects"));
        let htmlContent = "";

        if (querySnapshot.empty) {
            container.innerHTML = `<div class="text-center text-muted py-5">No projects found. Add some from the Admin Panel!</div>`;
            return;
        }

        querySnapshot.forEach((doc) => {
            const projectData = doc.data();
            
            // Build Tech Badges (Design is blue background, text is black)
            const techBadges = projectData.techStack 
                ? projectData.techStack.map(tech => `<span class="badge bg-primary bg-opacity-10 text-dark px-3 py-2 rounded-pill fw-medium me-2 mb-2">${tech}</span>`).join('') 
                : '';

            const liveDemoBtn = projectData.liveUrl 
                ? `<a href="${projectData.liveUrl}" target="_blank" class="btn btn-primary rounded-pill px-4 py-2 fw-bolder me-3 shadow-sm"><i class="bi bi-globe me-2"></i>Live Demo</a>` 
                : '';
                
            const githubBtn = projectData.githubUrl 
                ? `<a href="${projectData.githubUrl}" target="_blank" class="btn btn-outline-dark rounded-pill px-4 py-2 fw-bolder"><i class="bi bi-github me-2"></i>GitHub</a>` 
                : '';

            htmlContent += `
                <div class="card overflow-hidden shadow rounded-4 border-0 mb-5">
                    <div class="card-body p-0">
                        <div class="d-flex align-items-center flex-column flex-md-row">
                            <div class="p-5 flex-grow-1">
                                <h2 class="fw-bolder text-dark">${projectData.title}</h2>
                                <p class="text-muted">${projectData.description}</p>
                                <div class="mb-4">${techBadges}</div>
                                <div class="d-flex flex-wrap mt-2">
                                    ${liveDemoBtn}
                                    ${githubBtn}
                                </div>
                            </div>
                            <img class="img-fluid" src="https://dummyimage.com/300x400/343a40/6c757d" alt="Project Image" />
                        </div>
                    </div>
                </div>
            `;
        });
        container.innerHTML = htmlContent;
    } catch (error) {
        console.error("Error fetching projects: ", error);
        container.innerHTML = `<div class="alert alert-danger text-center rounded-4" role="alert">Failed to load projects.</div>`;
    }
}
loadProjects();

// ---------------------------------------------------------
// SECTION B: HANDLE CONTACT FORM (For contact.html)
// ---------------------------------------------------------
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        const submitBtn = document.getElementById('submitButton');
        const successMsg = document.getElementById('submitSuccessMessage');
        const errorMsg = document.getElementById('submitErrorMessage');

        submitBtn.innerHTML = "Sending..."; submitBtn.disabled = true;

        const formData = {
            access_key: "812eb957-d75b-408b-8b56-c3d7037b3af2", 
            subject: `New Portfolio Contact from ${document.getElementById('name').value}`,
            from_name: "My Portfolio Website",
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            message: document.getElementById('message').value
        };

        try {
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(formData)
            });
            const result = await response.json();
            if (result.success) {
                contactForm.reset(); successMsg.classList.remove('d-none'); errorMsg.classList.add('d-none');
            } else {
                errorMsg.classList.remove('d-none'); successMsg.classList.add('d-none');
            }
        } catch (error) {
            errorMsg.classList.remove('d-none'); successMsg.classList.add('d-none');
        } finally {
            submitBtn.innerHTML = "Submit"; submitBtn.disabled = false;
        }
    });
}
// ... (Keep your Firebase Config, loadProjects, and contactForm code exactly the same) ...

// ---------------------------------------------------------
// SECTION C: LOAD EXPERIENCE (For resume.html)
// ---------------------------------------------------------
async function loadExperience() {
    const container = document.getElementById('experience-list');
    if (!container) return; 
    try {
        const querySnapshot = await getDocs(collection(db, "experience"));
        let htmlContent = "";
        const docs = querySnapshot.docs; // Get array to check for last item

        docs.forEach((doc, index) => {
            const exp = doc.data();
            const descriptionHTML = (exp.description && exp.description !== "undefined") ? `<p class="text-muted mb-0 mt-3 lh-lg">${exp.description}</p>` : "";
            const isLast = index === docs.length - 1;
            const borderClass = isLast ? "" : "border-bottom pb-4 mb-4"; // No line after the last item

            htmlContent += `
                <div class="${borderClass}">
                    <div class="d-flex flex-column flex-md-row justify-content-between">
                        <div class="mb-2 mb-md-0">
                            <h5 class="fw-bolder text-dark mb-1 fs-5">${exp.role || 'Job Title'}</h5>
                            <div class="text-primary fw-bold"><i class="bi bi-building me-2"></i>${exp.company || 'Company'}</div>
                        </div>
                        <div class="text-md-end mt-2 mt-md-0">
                            <div class="badge badge-outline rounded-pill mb-2">
                                <i class="bi bi-calendar-event me-1"></i> ${exp.period || 'Date'}
                            </div>
                            <div class="small text-muted d-block"><i class="bi bi-geo-alt me-1"></i> ${exp.location || 'Location'}</div>
                        </div>
                    </div>
                    ${descriptionHTML}
                </div>
            `;
        });
        container.innerHTML = htmlContent || `<p class="text-muted">No experience added yet.</p>`;
    } catch (error) { container.innerHTML = `<p class="text-danger">Failed to load experience.</p>`; }
}
loadExperience();

// ---------------------------------------------------------
// SECTION D: LOAD VOLUNTEER EXPERIENCE (For resume.html)
// ---------------------------------------------------------
async function loadVolunteer() {
    const container = document.getElementById('volunteer-list');
    if (!container) return; 
    try {
        const querySnapshot = await getDocs(collection(db, "volunteer"));
        let htmlContent = "";
        const docs = querySnapshot.docs;

        docs.forEach((doc, index) => {
            const vol = doc.data();
            const descriptionHTML = (vol.description && vol.description !== "undefined") ? `<p class="text-muted mb-0 mt-3 lh-lg">${vol.description}</p>` : "";
            const isLast = index === docs.length - 1;
            const borderClass = isLast ? "" : "border-bottom pb-4 mb-4";

            htmlContent += `
                <div class="${borderClass}">
                    <div class="d-flex flex-column flex-md-row justify-content-between">
                        <div class="mb-2 mb-md-0">
                            <h5 class="fw-bolder text-dark mb-1 fs-5">${vol.role || 'Role'}</h5>
                            <div class="text-primary fw-bold"><i class="bi bi-heart-fill me-2"></i>${vol.company || 'Organization'}</div>
                        </div>
                        <div class="text-md-end mt-2 mt-md-0">
                            <div class="badge badge-outline rounded-pill mb-2">
                                <i class="bi bi-calendar-event me-1"></i> ${vol.period || 'Date'}
                            </div>
                            <div class="small text-muted d-block"><i class="bi bi-geo-alt me-1"></i> ${vol.location || 'Location'}</div>
                        </div>
                    </div>
                    ${descriptionHTML}
                </div>
            `;
        });
        container.innerHTML = htmlContent || `<p class="text-muted">No volunteer work added yet.</p>`;
    } catch (error) { console.error("Error fetching volunteer data: ", error); }
}
loadVolunteer();

// ---------------------------------------------------------
// SECTION E: LOAD EDUCATION (For resume.html)
// ---------------------------------------------------------
async function loadEducation() {
    const container = document.getElementById('education-list');
    if (!container) return; 
    try {
        const querySnapshot = await getDocs(collection(db, "education"));
        let htmlContent = "";
        const docs = querySnapshot.docs;

        docs.forEach((doc, index) => {
            const edu = doc.data();
            const descriptionHTML = (edu.description && edu.description !== "undefined") ? `<p class="text-muted mb-0 mt-3 lh-lg">${edu.description}</p>` : "";
            const isLast = index === docs.length - 1;
            const borderClass = isLast ? "" : "border-bottom pb-4 mb-4";

            htmlContent += `
                <div class="${borderClass}">
                    <div class="d-flex flex-column flex-md-row justify-content-between">
                        <div class="mb-2 mb-md-0">
                            <h5 class="fw-bolder text-dark mb-1 fs-5">${edu.degree || 'Degree Title'}</h5>
                            <div class="text-primary fw-bold"><i class="bi bi-bank me-2"></i>${edu.university || 'University Name'}</div>
                        </div>
                        <div class="text-md-end mt-2 mt-md-0">
                            <div class="badge badge-outline rounded-pill mb-2">
                                <i class="bi bi-calendar-event me-1"></i> ${edu.period || 'Date'}
                            </div>
                            <div class="small text-muted d-block"><i class="bi bi-geo-alt me-1"></i> ${edu.location || 'Location'}</div>
                        </div>
                    </div>
                    ${descriptionHTML}
                </div>
            `;
        });
        container.innerHTML = htmlContent || `<p class="text-muted">No education added yet.</p>`;
    } catch (error) { container.innerHTML = `<p class="text-danger">Failed to load education.</p>`; }
}
loadEducation();

// ---------------------------------------------------------
// SECTION F: LOAD COURSES (For resume.html)
// ---------------------------------------------------------
async function loadCourses() {
    const container = document.getElementById('courses-list');
    if (!container) return; 
    try {
        const querySnapshot = await getDocs(collection(db, "courses"));
        let htmlContent = "";
        const docs = querySnapshot.docs;

        docs.forEach((doc, index) => {
            const course = doc.data();
            const isLast = index === docs.length - 1;
            const borderClass = isLast ? "" : "border-bottom pb-3 mb-3";

            htmlContent += `
                <div class="${borderClass} d-flex align-items-center justify-content-between">
                    <div>
                        <h6 class="fw-bolder text-dark mb-1 fs-6">${course.title || 'Course Title'}</h6>
                        <div class="small text-muted"><i class="bi bi-award text-primary me-1"></i> ${course.institution || 'Institution'}</div>
                    </div>
                    <div class="badge bg-light text-dark border px-3 py-2 rounded-pill">${course.date || ''}</div>
                </div>
            `;
        });
        container.innerHTML = htmlContent || `<p class="text-muted">No courses added yet.</p>`;
    } catch (error) { console.error("Error fetching courses: ", error); }
}
loadCourses();

// ---------------------------------------------------------
// SECTION G: LOAD SKILLS & LANGUAGES (From 'profile/main')
// ---------------------------------------------------------
async function loadProfile() {
    const skillsContainer = document.getElementById('skills-list');
    const languagesContainer = document.getElementById('languages-list');
    if (!skillsContainer || !languagesContainer) return;

    try {
        const docRef = doc(db, "profile", "main");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();

            if (data.technicalSkills) {
                let skillsHTML = '<div class="d-flex flex-wrap gap-2">';
                data.technicalSkills.forEach(skill => {
                    skillsHTML += `<span class="badge badge-soft-primary rounded-pill">${skill}</span>`;
                });
                skillsHTML += '</div>';
                skillsContainer.innerHTML = skillsHTML;
            }

            if (data.languages) {
                let langHTML = '<div class="d-flex flex-wrap gap-2">';
                data.languages.forEach(lang => {
                    langHTML += `<span class="badge badge-outline rounded-pill"><i class="bi bi-translate text-muted me-1"></i> ${lang}</span>`;
                });
                langHTML += '</div>';
                languagesContainer.innerHTML = langHTML;
            }
        }
    } catch (error) { console.error("Error fetching profile: ", error); }
}
loadProfile();