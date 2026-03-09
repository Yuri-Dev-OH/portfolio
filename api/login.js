// Arquivo: api/login.js
export default function handler(req, res) {
    // Pega a senha que o usuário digitou no site
    const { senhaDigitada } = req.body;
    
    // Puxa a senha secreta que vamos configurar no painel do Vercel
    const senhaSecreta = process.env.SENHA_ADMIN;

    // Faz a comparação em ambiente seguro (no servidor do Vercel)
    if (senhaDigitada === senhaSecreta) {
        res.status(200).json({ sucesso: true });
    } else {
        res.status(401).json({ sucesso: false });
    }
}