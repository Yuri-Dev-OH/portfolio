// =========================================================
// 1. SUPABASE E VARIÁVEIS DE AMBIENTE
// =========================================================
const SUPABASE_URL = 'https://ncwvrsobqcsttourhwih.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jd3Zyc29icWNzdHRvdXJod2loIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwODkyNTcsImV4cCI6MjA4ODY2NTI1N30.N74_hRf4dV9a32HKZduoUUAvEEXITxG594idNqhy_OA';
const meuBanco = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// =========================================================
// 2. O CORAÇÃO DO SITE: AS LISTAS DE DADOS (JSON)
// =========================================================
let dadosPerfil = {
    nome: "Yuri Gonçalves",
    subtitulo: "Desenvolvedor de Software Multiplataforma",
    foto: "img/yuri.png",
    sobre: "Sou Yuri Gonçalves de Souza, estudante de Desenvolvimento de Software Multiplataforma na Fatec São José dos Campos. Entusiasta de tecnologia e hardware, busco aplicar meus conhecimentos em análise de dados e desenvolvimento web para criar soluções eficientes."
};

let listaStacks = [
    { id: 1, nome: "Python", icone: "devicon-python-plain", descricao: "Análise de dados e backend com Flask." },
    { id: 2, nome: "MySQL", icone: "devicon-mysql-plain", descricao: "Modelagem e gerenciamento de bancos de dados." },
    { id: 3, nome: "HTML5", icone: "devicon-html5-plain", descricao: "Estruturas web semânticas e acessíveis." },
    { id: 4, nome: "CSS3", icone: "devicon-css3-plain", descricao: "Design responsivo e animações modernas." }
];

let listaProjetos = [
    {
        id: 1,
        titulo: "CodeWave",
        resumo: "Visualização de dados demográficos de São José dos Campos.",
        imagem: "img/codewave.png",
        tags: ["Python", "Flask"],
        link: "https://github.com/guilhermefpo/CodeWave",
        descricaoCompleta: "O CodeWave é uma ferramenta de análise desenvolvida para transformar dados demográficos em gráficos intuitivos, facilitando a compreensão das estatísticas municipais."
    }
];

// =========================================================
// 3. O MOTOR DE RENDERIZAÇÃO (Desenha o HTML)
// =========================================================
document.addEventListener('DOMContentLoaded', async () => {
    renderizarTudo(); // Desenha rápido com os dados padrão
    await carregarDadosDoBanco(); // Puxa do banco e redesenha por cima
});

function renderizarTudo() {
    // Renderiza Perfil
    document.getElementById('edit-nome').innerText = dadosPerfil.nome;
    document.getElementById('edit-subtitulo').innerText = dadosPerfil.subtitulo;
    document.getElementById('edit-foto').src = dadosPerfil.foto;
    document.getElementById('edit-sobre').innerText = dadosPerfil.sobre;

    // Renderiza Stacks
    const containerStacks = document.getElementById('container-stacks');
    containerStacks.innerHTML = '';
    listaStacks.forEach(stack => {
        containerStacks.innerHTML += `
            <div class="col-md-3 stack-item" data-id="${stack.id}">
                <div class="card-tech" onclick="toggleCard(this)">
                    <button class="btn-delete-item" style="display:none;" onclick="deletarStack(${stack.id}, event)">X</button>
                    <div class="card-content">
                        <i class="${stack.icone} colored"></i>
                        <h3 class="stack-nome">${stack.nome}</h3>
                    </div>
                    <div class="card-description">
                        <h3 class="stack-nome">${stack.nome}</h3>
                        <p class="stack-desc">${stack.descricao}</p>
                    </div>
                </div>
            </div>
        `;
    });

    // Renderiza Projetos e Modais
    const containerProjetos = document.getElementById('container-projetos');
    const containerModais = document.getElementById('container-modais');
    containerProjetos.innerHTML = '';
    containerModais.innerHTML = '';

    listaProjetos.forEach(proj => {
        let tagsHTML = proj.tags.map(tag => `<span class="badge bg-primary">${tag}</span>`).join(' ');
        
        containerProjetos.innerHTML += `
            <div class="col-md-6 col-lg-4 projeto-item" data-id="${proj.id}">
                <div class="projeto-card">
                    <button class="btn-delete-item" style="display:none;" onclick="deletarProjeto(${proj.id}, event)">X</button>
                    <div class="projeto-img-container">
                        <img src="${proj.imagem}" class="projeto-img" id="img-proj-${proj.id}">
                    </div>
                    <div class="projeto-corpo p-4">
                        <h3 class="proj-titulo">${proj.titulo}</h3>
                        <p class="proj-resumo">${proj.resumo}</p>
                        <div class="tags mb-4">
                            ${tagsHTML}
                            <span class="badge bg-success btn-edit-tags ms-1" style="display:none; cursor:pointer;" onclick="editarTags(${proj.id})">✏️ Editar</span>
                        </div>
                        <div class="d-flex gap-2">
                            <a href="${proj.link}" class="btn btn-projeto proj-link"><i class="devicon-github-original"></i> Link</a>
                            <button class="btn btn-outline-primary" data-bs-toggle="modal" data-bs-target="#modalProj-${proj.id}">Descrição</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        containerModais.innerHTML += `
            <div class="modal fade modal-projeto" id="modalProj-${proj.id}" data-id="${proj.id}" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content" style="background-color: var(--fundo); border: 2px solid var(--cor-principal);">
                        <div class="modal-header border-0">
                            <h5 class="modal-title" style="color: var(--cor-principal); font-weight: bold;">Sobre o Projeto</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <p class="proj-modal-desc">${proj.descricaoCompleta}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
}

function toggleCard(element) {
    const alvo = window.event ? window.event.target : null;
    if (alvo && alvo.isContentEditable) return; 

    const todos = document.querySelectorAll('.card-tech');
    todos.forEach(c => { if (c !== element) c.classList.remove('active'); });
    element.classList.toggle('active');
}

// =========================================================
// 4. LÓGICA DO MODO DESENVOLVEDOR (Data-Driven)
// =========================================================
async function verificarSenha() {
    const campoSenha = document.getElementById("senhaAdmin");
    const senhaDigitada = campoSenha.value;
    
    try {
        const resposta = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ senhaDigitada: senhaDigitada })
        });

        const dados = await resposta.json();

        if (dados.sucesso) {
            const modalEl = document.getElementById('modalAdmin');
            const modalObj = bootstrap.Modal.getInstance(modalEl) || bootstrap.Modal.getOrCreateInstance(modalEl);
            if (modalObj) modalObj.hide();
            
            campoSenha.value = ""; 
            ativarModoEdicao();
        } else {
            alert("Senha incorreta!");
            campoSenha.value = ""; 
        }
    } catch (e) {
        alert("Erro. Verifique se a API no Vercel está rodando.");
    }
}

