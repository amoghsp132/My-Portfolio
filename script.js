// Global variables
let projects = []
let filteredProjects = []
let currentPage = 0
const projectsPerPage = 6
const isLoading = false

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  loadProjects()
  initializeTheme()
  initializeSearch()
  initializeContactForm()

  // Check if we're on project detail page
  if (window.location.pathname.includes("project.html")) {
    loadProjectDetail()
  }
})

// Load projects data
async function loadProjects() {
  try {
    const response = await fetch("projects.json")
    projects = await response.json()
    filteredProjects = [...projects]
    displayProjects()
  } catch (error) {
    console.error("Error loading projects:", error)
    displayError()
  }
}

// Display projects
function displayProjects(reset = false) {
  const container = document.getElementById("projectsContainer")
  if (!container) return

  if (reset) {
    container.innerHTML = ""
    currentPage = 0
  }

  const startIndex = currentPage * projectsPerPage
  const endIndex = startIndex + projectsPerPage
  const projectsToShow = filteredProjects.slice(startIndex, endIndex)

  projectsToShow.forEach((project) => {
    const projectCard = createProjectCard(project)
    container.appendChild(projectCard)
  })

  currentPage++

  // Show/hide load more button
  const loadMoreBtn = document.getElementById("loadMoreBtn")
  if (loadMoreBtn) {
    if (endIndex >= filteredProjects.length) {
      loadMoreBtn.style.display = "none"
    } else {
      loadMoreBtn.style.display = "block"
      loadMoreBtn.onclick = () => displayProjects()
    }
  }
}

// Create project card element
function createProjectCard(project) {
  const col = document.createElement("div")
  col.className = "col-md-6 col-lg-4"

  col.innerHTML = `
        <div class="project-card h-100" onclick="openProject(${project.id})">
            <img src="${project.thumbnail}" alt="${project.title}" class="project-thumbnail">
            <div class="project-content">
                <h5 class="project-title">${project.title}</h5>
                <p class="project-description">${project.description}</p>
                <div class="project-tags">
                    ${project.technologies.map((tech) => `<span class="badge">${tech}</span>`).join("")}
                </div>
            </div>
        </div>
    `

  return col
}

// Open project detail
function openProject(projectId) {
  window.location.href = `project.html?id=${projectId}`
}

// Load project detail page
function loadProjectDetail() {
  const urlParams = new URLSearchParams(window.location.search)
  const projectId = Number.parseInt(urlParams.get("id"))

  if (!projectId) {
    window.location.href = "index.html"
    return
  }

  // Load projects first, then display detail
  fetch("projects.json")
    .then((response) => response.json())
    .then((data) => {
      projects = data
      const project = projects.find((p) => p.id === projectId)

      if (!project) {
        window.location.href = "index.html"
        return
      }

      displayProjectDetail(project)
      displayRelatedProjects(project)
    })
    .catch((error) => {
      console.error("Error loading project:", error)
      window.location.href = "index.html"
    })
}

// Display project detail
function displayProjectDetail(project) {
  const container = document.getElementById("projectDetail")
  if (!container) return

  document.title = `${project.title} - Portfolio`

  const videoContent = project.videoEmbed
    ? project.videoEmbed
    : `<img src="${project.thumbnail}" alt="${project.title}" class="img-fluid">`

  container.innerHTML = `
        <div class="project-detail-video d-flex align-items-center justify-content-center">
            ${videoContent}
        </div>
        
        <div class="project-detail-content">
            <h1>${project.title}</h1>
            <p class="text-muted mb-3">${project.category}</p>
            
            <div class="mb-4">
                ${project.technologies.map((tech) => `<span class="badge bg-primary me-1">${tech}</span>`).join("")}
            </div>
            
            <div class="mb-4">
                <h5>Description</h5>
                <p>${project.longDescription || project.description}</p>
            </div>
            
            <div class="mb-4">
                <h5>Key Features</h5>
                <ul>
                    ${(project.features || ["Feature 1", "Feature 2", "Feature 3"]).map((feature) => `<li>${feature}</li>`).join("")}
                </ul>
            </div>
            
            <div class="project-links">
                ${
                  project.githubUrl
                    ? `<a href="${project.githubUrl}" class="btn btn-outline-primary" target="_blank">
                    <i class="fab fa-github me-1"></i>View Code
                </a>`
                    : ""
                }
                ${
                  project.liveUrl
                    ? `<a href="${project.liveUrl}" class="btn btn-primary" target="_blank">
                    <i class="fas fa-external-link-alt me-1"></i>Live Demo
                </a>`
                    : ""
                }
            </div>
        </div>
    `
}

