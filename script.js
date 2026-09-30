const $ = id => document.getElementById(id);
const money = n => n.toLocaleString("ru-RU") + " ₸";
const list = items => items.map(i => "<li>" + i + "</li>").join("");

let areas = {};
let current = "general";

async function init() {
  const res = await fetch("/api/areas");
  areas = await res.json();

  $("areaList").innerHTML = Object.entries(areas).map(([k, a]) =>
    `<button class="area" data-k="${k}" onclick="pick('${k}')"><span>${a.icon}</span>${a.name}</button>`
  ).join("");

  $("popular").innerHTML = Object.entries(areas).slice(0, 3).map(([k, a]) =>
    `<div class="pop" onclick="pick('${k}');go(1)"><span>${a.icon}</span><b>${a.name}</b></div>`
  ).join("");

  pick(current);
}

function side(name, days, price) {
  $("sName").textContent = name;
  $("sDays").textContent = days;
  $("sPrice").textContent = price;
}

function pick(key) {
  current = key;
  const a = areas[key];
  document.querySelectorAll(".area").forEach(b => b.classList.toggle("on", b.dataset.k === key));
  $("dTitle").textContent = "Чекап: " + a.name;
  $("dDesc").textContent = a.desc;
  $("dList").innerHTML = list(a.tests);
  side(a.name, a.days, "от " + money(a.price));
}

function go(step) {
  [1, 2, 3].forEach(i => {
    $("p" + i).hidden = i !== step;
    $("s" + i).classList.toggle("on", i <= step);
  });
}

async function build() {
  const body = {
    area: current,
    age: +$("age").value || 0,
    sleep: +$("sleep").value || 0,
    smoker: $("smoker").value,
    activity: $("activity").value,
    family: $("family").value
  };
  try {
    const res = await fetch("/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const r = await res.json();
    $("rTitle").textContent = "Ваш чекап: " + r.name;
    $("rTests").innerHTML = list(r.tests);
    $("rDoctors").innerHTML = list(r.doctors);
    $("rWhy").innerHTML = r.reasons.length
      ? '<p class="why">Добавлено с учётом ваших ответов: ' + r.reasons.join(", ") + ".</p>"
      : "";
    $("rNote").textContent = r.note;
    side(r.name, r.days, money(r.price));
    go(3);
  } catch (e) {
    alert("Не удалось составить чекап. Проверьте, что сервер запущен.");
  }
}

init();
