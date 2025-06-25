// TechEase Main JS
let problemsData = {};

// Fetch problems from JSON
async function loadProblems() {
  const res = await fetch('problems.json');
  problemsData = await res.json();
  renderCategoryCards();
}

// Group problems by category and render category sections with their problems
function renderCategoryCards() {
  const cards = document.getElementById('popular-cards');
  if (!cards) return;
  // Group problems by category
  const grouped = {};
  Object.values(problemsData).forEach(problem => {
    if (!grouped[problem.category]) grouped[problem.category] = [];
    grouped[problem.category].push(problem);
  });
  cards.innerHTML = '';
  Object.keys(grouped).forEach(category => {
    const section = document.createElement('div');
    section.className = 'category-section';
    section.innerHTML = `<h3 style="margin-top:2rem;">${category}</h3>`;
    const cardRow = document.createElement('div');
    cardRow.className = 'card-row';
    grouped[category].forEach(problem => {
      const card = document.createElement('div');
      card.className = 'card compact';
      card.innerHTML = `<div class="card-icon" style="font-size:1.5rem;">${problem.icon || '💡'}</div><div style="font-weight:500;font-size:1rem;line-height:1.2;">${problem.title}</div>`;
      card.onclick = () => showProblem(problem.key, true);
      cardRow.appendChild(card);
    });
    section.appendChild(cardRow);
    cards.appendChild(section);
  });
}

