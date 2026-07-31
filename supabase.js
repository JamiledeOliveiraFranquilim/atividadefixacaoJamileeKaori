const SUPABASE_URL = "https://xxfyrxycbnnrizxoexre.supabase.co";

const SUPABASE_KEY = "sb_publishable_2P7CdAPFH68FhLosaNi1-A_2O-Hj7_n";


const supabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);



async function cadastrar(){


    let nome = document.getElementById("nome").value;

    let email = document.getElementById("email").value;

    let senha = document.getElementById("senha").value;

    let dataNascimento = document.getElementById("dataNascimento").value;



    // Verificação dos campos

    if(nome === "" || email === "" || senha === "" || dataNascimento === ""){


        document.getElementById("mensagem").innerHTML =
        "❌ Preencha todos os campos!";


        return;

    }



    // Verifica tamanho da senha

    if(senha.length < 6){


        document.getElementById("mensagem").innerHTML =
        "❌ A senha deve possuir pelo menos 6 caracteres!";


        return;

    }



    // Criar usuário no Supabase Auth


    const {data,error} = await supabase.auth.signUp({


        email: email,

        password: senha


    });



    if(error){


        document.getElementById("mensagem").innerHTML =
        "❌ Erro no cadastro: " + error.message;


        return;

    }



    const usuario = data.user;



    // Salvar dados na tabela usuarios


    const {error:erroTabela} = await supabase

    .from("usuarios")

    .insert({


        id: usuario.id,

        nome:nome,

        email:email,

        data_nascimento:dataNascimento


    });



    if(erroTabela){


        document.getElementById("mensagem").innerHTML =
        "❌ Erro ao salvar informações!";


    }

    else{


        document.getElementById("mensagem").innerHTML =
        "✅ Cadastro realizado com sucesso!";


        setTimeout(()=>{


            window.location.href="login.html";


        },1500);


    }


}




// ==========================
// LOGIN
// ==========================


async function login(){


let email = document.getElementById("email").value;


let senha = document.getElementById("senha").value;



if(email === "" || senha === ""){


document.getElementById("mensagem").innerHTML =
"❌ Informe email e senha!";


return;


}



const {data,error} = await supabase.auth.signInWithPassword({


    email:email,

    password:senha


});




if(error){


document.getElementById("mensagem").innerHTML =
"❌ Seus dados estão incorretos!";


}

else{


document.getElementById("mensagem").innerHTML =
"✅ Login realizado com sucesso!";


setTimeout(()=>{


window.location.href="homepage.html";


},1000);


}



}