// Global state
let livestock = [];
let filteredListings = [];
let currentUser = null;
let isLoggedIn = false;
const animalEmojis = {
    cow: '🐄',
    goat: '🐐', 
    sheep: '🐑',
    pig: '🐷',
    horse: '🐎',
    chicken: '🐔',
    duck: '🦆',
    rabbit: '🐰'
};

// Province and area data for South Africa
const provinces = {
    'gauteng': {
        name: 'Gauteng',
        areas: ['Johannesburg', 'Pretoria', 'Ekurhuleni', 'Soweto', 'Sandton', 'Randburg', 'Roodepoort', 'Benoni', 'Boksburg', 'Germiston']
    },
    'western-cape': {
        name: 'Western Cape',
        areas: ['Cape Town', 'Stellenbosch', 'Paarl', 'Worcester', 'George', 'Mossel Bay', 'Oudtshoorn', 'Hermanus', 'Swellendam', 'Caledon']
    },
    'kwazulu-natal': {
        name: 'KwaZulu-Natal',
        areas: ['Durban', 'Pietermaritzburg', 'Newcastle', 'Ladysmith', 'Estcourt', 'Dundee', 'Vryheid', 'Empangeni', 'Richards Bay', 'Port Shepstone']
    },
    'eastern-cape': {
        name: 'Eastern Cape',
        areas: ['Port Elizabeth', 'East London', 'Uitenhage', 'King Williams Town', 'Grahamstown', 'Queenstown', 'Mdantsane', 'Bhisho', 'Mthatha', 'Butterworth']
    },
    'free-state': {
        name: 'Free State',
        areas: ['Bloemfontein', 'Welkom', 'Kroonstad', 'Bethlehem', 'Sasolburg', 'Virginia', 'Bothaville', 'Parys', 'Ficksburg', 'Harrismith']
    },
    'limpopo': {
        name: 'Limpopo',
        areas: ['Polokwane', 'Tzaneen', 'Phalaborwa', 'Mokopane', 'Louis Trichardt', 'Thohoyandou', 'Giyani', 'Lebowakgomo', 'Bela-Bela', 'Modimolle']
    },
    'mpumalanga': {
        name: 'Mpumalanga',
        areas: ['Nelspruit', 'Witbank', 'Secunda', 'Ermelo', 'Standerton', 'Middelburg', 'Barberton', 'White River', 'Sabie', 'Hazyview']
    },
    'north-west': {
        name: 'North West',
        areas: ['Mafikeng', 'Rustenburg', 'Potchefstroom', 'Klerksdorp', 'Brits', 'Lichtenburg', 'Zeerust', 'Vryburg', 'Schweizer-Reneke', 'Coligny']
    },
    'northern-cape': {
        name: 'Northern Cape',
        areas: ['Kimberley', 'Upington', 'Springbok', 'De Aar', 'Kuruman', 'Postmasburg', 'Carnarvon', 'Calvinia', 'Prieska', 'Britstown']
    }
};

// Authentication functions
function handleSellClick() {
    if (!isLoggedIn) {
        showAuthModal();
    } else {
        showPage('sell');
    }
}

function showAuthModal() {
    document.getElementById('auth-modal').style.display = 'block';
}

function hideAuthModal() {
    document.getElementById('auth-modal').style.display = 'none';
}

function switchAuthTab(tabName) {
    // Hide all forms
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.remove('active');
    });
    
    // Remove active class from tabs
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected form and tab
    document.getElementById(tabName + '-form').classList.add('active');
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
}

function login(email, name) {
    isLoggedIn = true;
    currentUser = { email, name };
    
    // Update UI
    document.getElementById('user-name').textContent = name.split(' ')[0];
    document.getElementById('user-avatar').textContent = name.charAt(0).toUpperCase();
    document.getElementById('user-status').classList.add('logged-in');
    
    // Hide modal and show sell page
    hideAuthModal();
    showPage('sell');
}

function logout() {
    isLoggedIn = false;
    currentUser = null;
    document.getElementById('user-status').classList.remove('logged-in');
    showPage('home');
}

// Navigation functionality
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Remove active class from all nav buttons
    document.querySelectorAll('.nav-links button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected page
    document.getElementById(pageId).classList.add('active');
    document.getElementById(pageId + '-btn').classList.add('active');
    
    // Refresh listings if browsing
    if (pageId === 'browse') {
        displayListings();
    }
}

