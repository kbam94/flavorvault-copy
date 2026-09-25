document.addEventListener('DOMContentLoaded', () => {
    const recipeList = document.getElementById('recipe-list');
    const recipeForm = document.getElementById('recipe-form');
    const recipeModal = document.getElementById('recipe-modal');
    const addRecipeBtn = document.getElementById('add-recipe-btn');
    const closeModalBtn = document.getElementById('close-modal');
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');

    let recipes = JSON.parse(localStorage.getItem('recipes')) || [];

    const saveToStorage = () => {
        localStorage.setItem('recipes', JSON.stringify(recipes));
    };

    const renderRecipes = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const filterCat = categoryFilter.value;

        recipeList.innerHTML = '';

        const filtered = recipes.filter(r => {
            const matchesSearch = r.name.toLowerCase().includes(searchTerm);
            const matchesCat = filterCat === 'All' || r.category === filterCat;
            return matchesSearch && matchesCat;
        });

        if (filtered.length === 0) {
            recipeList.innerHTML = '<p style="text-align:center; color:var(--text-dim); margin-top:20px;">No recipes found. Add some!</p>';
            return;
        }

        filtered.forEach(recipe => {
            const card = document.createElement('div');
            card.className = `recipe-card ${recipe.favorite ? 'favorite' : ''}`;
            card.innerHTML = `
                <h3>${recipe.name}</h3>
                <div class="meta">
                    <span class="category-tag">${recipe.category}</span>
                    <span>⏱ ${recipe.time} mins</span>
                </div>
                <div style="font-size: 0.9rem; color: var(--text-dim); margin-bottom: 10px;">
                    <strong>Ingredients:</strong> ${recipe.ingredients.split('\n').slice(0, 2).join(', ')}${recipe.ingredients.split('\n').length > 2 ? '...' : ''}
                </div>
                <div class="actions">
                    <button class="btn-small btn-fav ${recipe.favorite ? 'active' : ''}" onclick="toggleFavorite('${recipe.id}')">
                        ${recipe.favorite ? '★ Favorited' : '☆ Favorite'}
                    </button>
                    <button class="btn-small btn-edit" onclick="editRecipe('${recipe.id}')">Edit</button>
                    <button class="btn-small btn-delete" onclick="deleteRecipe('${recipe.id}')">Delete</button>
                </div>
            `;
            recipeList.appendChild(card);
        });
    };

    const openModal = (recipe = null) => {
        recipeModal.style.display = 'flex';
        if (recipe) {
            document.getElementById('modal-title').innerText = 'Edit Recipe';
            document.getElementById('recipe-id').value = recipe.id;
            document.getElementById('recipe-name').value = recipe.name;
            document.getElementById('recipe-category').value = recipe.category;
            document.getElementById('recipe-time').value = recipe.time;
            document.getElementById('recipe-ingredients').value = recipe.ingredients;
            document.getElementById('recipe-instructions').value = recipe.instructions;
        } else {
            document.getElementById('modal-title').innerText = 'Add Recipe';
            recipeForm.reset();
            document.getElementById('recipe-id').value = '';
        }
    };

    const closeModal = () => {
        recipeModal.style.display = 'none';
    };

    recipeForm.onsubmit = (e) => {
        e.preventDefault();
        const id = document.getElementById('recipe-id').value || Date.now().toString();
        const recipeData = {
            id,
            name: document.getElementById('recipe-name').value,
            category: document.getElementById('recipe-category').value,
            time: document.getElementById('recipe-time').value,
            ingredients: document.getElementById('recipe-ingredients').value,
            instructions: document.getElementById('recipe-instructions').value,
            favorite: recipes.find(r => r.id === id)?.favorite || false
        };

        const index = recipes.findIndex(r => r.id === id);
        if (index > -1) {
            recipes[index] = recipeData;
        } else {
            recipes.push(recipeData);
        }

        saveToStorage();
        renderRecipes();
        closeModal();
    };

    window.toggleFavorite = (id) => {
        const recipe = recipes.find(r => r.id === id);
        if (recipe) {
            recipe.favorite = !recipe.favorite;
            saveToStorage();
            renderRecipes();
        }
    };

    window.deleteRecipe = (id) => {
        if (confirm('Delete this recipe?')) {
            recipes = recipes.filter(r => r.id !== id);
            saveToStorage();
            renderRecipes();
        }
    };

    window.editRecipe = (id) => {
        const recipe = recipes.find(r => r.id === id);
        if (recipe) openModal(recipe);
    };

    addRecipeBtn.onclick = () => openModal();
    closeModalBtn.onclick = closeModal;
    searchInput.oninput = renderRecipes;
    categoryFilter.onchange = renderRecipes;

    // Close modal when clicking outside content
    recipeModal.onclick = (e) => {
        if (e.target === recipeModal) closeModal();
    };

    renderRecipes();
});