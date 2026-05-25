import Substrato from "./Substrato.js";
import PALETA_MICROBIOLOGIA from "./Paleta.js";

class Esfera {

    constructor(
        cwidth,
        cheight,
        substrateLayer,
        x = null,
        y = null,
        linhaOrigem = null,
        corOrigem = null,
        qualidade = "base"
    ) {
        this.cwidth = cwidth;
        this.cheight = cheight;
        this.substrateLayer = substrateLayer;

        this.position = createVector(
            x !== null ? x : random(-cwidth / 2, cwidth / 2),
            y !== null ? y : random(-cheight / 2, cheight / 2)
        );

        this.linhaOrigem = linhaOrigem;
        this.estadoNascimento = linhaOrigem ? "presa_laco" : "livre";
        this.noiseNascimento = random(1000);

        this.raioAlvo = random(7, 13);
        this.raioOriginal = this.raioAlvo;
        this.raioBase = linhaOrigem ? 0.2 : this.raioAlvo;

        this.velocity = p5.Vector.random2D().mult(random(0.1, 0.45));
        this.vivo = true;

        this.rotacao = random(TWO_PI);
        this.velRotacao = random(-0.03, 0.03);
        this.noiseRot = random(1000);
        this.noiseMovX = random(1000);
        this.noiseMovY = random(1000);

        this.qualidade = qualidade;

        this.corBase = corOrigem
            ? color(red(corOrigem), green(corOrigem), blue(corOrigem))
            : this.sortearCorBase();

        this.manchas = [];
        this.esferaQuebrada = null;

        this.substrato = new Substrato(
            this.position.x,
            this.position.y,
            this.qualidade,
            this.substrateLayer,
            this.cwidth,
            this.cheight
        );

        this.noiseDirecao = random(1000);
        this.tempoMudancaDirecao = floor(random(90, 220));
        this.vetorDirecao = p5.Vector.random2D();

        this.forcaCentro = random(0.0015, 0.004);
        this.forcaCanto = random(0.02, 0.06);
    }

    comportar(pontos, esferas) {
        if (this.estadoNascimento === "presa_laco") {
            this.crescerNoLaco();
            this.rotacionar();
            return;
        }

        this.interagir(pontos, esferas);
        this.mover();
        this.seguirSemelhantes(esferas);
        this.comportamentoExtra();

        this.raioBase = lerp(this.raioBase, this.raioAlvo, 0.06);

        this.deslocar();
        this.colidirComEsferas(esferas);
        this.rotacionar();
        this.atualizar();
        this.produzirSubstrato();
    }

    interagir(pontos, esferas) {
        this.procurarEComerPontos(pontos);
    }

    comportamentoExtra() { }

    atualizar() { }

    crescerNoLaco() {
        if (this.linhaOrigem && this.linhaOrigem.pontoLaco) {
            let tremorX = map(noise(this.noiseNascimento), 0, 1, -0.6, 0.6);
            let tremorY = map(noise(this.noiseNascimento + 100), 0, 1, -0.6, 0.6);

            this.position.x = lerp(
                this.position.x,
                this.linhaOrigem.pontoLaco.x + tremorX,
                0.045
            );

            this.position.y = lerp(
                this.position.y,
                this.linhaOrigem.pontoLaco.y + tremorY,
                0.045
            );

            this.noiseNascimento += 0.01;
        }

        this.raioBase = lerp(this.raioBase, this.raioAlvo, 0.012);

        if (abs(this.raioBase - this.raioAlvo) < 0.12) {
            this.raioBase = this.raioAlvo;
            this.estadoNascimento = "livre";
            this.linhaOrigem = null;
        }
    }

    procurarEComerPontos(pontos) {
        for (let ponto of pontos) {
            if (!ponto.vivo) continue;
            if (ponto.imuneComida && ponto.imuneComida > 0) continue;

            let d = dist(
                this.position.x,
                this.position.y,
                ponto.position.x,
                ponto.position.y
            );

            if (d < this.raioBase + ponto.tamanho) {
                ponto.motivoMorte = "comido";
                ponto.vivo = false;
                this.absorverPonto(ponto);
            }
        }
    }

    absorverPonto(ponto) {
        this.aumentarVelocidadeAoComer();
    }

    aumentarVelocidadeAoComer() {
        this.velocity.mult(random(1.06, 1.12));
        this.velocity.limit(2.2);
    }

    mover() {

        let vx = map(
            noise(this.noiseMovX),
            0,
            1,
            -0.08,
            0.08
        );
    
        let vy = map(
            noise(this.noiseMovY),
            0,
            1,
            -0.08,
            0.08
        );
    
        this.velocity.add(
            createVector(vx, vy)
        );
    
        this.alterarDirecaoOrganicamente();
    
        this.afastarDosCantos();
    
        this.puxarLevementeParaCentro();
    
        this.velocity.limit(1.4);
    
        this.noiseMovX += 0.005;
        this.noiseMovY += 0.005;
    
    }

    deslocar() {

        this.position.add(this.velocity);
    
        let margem = this.raioBase;
    
        /*
        wrap simétrico
        sem alterar velocidade
        */
    
        if (
            this.position.x >
            this.cwidth/2 + margem
        ){
    
            this.position.x =
            -this.cwidth/2 - margem;
    
        }
    
        else if(
    
            this.position.x <
            -this.cwidth/2 - margem
    
        ){
    
            this.position.x =
            this.cwidth/2 + margem;
    
        }
    
        if(
    
            this.position.y >
            this.cheight/2 + margem
    
        ){
    
            this.position.y =
            -this.cheight/2 - margem;
    
        }
    
        else if(
    
            this.position.y <
            -this.cheight/2 - margem
    
        ){
    
            this.position.y =
            this.cheight/2 + margem;
    
        }
    
    }

