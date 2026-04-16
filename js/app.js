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
            container.innerHTML = `<div class="col-12 text-center text-muted py-5">No projects found. Add some from the Admin Panel!</div>`;
            return;
        }

        querySnapshot.forEach((docSnap) => {
            const projectData = docSnap.data();
            const techBadges = projectData.techStack ? projectData.techStack.map(tech => `<span class="badge tech-badge rounded-pill me-2 mb-2">${tech}</span>`).join('') : '';
            const liveDemoBtn = projectData.liveUrl ? `<a href="${projectData.liveUrl}" target="_blank" class="btn btn-primary btn-sm rounded-pill px-3 fw-bolder shadow-sm" style="background-color: #2563eb; border: none;"><i class="bi bi-globe me-1"></i> Demo</a>` : '';
            const githubBtn = projectData.githubUrl ? `<a href="${projectData.githubUrl}" target="_blank" class="btn btn-outline-dark btn-sm rounded-pill px-3 fw-bolder"><i class="bi bi-github me-1"></i> Code</a>` : '';
            const imageSrc = projectData.imageUrl ? projectData.imageUrl : 'https://dummyimage.com/600x400/f8fafc/64748b&text=Project+Image';

            htmlContent += `
                <div class="col-lg-4 col-md-6 mb-4">
                    <div class="card h-100 project-card shadow-sm border-0 d-flex flex-column">
                        <img src="${imageSrc}" class="img-fluid" alt="${projectData.title}" style="height: 200px; object-fit: cover;" />
                        <div class="card-body p-4 d-flex flex-column">
                            <div class="small fw-bold text-primary mb-1" style="font-size: 0.8rem;">Project</div>
                            <h5 class="fw-bolder text-dark mb-2 fs-5">${projectData.title}</h5>
                            <p class="text-muted small mb-4 flex-grow-1" style="line-height: 1.6;">${projectData.description}</p>
                            <div class="d-flex flex-wrap mb-4">
                                ${techBadges}
                            </div>
                            <div class="mt-auto d-flex gap-2">
                                ${liveDemoBtn}
                                ${githubBtn}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        container.innerHTML = htmlContent;
    } catch (error) {
        console.error("Error fetching projects: ", error);
        container.innerHTML = `<div class="col-12 alert alert-danger text-center rounded-4" role="alert">Failed to load projects.</div>`;
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

// ---------------------------------------------------------
// SECTION C: LOAD EXPERIENCE (For resume.html)
// ---------------------------------------------------------
async function loadExperience() {
    const container = document.getElementById('experience-list');
    if (!container) return; 
    try {
        const querySnapshot = await getDocs(collection(db, "experience"));
        let htmlContent = "";
        const docs = querySnapshot.docs; 

        docs.forEach((doc, index) => {
            const exp = doc.data();
            const descriptionHTML = (exp.description && exp.description !== "undefined") ? `<ul class="mb-0 ps-3 mt-3"><li class="text-muted small" style="line-height: 1.7;">${exp.description}</li></ul>` : "";
            const isLast = index === docs.length - 1;
            const borderClass = isLast ? "" : "border-bottom pb-4 mb-4"; 

            htmlContent += `
                <div class="${borderClass}" style="border-color: #f1f5f9 !important;">
                    <div class="d-flex flex-column flex-md-row justify-content-between mb-2">
                        <div>
                            <h5 class="fw-bolder text-dark mb-1 fs-6">${exp.role || 'Job Title'}</h5>
                            <div class="text-primary small fw-medium">${exp.company || 'Company'}</div>
                        </div>
                        <div class="text-md-end mt-2 mt-md-0 text-muted" style="font-size: 0.8rem;">
                            <div class="mb-1"><i class="bi bi-calendar3 me-2"></i>${exp.period || 'Date'}</div>
                            <div><i class="bi bi-geo-alt me-2"></i>${exp.location || 'Location'}</div>
                        </div>
                    </div>
                    ${descriptionHTML}
                </div>
            `;
        });
        container.innerHTML = htmlContent || `<p class="text-muted small">No experience added yet.</p>`;
    } catch (error) { container.innerHTML = `<p class="text-danger small">Failed to load experience.</p>`; }
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
            const descriptionHTML = (vol.description && vol.description !== "undefined") ? `<ul class="mb-0 ps-3 mt-3"><li class="text-muted small" style="line-height: 1.7;">${vol.description}</li></ul>` : "";
            const isLast = index === docs.length - 1;
            const borderClass = isLast ? "" : "border-bottom pb-4 mb-4";

            htmlContent += `
                <div class="${borderClass}" style="border-color: #f1f5f9 !important;">
                    <div class="d-flex flex-column flex-md-row justify-content-between mb-2">
                        <div>
                            <h5 class="fw-bolder text-dark mb-1 fs-6">${vol.role || 'Role'}</h5>
                            <div class="text-primary small fw-medium">${vol.company || 'Organization'}</div>
                        </div>
                        <div class="text-md-end mt-2 mt-md-0 text-muted" style="font-size: 0.8rem;">
                            <div class="mb-1"><i class="bi bi-calendar3 me-2"></i>${vol.period || 'Date'}</div>
                            <div><i class="bi bi-geo-alt me-2"></i>${vol.location || 'Location'}</div>
                        </div>
                    </div>
                    ${descriptionHTML}
                </div>
            `;
        });
        container.innerHTML = htmlContent || `<p class="text-muted small">No volunteer work added yet.</p>`;
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
            const descriptionHTML = (edu.description && edu.description !== "undefined") ? `<ul class="mb-0 ps-3 mt-3"><li class="text-muted small" style="line-height: 1.7;">${edu.description}</li></ul>` : "";
            const isLast = index === docs.length - 1;
            const borderClass = isLast ? "" : "border-bottom pb-4 mb-4";

            htmlContent += `
                <div class="${borderClass}" style="border-color: #f1f5f9 !important;">
                    <div class="d-flex flex-column flex-md-row justify-content-between mb-2">
                        <div>
                            <h5 class="fw-bolder text-dark mb-1 fs-6">${edu.degree || 'Degree Title'}</h5>
                            <div class="text-primary small fw-medium">${edu.university || 'University Name'}</div>
                        </div>
                        <div class="text-md-end mt-2 mt-md-0 text-muted" style="font-size: 0.8rem;">
                            <div class="mb-1"><i class="bi bi-calendar3 me-2"></i>${edu.period || 'Date'}</div>
                            <div><i class="bi bi-geo-alt me-2"></i>${edu.location || 'Location'}</div>
                        </div>
                    </div>
                    ${descriptionHTML}
                </div>
            `;
        });
        container.innerHTML = htmlContent || `<p class="text-muted small">No education added yet.</p>`;
    } catch (error) { container.innerHTML = `<p class="text-danger small">Failed to load education.</p>`; }
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
        
        querySnapshot.forEach((doc) => {
            const course = doc.data();
            htmlContent += `
                <div class="col-md-6 mb-2">
                    <div class="border rounded-3 p-4 h-100" style="background-color: #f8fafc; border-color: #e2e8f0 !important;">
                        <h6 class="fw-bolder text-dark mb-1">${course.title || 'Course Title'}</h6>
                        <div class="small text-muted mb-3">${course.institution || 'Institution'}</div>
                        <div class="text-primary small fw-medium">${course.date || ''}</div>
                    </div>
                </div>
            `;
        });
        container.innerHTML = htmlContent || `<p class="col-12 text-muted small">No courses added yet.</p>`;
    } catch (error) { console.error("Error fetching courses: ", error); }
}
loadCourses();

// ---------------------------------------------------------
// SECTION G: LOAD SKILLS, LANGUAGES, & GLOBAL PROFILE
// ---------------------------------------------------------
async function loadProfile() {
    // 1. Get DOM Elements
    const skillsContainer = document.getElementById('skills-list');
    const languagesContainer = document.getElementById('languages-list');
    const softSkillsContainer = document.getElementById('soft-skills-list');
    const summaryContainer = document.getElementById('profile-summary');
    const phoneContainer = document.getElementById('profile-phone');
    const websiteContainer = document.getElementById('profile-website');

    try {
        const docRef = doc(db, "profile", "main");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();

            // Render Technical Skills
            if (data.technicalSkills && skillsContainer) {
                let skillsHTML = '<div class="d-flex flex-wrap gap-2">';
                data.technicalSkills.forEach(skill => {
                    skillsHTML += `<span class="badge text-dark fw-normal px-3 py-2 rounded-pill" style="background-color: #f1f5f9; border: 1px solid #e2e8f0; font-size: 0.8rem;">${skill}</span>`;
                });
                skillsHTML += '</div>';
                skillsContainer.innerHTML = skillsHTML;
            }

            // Render Languages
            if (data.languages && languagesContainer) {
                let langHTML = '<div class="d-flex flex-wrap gap-2">';
                data.languages.forEach(lang => {
                    langHTML += `<span class="badge fw-normal px-3 py-2 rounded-pill" style="background-color: #fdf2f8; border: 1px solid #fce7f3; color: #9d174d; font-size: 0.8rem;">${lang}</span>`;
                });
                langHTML += '</div>';
                languagesContainer.innerHTML = langHTML;
            }

            // Render Soft Skills (Figma green style)
            if (data.softSkills && softSkillsContainer) {
                let softHTML = '<div class="d-flex flex-wrap gap-2">';
                data.softSkills.forEach(skill => {
                    softHTML += `<span class="badge fw-normal px-3 py-2 rounded-pill" style="background-color: #ecfdf5; border: 1px solid #d1fae5; color: #065f46; font-size: 0.8rem;">${skill}</span>`;
                });
                softHTML += '</div>';
                softSkillsContainer.innerHTML = softHTML;
            }

            // Render Profile Summary Text
            if (data.summary && summaryContainer) {
                summaryContainer.innerText = data.summary;
            }

            // Render Phone Number
            if (data.phone && phoneContainer) {
                phoneContainer.innerHTML = `<i class="bi bi-telephone me-2 fs-6"></i>${data.phone}`;
            }

            // Render Website
            if (data.website && websiteContainer) {
                websiteContainer.innerHTML = `<i class="bi bi-globe me-2 fs-6"></i>${data.website}`;
            }
        }
    } catch (error) { console.error("Error fetching profile: ", error); }
}
loadProfile();