// Jamile de Oliveira Franquilim e Geovanna Kaori Shimada

const SUPABASE_URL = 'https://xxfyrxycbnnrizxoexre.supabase.co';
const SUPABASE_KEY = 'sb_publishable_2P7CdAPFH68FhLosaNi1-A_2O-Hj7_n';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

window.supabase = supabaseClient;
window.supabaseClient = supabaseClient;

console.log('Supabase inicializado com sucesso!');

async function cadastrar() {
    const nome = document.getElementById('nome')?.value;
    const email = document.getElementById('email')?.value;
    const senha = document.getElementById('senha')?.value;
    const dataNascimento = document.getElementById('dataNascimento')?.value;
    const mensagem = document.getElementById('mensagem');

    console.log('Tentando cadastrar:', { nome, email, dataNascimento });

    if (!nome || !email || !senha || !dataNascimento) {
        mensagem.textContent = 'Preencha todos os campos!';
        mensagem.style.color = '#e74c3c';
        return;
    }

    if (senha.length < 6) {
        mensagem.textContent = 'A senha deve ter pelo menos 6 caracteres!';
        mensagem.style.color = '#e74c3c';
        return;
    }

    try {
        const { data: authData, error: authError } = await supabaseClient.auth.signUp({
            email: email,
            password: senha,
            options: {
                data: {
                    nome: nome,
                    data_nascimento: dataNascimento
                }
            }
        });

        if (authError) {
            console.error('Erro no Auth:', authError);
            if (authError.message.includes('already registered')) {
                mensagem.textContent = 'Este email já está cadastrado!';
            } else if (authError.message.includes('password')) {
                mensagem.textContent = 'Senha muito fraca. Use letras, números e caracteres especiais!';
            } else {
                mensagem.textContent = `Erro: ${authError.message}`;
            }
            mensagem.style.color = '#e74c3c';
            return;
        }

        console.log('Auth OK:', authData.user);

        if (authData.user) {
            const { error: insertError } = await supabaseClient
                .from('usuarios')
                .insert([
                    {
                        id: authData.user.id,
                        nome: nome,
                        email: email,
                        data_nascimento: dataNascimento,
                        created_at: new Date().toISOString()
                    }
                ]);

            if (insertError) {
                console.error('Erro ao salvar dados:', insertError);
                mensagem.textContent = `Usuário criado, mas erro ao salvar dados: ${insertError.message}`;
                mensagem.style.color = '#f39c12';
            } else {
                mensagem.textContent = 'Cadastro realizado com sucesso!';
                mensagem.style.color = '#27ae60';
                
                document.getElementById('nome').value = '';
                document.getElementById('email').value = '';
                document.getElementById('senha').value = '';
                document.getElementById('dataNascimento').value = '';

                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            }
        }

    } catch (error) {
        console.error('Erro no cadastro:', error);
        mensagem.textContent = `Erro ao realizar cadastro: ${error.message}`;
        mensagem.style.color = '#e74c3c';
    }
}

async function login() {
    const email = document.getElementById('email')?.value.trim();
    const senha = document.getElementById('senha')?.value;
    const mensagem = document.getElementById('mensagem');

    console.log('Tentando login para:', email);

    mensagem.textContent = '';
    mensagem.style.color = '';

    if (!email || !senha) {
        mensagem.textContent = 'Preencha todos os campos!';
        mensagem.style.color = '#e74c3c';
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        mensagem.textContent = 'Email inválido!';
        mensagem.style.color = '#e74c3c';
        return;
    }

    try {
        mensagem.textContent = 'Entrando...';
        mensagem.style.color = '#3498db';

        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: senha
        });

        if (error) {
            console.error('Erro no login:', error);
            
            if (error.message.includes('Invalid login credentials')) {
                mensagem.textContent = 'Email ou senha incorretos!';
            } else if (error.message.includes('Email not confirmed')) {
                mensagem.textContent = 'Confirme seu email antes de fazer login!';
            } else {
                mensagem.textContent = `Erro: ${error.message}`;
            }
            mensagem.style.color = '#e74c3c';
            return;
        }

        if (data.user) {
            console.log('Login bem sucedido:', data.user.email);
            
            mensagem.textContent = '✅ Login realizado com sucesso!';
            mensagem.style.color = '#27ae60';
            
            localStorage.setItem('user', JSON.stringify({
                id: data.user.id,
                email: data.user.email,
                nome: data.user.user_metadata?.nome || 'Usuário'
            }));
            
            document.getElementById('email').value = '';
            document.getElementById('senha').value = '';
            
            setTimeout(() => {
                window.location.href = 'homepage.html';
            }, 1500);
        }

    } catch (error) {
        console.error('Erro inesperado no login:', error);
        mensagem.textContent = 'Erro ao realizar login. Tente novamente.';
        mensagem.style.color = '#e74c3c';
    }
}

// Função para verificar se o usuário está logado
async function verificarSessao() {
    try {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        if (error) {
            console.error('Erro ao verificar sessão:', error);
            return null;
        }
        return session;
    } catch (error) {
        console.error('Erro ao verificar sessão:', error);
        return null;
    }
}

async function logout() {
    const { error } = await supabaseClient.auth.signOut();
    
    if (error) {
        console.error('Erro ao fazer logout:', error);
        alert('Erro ao fazer logout!');
        return;
    }
    
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

async function buscarDadosUsuario() {
    try {
        const { data: { user }, error } = await supabaseClient.auth.getUser();
        
        if (error) {
            console.error('Erro ao buscar usuário:', error);
            return null;
        }

        if (user) {
            const { data, error: dbError } = await supabaseClient
                .from('usuarios')
                .select('*')
                .eq('id', user.id)
                .single();
            
            if (dbError) {
                console.error('Erro ao buscar dados do banco:', dbError);
                return null;
            }
            
            return data;
        }
        return null;
    } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
        return null;
    }
}
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM carregado, verificando sessão...');
    const session = await verificarSessao();
    
    const currentPage = window.location.pathname;
    if (session && (currentPage.includes('login.html') || currentPage.includes('index.html') || currentPage === '/' || currentPage === '')) {
        console.log('Usuário já logado, redirecionando para dashboard');
        window.location.href = 'dashboard.html';
    }
});

console.log('Todas as funções carregadas!');