// Province and area handling
function updateAreas() {
    const provinceSelect = document.getElementById('province');
    const areaSelect = document.getElementById('area');
    const selectedProvince = provinceSelect.value;
    
    // Clear area options
    areaSelect.innerHTML = '<option value="">Select area...</option>';
    
    if (selectedProvince && provinces[selectedProvince]) {
        areaSelect.disabled = false;
        provinces[selectedProvince].areas.forEach(area => {
            const option = document.createElement('option');
            option.value = area.toLowerCase().replace(/\s+/g, '-');
            option.textContent = area;
            areaSelect.appendChild(option);
        });
    } else {
        areaSelect.disabled = true;
    }
}

function updateAreaFilter() {
    const provinceFilter = document.getElementById('province-filter');
    const areaFilter = document.getElementById('area-filter');
    const selectedProvince = provinceFilter.value;
    
    // Clear area filter options
    areaFilter.innerHTML = '<option value="">All Areas</option>';
    
    if (selectedProvince && provinces[selectedProvince]) {
        areaFilter.disabled = false;
        provinces[selectedProvince].areas.forEach(area => {
            const option = document.createElement('option');
            option.value = area.toLowerCase().replace(/\s+/g, '-');
            option.textContent = area;
            areaFilter.appendChild(option);
        });
    } else {
        areaFilter.disabled = true;
    }
    
    // Re-apply filters
    filterListings();
}

