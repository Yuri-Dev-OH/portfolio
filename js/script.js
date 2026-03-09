// 1. SUPABASE (Suas chaves exatas)
const SUPABASE_URL = 'https://ncwvrsobqcsttourhwih.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jd3Zyc29icWNzdHRvdXJod2loIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwODkyNTcsImV4cCI6MjA4ODY2NTI1N30.N74_hRf4dV9a32HKZduoUUAvEEXITxG594idNqhy_OA';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const SENHA_ADMIN = "yuri123";

// 2. CARREGAR DADOS AO ABRIR O SITE
document.addEventListener('DOMContentLoaded', () => {
    carregarDadosDoBanco();
});

// 3. VIRAR O CARD DE TECNOLOGIA
function toggleCard(element) {
    if(element.querySelector('[contenteditable="true"]')) return; // Bloqueia o giro se estiver editando
    const todosOsCards = document.querySelectorAll('.card-tech');
    todosOsCards.forEach(card => {
        if (card !== element) card.classList.remove('active');
    });
    element.classList.toggle('active');
}

// 4. MODO DESENVOLVEDOR (LÓGICA)
function abrirModalAdmin() {
    new bootstrap.Modal(document.getElementById('modalAdmin')).show();
}

function verificarSenha() {
    const senha = document.getElementById("senhaAdmin").value;
    if (senha === SENHA_ADMIN) {
        bootstrap.Modal.getInstance(document.getElementById('modalAdmin')).hide();
        ativarModoEdicao();
    } else {
        alert("Senha incorreta!");
    }
}

function ativarModoEdicao() {
    alert("MODO DE EDIÇÃO ATIVADO!");

    document.getElementById("btnSalvarGeral").style.display = "block";
    document.getElementById("btn-add-stack").style.display = "block";
    document.getElementById("btn-add-projeto").style.display = "block";

    const camposParaEditar = [
        document.getElementById('edit-nome'),
        document.getElementById('edit-subtitulo'),
        document.getElementById('edit-sobre')
    ];
    camposParaEditar.forEach(el => makeEditable(el));

    document.querySelectorAll('#container-stacks h3, #container-stacks p, #container-projetos h3, #container-projetos p').forEach(el => makeEditable(el));

    const imagens = [document.getElementById('edit-foto'), ...document.querySelectorAll('.projeto-img')];
    imagens.forEach(img => {
        if(img) {
            img.classList.add('img-editing');
            img.onclick = () => {
                const novaURL = prompt("Cole o link (URL) da nova imagem:", img.src);
                if (novaURL) img.src = novaURL;
            };
        }
    });

    document.querySelectorAll('.card-tech').forEach(card => adicionarBotaoDeletar(card, card.parentElement));
    document.querySelectorAll('.projeto-card').forEach(card => adicionarBotaoDeletar(card, card.parentElement));
}

function makeEditable(element) {
    if(!element) return;
    element.setAttribute("contenteditable", "true");
    element.classList.add("is-editing");
}

function adicionarBotaoDeletar(cardElement, parentElement) {
    if(cardElement.querySelector('.btn-delete-item')) return;
    const btnDel = document.createElement("button");
    btnDel.innerText = "X";
    btnDel.className = "btn-delete-item";
    btnDel.style.display = "block";
    btnDel.onclick = (e) => {
        e.stopPropagation(); 
        if(confirm("Deseja excluir este item?")) {
            parentElement.remove();
        }
    };
    cardElement.appendChild(btnDel);
}

function adicionarStack() {
    const nome = prompt("Nome da Tecnologia (ex: React):", "Nova Tech");
    if(!nome) return;
    const icone = prompt("Classe do ícone DevIcon (ex: devicon-react-original):", "devicon-javascript-plain");
    
    const novaStackHTML = `
        <div class="col-md-3">
            <div class="card-tech" onclick="toggleCard(this)">
                <div class="card-content">
                    <i class="${icone} colored"></i>
                    <h3 contenteditable="true" class="is-editing">${nome}</h3>
                </div>
                <div class="card-description">
                    <h3 contenteditable="true" class="is-editing">${nome}</h3>
                    <p contenteditable="true" class="is-editing">Descrição...</p>
                </div>
            </div>
        </div>
    `;
    document.getElementById("container-stacks").insertAdjacentHTML('beforeend', novaStackHTML);
    const novaStack = document.getElementById("container-stacks").lastElementChild;
    adicionarBotaoDeletar(novaStack.querySelector('.card-tech'), novaStack);
}

