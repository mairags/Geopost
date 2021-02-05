function avancarTextArea(){
    let erroEntrada = false;
    
    let textoTimes = document.getElementById("textAreaTimes").value;

    let times = [];
    let jogos = [];


    // tratamento de entrada, dividindo por linhas depois por ponto e vírgula (;)
    textoTimes.split("\n").forEach(time => {

        let timeSplit = time.split(";");

        if(timeSplit.length != 2){
            alert("Entrada inválida, verificar quebra de linha");
            return;
        }
        else{
            times.push({nome: timeSplit[0].trim(), cidade: timeSplit[1].trim(), pontos: 0})
        }
    });
    
    jogos = setJogos(times);

    jogos = setJogoIdaVolta(jogos);

    jogos.sort(function(a,b) {return (b.ida > a.ida) ? 1 : ((a.ida > b.ida) ? -1 : 0);} );
    
    let jogosIda = setRodadas(jogos.filter(jogo => { return jogo.ida }), times);
    let jogosVolta = setRodadas(jogos.filter(jogo => { return !jogo.ida }), times);

    setPlacar(jogosIda, times);
    setPlacar(jogosVolta, times);

    setRodadaDupla(jogosIda);
    setRodadaDupla(jogosVolta);

    times.sort(function(a,b) {return (b.pontos > a.pontos) ? 1 : ((a.pontos > b.pontos) ? -1 : 0);} )

    criarTabelas(jogosIda, jogosVolta, times);
}

function limparTextArea(){
    let textArea = document.getElementById("textAreaTimes");
    textArea.value = "";
}


function setRodadas(jogos, times)
{
    let jogosRodadas = [...jogos];
    let rodada = 1;
    
    while (jogosRodadas.length)
    {
        let timesRodadas = [...times];
        while (timesRodadas.length)
        {
            let timeA, timeB, jogoRodada;
            let contadorTentativas = 0;

            do
            {
                contadorTentativas++;
                timeA = timesRodadas[Math.round(Math.random() * (timesRodadas.length - 1))];

                do{
                    timeB = timesRodadas[Math.round(Math.random() * (timesRodadas.length - 1))];
                } while (timeA == timeB && timesRodadas.length > 1);
                
                
                jogoRodada = jogosRodadas.find(jogo => {
                    return (jogo.timeA == timeA.nome && jogo.timeB == timeB.nome)
                });
                
            } while (jogoRodada == undefined && contadorTentativas <= 100000);
            
            if(jogoRodada == undefined){
                jogoRodada = jogosRodadas.find(jogo => {
                    return true;
                });
            }

            if (jogoRodada){
                jogoRodadaReal = jogos.find(jogo => {
                    return (jogo.timeA == jogoRodada.timeA && jogo.timeB == jogoRodada.timeB)
                });
            }

            if (jogoRodadaReal)
            {
                jogoRodadaReal.rodada = rodada;
                timesRodadas.splice(timesRodadas.indexOf(timeA), 1);
                timesRodadas.splice(timesRodadas.indexOf(timeB), 1);
                jogosRodadas.splice(jogosRodadas.indexOf(jogoRodada), 1);
            }
        }
        rodada += 1;
    }
    
    jogos.sort(function(a,b) {return (a.rodada > b.rodada) ? 1 : ((b.rodada > a.rodada) ? -1 : 0);} );


    console.log(jogos);
    return jogos;
}

function setJogoIdaVolta(jogos)
{
    jogos.forEach((jogo, i) => {
        if (jogo.ida == null)
        {
            jogo.ida = true;

            let jogoInverso = jogos.find(jogoInv => {
                return (jogoInv.timeA == jogo.timeB && jogoInv.timeB == jogo.timeA)
            });
            
            if (jogoInverso)
                jogoInverso.ida = false;
        }
    });
    return jogos;
}

function setJogos(times)
{
    let jogos = [];
    times.forEach(time1 => {

        let oponentes = times.filter(time => {
            return time.nome != time1.nome;
        })

        oponentes.forEach(time2 => {
            if(time1.nome != time2.nome){
                jogos.push({timeA: time1.nome, timeB: time2.nome, local: time1.cidade, rodada: 0, rodadaDupla: false});
            }
        });
    });

    return jogos;
}

function setPlacar(jogos, times)
{
    // array de probabilidade de gols, mais realista
    let probabilidadeGols = [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 4, 4, 5, 6, 7];

    jogos.forEach(jogo => {
        jogo.timeAGols = probabilidadeGols[Math.round(Math.random() * (probabilidadeGols.length - 1))];
        jogo.timeBGols = probabilidadeGols[Math.round(Math.random() * (probabilidadeGols.length - 1))];
        
        let timeA = times.find(time => { return time.nome == jogo.timeA });
        let timeB = times.find(time => { return time.nome == jogo.timeB });

        timeA.pontos += (jogo.timeAGols > jogo.timeBGols) ? 3 : ((jogo.timeBGols > jogo.timeAGols) ? 0 : 1);        
        timeB.pontos += (jogo.timeBGols > jogo.timeAGols) ? 3 : ((jogo.timeAGols > jogo.timeBGols) ? 0 : 1);
    });
}

