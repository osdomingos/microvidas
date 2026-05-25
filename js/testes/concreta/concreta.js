import Ponto from "./Ponto.js";
import Linha from "./Linha.js";
import criarEsfera from "./criarEsfera.js";

let cwidth = window.innerWidth;
let cheight = window.innerHeight;

const MAX_PONTOS = 220;
const MAX_ESFERAS = 100;
const MAX_PONTOS_EXPLOSAO = 75;

let substrateLayer;
let substrateCacheLayer;
let intervaloCacheSubstrato = 600;

let pontos = [];
let linhas = [];
let esferas = [];

let cooldownReproducaoEsferas = 0;
let sistemaPodeCriarLinhas = false;
let tempoInicioSistema;
let atrasoCriacaoLinhas;
let MAX_LINHAS;

let videoAtual;
let videoPronto = false;
let videoEmExecucao = false;

let ecossistemaIniciado = false;
let LIMIAR_VIDEO_REINICIO;

let fpsBaixoFrames = 0;
let FPS_MINIMO_REINICIO = 28;
let FRAMES_FPS_BAIXO_PARA_REINICIAR = 180;

window.setup = function () {

    createCanvas(
        windowWidth,
        windowHeight,
        WEBGL
    );

    cwidth = width;
    cheight = height;

    substrateLayer = createGraphics(
        cwidth,
        cheight
    );

    substrateCacheLayer = createGraphics(
        cwidth,
        cheight
    );

    substrateLayer.clear();
    substrateCacheLayer.clear();

    MAX_LINHAS = floor(
        random(12, 22)
    );

    LIMIAR_VIDEO_REINICIO = floor(
        random(40, 61)
    );

    prepararVideoAleatorio();

};

window.draw = function () {

    background(255);

    if (exibirVideoAtual()) {
        return;
    }

    if (!ecossistemaIniciado) {
        reiniciarEcossistema();
    }

    verificarReinicioPorPerformance();

    if (
        pontos.length <= 3 &&
        !videoEmExecucao
    ) {
    
        prepararVideoAleatorio();
    
        return;
    
    }

    if (videoEmExecucao) {
        return;
    }

    if (esferas.length >= LIMIAR_VIDEO_REINICIO) {
        iniciarCicloDeVideo();
        return;
    }

    image(
        substrateCacheLayer,
        -cwidth / 2,
        -cheight / 2
    );

    image(
        substrateLayer,
        -cwidth / 2,
        -cheight / 2
    );

    let gridPontos = criarGridEspacial(pontos, 70);
    let gridEsferas = criarGridEspacial(esferas, 90);

    animarLinhas();

    verificarReproducaoEsferas();

    animarEsferas(gridPontos, gridEsferas);

    animarPontos();

    if (
        !sistemaPodeCriarLinhas &&
        millis() - tempoInicioSistema > atrasoCriacaoLinhas
    ) {
        sistemaPodeCriarLinhas = true;
    }

    if (sistemaPodeCriarLinhas) {
        verificarCriacaoDeLinhas(gridPontos);
    }

    compactarSubstrato();

};

window.mousePressed = function () {

    if (
        videoEmExecucao &&
        videoAtual
    ) {
        videoAtual.elt.play();
    }

};

function caminhosVideos() {

    return [
        new URL("./videos/um.mp4", import.meta.url).href,
        new URL("./videos/dois.mp4", import.meta.url).href,
        new URL("./videos/tres.mp4", import.meta.url).href,
        new URL("./videos/quatro.mp4", import.meta.url).href
    ];

}

function prepararVideoAleatorio() {

    let videos = caminhosVideos();

    videoPronto = false;
    videoEmExecucao = true;

    if (videoAtual) {
        videoAtual.remove();
        videoAtual = null;
    }

    videoAtual = createVideo(
        random(videos)
    );

    videoAtual.hide();
    videoAtual.volume(0);

    videoAtual.elt.muted = true;
    videoAtual.elt.playsInline = true;
    videoAtual.elt.autoplay = true;

    videoAtual.elt.oncanplay = function () {

        videoPronto = true;

        videoAtual.elt.play().catch(function () {
            console.log("Autoplay bloqueado. Clique no canvas para iniciar.");
        });

    };

    videoAtual.elt.onended = function () {

        videoEmExecucao = false;

        reiniciarEcossistema();

    };

    videoAtual.elt.onerror = function () {

        console.log(
            "Erro ao carregar vídeo:",
            videoAtual.elt.src
        );

        videoEmExecucao = false;

        reiniciarEcossistema();

    };

}

function exibirVideoAtual() {

    if (!videoEmExecucao) {
        return false;
    }

    if (!videoPronto) {
        exibirLoadingVideo();
        return true;
    }

    background(0);

    image(
        videoAtual,
        -cwidth / 2,
        -cheight / 2,
        cwidth,
        cheight
    );

    return true;

}

function exibirLoadingVideo() {

    background(245);

    push();

    resetMatrix();

    fill(30);
    noStroke();

    textAlign(CENTER, CENTER);
    textSize(22);
    textFont("Arial, Helvetica, sans-serif");

    text(
        "carregando visualização de microvidas",
        0,
        0
    );

    pop();

}