function adicionarProjeto() {
    const titulo = prompt("Nome do Projeto:", "Novo Projeto");
    if(!titulo) return;

    const novoProjetoHTML = `
        <div class="col-md-6 col-lg-4">
            <div class="projeto-card">
                <div class="projeto-img-container">
                    <img src="img/placeholder.png" alt="Preview" class="projeto-img img-editing" onclick="this.src = prompt('Nova URL da imagem:', this.src) || this.src">
                </div>
                <div class="projeto-corpo p-4">
                    <h3 contenteditable="true" class="is-editing">${titulo}</h3>
                    <p contenteditable="true" class="is-editing">Descrição do projeto...</p>
                    <div class="tags mb-4">
                        <span class="badge bg-primary">Tag</span>
                    </div>
                    <div class="d-flex gap-2">
                        <a href="#" class="btn btn-projeto"><i class="devicon-github-original"></i> GitHub</a>
                        <button class="btn btn-outline-primary" data-bs-toggle="modal" data-bs-target="#modalCodeWave">Descrição</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.getElementById("container-projetos").insertAdjacentHTML('beforeend', novoProjetoHTML);
    const novoProj = document.getElementById("container-projetos").lastElementChild;
    adicionarBotaoDeletar(novoProj.querySelector('.projeto-card'), novoProj);
}

// 5. SALVAR E CARREGAR NO SUPABASE
async function salvarAlteracoes() {
    document.querySelectorAll('[contenteditable="true"]').forEach(el => {
        el.removeAttribute("contenteditable");
        el.classList.remove("is-editing");
    });
    document.querySelectorAll('.img-editing').forEach(el => {
        el.classList.remove("img-editing");
        el.onclick = null; 
    });
    document.querySelectorAll('.btn-delete-item').forEach(btn => btn.remove());
    
    document.getElementById("btnSalvarGeral").style.display = "none";
    document.getElementById("btn-add-stack").style.display = "none";
    document.getElementById("btn-add-projeto").style.display = "none";

    const updates = [
        { chave: 'nome', valor: document.getElementById('edit-nome').innerText },
        { chave: 'subtitulo', valor: document.getElementById('edit-subtitulo').innerText },
        { chave: 'foto', valor: document.getElementById('edit-foto').src },
        { chave: 'sobre', valor: document.getElementById('edit-sobre').innerText },
        { chave: 'stacks', valor: document.getElementById('container-stacks').innerHTML },
        { chave: 'projetos', valor: document.getElementById('container-projetos').innerHTML }
    ];

    const { error } = await supabase.from('site_content').upsert(updates);

    if (error) {
        alert("Erro ao salvar: " + error.message);
    } else {
        alert("Sucesso! Banco atualizado.");
        location.reload(); 
    }
}

async function carregarDadosDoBanco() {
    const { data, error } = await supabase.from('site_content').select('*');
    if (error) {
        console.error("Erro no Supabase:", error);
        return;
    }
    if (data && data.length > 0) {
        const dados = {};
        data.forEach(item => dados[item.chave] = item.valor);

        if(dados.nome) document.getElementById('edit-nome').innerText = dados.nome;
        if(dados.subtitulo) document.getElementById('edit-subtitulo').innerText = dados.subtitulo;
        if(dados.foto) document.getElementById('edit-foto').src = dados.foto;
        if(dados.sobre) document.getElementById('edit-sobre').innerText = dados.sobre;
        if(dados.stacks && dados.stacks.trim() !== '') document.getElementById('container-stacks').innerHTML = dados.stacks;
        if(dados.projetos && dados.projetos.trim() !== '') document.getElementById('container-projetos').innerHTML = dados.projetos;
    }
}