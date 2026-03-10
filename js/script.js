// =========================================================
// 1. CONEXÃO COM O BANCO DE DADOS (SUPABASE)
// =========================================================
const SUPABASE_URL = 'https://ncwvrsobqcsttourhwih.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jd3Zyc29icWNzdHRvdXJod2loIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwODkyNTcsImV4cCI6MjA4ODY2NTI1N30.N74_hRf4dV9a32HKZduoUUAvEEXITxG594idNqhy_OA';

const meuBanco = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);


// =========================================================
// 2. LÓGICA DO PORTFÓLIO E MODO DEV
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    carregarDadosDoBanco();
});

function toggleCard(element) {
    const alvoClique = window.event ? window.event.target : null;
    if (alvoClique && alvoClique.isContentEditable) return; 

    const todosOsCards = document.querySelectorAll('.card-tech');
    todosOsCards.forEach(card => {
        if (card !== element) card.classList.remove('active');
    });
    element.classList.toggle('active');
    
}
async function verificarSenha() {
    const campoSenha = document.getElementById("senhaAdmin");
    const senhaDigitada = campoSenha.value;
    
    try {
        // Envia a senha para o nosso arquivo invisível no Vercel
        const resposta = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ senhaDigitada: senhaDigitada })
        });

        const dados = await resposta.json();

        // Se o Vercel disser que a senha está certa, libera o acesso
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
    } catch (erro) {
        console.error(erro);
        alert("Erro de conexão. Verifique se o site já está rodando no Vercel.");
    }
}

// Lógica para alternar as cores do Bootstrap nas Tags
function alternarCorTag(tagElement) {
    const cores = ['bg-primary', 'bg-success', 'bg-danger', 'bg-warning', 'bg-info', 'bg-dark'];
    let corAtual = cores.find(c => tagElement.classList.contains(c)) || 'bg-primary';
    let proxCor = cores[(cores.indexOf(corAtual) + 1) % cores.length];
    
    tagElement.classList.remove(...cores);
    tagElement.classList.add(proxCor);
}

function ativarModoEdicao() {
    alert("MODO DE EDIÇÃO ATIVADO!\n\n- DICA TAGS: Dê um duplo clique na tag para mudar a cor.\n- DICA MODAIS: Você pode abrir os modais de descrição agora mesmo para editar o texto dentro deles.");

    document.getElementById("btnSalvarGeral").style.display = "block";
    document.getElementById("btn-add-stack").style.display = "block";
    document.getElementById("btn-add-projeto").style.display = "block";

    // Textos base editáveis
    const camposParaEditar = [
        document.getElementById('edit-nome'),
        document.getElementById('edit-subtitulo'),
        document.getElementById('edit-sobre')
    ];
    camposParaEditar.forEach(el => makeEditable(el));
    document.querySelectorAll('#container-stacks h3, #container-stacks p, #container-projetos h3, #container-projetos p').forEach(el => makeEditable(el));

    // Torna textos dos Modais editáveis
    document.querySelectorAll('.modal:not(#modalAdmin) .modal-title, .modal:not(#modalAdmin) .modal-body p').forEach(el => makeEditable(el));

    // Imagens editáveis
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

    // Links dos botões do GitHub
    document.querySelectorAll('.btn-projeto').forEach(btn => {
        btn.classList.add('is-editing');
        btn.onclick = (e) => {
            e.preventDefault(); 
            const novoLink = prompt("Cole o novo link para este botão:", btn.href);
            if (novoLink) btn.href = novoLink;
        };
    });

    // Gestão de Tags (+ botão duplo clique para cor)
    document.querySelectorAll('.tags').forEach(container => {
        container.querySelectorAll('.badge').forEach(tag => {
            makeEditable(tag);
            tag.title = "Duplo clique para mudar cor";
            tag.ondblclick = () => alternarCorTag(tag);
        });
        
        if(!container.querySelector('.btn-add-tag')) {
            const addBtn = document.createElement('span');
            addBtn.className = "badge bg-success btn-add-tag ms-1";
            addBtn.style.cursor = "pointer";
            addBtn.innerText = "+ Tag";
            
            addBtn.onclick = () => {
                const nome = prompt("Nome da nova tag:");
                if(nome) {
                    const novaTag = document.createElement('span');
                    novaTag.className = "badge bg-primary me-1 is-editing";
                    novaTag.innerText = nome;
                    makeEditable(novaTag);
                    novaTag.title = "Duplo clique para mudar cor";
                    novaTag.ondblclick = () => alternarCorTag(novaTag);
                    container.insertBefore(novaTag, addBtn); 
                }
            };
            container.appendChild(addBtn);
        }
    });

    // Botões de deletar
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
        if(confirm("Deseja excluir este item?")) parentElement.remove();
    };
    cardElement.appendChild(btnDel);
}

