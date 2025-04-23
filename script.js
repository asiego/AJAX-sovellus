document.addEventListener('DOMContentLoaded', () => {
    const Leffasäilö = document.getElementById('Leffasäilö');
    const teatteriSelect = document.getElementById('teatterivalinta');
  
    if (!Leffasäilö || !teatteriSelect) {
      console.error('Joko #Leffasäilö tai #teatterivalinta ei löytynyt!');
      return;
    }
  
    // 1. Haetaan teatterit
    fetch('https://www.finnkino.fi/xml/TheatreAreas/')
      .then(res => res.text())
      .then(xmlStr => (new window.DOMParser()).parseFromString(xmlStr, "text/xml"))
      .then(data => {
        const areas = data.getElementsByTagName('TheatreArea');
        teatteriSelect.innerHTML = '<option value="">Valitse teatteri</option>';
  
        for (let i = 0; i < areas.length; i++) {
          const id = areas[i].getElementsByTagName('ID')[0].textContent;
          const name = areas[i].getElementsByTagName('Name')[0].textContent;
  
          if (
            name.toLowerCase().includes('helsinki') ||
            name.toLowerCase().includes('espoo') ||
            name.toLowerCase().includes('vantaa') ||
            name === 'Pääkaupunkiseutu'
          ) {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = name;
            teatteriSelect.appendChild(option);
          }
        }
      });
  
    // 2. teatterin valinta
    teatteriSelect.addEventListener('change', () => {
      const valittuId = teatteriSelect.value;
      if (!valittuId) return;
      haeNäytökset(valittuId);
    });
  
    // 3. näytösten haku
    function haeNäytökset(areaId) {
      const osoite = `https://www.finnkino.fi/xml/Schedule/?area=${areaId}`;
  
      fetch(osoite)
        .then(res => res.text())
        .then(xmlStr => (new window.DOMParser()).parseFromString(xmlStr, "text/xml"))
        .then(data => {
          const shows = data.getElementsByTagName('Show');
          Leffasäilö.innerHTML = '';
  
          if (shows.length === 0) {
            Leffasäilö.innerHTML = '<p>Ei näytöksiä saatavilla.</p>';
            return;
          }
  
          for (let i = 0; i < shows.length; i++) {
            const show = shows[i];
            const nimi = show.getElementsByTagName('Title')[0].textContent;
            const paikka = show.getElementsByTagName('Theatre')[0].textContent;
            const alku = new Date(show.getElementsByTagName('dttmShowStart')[0].textContent).toLocaleString();
  
            const kortti = document.createElement('div');
            kortti.className = 'leffa';
            kortti.innerHTML = `
              <h2>${nimi}</h2>
              <p><strong>Teatteri:</strong> ${paikka}</p>
              <p><strong>Aika:</strong> ${alku}</p>
            `;
            Leffasäilö.appendChild(kortti);
          }
        })

        .catch(err => {
          console.error('Virhe haettaessa näytöksiä:', err);
          Leffasäilö.innerHTML = '<p>Virhe haettaessa näytöksiä.</p>';
        });
    }
  });
  
  