function iniciarCicloDeVideo() {

    ecossistemaIniciado = false;
    fpsBaixoFrames = 0;

    prepararVideoAleatorio();

}

function verificarReinicioPorPerformance() {

    if (videoEmExecucao) return;
    if (!ecossistemaIniciado) return;

    if (frameRate() < FPS_MINIMO_REINICIO) {
        fpsBaixoFrames++;
    } else {
        fpsBaixoFrames = 0;
    }

    if (
        fpsBaixoFrames >
        FRAMES_FPS_BAIXO_PARA_REINICIAR
    ) {
        iniciarCicloDeVideo();
    }

}

function reiniciarEcossistema() {

    pontos = [];
    linhas = [];
    esferas = [];

    substrateLayer.clear();
    substrateCacheLayer.clear();

    sistemaPodeCriarLinhas = false;
    cooldownReproducaoEsferas = 0;
    fpsBaixoFrames = 0;

    MAX_LINHAS = floor(
        random(12, 22)
    );

    LIMIAR_VIDEO_REINICIO = floor(
        random(40, 61)
    );

    iniciarEcossistema();

    tempoInicioSistema = millis();

    atrasoCriacaoLinhas = random(
        12000,
        24000
    );

    ecossistemaIniciado = true;

}

function iniciarEcossistema() {

    let quantidadePontos = floor(
        random(70, 90)
    );

    for (let i = 0; i < quantidadePontos; i++) {
        pontos.push(
            new Ponto(
                cwidth,
                cheight,
                substrateLayer
            )
        );
    }

}

function animarPontos() {

    for (let i = pontos.length - 1; i >= 0; i--) {
        let ponto = pontos[i];

        ponto.comportar();
        ponto.exibir();

        if (!ponto.vivo) {
            if (ponto.motivoMorte === "borda") {
                criarPontoAPartirDeOutro();
            }

            pontos.splice(i, 1);
        }
    }

}

function animarLinhas() {

    for (let i = linhas.length - 1; i >= 0; i--) {
        let linha = linhas[i];

        linha.comportar();

        if (
            linha.pontoLaco &&
            esferas.length < MAX_ESFERAS
        ) {
            esferas.push(
                criarEsfera(
                    cwidth,
                    cheight,
                    substrateLayer,
                    linha.pontoLaco.x,
                    linha.pontoLaco.y,
                    linha,
                    linha.cor
                )
            );

            linha.pontoLaco = null;
        }

        linha.exibir();

        if (!linha.viva) {
            linhas.splice(i, 1);
        }
    }

}

function animarEsferas(gridPontos, gridEsferas) {

    for (let i = esferas.length - 1; i >= 0; i--) {
        let esfera = esferas[i];

        let pontosProximos = consultarVizinhos(
            gridPontos,
            esfera.position,
            1
        );

        let esferasProximas = consultarVizinhos(
            gridEsferas,
            esfera.position,
            1
        );

        esfera.comportar(
            pontosProximos,
            esferasProximas
        );

        if (esfera.esferaQuebrada) {
            explodirEsferaEmPontos(
                esfera.esferaQuebrada
            );

            esfera.esferaQuebrada.vivo = false;
            esfera.esferaQuebrada = null;
        }

        esfera.exibir();

        if (!esfera.vivo) {
            esferas.splice(i, 1);
        }
    }

}

function verificarCriacaoDeLinhas(gridPontos) {

    if (linhas.length >= MAX_LINHAS) return;
    if (frameCount % 2 !== 0) return;

    for (let a of pontos) {
        if (!a.vivo) continue;
        if (a.ancorado) continue;
        if (a.tempoSemLinha > 0) continue;

        let candidatos = consultarVizinhos(
            gridPontos,
            a.position,
            1
        );

        for (let b of candidatos) {
            if (a === b) continue;
            if (!b.vivo) continue;
            if (b.ancorado) continue;
            if (b.tempoSemLinha > 0) continue;

            let d = dist(
                a.position.x,
                a.position.y,
                b.position.x,
                b.position.y
            );

            let distanciaSobreposicao =
                (a.tamanho + b.tamanho) * 0.5;

            if (
                d < distanciaSobreposicao &&
                random(1) < 0.02
            ) {
                let linha = new Linha(
                    a,
                    b,
                    cwidth,
                    cheight,
                    substrateLayer
                );

                linhas.push(linha);

                a.ancorarEmLinha(linha);
                b.ancorarEmLinha(linha);

                return;
            }
        }
    }

}

function criarPontoAPartirDeOutro() {

    if (pontos.length >= MAX_PONTOS) return;

    let origem = random(pontos);
    if (!origem) return;

    let novoPonto = new Ponto(
        cwidth,
        cheight,
        substrateLayer
    );

    novoPonto.position.x =
        origem.position.x + random(-8, 8);

    novoPonto.position.y =
        origem.position.y + random(-8, 8);

    pontos.push(novoPonto);

}