function adicionarStack() {
    const nome = prompt("Nome da Tecnologia:", "Nova Tech");
    if(!nome) return;
    const icone = prompt("Classe do ícone DevIcon:", "devicon-javascript-plain");
    
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

    // Cria um ID único para o Modal desse novo projeto
    const idUnicoModal = 'modalProj-' + Date.now();

    const novoProjetoHTML = `
        <div class="col-md-6 col-lg-4">
            <div class="projeto-card">
                <div class="projeto-img-container">
                    <img src="img/placeholder.png" alt="Preview" class="projeto-img img-editing" onclick="this.src = prompt('Nova URL da imagem:', this.src) || this.src">
                </div>
                <div class="projeto-corpo p-4">
                    <h3 contenteditable="true" class="is-editing">${titulo}</h3>
                    <p contenteditable="true" class="is-editing">Descrição curta do projeto...</p>
                    <div class="tags mb-4">
                        <span class="badge bg-primary is-editing" contenteditable="true" title="Duplo clique para mudar cor" ondblclick="alternarCorTag(this)">Nova Tag</span>
                    </div>
                    <div class="d-flex gap-2">
                        <a href="#" class="btn btn-projeto is-editing" onclick="event.preventDefault(); this.href = prompt('Novo link:', this.href) || this.href"><i class="devicon-github-original"></i> Link</a>
                        <button class="btn btn-outline-primary" data-bs-toggle="modal" data-bs-target="#${idUnicoModal}">Descrição</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.getElementById("container-projetos").insertAdjacentHTML('beforeend', novoProjetoHTML);
    const novoProj = document.getElementById("container-projetos").lastElementChild;
    adicionarBotaoDeletar(novoProj.querySelector('.projeto-card'), novoProj);
    
    // Adiciona o botão de Tag no projeto recém-criado
    const novoContainerTags = novoProj.querySelector('.tags');
    const addBtn = document.createElement('span');
    addBtn.className = "badge bg-success btn-add-tag ms-1";
    addBtn.style.cursor = "pointer";
    addBtn.innerText = "+ Tag";
    addBtn.onclick = () => {
        const nome = prompt("Nome da nova tag:");
        if(nome) {
            const novaTag = document.createElement('span');
            novaTag.className = "badge bg-primary me-1 is-editing";
            novaTag.innerText = nome;
            novaTag.setAttribute("contenteditable", "true");
            novaTag.title = "Duplo clique para mudar cor";
            novaTag.ondblclick = () => alternarCorTag(novaTag);
            novoContainerTags.insertBefore(novaTag, addBtn);
        }
    };
    novoContainerTags.appendChild(addBtn);

    // CRIA O MODAL EXCLUSIVO PARA ESSE NOVO PROJETO NO FIM DA PÁGINA
    const novoModalHTML = `
        <div class="modal fade" id="${idUnicoModal}" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content" style="background-color: var(--fundo); border: 2px solid var(--cor-principal);">
                    <div class="modal-header border-0">
                        <h5 class="modal-title is-editing" style="color: var(--cor-principal); font-weight: bold;" contenteditable="true">Sobre o ${titulo}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p class="is-editing" contenteditable="true">Escreva a descrição detalhada do projeto aqui...</p>
                    </div>
                    <div class="modal-footer border-0">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', novoModalHTML);
}

// =========================================================
// 3. INTEGRAÇÃO COM SUPABASE (SALVAR E CARREGAR)
// =========================================================
async function salvarAlteracoes() {
    // Limpa a sujeira do modo edição antes de salvar
    document.querySelectorAll('[contenteditable="true"]').forEach(el => {
        el.removeAttribute("contenteditable");
        el.classList.remove("is-editing");
    });
    document.querySelectorAll('.img-editing').forEach(el => {
        el.classList.remove("img-editing");
        el.onclick = null; 
    });
    document.querySelectorAll('.btn-projeto').forEach(btn => {
        btn.classList.remove("is-editing");
        btn.onclick = null; 
    });
    document.querySelectorAll('.badge').forEach(tag => {
        tag.removeAttribute("title");
        tag.ondblclick = null; 
    });
    
    document.querySelectorAll('.btn-delete-item, .btn-add-tag').forEach(btn => btn.remove());
    
    document.getElementById("btnSalvarGeral").style.display = "none";
    document.getElementById("btn-add-stack").style.display = "none";
    document.getElementById("btn-add-projeto").style.display = "none";

    // Captura TODOS os modais de projeto da página e junta o HTML deles
    let htmlDosModais = "";
    document.querySelectorAll('.modal:not(#modalAdmin)').forEach(modal => {
        htmlDosModais += modal.outerHTML + "\n";
    });

    const updates = [
        { chave: 'nome', valor: document.getElementById('edit-nome').innerText },
        { chave: 'subtitulo', valor: document.getElementById('edit-subtitulo').innerText },
        { chave: 'foto', valor: document.getElementById('edit-foto').src },
        { chave: 'sobre', valor: document.getElementById('edit-sobre').innerText },
        { chave: 'stacks', valor: document.getElementById('container-stacks').innerHTML },
        { chave: 'projetos', valor: document.getElementById('container-projetos').innerHTML },
        { chave: 'modais', valor: htmlDosModais } // <- Salva os modais no banco!
    ];

    const { error } = await meuBanco.from('site_content').upsert(updates);

    if (error) {
        alert("Erro ao salvar: " + error.message);
    } else {
        alert("Sucesso! Banco atualizado e publicado para todos.");
        location.reload(); 
    }
}

async function carregarDadosDoBanco() {
    const { data, error } = await meuBanco.from('site_content').select('*');
    
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
        
        // Carrega os modais salvos
        if(dados.modais && dados.modais.trim() !== '') {
            // Apaga os originais (exceto o modal de admin)
            document.querySelectorAll('.modal:not(#modalAdmin)').forEach(m => m.remove());
            // Insere os que vieram do banco
            document.body.insertAdjacentHTML('beforeend', dados.modais);
        }
    }
}