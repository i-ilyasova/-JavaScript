const loader = document.getElementById('loader');
const items = document.getElementById('items');

fetch('https://students.netoservices.ru/nestjs-backend/slow-get-courses')
  .then(function(response) {
    return response.json();
  })
  .then(function(data) {
    const valute = data.response.Valute;

    Object.keys(valute).forEach(function(key) {
      const currency = valute[key];
      const item = document.createElement('div');
      item.classList.add('item');

      item.innerHTML =
        '<div class="item__code">' + currency.CharCode + '</div>' +
        '<div class="item__value">' + currency.Value + '</div>' +
        '<div class="item__currency">руб.</div>';

      items.appendChild(item);
    });

    loader.classList.remove('loader_active');
  })
  .catch(function(error) {
    console.error('Ошибка загрузки:', error);
    loader.classList.remove('loader_active');
  });