    colidirComEsferas(esferas) {
        if (!esferas) return;

        for (let outra of esferas) {
            if (outra === this) continue;
            if (!outra.vivo) continue;

            let direcao = p5.Vector.sub(this.position, outra.position);
            let d = direcao.mag();

            if (d === 0) {
                direcao = p5.Vector.random2D();
                d = 0.01;
            }

            let distanciaMinima = this.raioBase + outra.raioBase;

            if (d < distanciaMinima) {
                let sobreposicao = distanciaMinima - d;
                direcao.normalize();

                this.position.add(p5.Vector.mult(direcao, sobreposicao * 0.7));
                outra.position.sub(p5.Vector.mult(direcao, sobreposicao * 0.7));

                this.velocity.add(p5.Vector.mult(direcao, 0.12));
                outra.velocity.sub(p5.Vector.mult(direcao, 0.12));
            }
        }
    }

    rotacionar() {
        this.rotacao += this.velRotacao + map(noise(this.noiseRot), 0, 1, -0.01, 0.01);
        this.noiseRot += 0.004;
    }

    produzirSubstrato() {
        this.substrato.position = this.position.copy();

        let chance = this.chanceSubstrato();

        if (frameCount % 2 === 0 && random(1) < chance) {
            this.substrato.pintar(this.intensidadeSubstrato());
        }
    }

    chanceSubstrato() {
        if (this.qualidade === "aquoso") return 0.12;
        if (this.qualidade === "alcalino") return 0.09;
        if (this.qualidade === "residual") return 0.12;
        if (this.qualidade === "neutro") return 0.08;
        return 0.1;
    }

    intensidadeSubstrato() {
        if (this.qualidade === "residual") return 1.25;
        if (this.qualidade === "aquoso") return 1.15;
        return 1;
    }

    exibir() {
        push();
        translate(this.position.x, this.position.y);
        rotate(this.rotacao);
        this.exibirForma();
        pop();
    }

    exibirForma() {
        this.exibirCorpoCheio();
        this.exibirManchas();
    }

    exibirCorpoCheio() {
        noStroke();
        fill(this.corBase);
        ellipse(0, 0, this.raioBase * 2);
    }

    exibirManchas() {
        for (let m of this.manchas) {
            fill(m.cor);
            ellipse(m.x * this.raioBase, m.y * this.raioBase, m.tamanho);
        }
    }

    sortearCorBase() {
        return color(random(PALETA_MICROBIOLOGIA));
    }

    sortearCorMembrana() {
        return color(random(PALETA_MICROBIOLOGIA));
    }

    alterarDirecaoOrganicamente() {

        this.tempoMudancaDirecao--;
    
        if (this.tempoMudancaDirecao <= 0) {
    
            let angulo = noise(this.noiseDirecao) * TWO_PI * 4;
    
            this.vetorDirecao = p5.Vector.fromAngle(angulo);
    
            this.vetorDirecao.mult(
                random(0.08, 0.22)
            );
    
            this.velocity.add(
                this.vetorDirecao
            );
    
            this.tempoMudancaDirecao = floor(
                random(70, 180)
            );
    
            this.noiseDirecao += random(0.2, 0.8);
    
        }
    
    }
    
    afastarDosCantos() {
    
        let limiteX = this.cwidth / 2;
        let limiteY = this.cheight / 2;
    
        let margemX = limiteX * 0.18;
        let margemY = limiteY * 0.18;
    
        let pertoDireita =
            this.position.x > limiteX - margemX;
    
        let pertoEsquerda =
            this.position.x < -limiteX + margemX;
    
        let pertoBaixo =
            this.position.y > limiteY - margemY;
    
        let pertoCima =
            this.position.y < -limiteY + margemY;
    
        if (
            (pertoDireita || pertoEsquerda) &&
            (pertoBaixo || pertoCima)
        ) {
    
            let fuga = p5.Vector.mult(
                this.position,
                -1
            );
    
            fuga.normalize();
    
            fuga.mult(this.forcaCanto);
    
            this.velocity.add(fuga);
    
        }
    
    }

    puxarLevementeParaCentro() {

        let centro = createVector(0, 0);
    
        let direcaoCentro = p5.Vector.sub(
            centro,
            this.position
        );
    
        let distancia = direcaoCentro.mag();
    
        let limite = min(
            this.cwidth,
            this.cheight
        ) * 0.28;
    
        if (distancia > limite) {
    
            direcaoCentro.normalize();
    
            direcaoCentro.mult(this.forcaCentro);
    
            this.velocity.add(direcaoCentro);
    
        }
    
    }

    seguirSemelhantes(esferas) {

        if (!esferas) return;
    
        let centroGrupo = createVector(0, 0);
        let quantidade = 0;
    
        let raioInfluencia =
            min(this.cwidth, this.cheight) * 0.22;
    
        for (let outra of esferas) {
    
            if (outra === this) continue;
            if (!outra.vivo) continue;
            if (outra.qualidade !== this.qualidade) continue;
            if (outra.estadoNascimento !== "livre") continue;
    
            let d = dist(
                this.position.x,
                this.position.y,
                outra.position.x,
                outra.position.y
            );
    
            if (d < raioInfluencia) {
    
                centroGrupo.add(outra.position);
                quantidade++;
    
            }
    
        }
    
        if (quantidade === 0) return;
    
        centroGrupo.div(quantidade);
    
        let tendencia = p5.Vector.sub(
            centroGrupo,
            this.position
        );
    
        if (tendencia.mag() === 0) return;
    
        tendencia.normalize();
    
        tendencia.mult(0.018);
    
        this.velocity.add(tendencia);
    
    }


}

export default Esfera;