// Render problem cards
function renderCards(problems) {
  const cards = document.querySelector('.cards');
  cards.innerHTML = '';
  problems.forEach(problem => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<div class="card-icon">${problem.icon || '💡'}</div><div><strong>${problem.title}</strong></div><div style="margin-top:0.5rem; color:#555;">${problem.short || ''}</div>`;
    card.onclick = () => showProblem(problem.key);
    cards.appendChild(card);
  });
}

// Show all problems
function showAllProblems() {
  renderCards(Object.values(problemsData));
  document.getElementById('showAllBtn').style.display = 'none';
}

// Back to Top button
const backToTopBtn = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
  if (window.scrollY > 300) backToTopBtn.style.display = 'block';
  else backToTopBtn.style.display = 'none';
});
backToTopBtn.onclick = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  document.getElementById('main-content').focus();
};

// Notification system
function showNotification(msg, type = 'info') {
  const area = document.getElementById('notification-area');
  area.textContent = msg;
  area.className = 'notification ' + type;
  setTimeout(() => { area.textContent = ''; area.className = ''; }, 4000);
}

// Modal close on Escape/click outside
window.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeAnyModal();
});
document.addEventListener('click', e => {
  const modalBg = document.querySelector('.modal-bg');
  if (modalBg && e.target === modalBg) closeAnyModal();
});
function closeAnyModal() {
  const modalBg = document.querySelector('.modal-bg');
  if (modalBg) {
    document.body.removeChild(modalBg);
    document.body.classList.remove('modal-open');
  }
}

// Modal utility
function closeModal(btn) {
  const modal = btn.closest('.modal-bg');
  if (modal) {
    modal.remove();
    document.body.classList.remove('modal-open');
  }
}
function trapFocus(modal) {
  const focusable = modal.querySelectorAll('input, textarea, select, button, [tabindex]:not([tabindex="-1"])');
  if (!focusable.length) return;
  let first = focusable[0], last = focusable[focusable.length-1];
  modal.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
      if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus(); } }
      else { if (document.activeElement === last) { e.preventDefault(); first.focus(); } }
    }
    if (e.key === 'Escape') closeModal(first);
  });
  setTimeout(() => first.focus(), 50);
}

// Show problem details (accordion)
function showProblem(key, isPopular) {
  const problem = problemsData[key];
  if (!problem) return;
  const modal = document.createElement('div');
  modal.className = 'modal-bg';
  // Special handling for info-only sets (like info_smc_reset/info_nvram_reset)
  if (key === 'info_smc_reset' || key === 'info_nvram_reset') {
    const questionsHtml = problem.questions && problem.questions.length
      ? `<div style='margin-bottom:1rem;'><strong>When to use:</strong><ul style='margin:0 0 0.5rem 1.2rem;padding:0;'>${problem.questions.map(q=>`<li>${q}</li>`).join('')}</ul></div>`
      : '';
    const descHtml = problem.description ? `<div style='margin-bottom:1rem;'>${problem.description}</div>` : '';
    const stepsHtml = problem.steps && problem.steps.length
      ? `<div class="accordion">${problem.steps.map((step,i)=>`<div class='accordion-item'><div class='accordion-title'>Step ${i+1}</div><div class='accordion-content'>${step.replace(/\n/g,'<br>')}</div></div>`).join('')}</div>`
      : '';
    modal.innerHTML = `<div class="modal" role="dialog" aria-modal="true" tabindex="-1"><h2>${problem.title}</h2>${questionsHtml}${descHtml}${stepsHtml}<button class='btn' onclick='closeModal(this)'>Close</button></div>`;
    Object.assign(modal.style, {position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(24,49,83,0.45)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000});
    document.body.appendChild(modal);
    document.body.classList.add('modal-open');
    setTimeout(() => { modal.querySelector('.modal').focus(); }, 100);
    modal.querySelectorAll('.accordion-title').forEach(title => {
      title.addEventListener('click', function() {
        this.nextElementSibling.classList.toggle('active');
      });
    });
    return;
  }
  // Add questions label and list
  const questionsHtml = problem.questions && problem.questions.length
    ? `<div style='margin-bottom:1rem;'><strong>Questions:</strong><ul style='margin:0 0 0.5rem 1.2rem;padding:0;'>${problem.questions.map(q=>`<li>${q}</li>`).join('')}</ul></div>`
    : '';
  modal.innerHTML = `<div class="modal" role="dialog" aria-modal="true" tabindex="-1"><h2>${problem.title}</h2>${questionsHtml}<div class="accordion">${problem.solution_steps.map((step,i)=>`<div class='accordion-item'><div class='accordion-title'>Step ${i+1}</div><div class='accordion-content'>${step}</div></div>`).join('')}</div><div class='feedback'><span>Was this helpful?</span> <button onclick='feedbackYes(this)'>Yes</button> <button onclick='feedbackNo(this)'>No</button></div><button class='btn' onclick='closeModal(this)'>Close</button></div>`;
  Object.assign(modal.style, {position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(24,49,83,0.45)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000});
  document.body.appendChild(modal);
  document.body.classList.add('modal-open');
  setTimeout(() => { modal.querySelector('.modal').focus(); }, 100);
  // Add accordion toggle logic
  modal.querySelectorAll('.accordion-title').forEach(title => {
    title.addEventListener('click', function() {
      this.nextElementSibling.classList.toggle('active');
    });
  });
}
function feedbackYes(btn) {
  btn.parentNode.innerHTML = '<span>Thank you for your feedback! 😊</span>';
}
function feedbackNo(btn) {
  btn.parentNode.innerHTML = '<span>We appreciate your feedback and will improve this solution. 🙏</span>';
}

// Contact Modal
function openContactModal() {
  if (document.querySelector('.modal-bg')) return;
  document.body.classList.add('modal-open');
  const modalBg = document.createElement('div');
  modalBg.className = 'modal-bg';
  modalBg.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true">
      <div class="modal-content" style="display:flex;flex-direction:column;align-items:center;">
        <button class="modal-close" aria-label="Close" onclick="closeModal(this)">&times;</button>
        <h2 style="margin-bottom:0.7rem;">Contact Us</h2>
        <form id="contactForm" style="display:flex;flex-direction:column;align-items:center;width:100%;max-width:340px;gap:0.7rem;">
          <label for="contactProblemType" style="align-self:flex-start;">Problem Type</label>
          <input type="text" id="contactProblemType" name="problemType" placeholder="e.g. VPN, Printer, Email" required style="width:100%;">
          <label for="contactName" style="align-self:flex-start;">Name</label>
          <input type="text" id="contactName" name="name" required style="width:100%;">
          <label for="contactEmail" style="align-self:flex-start;">Email</label>
          <input type="email" id="contactEmail" name="email" required style="width:100%;">
          <label for="contactMsg" style="align-self:flex-start;">Message</label>
          <textarea id="contactMsg" name="message" rows="4" required style="width:100%;resize:vertical;"></textarea>
          <button type="submit" class="btn" style="width:100%;margin-top:1rem;">Send</button>
        </form>
      </div>
    </div>
  `;
  document.body.appendChild(modalBg);
  modalBg.querySelector('#contactForm').onsubmit = function(e) {
    e.preventDefault();
    showNotification('Thank you for contacting us! We will reply soon.','success');
    closeModal(modalBg.querySelector('.modal-close'));
  };
  trapFocus(modalBg.querySelector('.modal'));
}
// Feedback/Review Modal
function openFeedbackModal() {
  if (document.querySelector('.modal-bg')) return;
  document.body.classList.add('modal-open');
  const modalBg = document.createElement('div');
  modalBg.className = 'modal-bg';
  modalBg.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true">
      <div class="modal-content" style="display:flex;flex-direction:column;align-items:center;">
        <button class="modal-close" aria-label="Close" onclick="closeModal(this)">&times;</button>
        <h2 style="margin-bottom:0.7rem;">Customer Feedback</h2>
        <form id="feedbackForm" style="display:flex;flex-direction:column;align-items:center;width:100%;max-width:340px;gap:0.7rem;">
          <label for="feedbackName" style="align-self:flex-start;">Name</label>
          <input type="text" id="feedbackName" name="name" required style="width:100%;">
          <label for="feedbackMsg" style="align-self:flex-start;">Your Feedback</label>
          <textarea id="feedbackMsg" name="feedback" rows="4" required style="width:100%;resize:vertical;"></textarea>
          <label for="feedbackStars" style="align-self:flex-start;">How satisfied are you?</label>
          <div id="feedbackStars" style="display:flex;gap:0.3rem;margin-bottom:0.5rem;">
            <span class="star" data-value="1" tabindex="0" aria-label="1 star" style="font-size:2rem;cursor:pointer;">☆</span>
            <span class="star" data-value="2" tabindex="0" aria-label="2 stars" style="font-size:2rem;cursor:pointer;">☆</span>
            <span class="star" data-value="3" tabindex="0" aria-label="3 stars" style="font-size:2rem;cursor:pointer;">☆</span>
            <span class="star" data-value="4" tabindex="0" aria-label="4 stars" style="font-size:2rem;cursor:pointer;">☆</span>
            <span class="star" data-value="5" tabindex="0" aria-label="5 stars" style="font-size:2rem;cursor:pointer;">☆</span>
          </div>
          <input type="hidden" id="feedbackRating" name="rating" required>
          <button type="submit" class="btn" style="width:100%;margin-top:1rem;">Submit</button>
        </form>
      </div>
    </div>
  `;
  document.body.appendChild(modalBg);
  // Star rating logic
  const stars = modalBg.querySelectorAll('.star');
  const ratingInput = modalBg.querySelector('#feedbackRating');
  stars.forEach(star => {
    star.addEventListener('click', function() {
      const val = this.getAttribute('data-value');
      ratingInput.value = val;
      stars.forEach(s => s.textContent = s.getAttribute('data-value') <= val ? '★' : '☆');
    });
    star.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.click();
      }
    });
  });
  modalBg.querySelector('#feedbackForm').onsubmit = function(e) {
    e.preventDefault();
    if (!ratingInput.value) {
      showNotification('Please select a star rating.','error');
      return;
    }
    showNotification('Thank you for your feedback!','success');
    closeModal(modalBg.querySelector('.modal-close'));
  };
  trapFocus(modalBg.querySelector('.modal'));
}

// Search functionality
function searchProblems() {
  const q = document.getElementById('search').value.toLowerCase();
  const filtered = Object.values(problemsData).filter(p => p.title.toLowerCase().includes(q) || (p.short && p.short.toLowerCase().includes(q)));
  renderCards(filtered);
}

// Floating ChatBot logic
let chatBotOpen = false;
function openChatBot() {
  if (chatBotOpen) return;
  chatBotOpen = true;
  const botWindow = document.createElement('div');
  botWindow.id = 'floating-bot-window';
  botWindow.innerHTML = `
    <div class='bot-header'>IT self-support MiniBot <span class='bot-close' onclick='closeChatBot()'>&times;</span></div>
    <div class='bot-messages' id='bot-messages'></div>
    <form class='bot-input-area' onsubmit='return sendBotMessage(event)'>
      <input id='bot-user-input' type='text' placeholder='Search the categories...' autocomplete='off' />
      <button type='submit'>Send</button>
    </form>
  `;
  Object.assign(botWindow.style, {
    position:'fixed', right:'2rem', bottom:'5.5rem', left:'auto', width:'320px', background:'#fff', borderRadius:'12px', boxShadow:'0 4px 24px rgba(0,0,0,0.18)', zIndex:3000, overflow:'hidden', border:'1px solid #007bff', display:'flex', flexDirection:'column', minHeight:'320px', maxHeight:'60vh'
  });
  if(document.body.classList.contains('dark')) botWindow.style.background = '#232a36';
  document.body.appendChild(botWindow);
  setTimeout(()=>{
    addBotMessage("Hi! I'm ITself MiniBot. Search the categories or select one below:");
    addBotQuickReplies();
  }, 200);
}
function closeChatBot() {
  chatBotOpen = false;
  const win = document.getElementById('floating-bot-window');
  if(win) document.body.removeChild(win);
}
function addBotMessage(msg, fromUser) {
  const area = document.getElementById('bot-messages');
  if(!area) return;
  const div = document.createElement('div');
  div.className = fromUser ? 'bot-msg user' : 'bot-msg';
  div.innerHTML = msg;
  area.appendChild(div);
  area.scrollTop = area.scrollHeight;
}
function addBotQuickReplies() {
  const area = document.getElementById('bot-messages');
  if(!area) return;
  const quick = document.createElement('div');
  quick.className = 'bot-quick';
  // Show category names as quick replies
  const categories = Array.from(new Set(Object.values(problemsData).map(p => p.category)));
  quick.innerHTML = categories.map(cat => `<button onclick='botQuickCategory("${cat}")'>${cat}</button>`).join(' ');
  area.appendChild(quick);
}
function botQuickCategory(category) {
  addBotMessage(category, true);
  setTimeout(()=>{
    // List all problems in this category as clickable buttons
    const problems = Object.values(problemsData).filter(p => p.category === category);
    if(problems.length) {
      const list = problems.map(p => `<button class='bot-problem-btn' onclick='botShowProblemModal("${p.key}")' style='display:block;width:100%;margin:0.2em 0;padding:0.4em 0.7em;border-radius:8px;border:1px solid #1abc9c;background:#fff;color:#1abc9c;cursor:pointer;text-align:left;'>${p.title}</button>`).join('');
      addBotMessage(`<div>Problems in <strong>${category}</strong>:</div>${list}`);
    } else {
      addBotMessage("No problems found in this category.");
    }
  }, 500);
}
function botShowProblemModal(key) {
  showProblem(key, false);
}
async function sendBotMessage(e) {
  e.preventDefault();
  const input = document.getElementById('bot-user-input');
  const msg = input.value.trim();
  if(!msg) return false;
  addBotMessage(msg, true);
  input.value = '';
  // First, try to match a category
  const categories = Array.from(new Set(Object.values(problemsData).map(p => p.category)));
  const cat = categories.find(c => c.toLowerCase().includes(msg.toLowerCase()));
  if(cat) {
    botQuickCategory(cat);
    return false;
  }
  // Otherwise, fallback to problem search
  let found = false;
  if(problemsData) {
    for(const k in problemsData) {
      if(problemsData[k].title.toLowerCase().includes(msg.toLowerCase()) || (problemsData[k].short && problemsData[k].short.toLowerCase().includes(msg.toLowerCase()))) {
        // Add a button to open the modal
        addBotMessage(`<button class='bot-problem-btn' onclick='botShowProblemModal("${problemsData[k].key}")' style='display:block;width:100%;margin:0.2em 0;padding:0.4em 0.7em;border-radius:8px;border:1px solid #1abc9c;background:#fff;color:#1abc9c;cursor:pointer;text-align:left;'>${problemsData[k].title}</button>`);
        found = true;
        break;
      }
    }
  }
  if(!found) {
    addBotMessage("Let me check with AI...", false);
    getAIAnswer(msg).then(answer => {
      addBotMessage(answer);
    }).catch(() => {
      addBotMessage("Sorry, I couldn't get an answer from AI right now.");
    });
  }
  return false;
}

async function getAIAnswer(userMsg) {
  // Now using a local proxy server to securely call OpenAI API
  try {
    const res = await fetch('http://localhost:3001/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userMsg })
    });
    if (!res.ok) return 'AI service is currently unavailable. Please try again later.';
    const data = await res.json();
    return data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content
      ? data.choices[0].message.content
      : 'No answer found.';
  } catch (err) {
    return 'Network error. Please ensure the AI proxy server is running.';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadProblems();
  document.getElementById('search').addEventListener('input', searchProblems);
});

// Move this block to the very end of the file, after all functions are defined
window.addEventListener('DOMContentLoaded', function() {
  var toggleSwitch = document.getElementById('toggleModeSwitch');
  if (!toggleSwitch) return;
  var sunIcon = document.getElementById('sunIcon');
  var moonIcon = document.getElementById('moonIcon');
  function setModeIcons() {
    if (toggleSwitch.checked) {
      if (sunIcon) sunIcon.style.opacity = 0;
      if (moonIcon) moonIcon.style.opacity = 1;
    } else {
      if (sunIcon) sunIcon.style.opacity = 1;
      if (moonIcon) moonIcon.style.opacity = 0;
    }
  }
  // Set initial state from localStorage
  var darkPref = localStorage.getItem('darkMode');
  if (darkPref === '1' || (darkPref === null && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    toggleSwitch.checked = true;
    document.body.classList.add('dark');
  } else {
    toggleSwitch.checked = false;
    document.body.classList.remove('dark');
  }
  setModeIcons();
  toggleSwitch.addEventListener('change', function() {
    if (this.checked) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    localStorage.setItem('darkMode', this.checked ? '1' : '0');
    setModeIcons();
  });
});

// Hide navbar on scroll down, show on scroll up
(function() {
  var lastScroll = window.scrollY;
  var nav = document.querySelector('.main-nav');
  if (!nav) return;
  var ticking = false;
  window.addEventListener('scroll', function() {
    if (!ticking) {
      window.requestAnimationFrame(function() {
        var currentScroll = window.scrollY;
        if (currentScroll > lastScroll && currentScroll > 60) {
          nav.style.top = '-90px'; // hide
        } else {
          nav.style.top = '0'; // show
        }
        lastScroll = currentScroll;
        ticking = false;
      });
      ticking = true;
    }
  });
})();
