class InventoryManager {
    constructor() {
        this.inventory = JSON.parse(localStorage.getItem('inventory')) || [];
        this.form = document.getElementById('inventoryForm');
        this.itemList = document.getElementById('inventoryList');
        this.categoryDropdown = document.getElementById('itemCategory');
        this.newCategoryInput = document.getElementById('newCategory');
        this.addCategoryBtn = document.getElementById('addCategoryBtn');

        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.addCategoryBtn.addEventListener('click', () => this.addCustomCategory());

        this.displayInventory();
    }

    handleSubmit(e) {
        e.preventDefault();

        const itemName = document.getElementById('itemName').value;
        const quantity = parseInt(document.getElementById('itemQuantity').value);
        const price = parseFloat(document.getElementById('itemPrice').value);
        const category = document.getElementById('itemCategory').value;

        // Validate category selection
        if (!category) {
            alert('Please select a category!');
            return;
        }

        const item = {
            id: Date.now(),
            name: itemName,
            quantity: quantity,
            price: price,
            category: category
        };

        this.inventory.push(item);
        this.saveToLocalStorage();
        this.displayInventory();
        this.form.reset();
    }

    addCustomCategory() {
        const newCategory = this.newCategoryInput.value.trim();
        if (newCategory === '') {
            alert('Please enter a category name.');
            return;
        }

        // Create a new option element and add it to the dropdown
        const option = document.createElement('option');
        option.value = newCategory;
        option.textContent = newCategory;

        this.categoryDropdown.appendChild(option);

        // Optionally, clear the input field after adding the category
        this.newCategoryInput.value = '';
    }

    deleteItem(id) {
        this.inventory = this.inventory.filter(item => item.id !== id);
        this.saveToLocalStorage();
        this.displayInventory();
    }

    displayInventory(filteredInventory = null) {
        const inventoryToDisplay = filteredInventory || this.inventory;
        this.itemList.innerHTML = '';

        inventoryToDisplay.forEach(item => {
            const row = document.createElement('tr');
            const totalValue = (item.quantity * item.price).toFixed(2);

            row.innerHTML = `
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>$${item.price.toFixed(2)}</td>
                <td>$${totalValue}</td>
                <td>${item.category}</td>
                <td>
                    <button class="delete-btn" onclick="inventoryManager.deleteItem(${item.id})">
                        Delete
                    </button>
                </td>
            `;

            this.itemList.appendChild(row);
        });
    }


    saveToLocalStorage() {
        localStorage.setItem('inventory', JSON.stringify(this.inventory));
    }

    searchItem(name) {
        const searchResults = this.inventory.filter(item =>
            item.name.toLowerCase().includes(name.toLowerCase())
        );
        this.displayInventory(searchResults);
    }

    filterByQuantity(min, max) {
        const filteredItems = this.inventory.filter(item =>
            item.quantity >= min && item.quantity <= max
        );
        this.displayInventory(filteredItems);
    }

    filterByPrice(min, max) {
        const filteredItems = this.inventory.filter(item =>
            item.price >= min && item.price <= max
        );
        this.displayInventory(filteredItems);
    }

    clearFilters() {
        this.displayInventory();
    }

}

document.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        btn.style.setProperty("--x", `${x}px`);
        btn.style.setProperty("--y", `${y}px`);
    });
});

document.getElementById('searchBtn').addEventListener('click', () => {
    const name = document.getElementById('searchItem').value;
    inventoryManager.searchItem(name);
});

document.getElementById('filterQuantityBtn').addEventListener('click', () => {
    const min = parseInt(document.getElementById('minQuantity').value) || 0;
    const max = parseInt(document.getElementById('maxQuantity').value) || Infinity;
    inventoryManager.filterByQuantity(min, max);
});

document.getElementById('filterPriceBtn').addEventListener('click', () => {
    const min = parseFloat(document.getElementById('minPrice').value) || 0;
    const max = parseFloat(document.getElementById('maxPrice').value) || Infinity;
    inventoryManager.filterByPrice(min, max);
});

document.getElementById('clearFiltersBtn').addEventListener('click', () => {
    inventoryManager.clearFilters();
});



// Initialize the inventory manager
const inventoryManager = new InventoryManager();
