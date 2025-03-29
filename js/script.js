document.addEventListener('DOMContentLoaded', function() {
  
  const sections = document.querySelectorAll(".section");
  const mainSection = document.querySelector(".section.main");
  const recycleSection = document.querySelector(".section.recycle");
  const upcycleSection = document.querySelector(".section.upcycle");
  const customizationSection = document.querySelector(".section.customization");

  const secondScreen = document.querySelector(".second_screen");
  const thirdScreen = document.querySelector(".third_screen"); 
    const fourthScreen = document.querySelector(".fourth_screen"); 

  const recycle_button = document.getElementById("recycle_button");
  const upcycle_button = document.getElementById("upcycle_button");
  const customization_button = document.getElementById("customization_button");

  const recycle_back = document.getElementById("recycle_back");
  const upcycle_back = document.getElementById("upcycle_back");           
  const customization_back = document.getElementById("customization_back"); 

  
  function showSection(sectionToShow) {
      
      sections.forEach(section => {
          section.classList.remove('visible');
      });
      
      if (sectionToShow) {
          sectionToShow.classList.add('visible');
      }

      
    if (secondScreen && thirdScreen && fourthScreen) { 
        if (sectionToShow === mainSection) {
            
            secondScreen.style.display = ''; 
            thirdScreen.style.display = '';
            fourthScreen.style.display = ''; 
            
            
            
        } else {
            
            
            
            secondScreen.style.display = 'none';
            thirdScreen.style.display = 'none';
            fourthScreen.style.display = 'none';
        }
    }
    
  }

  
  if (recycle_button && recycleSection) {
      recycle_button.addEventListener("click", () => {
          showSection(recycleSection);
      });
  }

  if (upcycle_button && upcycleSection) {
      upcycle_button.addEventListener("click", () => {
          showSection(upcycleSection);
      });
  }

  if (customization_button && customizationSection) {
      customization_button.addEventListener("click", () => {
          showSection(customizationSection);
      });
  }

  
  if (recycle_back && mainSection) {
      recycle_back.addEventListener("click", () => {
          showSection(mainSection); 
      });
  }

  if (upcycle_back && mainSection) {
      upcycle_back.addEventListener("click", () => {
          showSection(mainSection); 
      });
  }

  if (customization_back && mainSection) {
      customization_back.addEventListener("click", () => {
          showSection(mainSection); 
      });
  }

  
  

  
  var gifGroups = document.querySelectorAll('.gif_group');
  gifGroups.forEach(function(win) {
      makeDraggable(win);
      addCloseHandler(win);
  });

  
  const gifs = document.querySelectorAll(".gif_group");
  gifs.forEach(gif => {
      
      const rect = gif.getBoundingClientRect();
      const elementWidth = rect.width || gif.offsetWidth; 
      const elementHeight = rect.height || gif.offsetHeight;

      
      const maxX = window.innerWidth - elementWidth - 20; 
      const maxY = window.innerHeight - elementHeight - 20; 

      const random_x = Math.random() * maxX;
      const random_y = Math.random() * maxY;

      
      gif.style.left = `${Math.max(0, random_x)}px`;
      gif.style.top = `${Math.max(0, random_y)}px`;
  });

}); 


function makeDraggable(el) {
  var isDragging = false;
  var offsetX, offsetY;
  var highestZ = 100; 

  const elImg = el.querySelector ("img");
  elImg.addEventListener('mousedown', e=>e.preventDefault());
  elImg.addEventListener('mousemove', e=>e.preventDefault());


  el.addEventListener('mousedown', function(e) {
    e.preventDefault();
    
    if (e.target.closest('.close-btn')) return;

    isDragging = true;
    
    const rect = el.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;

    
    highestZ++;
    el.style.zIndex = highestZ;
    el.style.cursor = 'grabbing'; 
  });

  document.addEventListener('mousemove', function(e) {
      if (!isDragging) return;
      
      let newLeft = e.clientX - offsetX;
      let newTop = e.clientY - offsetY;

      
      const parentRect = el.parentElement.getBoundingClientRect(); 
      newLeft = Math.max(0, Math.min(newLeft, parentRect.width - el.offsetWidth));
      newTop = Math.max(0, Math.min(newTop, parentRect.height - el.offsetHeight));


      el.style.left = newLeft + 'px';
      el.style.top  = newTop + 'px';
  });

  document.addEventListener('mouseup', function() {
      if (isDragging) {
           isDragging = false;
           el.style.cursor = 'move'; 
      }
  });

   
  el.style.cursor = 'move';
}

function addCloseHandler(el) {
  var closeBtn = el.querySelector('.close-btn');
  if (closeBtn) {
      closeBtn.addEventListener('click', function() {
          
          
           el.parentNode.removeChild(el); 
      });
  }
}

















































































































































































