function ativarModoEdicao() {
    document.getElementById("btnSalvarGeral").style.display = "block";
    document.getElementById("btn-add-stack").style.display = "block";
    document.getElementById("btn-add-projeto").style.display = "block";

    // Torna textos editáveis
    const seletoresTexto = ['.perfil-editavel', '.stack-nome', '.stack-desc', '.proj-titulo', '.proj-resumo', '.proj-modal-desc'];
    seletoresTexto.forEach(seletor => {
        document.querySelectorAll(seletor).forEach(el => {
            el.setAttribute("contenteditable", "true");
            el.classList.add("is-editing");
        });
    });

    // Mostra botões de deletar e editar tags
    document.querySelectorAll('.btn-delete-item').forEach(btn => btn.style.display = 'block');
    document.querySelectorAll('.btn-edit-tags').forEach(btn => btn.style.display = 'inline-block');

    // Imagens editáveis
    document.getElementById('edit-foto').onclick = (e) => editarImagemPerfil(e.target);
    document.getElementById('edit-foto').classList.add("img-editing");
    
    document.querySelectorAll('.projeto-img').forEach(img => {
        img.classList.add('img-editing');
        img.onclick = () => editarImagemProj(img);
    });

    // Links editáveis
    document.querySelectorAll('.proj-link').forEach(btn => {
        btn.classList.add('is-editing');
        btn.onclick = (e) => {
            e.preventDefault(); 
            const novoLink = prompt("Novo link para o botão:", btn.href);
            if (novoLink) btn.href = novoLink;
        };
    });
}

// LÓGICA DE INSERIR DADOS NOS ARRAYS VIA BOTÕES
function editarTags(idProj) {
    extrairDadosDaTela(); // Salva estado atual primeiro
    const proj = listaProjetos.find(p => p.id === idProj);
    const textoTags = prompt("Digite as tags separadas por vírgula (ex: Python, Flask):", proj.tags.join(", "));
    if(textoTags !== null) {
        proj.tags = textoTags.split(",").map(t => t.trim()).filter(t => t !== "");
        renderizarTudo();
        ativarModoEdicao();
    }
}

function editarImagemPerfil(imgElement) {
    const novaURL = prompt("URL da nova foto de perfil:", imgElement.src);
    if(novaURL) imgElement.src = novaURL;
}

function editarImagemProj(imgElement) {
    const novaURL = prompt("URL da nova imagem do projeto:", imgElement.src);
    if(novaURL) imgElement.src = novaURL;
}

