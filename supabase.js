// Jamile de Oliveira Franquilim e Geovanna Kaori Shimada
const SUPABASE_URL = 'https://xxfyrxycbnnrizxoexre.supabase.co';
const SUPABASE_KEY = 'sb_publishable_2P7CdAPFH68FhLosaNi1-A_2O-Hj7_n';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Função de cadastro
async function cadastrar() {
    const nome = document.getElementById('nome')?.value;
    const email = document.getElementById('email')?.value;
    const senha = document.getElementById('senha')?.value;
    const dataNascimento = document.getElementById('dataNascimento')?.value;
    const mensagem = document.getElementById('mensagem');

    // Validação básica
    if (!nome || !email || !senha || !dataNascimento) {
        mensagem.textContent = '⚠️ Preencha todos os campos!';
        mensagem.style.color = '#e74c3c';
        return;
    }

    if (senha.length < 6) {
        mensagem.textContent = '⚠️ A senha deve ter pelo menos 6 caracteres!';
        mensagem.style.color = '#e74c3c';
        return;
    }

    try {
        // 1. Cadastrar usuário no Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email,
            password: senha,
            options: {
                data: {
                    nome_completo: nome,
                    data_nascimento: dataNascimento
                }
            }
        });

        if (authError) {
            if (authError.message.includes('already registered')) {
                mensagem.textContent = '⚠️ Este email já está cadastrado!';
            } else {
                mensagem.textContent = `❌ Erro: ${authError.message}`;
            }
            mensagem.style.color = '#e74c3c';
            return;
        }

        // 2. Salvar dados adicionais na tabela 'usuarios'
        if (authData.user) {
            const { error: insertError } = await supabase
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
                mensagem.textContent = '⚠️ Usuário criado, mas erro ao salvar dados extras.';
                mensagem.style.color = '#f39c12';
            } else {
                mensagem.textContent = '✅ Cadastro realizado com sucesso!';
                mensagem.style.color = '#27ae60';
                
                // Limpar campos
                document.getElementById('nome').value = '';
                document.getElementById('email').value = '';
                document.getElementById('senha').value = '';
                document.getElementById('dataNascimento').value = '';

                // Redirecionar após 2 segundos
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            }
        }

    } catch (error) {
        console.error('Erro no cadastro:', error);
        mensagem.textContent = '❌ Erro ao realizar cadastro. Tente novamente.';
        mensagem.style.color = '#e74c3c';
    }
}

// Função de login
async function login() {
    const email = document.getElementById('email')?.value;
    const senha = document.getElementById('senha')?.value;
    const mensagem = document.getElementById('mensagem');

    if (!email || !senha) {
        mensagem.textContent = '⚠️ Preencha todos os campos!';
        mensagem.style.color = '#e74c3c';
        return;
    }

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: senha
        });

        if (error) {
            if (error.message.includes('Invalid login credentials')) {
                mensagem.textContent = '❌ Email ou senha incorretos!';
            } else {
                mensagem.textContent = `❌ Erro: ${error.message}`;
            }
            mensagem.style.color = '#e74c3c';
            return;
        }

        if (data.user) {
            mensagem.textContent = '✅ Login realizado com sucesso!';
            mensagem.style.color = '#27ae60';
            
            // Salvar sessão no localStorage
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Redirecionar para página principal após 1.5 segundos
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        }

    } catch (error) {
        console.error('Erro no login:', error);
        mensagem.textContent = '❌ Erro ao realizar login. Tente novamente.';
        mensagem.style.color = '#e74c3c';
    }
}

// Função para verificar se o usuário está logado
async function verificarSessao() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session && window.location.pathname.includes('dashboard.html')) {
        window.location.href = 'login.html';
        return null;
    }
    
    return session;
}

// Função para logout
async function logout() {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
        console.error('Erro ao fazer logout:', error);
        alert('Erro ao fazer logout!');
        return;
    }
    
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// Função para buscar dados do usuário
async function buscarDadosUsuario() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
        const { data, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('id', user.id)
            .single();
        
        if (error) {
            console.error('Erro ao buscar dados:', error);
            return null;
        }
        
        return data;
    }
    return null;
}