// Display listings
function displayListings() {
    const container = document.getElementById('listings-container');
    
    if (filteredListings.length === 0) {
        container.innerHTML = '<div class="no-listings">No livestock listings found matching your criteria. Try adjusting your filters!</div>';
        return;
    }
    
    container.innerHTML = filteredListings.map(animal => `
        <div class="listing-card">
            <div class="listing-image">
                ${animal.image ? 
                    `<img src="${animal.image}" alt="${animal.name}" onerror="this.parentElement.innerHTML='${animalEmojis[animal.type] || '🐾'}'">` : 
                    animalEmojis[animal.type] || '🐾'
                }
            </div>
            <div class="listing-content">
                <div class="listing-header">
                    <div class="listing-title">${animal.name}</div>
                    <div class="livestock-type">${animal.type}</div>
                </div>
                <div class="listing-details">
                    <div class="price-badge">R ${animal.price.toLocaleString('en-ZA', {minimumFractionDigits: 2})}</div>
                    <p><span class="age-badge">${animal.age} year${animal.age !== 1 ? 's' : ''} old</span></p>
                    <div class="seller-info">
                        <span>👤</span>
                        <span><strong>Seller:</strong> ${animal.seller}</span>
                    </div>
                    <div class="seller-info">
                        <span>📞</span>
                        <span><strong>Phone:</strong> ${animal.phone}</span>
                    </div>
                    <div class="location-info">
                        <span>📍</span>
                        <span>${getAreaName(animal.area)}, ${getProvinceName(animal.province)}</span>
                    </div>
                    <p>${animal.description}</p>
                </div>
                <div class="listing-footer">
                    <button class="root-btn" onclick="rootForAnimal(${animal.id})">
                        ❤️ Root for ${animal.name}
                    </button>
                    <div class="root-count">
                        <span>⭐ ${animal.roots} root${animal.roots !== 1 ? 's' : ''}</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Helper functions for display names
function getProvinceName(provinceKey) {
    return provinces[provinceKey] ? provinces[provinceKey].name : provinceKey;
}

function getAreaName(areaKey) {
    // Convert kebab-case back to proper case
    return areaKey.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

// Root for animal
function rootForAnimal(id) {
    const animal = livestock.find(a => a.id === id);
    if (animal) {
        animal.roots++;
        applyFiltersAndSort();
        displayListings();
    }
}

// Filter listings
function filterListings() {
    const typeFilter = document.getElementById('type-filter').value;
    const provinceFilter = document.getElementById('province-filter').value;
    const areaFilter = document.getElementById('area-filter').value;
    const minPrice = parseFloat(document.getElementById('price-min').value) || 0;
    const maxPrice = parseFloat(document.getElementById('price-max').value) || Infinity;
    
    filteredListings = livestock.filter(animal => {
        const typeMatch = !typeFilter || animal.type === typeFilter;
        const provinceMatch = !provinceFilter || animal.province === provinceFilter;
        const areaMatch = !areaFilter || animal.area === areaFilter;
        const priceMatch = animal.price >= minPrice && animal.price <= maxPrice;
        
        return typeMatch && provinceMatch && areaMatch && priceMatch;
    });
    
    sortListings();
}

// Sort listings
function sortListings() {
    const sortBy = document.getElementById('sort-filter').value;
    
    filteredListings.sort((a, b) => {
        switch(sortBy) {
            case 'price-low':
                return a.price - b.price;
            case 'price-high':
                return b.price - a.price;
            case 'roots':
                return b.roots - a.roots;
            case 'name':
                return a.name.localeCompare(b.name);
            case 'age':
                return a.age - b.age;
            case 'newest':
            default:
                return b.dateAdded - a.dateAdded;
        }
    });
    
    displayListings();
}

// Apply both filters and sorting
function applyFiltersAndSort() {
    filterListings();
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Modal event listeners
    document.querySelector('.close').onclick = hideAuthModal;
    window.onclick = function(event) {
        const modal = document.getElementById('auth-modal');
        if (event.target === modal) {
            hideAuthModal();
        }
    };
    
    // Auth tab switching
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            switchAuthTab(this.dataset.tab);
        });
    });
    
    // Form submissions
    document.getElementById('login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = this.querySelector('input[type="email"]').value;
        const btn = this.querySelector('.auth-btn');
        
        btn.innerHTML = '<div class="loading"></div>';
        
        setTimeout(() => {
            login(email, 'John Farmer');
            btn.innerHTML = 'Login';
            this.reset();
        }, 1500);
    });
    
    document.getElementById('signup-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = this.querySelector('input[type="email"]').value;
        const name = this.querySelector('input[type="text"]').value;
        const btn = this.querySelector('.auth-btn');
        
        btn.innerHTML = '<div class="loading"></div>';
        
        setTimeout(() => {
            login(email, name);
            btn.innerHTML = 'Sign Up';
            this.reset();
        }, 1500);
    });

    // Livestock form submission
    document.getElementById('livestock-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('animal-name').value;
        const type = document.getElementById('animal-type').value;
        const age = parseFloat(document.getElementById('animal-age').value);
        const price = parseFloat(document.getElementById('animal-price').value);
        const seller = document.getElementById('seller-name').value;
        const phone = document.getElementById('seller-phone').value;
        const province = document.getElementById('province').value;
        const area = document.getElementById('area').value;
        const description = document.getElementById('animal-description').value;
        const image = document.getElementById('animal-image').value;
        
        const newLivestock = {
            id: Date.now(),
            name,
            type,
            age,
            price,
            seller,
            phone,
            province,
            area,
            description,
            image,
            roots: 0,
            dateAdded: new Date()
        };
        
        livestock.push(newLivestock);
        
        // Clear form
        this.reset();
        document.getElementById('area').disabled = true;
        document.getElementById('area').innerHTML = '<option value="">Select area...</option>';
        
        // Show success message and redirect to browse
        alert('Livestock listed successfully!');
        showPage('browse');
    });

    // Add sample data with enhanced information
    livestock = [
        {
            id: 1,
            name: "Bessie",
            type: "cow",
            age: 3,
            price: 15000.00,
            seller: "Bokmakirie Farm",
            phone: "018 294 5678",
            province: "north-west",
            area: "potchefstroom",
            description: "A gentle Holstein dairy cow with excellent milk production. Well-trained and friendly with people. Produces 25-30 liters per day.",
            image: "https://www.karooexports.com/wp-content/uploads/2019/05/bonsmara-cattle-kle-1.jpg",
            roots: 12,
            dateAdded: new Date(Date.now() - 86400000)
        },
        {
            id: 2,
            name: "Charlie",
            type: "goat",
            age: 2,
            price: 3500.00,
            seller: "Veld View Ranch",
            phone: "011 456 7890",
            province: "gauteng",
            area: "johannesburg",
            description: "Playful Nubian goat, great with kids and other animals. Excellent for milk or companionship. Vaccinated and healthy.",
            image: "https://www.karooexports.com/wp-content/uploads/2019/07/chandelier-boer-goat-studs.jpg",
            roots: 8,
            dateAdded: new Date(Date.now() - 172800000)
        },
        {
            id: 3,
            name: "Woolly",
            type: "sheep",
            age: 1.5,
            price: 2800.00,
            seller: "Mountain View Farm",
            phone: "021 789 1234",
            province: "western-cape",
            area: "stellenbosch",
            description: "Young Merino sheep with soft, high-quality wool. Perfect for small farm operations. Excellent breeding potential.",
            image: "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=400&h=300&fit=crop",
            roots: 5,
            dateAdded: new Date(Date.now() - 259200000)
        },
        {
            id: 4,
            name: "Bacon",
            type: "pig",
            age: 1,
            price: 4200.00,
            seller: "Sunrise Piggery",
            phone: "051 234 5678",
            province: "free-state",
            area: "bloemfontein",
            description: "Friendly Yorkshire pig, great for breeding. Very social and easy to handle. Excellent meat quality.",
            image: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=400&h=300&fit=crop",
            roots: 15,
            dateAdded: new Date(Date.now() - 345600000)
        },
        {
            id: 5,
            name: "Thunder",
            type: "horse",
            age: 5,
            price: 45000.00,
            seller: "Equestrian Dreams",
            phone: "033 567 8901",
            province: "kwazulu-natal",
            area: "pietermaritzburg",
            description: "Beautiful Arabian stallion with excellent breeding lineage. Well-trained for riding and competition.",
            image: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=400&h=300&fit=crop",
            roots: 23,
            dateAdded: new Date(Date.now() - 432000000)
        },
        {
            id: 6,
            name: "Henrietta",
            type: "chicken",
            age: 0.5,
            price: 250.00,
            seller: "Happy Hens Farm",
            phone: "013 890 1234",
            province: "mpumalanga",
            area: "nelspruit",
            description: "Rhode Island Red hen, excellent layer producing 5-6 eggs per week. Healthy and disease-free.",
            image: "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=400&h=300&fit=crop",
            roots: 7,
            dateAdded: new Date(Date.now() - 518400000)
        },
        {
            id: 7,
            name: "Storm",
            type: "horse",
            age: 8,
            price: 32000.00,
            seller: "Galloping Acres",
            phone: "041 345 6789",
            province: "eastern-cape",
            area: "port-elizabeth",
            description: "Experienced gelding, perfect for trail riding. Calm temperament, great with children. Well-maintained hooves and teeth.",
            image: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=400&h=300&fit=crop",
            roots: 11,
            dateAdded: new Date(Date.now() - 604800000)
        },
        {
            id: 8,
            name: "Daisy Chain",
            type: "cow",
            age: 4,
            price: 18500.00,
            seller: "Green Pastures",
            phone: "015 678 9012",
            province: "limpopo",
            area: "polokwane",
            description: "Prime Angus cow, excellent for beef production. Well-muscled with good confirmation. Ready for breeding.",
            image: "https://www.karooexports.com/wp-content/uploads/2019/05/bonsmara-cattle-kle-1.jpg",
            roots: 19,
            dateAdded: new Date(Date.now() - 691200000)
        }
    ];
    
    applyFiltersAndSort();
});

// Slideshow functionality
let slideIndex = 0;
let slideTimer;

// Show slides
function showSlides(n) {
    const slides = document.getElementsByClassName("slide");
    const dots = document.getElementsByClassName("dot");

    if (n > slides.length) { slideIndex = 1 }
    if (n < 1) { slideIndex = slides.length }

    // Hide all slides
    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    // Remove active class from all dots
    for (let i = 0; i < dots.length; i++) {
        dots[i].classList.remove("active-dot");
    }

    // Show current slide + highlight dot
    slides[slideIndex - 1].style.display = "block";
    if (dots.length > 0) {
        dots[slideIndex - 1].classList.add("active-dot");
    }
}

// Next/Prev controls
function changeSlide(n) {
    clearTimeout(slideTimer);
    showSlides(slideIndex += n);
    autoSlides();
}

// Dot controls
function setSlide(n) {
    clearTimeout(slideTimer);
    showSlides(slideIndex = n);
    autoSlides();
}

// Auto-play function
function autoSlides() {
    const slides = document.getElementsByClassName("slide");
    slideIndex++;
    if (slideIndex > slides.length) { slideIndex = 1 }
    showSlides(slideIndex);
    slideTimer = setTimeout(autoSlides, 4000); // Change every 4s
}

// Initialize slideshow
document.addEventListener("DOMContentLoaded", () => {
    slideIndex = 0;
    autoSlides();
});