function adicionarStack() {
    extrairDadosDaTela();
    const nome = prompt("Nome da Tecnologia:");
    if(!nome) return;
    listaStacks.push({
        id: Date.now(),
        nome: nome,
        icone: prompt("Classe do ícone DevIcon:", "devicon-javascript-plain"),
        descricao: "Descrição curta..."
    });
    renderizarTudo();
    ativarModoEdicao();
}

function deletarStack(id, event) {
    event.stopPropagation();
    if(confirm("Excluir esta tecnologia?")) {
        extrairDadosDaTela();
        listaStacks = listaStacks.filter(s => s.id !== id);
        renderizarTudo();
        ativarModoEdicao();
    }
}

function adicionarProjeto() {
    extrairDadosDaTela();
    listaProjetos.push({
        id: Date.now(),
        titulo: prompt("Nome do Projeto:", "Novo Projeto") || "Novo Projeto",
        resumo: "Resumo curto...",
        imagem: "img/placeholder.png",
        tags: ["NovaTag"],
        link: "#",
        descricaoCompleta: "Descrição completa do projeto aqui..."
    });
    renderizarTudo();
    ativarModoEdicao();
}

function deletarProjeto(id, event) {
    event.stopPropagation();
    if(confirm("Excluir este projeto?")) {
        extrairDadosDaTela();
        listaProjetos = listaProjetos.filter(p => p.id !== id);
        renderizarTudo();
        ativarModoEdicao();
    }
}

// =========================================================
// 5. PONTE COM O SUPABASE (Lê do Banco / Salva no Banco)
// =========================================================

// Função vital: Lê o que você alterou visualmente e joga nas Listas
function extrairDadosDaTela() {
    dadosPerfil.nome = document.getElementById('edit-nome').innerText;
    dadosPerfil.subtitulo = document.getElementById('edit-subtitulo').innerText;
    dadosPerfil.foto = document.getElementById('edit-foto').src;
    dadosPerfil.sobre = document.getElementById('edit-sobre').innerText;

    document.querySelectorAll('.stack-item').forEach(el => {
        const id = parseInt(el.getAttribute('data-id'));
        const stack = listaStacks.find(s => s.id === id);
        if(stack) {
            stack.nome = el.querySelector('.stack-nome').innerText;
            stack.descricao = el.querySelector('.stack-desc').innerText;
        }
    });

    document.querySelectorAll('.projeto-item').forEach(el => {
        const id = parseInt(el.getAttribute('data-id'));
        const proj = listaProjetos.find(p => p.id === id);
        if(proj) {
            proj.titulo = el.querySelector('.proj-titulo').innerText;
            proj.resumo = el.querySelector('.proj-resumo').innerText;
            proj.imagem = el.querySelector('.projeto-img').src;
            proj.link = el.querySelector('.proj-link').href;
        }
    });

    document.querySelectorAll('.modal-projeto').forEach(el => {
        const id = parseInt(el.getAttribute('data-id'));
        const proj = listaProjetos.find(p => p.id === id);
        if(proj) {
            proj.descricaoCompleta = el.querySelector('.proj-modal-desc').innerText;
        }
    });
}

async function salvarAlteracoes() {
    document.getElementById("btnSalvarGeral").innerText = "Salvando...";
    
    // Atualiza as listas com tudo o que foi modificado na tela
    extrairDadosDaTela(); 

    // O Pulo do Gato: Transforma as listas em texto JSON purinho
    const updates = [
        { chave: 'perfil', valor: JSON.stringify(dadosPerfil) },
        { chave: 'stacks', valor: JSON.stringify(listaStacks) },
        { chave: 'projetos', valor: JSON.stringify(listaProjetos) }
    ];

    const { error } = await meuBanco.from('site_content').upsert(updates);

    if (error) {
        alert("Erro ao salvar: " + error.message);
        document.getElementById("btnSalvarGeral").innerText = "💾 Salvar no Banco";
    } else {
        alert("Sucesso! Banco de Dados atualizado e limpo.");
        location.reload(); 
    }
}

async function carregarDadosDoBanco() {
    const { data, error } = await meuBanco.from('site_content').select('*');
    if (error) return;

    if (data && data.length > 0) {
        data.forEach(item => {
            try {
                // Tenta transformar o JSON de volta em Lista
                if (item.chave === 'perfil') dadosPerfil = JSON.parse(item.valor);
                if (item.chave === 'stacks') listaStacks = JSON.parse(item.valor);
                if (item.chave === 'projetos') listaProjetos = JSON.parse(item.valor);
            } catch (e) {
                // Se der erro (ex: achar o HTML velho que salvamos antes), ele ignora para não quebrar
                console.log("Ignorando formato de dados antigo para limpar o banco.");
            }
        });
        renderizarTudo(); // Desenha a tela final com os dados que vieram
    }
}