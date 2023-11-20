const allFilterItems = document.querySelectorAll('.filter-item');
const allFilterBtns = document.querySelectorAll('.filter-btn');

window.addEventListener('DOMContentLoaded', () => {
    allFilterBtns[0].classList.add('active-btn');
});

allFilterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
        showFilteredContent(btn);
    });
});

function showFilteredContent(btn){
    allFilterItems.forEach((item) => {
        if(item.classList.contains(btn.id)){
            resetActiveBtn();
            btn.classList.add('active-btn');
            item.style.display = "block";
        } else {
            item.style.display = "none";
        }
    });
}

function resetActiveBtn(){
    allFilterBtns.forEach((btn) => {
        btn.classList.remove('active-btn');
    });
}
//search
function searchProducts() {
    var input, filter, items, item, i, txtValue;
    input = document.getElementById("search-input");
    filter = input.value.toUpperCase();
    items = document.getElementsByClassName("filter-item");

    for (i = 0; i < items.length; i++) {
        item = items[i];
        txtValue = item.textContent || item.innerText;

        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            item.style.display = "";
        } else {
            item.style.display = "none";
        }
    }
}


//filter
document.getElementById('sort-by').addEventListener('change', function () {
    let selectedValue = this.value;
    sortProducts(selectedValue);
});

function sortProducts(order) {
    let itemsContainer = document.querySelector('.filter-items');
    let items = Array.from(document.querySelectorAll('.filter-item'));

    items.sort(function (a, b) {
        let priceA = parseFloat(a.querySelector('.new-price').innerText.split(' ')[1]);
        let priceB = parseFloat(b.querySelector('.new-price').innerText.split(' ')[1]);

        if (order === 'low-to-high') {
            return priceA - priceB;
        } else {
            return priceB - priceA;
        }
    });

    itemsContainer.innerHTML = '';
    items.forEach(function (item) {
        itemsContainer.appendChild(item);
    });
}

