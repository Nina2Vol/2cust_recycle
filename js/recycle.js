const recycleBlock = document.querySelector (".recycle");
const resultModal = document.getElementById('resultModal');
const timeResult = document.getElementById('timeResult');
const scoreResult = document.getElementById('scoreResult');
const closeModal = document.getElementById('closeModal');

const itemImages = {
    glass: 'img/glass.png',
    plastic: 'img/plastic.png',
    textile: 'img/textile.png',
    paper: 'img/paper.png'
};

const itemTypes = Object.keys(itemImages);
const itemsCount = 5; //потом можно увеличить//
let itemsRemaining = itemsCount * itemTypes.length;
let correct = 0;
let incorrect = 0;
let startTime;
let draggedItem = null;
let draggedItemType = null;

function createItems() {
    startTime = new Date();
    
    itemTypes.forEach((type, index) => {
        for (let j = 0; j < itemsCount; j++) {
            setTimeout(() => {
                createItem(type);
            }, j * 100 + index * 300);
        }
    });
}

function createItem(type) {
    const item = document.createElement('div');
    item.className = 'item';
    item.dataset.type = type;
    item.style.transform = `rotate(${Math.random()*360}deg)` ;
    
    const img = document.createElement('img');
    img.src = itemImages[type];
    img.draggable = false;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'contain';
    item.appendChild(img);
    
    const x = Math.random() * (window.innerWidth - 100) + 50;
    const y = Math.random() * (window.innerHeight / 2) + 50;
    
    item.style.left = `${x}px`;
    item.style.top = `${y}px`;
    
    item.addEventListener('mousedown', startDrag);
    
    recycleBlock.appendChild(item);
}

function startDrag(e) {
    e.preventDefault();
    draggedItem = e.currentTarget;
    draggedItemType = draggedItem.dataset.type;
    draggedItem.style.cursor = 'grabbing';
    draggedItem.style.zIndex = '2';
    
    document.addEventListener('mousemove', dragItem);
    document.addEventListener('mouseup', stopDrag);
}

function dragItem(e) {
    if (!draggedItem) return;
    
    let x = e.clientX - draggedItem.offsetWidth / 2;
    let y = e.clientY - draggedItem.offsetHeight / 2;

    draggedItem.style.left = `${x}px`;
    draggedItem.style.top = `${y}px`;
}

function dragItem(e) {
    if (!draggedItem) return;
    
    let x, y;
    if (e.type === 'touchmove') {
        x = e.touches[0].clientX - draggedItem.offsetWidth / 2;
        y = e.touches[0].clientY - draggedItem.offsetHeight / 2;
    } else {
        x = e.clientX - draggedItem.offsetWidth / 2;
        y = e.clientY - draggedItem.offsetHeight / 2;
    }
    
    draggedItem.style.left = `${x}px`;
    draggedItem.style.top = `${y}px`;
}


function stopDrag(e) {
    if (!draggedItem) return;
    
    document.removeEventListener('mousemove', dragItem);
    document.removeEventListener('mouseup', stopDrag);
    
    draggedItem.style.cursor = 'grab';
    draggedItem.style.zIndex = '1';
    
    const element = document.elementFromPoint (e.clientX, e.clientY);
    let droppedBin;
    if (element) {
        droppedBin = element.closest (".bin");
    }
    console.log ("bin", element); 
    
    if (droppedBin) {
        const binType = droppedBin.dataset.type;
        
        draggedItem.style.transition = 'transform 0.3s, opacity 0.3s';
        draggedItem.style.transform = 'scale(0.5)';
        draggedItem.style.opacity = '0';
        
        setTimeout(() => {
            if (binType === draggedItemType) {
                correct++;
            } else {
                incorrect++;
            }
            draggedItem.remove();
            itemsRemaining--;

            draggedItem = null;
            draggedItemType = null;
            
            if (itemsRemaining === 0) {
                showResults();
            }
        }, 300);
    }
}

function showResults() {
    const endTime = new Date();
    const timeDiff = (endTime - startTime) / 1000;
    const minutes = Math.floor(timeDiff / 60);
    const seconds = Math.floor(timeDiff % 60);
    
    timeResult.textContent = `ЗА ${minutes}МИН ${seconds}СЕК`;
    scoreResult.textContent = `Правильно: ${correct} | Неправильно: ${incorrect}`;
    resultModal.style.display = 'flex';
}

closeModal.addEventListener('click', function() {
    resultModal.style.display = 'none';
    location.reload();
});

createItems();
