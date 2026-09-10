
// reveal on scroll
(function(){
  var els = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
    }, {threshold:0.12});
    els.forEach(function(el){ io.observe(el); });
  } else {
    els.forEach(function(el){ el.classList.add('in'); });
  }
})();

// count-up numbers
(function(){
  var nodes = document.querySelectorAll('.countup');
  if(!nodes.length) return;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function animate(el){
    var target = parseFloat(el.getAttribute('data-target')) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    if(reduceMotion){ el.textContent = target + suffix; return; }
    var duration = 1200;
    var start = null;
    function step(ts){
      if(start === null) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = Math.round(target * eased);
      el.textContent = value + suffix;
      if(progress < 1){ requestAnimationFrame(step); }
      else { el.textContent = target + suffix; }
    }
    requestAnimationFrame(step);
  }

  if('IntersectionObserver' in window){
    var cio = new IntersectionObserver(function(entries){
      entries.forEach(function(e){ if(e.isIntersecting){ animate(e.target); cio.unobserve(e.target); } });
    }, {threshold:0.4});
    nodes.forEach(function(el){ cio.observe(el); });
  } else {
    nodes.forEach(function(el){ animate(el); });
  }
})();

// faq accordion
document.querySelectorAll('.faq-item').forEach(function(item){
  var q = item.querySelector('.faq-q');
  var a = item.querySelector('.faq-a');
  q.addEventListener('click', function(){
    var open = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(function(o){
      if(o!==item){ o.classList.remove('open'); o.querySelector('.faq-a').style.maxHeight = null; }
    });
    if(open){ item.classList.remove('open'); a.style.maxHeight = null; }
    else { item.classList.add('open'); a.style.maxHeight = a.scrollHeight + 'px'; }
  });
});

// door access demo
(function(){
  var stage = document.getElementById('doorStage');
  if(!stage) return;
  var statusEl = document.getElementById('doorStatus');
  var statusText = document.getElementById('doorStatusText');
  var hint = document.getElementById('doorHint');
  var timer = null;

  stage.addEventListener('click', function(){
    if(stage.classList.contains('open')) return;
    stage.classList.add('open');
    stage.setAttribute('aria-pressed', 'true');
    stage.disabled = true;
    statusEl.classList.add('open');
    statusText.textContent = '門禁：已開啟';

    var count = 3;
    hint.textContent = count + ' 秒後自動歸位';
    timer = setInterval(function(){
      count -= 1;
      if(count > 0){
        hint.textContent = count + ' 秒後自動歸位';
      } else {
        clearInterval(timer);
        stage.classList.remove('open');
        stage.setAttribute('aria-pressed', 'false');
        stage.disabled = false;
        statusEl.classList.remove('open');
        statusText.textContent = '門禁：已上鎖';
        hint.textContent = '點一下開門';
      }
    }, 1000);
  });
})();

// chip toggles (single-select groups)
document.querySelectorAll('.chip-group').forEach(function(group){
  group.querySelectorAll('.chip').forEach(function(chip){
    chip.addEventListener('click', function(){
      group.querySelectorAll('.chip').forEach(function(c){ c.classList.remove('active'); });
      chip.classList.add('active');
      var field = group.getAttribute('data-field');
      if(field){
        var hidden = document.getElementById('field-' + field);
        if(hidden) hidden.value = chip.textContent.trim();
      }
    });
  });
});

// assessment form -> /api/leads
var assessForm = document.getElementById('assessForm');
if(assessForm){
  assessForm.addEventListener('submit', function(e){
    e.preventDefault();
    var submitBtn = assessForm.querySelector('button[type="submit"]');
    var hint = document.getElementById('formHint');
    var data = {};
    new FormData(assessForm).forEach(function(value, key){ data[key] = value; });
    data.consent = assessForm.querySelector('[name="consent"]').checked;
    data.pageUrl = window.location.href;

    if(submitBtn) submitBtn.disabled = true;
    if(hint) hint.textContent = '送出中…';

    fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(function(res){
      if(!res.ok) throw new Error('submit failed');
      return res.json();
    }).then(function(){
      document.getElementById('formThanks').classList.add('show');
      assessForm.reset();
      if(hint) hint.textContent = '送出後我們會盡快與你聯繫';
    }).catch(function(){
      if(hint){ hint.textContent = '送出失敗，請稍後再試，或直接透過右側方式聯絡我們。'; hint.style.color = '#c0392b'; }
    }).finally(function(){
      if(submitBtn) submitBtn.disabled = false;
    });
  });
}

// calculator
(function(){
  var ids = ['courts','price','hours','days','rent','utility','misc','service'];
  var inputs = {};
  ids.forEach(function(id){ inputs[id] = document.getElementById(id); });
  function fmt(n){
    n = Math.round(n);
    return 'NT$' + n.toLocaleString('en-US');
  }
  function calc(){
    var courts = parseFloat(inputs.courts.value)||0;
    var price = parseFloat(inputs.price.value)||0;
    var hours = parseFloat(inputs.hours.value)||0;
    var days = parseFloat(inputs.days.value)||0;
    var rent = parseFloat(inputs.rent.value)||0;
    var utility = parseFloat(inputs.utility.value)||0;
    var misc = parseFloat(inputs.misc.value)||0;
    var service = parseFloat(inputs.service.value)||0;

    var revenue = courts*price*hours*days;
    var cost = rent+utility+misc+service;
    var profit = revenue-cost;
    var hourlyCapacity = courts*price*days; // revenue per 1hr/day usage across all courts across the month
    var breakevenHours = hourlyCapacity>0 ? cost/(courts*price) : 0;

    document.getElementById('rRevenue').textContent = fmt(revenue);
    document.getElementById('rCost').textContent = fmt(cost);
    var profitEl = document.getElementById('rProfit');
    profitEl.textContent = (profit<0?'-':'')+fmt(Math.abs(profit));
    profitEl.parentElement.classList.toggle('neg', profit<0);
    document.getElementById('rBreakeven').textContent = (isFinite(breakevenHours)? breakevenHours.toFixed(1):'0') + ' 小時／片／月';
  }
  ids.forEach(function(id){ inputs[id].addEventListener('input', calc); });
  calc();
})();

// case carousel (真實案例：一次看4張，卡片多的話左右滑動／按箭頭)
document.querySelectorAll('.case-carousel').forEach(function(car){
  var grid = car.querySelector('.case-grid');
  var prev = car.querySelector('.case-nav.prev');
  var next = car.querySelector('.case-nav.next');
  if(!grid || !prev || !next) return;

  function update(){
    var max = grid.scrollWidth - grid.clientWidth - 1;
    var hasOverflow = grid.scrollWidth > grid.clientWidth + 1;
    car.classList.toggle('no-scroll', !hasOverflow);
    prev.disabled = grid.scrollLeft <= 1;
    next.disabled = grid.scrollLeft >= max;
  }

  prev.addEventListener('click', function(){ grid.scrollBy({ left: -grid.clientWidth, behavior: 'smooth' }); });
  next.addEventListener('click', function(){ grid.scrollBy({ left: grid.clientWidth, behavior: 'smooth' }); });
  grid.addEventListener('scroll', update);
  window.addEventListener('resize', update);
  update();
});

// theme respects host; no manual toggle needed
