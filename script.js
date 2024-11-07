let graficoConsumo;
let dadosCarros = [];

async function carregarModelos() {
    try {
        const resposta = await fetch("fuelData.json");
        dadosCarros = await resposta.json();

        const datalist = document.getElementById("modelos");
        dadosCarros.forEach(carro => {
            const option = document.createElement("option");
            option.value = carro.modelo;
            datalist.appendChild(option);
        });
    } catch (error) {
        console.error("Erro ao carregar modelos de carros:", error);
    }
}

function preencherConsumo() {
    const modelo = document.getElementById("modelo").value;
    const carroEncontrado = dadosCarros.find(carro => carro.modelo.toLowerCase() === modelo.toLowerCase());

    if (carroEncontrado) {
        document.getElementById("consumo").value = carroEncontrado.consumoUrbano;
    } else {
        document.getElementById("consumo").value = "";
    }
}

function calcularConsumo() {
    const modelo = document.getElementById("modelo").value;
    const consumoUrbano = parseFloat(document.getElementById("consumo").value);

    if (!modelo || isNaN(consumoUrbano) || consumoUrbano <= 0) {
        alert("Por favor, insira valores válidos.");
        return;
    }

    const velocidades = [20, 40, 60, 80, 100, 120];
  
    const a_base = 0.0008;
    const b_base = -0.1049;
    const c_base = 10.24;

    const consumoUrbanoL100km = 100 / consumoUrbano;
    const fatorAjuste = consumoUrbanoL100km / c_base;
    const a = a_base * fatorAjuste;
    const b = b_base * fatorAjuste;
    const c = consumoUrbanoL100km;

    const consumoTableBody = document.querySelector("#consumoTable tbody");
    consumoTableBody.innerHTML = "";

    const consumos = velocidades.map(v => {
        const consumo = a * v * v + b * v + c;
        consumoTableBody.innerHTML += `
            <tr>
                <td>${v}</td>
                <td>${consumo.toFixed(1)}</td>
            </tr>
        `;
        return consumo;
    });

    document.getElementById("info-modelo").textContent = modelo;
    const minConsumoIndex = consumos.indexOf(Math.min(...consumos));
    document.getElementById("minConsumo").textContent = velocidades[minConsumoIndex];

    gerarGrafico(velocidades, consumos);
    document.getElementById("result-section").classList.remove("hidden");
}

function gerarGrafico(velocidades, consumos) {
    const ctx = document.getElementById("graficoConsumo").getContext("2d");

    if (graficoConsumo) {
        graficoConsumo.destroy();
    }

    graficoConsumo = new Chart(ctx, {
        type: "line",
        data: {
            labels: velocidades,
            datasets: [
                {
                    label: "Consumo (L/100 km)",
                    data: consumos,
                    borderColor: "green",
                    fill: false,
                    pointBackgroundColor: "red",
                    tension: 0.4
                }
            ]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: "Velocidade (km/h)"
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: "Consumo (L/100 km)"
                    }
                }
            }
        }
    });
}

carregarModelos();
document.getElementById("modelo").addEventListener("input", preencherConsumo);

function toggleInfo() {
    const content = document.getElementById('infoContent');
    content.style.display = content.style.display === 'none' || content.style.display === '' ? 'block' : 'none';
}