function explodirEsferaEmPontos(esfera) {

    let espacoDisponivel = MAX_PONTOS - pontos.length;
    if (espacoDisponivel <= 0) return;

    let quantidade = floor(
        map(
            esfera.raioBase,
            5,
            40,
            10,
            MAX_PONTOS_EXPLOSAO,
            true
        )
    );

    quantidade = min(
        quantidade,
        espacoDisponivel
    );

    for (let i = 0; i < quantidade; i++) {
        let novoPonto = new Ponto(
            cwidth,
            cheight,
            substrateLayer
        );

        let direcao = p5.Vector.random2D();

        novoPonto.position.x =
            esfera.position.x + random(-3, 3);

        novoPonto.position.y =
            esfera.position.y + random(-3, 3);

        novoPonto.tamanho = random(1.5, 5.5);
        novoPonto.tamanhoBase = novoPonto.tamanho;

        novoPonto.emExplosao = true;

        novoPonto.velocidadeExplosao =
            direcao.mult(
                random(2.5, 6)
            );

        novoPonto.tempoExplosao = floor(
            random(80, 150)
        );

        novoPonto.imuneComida = floor(
            random(90, 160)
        );

        novoPonto.tempoProtegido = floor(
            random(90, 160)
        );

        novoPonto.tempoSemLinha = floor(
            random(120, 220)
        );

        novoPonto.motivoMorte = null;

        pontos.push(novoPonto);
    }

}

function compactarSubstrato() {

    if (frameCount % intervaloCacheSubstrato !== 0) return;

    substrateCacheLayer.image(
        substrateLayer,
        0,
        0
    );

    substrateLayer.clear();

}

function criarGridEspacial(lista, tamanhoCelula) {

    let grid = new Map();

    for (let item of lista) {
        if (!item.vivo) continue;

        let chave = chaveCelula(
            item.position,
            tamanhoCelula
        );

        if (!grid.has(chave)) {
            grid.set(chave, []);
        }

        grid.get(chave).push(item);
    }

    return {
        mapa: grid,
        tamanhoCelula: tamanhoCelula
    };

}

function consultarVizinhos(grid, position, raioCelulas = 1) {

    let resultado = [];

    let cx = floor(
        (position.x + cwidth / 2) /
        grid.tamanhoCelula
    );

    let cy = floor(
        (position.y + cheight / 2) /
        grid.tamanhoCelula
    );

    for (let dx = -raioCelulas; dx <= raioCelulas; dx++) {
        for (let dy = -raioCelulas; dy <= raioCelulas; dy++) {
            let chave = `${cx + dx},${cy + dy}`;
            let celula = grid.mapa.get(chave);

            if (celula) {
                resultado.push(...celula);
            }
        }
    }

    return resultado;

}

function chaveCelula(position, tamanhoCelula) {

    let cx = floor(
        (position.x + cwidth / 2) /
        tamanhoCelula
    );

    let cy = floor(
        (position.y + cheight / 2) /
        tamanhoCelula
    );

    return `${cx},${cy}`;

}

function verificarReproducaoEsferas() {

    if (esferas.length >= MAX_ESFERAS) return;

    if (cooldownReproducaoEsferas > 0) {
        cooldownReproducaoEsferas--;
        return;
    }

    for (let i = 0; i < esferas.length; i++) {

        let a = esferas[i];

        if (!a.vivo) continue;
        if (a.estadoNascimento !== "livre") continue;

        for (let j = i + 1; j < esferas.length; j++) {

            let b = esferas[j];

            if (!b.vivo) continue;
            if (b.estadoNascimento !== "livre") continue;
            if (a.qualidade !== b.qualidade) continue;

            let d = dist(
                a.position.x,
                a.position.y,
                b.position.x,
                b.position.y
            );

            let distanciaContato =
                a.raioBase +
                b.raioBase +
                8;

            if (d < distanciaContato) {

                criarEsferaFilha(a, b);

                cooldownReproducaoEsferas = floor(
                    random(90, 180)
                );

                return;

            }

        }

    }

}

function criarEsferaFilha(a, b) {

    if (esferas.length >= MAX_ESFERAS) return;

    let x =
        (a.position.x + b.position.x) / 2 +
        random(-8, 8);

    let y =
        (a.position.y + b.position.y) / 2 +
        random(-8, 8);

    let corMedia = color(
        (red(a.corBase) + red(b.corBase)) / 2,
        (green(a.corBase) + green(b.corBase)) / 2,
        (blue(a.corBase) + blue(b.corBase)) / 2
    );

    let filha = criarEsfera(
        cwidth,
        cheight,
        substrateLayer,
        x,
        y,
        null,
        corMedia,
        a.qualidade
    );

    filha.raioBase = random(
        2,
        4
    );

    filha.raioAlvo = random(
        6,
        11
    );

    filha.velocity = p5.Vector.random2D().mult(
        random(0.3, 0.9)
    );

    esferas.push(filha);

}

window.windowResized = function () {

    resizeCanvas(
        windowWidth,
        windowHeight
    );

    cwidth = width;
    cheight = height;

    substrateLayer = createGraphics(
        cwidth,
        cheight
    );

    substrateCacheLayer = createGraphics(
        cwidth,
        cheight
    );

};
