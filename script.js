// Função simples para monitorar a página
// Este exemplo básico apenas obtém o conteúdo HTML da página, armazena-o e compara
// as versões para detectar alterações.
// Em um caso real, você pode precisar de APIs mais avançadas, diffs de HTML, etc.

let ultimaVersao = null;
let urlMonitorada = null;
let intervaloMonitoramento = null;

// Iniciar monitoramento ao enviar o formulário
document.getElementById('monitor-form').addEventListener('submit', (e) => {
    e.preventDefault();
    urlMonitorada = document.getElementById('monitor-url').value.trim();

    if (!urlMonitorada) {
        alert("Por favor, insira uma URL válida.");
        return;
    }

    // Limpa histórico anterior
    document.getElementById('lista-historico').innerHTML = "";
    ultimaVersao = null;

    // Inicia um intervalo (ex: a cada 60 segundos)
    if (intervaloMonitoramento) {
        clearInterval(intervaloMonitoramento);
    }

    monitorarPagina();
    intervaloMonitoramento = setInterval(monitorarPagina, 60000); // 1 minuto
});

async function monitorarPagina() {
    if (!urlMonitorada) return;

    const statusEl = document.getElementById('status');
    const ultimoCheckEl = document.getElementById('ultimo-check');

    statusEl.textContent = "Checando atualizações...";
    ultimoCheckEl.textContent = "";

    try {
        const response = await fetch(urlMonitorada);
        if (!response.ok) {
            throw new Error(`Erro ao acessar a página: ${response.status}`);
        }

        const texto = await response.text();
        const conteudoAtual = texto;

        if (ultimaVersao && ultimaVersao !== conteudoAtual) {
            notificarAlteracao(urlMonitorada);
            registrarHistorico("Mudança detectada em " + new Date().toLocaleString());
        }

        ultimaVersao = conteudoAtual;
        statusEl.textContent = "Nenhuma nova atualização detectada.";
        ultimoCheckEl.textContent = "Último check: " + new Date().toLocaleString();

    } catch (error) {
        statusEl.textContent = "Erro ao monitorar: " + error.message;
    }
}

function registrarHistorico(msg) {
    const li = document.createElement('li');
    li.textContent = msg;
    document.getElementById('lista-historico').appendChild(li);
}

function notificarAlteracao(url) {
    // Aqui poderíamos implementar uma Notification API do browser
    // Antes, precisamos solicitar permissão do usuário

    if (Notification.permission === 'granted') {
        new Notification("Alteração detectada!", {
            body: "A página " + url + " foi alterada.",
            icon: "icons/icon-192x192.png"
        });
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                new Notification("Alteração detectada!", {
                    body: "A página " + url + " foi alterada.",
                    icon: "icons/icon-192x192.png"
                });
            }
        });
    }
}

// Registro do Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
        .then(() => console.log('Service Worker registrado com sucesso.'))
        .catch(err => console.error('Erro ao registrar Service Worker:', err));
}