function setRodadaDupla(jogos)
{
    jogos.forEach(jogo => {
        let jogoRodadaDuplaReal = jogos.find(jogoRodadaDupla => {
            //apenas 1 time ja garante que eu não busque "a mim mesmo" na rodada, pois time não repete na mesma rodada
            return (jogo.timeA != jogoRodadaDupla.timeA && jogo.rodada === jogoRodadaDupla.rodada && jogo.local === jogoRodadaDupla.local);
        });

        
        if (jogoRodadaDuplaReal != undefined){
            console.log(jogo.local, jogoRodadaDuplaReal.local)
            console.log(jogo.rodada, jogoRodadaDuplaReal.rodada)
            jogoRodadaDuplaReal.rodadaDupla = true; 
            jogo.rodadaDupla = true; 
        }
        else{
            jogo.rodadaDupla = false;
        }

    });
}

function criarTabelas(jogosIda, jogosVolta, times)
{
    document.getElementById("div-primaria").hidden = true;
    document.getElementById("div-secundaria-ida").hidden = false;
    document.getElementById("div-secundaria-volta").hidden = false;
    document.getElementById("div-secundaria-jogos").hidden = false;
    document.getElementById("div-secundaria-pontos").hidden = false;

    let tabelaIda = criarTabelasJogos(jogosIda);
    let tabelaVolta = criarTabelasJogos(jogosVolta);

    let tabelaPlacar = criarPlacarJogos(jogosIda, jogosVolta);

    let tabelaPontos = criarTabelaPontos(times);

    document.getElementById("div-secundaria-ida").appendChild(tabelaIda);
    document.getElementById("div-secundaria-volta").appendChild(tabelaVolta);
    document.getElementById("div-secundaria-jogos").appendChild(tabelaPlacar);
    document.getElementById("div-secundaria-pontos").appendChild(tabelaPontos);

}

function criarTabelasJogos(jogos)
{
    let tabela = document.createElement('table');

    tabela.classList.add("tabelas-jogos");

    let header = tabela.createTHead();

    let linha = header.insertRow();

    let celula = linha.insertCell();
    celula.outerHTML = "<th>Partida</th>";

    celula = linha.insertCell();
    celula.outerHTML = "<th>Local</th>";

    celula = linha.insertCell();
    celula.outerHTML = "<th>Rodada</th>";


    let body = tabela.createTBody();

    jogos.forEach(jogo => {

        let linha = body.insertRow();
        
        let celula = linha.insertCell();
        celula.textContent = jogo.timeA + " vs " + jogo.timeB;

        celula = linha.insertCell();
        celula.textContent =jogo.local;  

        celula = linha.insertCell();
        celula.textContent = "Rodada " + jogo.rodada + (jogo.rodadaDupla ? " (Rodada Dupla)" : "");     
    });

    return tabela;
}

function criarPlacarJogos(jogosIda, jogosVolta){
    let tabela = document.createElement('table');

    tabela.classList.add("tabelas-jogos");

    let header = tabela.createTHead();

    let linha = header.insertRow();

    let celula = linha.insertCell();
    celula.outerHTML = "<th>Time da Casa</th>";

    celula = linha.insertCell();
    celula.outerHTML = "<th>Placar</th>";

    celula = linha.insertCell();
    celula.outerHTML = "<th>Visitante</th>";


    jogosIda.forEach(jogo => {
        let linha = tabela.insertRow();

        let celula = linha.insertCell();
        celula.textContent = jogo.timeA;

        celula = linha.insertCell();
        celula.textContent = jogo.timeAGols +  " - " + jogo.timeBGols;

        celula = linha.insertCell();
        celula.textContent = jogo.timeB;
    });

    jogosVolta.forEach(jogo => {
        let linha = tabela.insertRow();

        let celula = linha.insertCell();
        celula.textContent = jogo.timeA;

        celula = linha.insertCell();
        celula.textContent = jogo.timeAGols +  " - " + jogo.timeBGols;

        celula = linha.insertCell();
        celula.textContent = jogo.timeB;
    });

    return tabela;
}


function criarTabelaPontos(times){
    let tabela = document.createElement('table');

    tabela.classList.add("tabelas-jogos");

    let header = tabela.createTHead();

    let linha = header.insertRow();

    let celula = linha.insertCell();
    celula.outerHTML = "<th>Time</th>";

    celula = linha.insertCell();
    celula.outerHTML = "<th>Pontos</th>";

    times.forEach(time => {
        let linha = tabela.insertRow();

        let celula = linha.insertCell();
        celula.textContent = time.nome;

        celula = linha.insertCell();
        celula.textContent = time.pontos;
    });

    return tabela;
}

