// Arquivo: api/login.js
export default function handler(req, res) {
    // Garante que só aceitamos envio de dados (POST)
    if (req.method !== 'POST') {
        return res.status(405).json({ erro: 'Método não permitido' });
    }

    // Pega a senha que o site enviou
    const { senhaDigitada } = req.body;
    
    // Puxa a senha verdadeira de uma "caixa-forte" do Vercel (Environment Variable)
    const senhaCerta = process.env.SENHA_ADMIN;

    // Compara as duas no servidor (ninguém vê isso acontecendo)
    if (senhaDigitada === senhaCerta) {
        res.status(200).json({ sucesso: true });
    } else {
        res.status(401).json({ sucesso: false });
    }
}