// Display related projects
function displayRelatedProjects(currentProject) {
  const container = document.getElementById("relatedProjects")
  if (!container) return

  const relatedProjects = projects
    .filter((p) => p.id !== currentProject.id && p.category === currentProject.category)
    .slice(0, 3)

  container.innerHTML = relatedProjects
    .map(
      (project) => `
        <div class="col-md-4">
            <div class="related-project-card" onclick="openProject(${project.id})">
                <img src="${project.thumbnail}" alt="${project.title}" class="related-project-thumbnail">
                <div class="p-2">
                    <h6 class="mb-1">${project.title}</h6>
                    <small class="text-muted">${project.category}</small>
                </div>
            </div>
        </div>
    `,
    )
    .join("")
}

// Initialize theme toggle
function initializeTheme() {
  const themeToggle = document.getElementById("themeToggle")
  const savedTheme = localStorage.getItem("theme") || "dark"

  document.body.setAttribute("data-theme", savedTheme)
  updateThemeIcon(savedTheme)

  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme)
  }
}

// Toggle theme
function toggleTheme() {
  const currentTheme = document.body.getAttribute("data-theme")
  const newTheme = currentTheme === "light" ? "dark" : "light"

  document.body.setAttribute("data-theme", newTheme)
  localStorage.setItem("theme", newTheme)
  updateThemeIcon(newTheme)
}

// Update theme icon
function updateThemeIcon(theme) {
  const themeToggle = document.getElementById("themeToggle")
  if (!themeToggle) return

  const icon = themeToggle.querySelector("i")
  if (theme === "dark") {
    icon.className = "fas fa-sun"
  } else {
    icon.className = "fas fa-moon"
  }
}

// Initialize search functionality
function initializeSearch() {
  const searchInput = document.getElementById("searchInput")
  const searchResults = document.getElementById("searchResults")

  if (!searchInput || !searchResults) return

  let searchTimeout

  searchInput.addEventListener("input", function () {
    clearTimeout(searchTimeout)
    const query = this.value.trim()

    if (query.length === 0) {
      searchResults.style.display = "none"
      filteredProjects = [...projects]
      displayProjects(true)
      return
    }

    searchTimeout = setTimeout(() => {
      performSearch(query)
    }, 300)
  })

  // Hide search results when clicking outside
  document.addEventListener("click", (e) => {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
      searchResults.style.display = "none"
    }
  })
}

// Perform search
function performSearch(query) {
  const searchResults = document.getElementById("searchResults")

  filteredProjects = projects.filter(
    (project) =>
      project.title.toLowerCase().includes(query.toLowerCase()) ||
      project.description.toLowerCase().includes(query.toLowerCase()) ||
      project.technologies.some((tech) => tech.toLowerCase().includes(query.toLowerCase())),
  )

  // Display search results dropdown
  if (filteredProjects.length > 0) {
    searchResults.innerHTML = filteredProjects
      .slice(0, 5)
      .map(
        (project) => `
            <div class="search-result-item" onclick="openProject(${project.id})">
                <div class="fw-bold">${project.title}</div>
                <div class="text-muted small">${project.description.substring(0, 60)}...</div>
            </div>
        `,
      )
      .join("")
    searchResults.style.display = "block"
  } else {
    searchResults.innerHTML = '<div class="search-result-item">No projects found</div>'
    searchResults.style.display = "block"
  }

  // Update main project display
  displayProjects(true)
}

// Initialize contact form
function initializeContactForm() {
  const contactForm = document.getElementById("contactForm")
  if (!contactForm) return

  contactForm.addEventListener("submit", function (e) {
    //e.preventDefault()

    /* const formData = new FormData(this)
    const name = formData.get("name") || this.querySelector('input[type="text"]').value
    const email = formData.get("email") || this.querySelector('input[type="email"]').value
    const message = formData.get("message") || this.querySelector("textarea").value

    // Create mailto link
    const subject = encodeURIComponent(`Portfolio Contact from ${name}`)
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`)
    const mailtoLink = `mailto:john@example.com?subject=${subject}&body=${body}`

    window.location.href = mailtoLink */

    // Reset form
    e.alert("Your message has been sent via email.\nThank you for contacting me.")
    this.reset()

    // Show success message
    alert("Thank you for your message! Your email client should open now.")
  })
}

// Display error message
function displayError() {
  const container = document.getElementById("projectsContainer")
  if (container) {
    container.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger" role="alert">
                    <h4 class="alert-heading">Error Loading Projects</h4>
                    <p>Sorry, there was an error loading the projects. Please try again later.</p>
                </div>
            </div>
        `
  }
}

// Intersection Observer for infinite scroll (optional enhancement)
function initializeInfiniteScroll() {
  const loadMoreBtn = document.getElementById("loadMoreBtn")
  if (!loadMoreBtn) return

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !isLoading) {
          displayProjects()
        }
      })
    },
    {
      rootMargin: "100px",
    },
  )

  observer.observe(loadMoreBtn)
}
