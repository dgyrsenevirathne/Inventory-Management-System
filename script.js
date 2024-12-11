class InventoryManager {
    constructor() {
        this.inventory = JSON.parse(localStorage.getItem('inventory')) || [];
        this.form = document.getElementById('inventoryForm');
        this.itemList = document.getElementById('inventoryList');
        this.categoryDropdown = document.getElementById('itemCategory');
        this.newCategoryInput = document.getElementById('newCategory');
        this.addCategoryBtn = document.getElementById('addCategoryBtn');
        this.editingId = null; // Tracks the ID of the item being edited
        this.stockThreshold = 5; // Set the threshold for stock alert

        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.addCategoryBtn.addEventListener('click', () => this.addCustomCategory());

        this.displayInventory();
        this.checkStockLevels(); // Check stock levels on load
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

        if (this.editingId) {
            // Update existing item
            const itemIndex = this.inventory.findIndex(item => item.id === this.editingId);
            if (itemIndex !== -1) {
                this.inventory[itemIndex] = {
                    id: this.editingId,
                    name: itemName,
                    quantity: quantity,
                    price: price,
                    category: category,
                };
            }
            this.editingId = null; // Reset editing ID
        } else {
            // Add new item
            const item = {
                id: Date.now(),
                name: itemName,
                quantity: quantity,
                price: price,
                category: category
            };
            this.inventory.push(item);
        }

        this.saveToLocalStorage();
        this.displayInventory();
        this.form.reset();
        this.checkStockLevels(); // Recheck stock levels after adding/updating item
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

    editItem(id) {
        const item = this.inventory.find(item => item.id === id);
        if (!item) return;

        // Populate form fields with item details
        document.getElementById('itemName').value = item.name;
        document.getElementById('itemQuantity').value = item.quantity;
        document.getElementById('itemPrice').value = item.price;
        document.getElementById('itemCategory').value = item.category;

        this.editingId = id; // Set editing ID
    }

    deleteItem(id) {
        this.inventory = this.inventory.filter(item => item.id !== id);
        this.saveToLocalStorage();
        this.displayInventory();
        this.checkStockLevels(); // Recheck stock levels after deleting item
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
                    <button class="edit-btn" onclick="inventoryManager.editItem(${item.id})">Edit</button>
                    <button class="delete-btn" onclick="inventoryManager.deleteItem(${item.id})">Delete</button>
                </td>
            `;

            this.itemList.appendChild(row);
        });
    }

    saveToLocalStorage() {
        localStorage.setItem('inventory', JSON.stringify(this.inventory));
    }

    checkStockLevels() {
        const lowStockItems = this.inventory.filter(item => item.quantity < this.stockThreshold);
        if (lowStockItems.length > 0) {
            alert('Warning: Some items have low stock!');
            lowStockItems.forEach(item => {
                alert(`${item.name} has only ${item.quantity} left in stock.`);
            });
        }
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

    exportToCSV() {
        const headers = ["Item Name,Quantity,Price,Total Value,Category"];
        const rows = this.inventory.map(item => {
            const totalValue = (item.quantity * item.price).toFixed(2);
            return `${item.name},${item.quantity},${item.price.toFixed(2)},${totalValue},${item.category}`;
        });

        const csvContent = [headers.join("\n"), rows.join("\n")].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "inventory.csv");
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    importFromCSV(file) {
        const reader = new FileReader();

        reader.onload = (event) => {
            const csvData = event.target.result;
            const rows = csvData.split("\n").slice(1); // Skip the header row

            rows.forEach(row => {
                const [name, quantity, price, , category] = row.split(",");
                if (name && quantity && price && category) {
                    this.inventory.push({
                        id: Date.now() + Math.random(), // Generate a unique ID
                        name: name.trim(),
                        quantity: parseInt(quantity.trim()),
                        price: parseFloat(price.trim()),
                        category: category.trim()
                    });
                }
            });

            this.saveToLocalStorage();
            this.displayInventory();
        };

        reader.readAsText(file);
    }

    generateReports() {
        const totalValue = this.inventory.reduce((sum, item) => sum + item.quantity * item.price, 0);

        const mostValuableItem = this.inventory.reduce((max, item) =>
            (item.quantity * item.price > max.quantity * max.price ? item : max),
            { quantity: 0, price: 0 });

        const leastValuableItem = this.inventory.reduce((min, item) =>
            (item.quantity * item.price < min.quantity * min.price ? item : min),
            { quantity: Infinity, price: Infinity });

        // Prepare data for charts
        const stockLevels = this.inventory.map(item => item.quantity);
        const prices = this.inventory.map(item => item.price);
        const labels = this.inventory.map(item => item.name);

        return {
            totalValue: totalValue.toFixed(2),
            mostValuableItem,
            leastValuableItem,
            stockLevels,
            prices,
            labels
        };
    }

    renderCharts(stockLevels, prices, labels) {
        const ctxStock = document.getElementById('inventoryStockChart').getContext('2d');
        const ctxPrice = document.getElementById('inventoryPriceChart').getContext('2d');

        // Stock Levels Chart
        new Chart(ctxStock, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Stock Levels',
                    data: stockLevels,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Stock Levels'
                    }
                }
            }
        });

        // Prices Chart
        new Chart(ctxPrice, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Prices',
                    data: prices,
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Price Trends'
                    }
                }
            }
        });
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

document.getElementById('exportCsvBtn').addEventListener('click', () => {
    inventoryManager.exportToCSV();
});

document.getElementById('importCsvBtn').addEventListener('click', () => {
    const fileInput = document.getElementById('importCsvInput');
    if (fileInput.files.length === 0) {
        alert('Please select a CSV file to import.');
        return;
    }
    const file = fileInput.files[0];
    inventoryManager.importFromCSV(file);
});

document.getElementById('generateReportBtn').addEventListener('click', () => {
    const reports = inventoryManager.generateReports();

    alert(`Total Inventory Value: $${reports.totalValue}`);
    alert(`Most Valuable Item: ${reports.mostValuableItem.name} - $${(reports.mostValuableItem.quantity * reports.mostValuableItem.price).toFixed(2)}`);
    alert(`Least Valuable Item: ${reports.leastValuableItem.name} - $${(reports.leastValuableItem.quantity * reports.leastValuableItem.price).toFixed(2)}`);

    // Render charts with the new data
    inventoryManager.renderCharts(reports.stockLevels, reports.prices, reports.labels);
});


// Initialize the inventory manager
const inventoryManager = new InventoryManager();
