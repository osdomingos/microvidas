import Substrato from "./Substrato.js";

class Ponto {

    constructor(cwidth, cheight, substrateLayer) {
        this.cwidth = cwidth;
        this.cheight = cheight;
        this.substrateLayer = substrateLayer;

        this.nome = "ponto";
        this.tipo = "unidade_minima";

        this.position = createVector(
            random(-this.cwidth / 2, this.cwidth / 2),
            random(-this.cheight / 2, this.cheight / 2)
        );

        this.velocity = p5.Vector.random2D().mult(random(0.2, 0.8));

        this.tamanho = random(4, 12);
        this.tamanhoBase = this.tamanho;

        this.corBase = color(random(10, 40));
        this.corAtual = this.corBase;

        this.vida = random(80, 140);
        this.energia = random(50, 100);
        this.fome = random(0, 30);

        this.estado = "deriva";
        this.vivo = true;
        this.idade = 0;

        this.noiseTempo = random(1000);
        this.noiseEscala = random(0.002, 0.006);

        this.ancorado = false;
        this.linhaAncorada = null;
        this.tempoVibracaoSoltura = 0;

        this.motivoMorte = null;
        this.tempoProtegido = 0;
        this.tempoSemLinha = 0;

        this.emExplosao = false;
        this.velocidadeExplosao = createVector(0, 0);
        this.tempoExplosao = 0;
        this.imuneComida = 0;

        this.substrato = new Substrato(
            this.position.x,
            this.position.y,
            "acido",
            this.substrateLayer,
            this.cwidth,
            this.cheight
        );
    }

    comportar() {
        if (this.imuneComida > 0) this.imuneComida--;
        if (this.tempoSemLinha > 0) this.tempoSemLinha--;

        if (this.emExplosao) {
            this.position.add(this.velocidadeExplosao);
            this.velocidadeExplosao.mult(0.965);
            this.tempoExplosao--;

            if (this.tempoExplosao <= 0) {
                this.emExplosao = false;
            }

            if (frameCount % 6 === 0) {
                this.produzirSubstrato(0.75);
            }

            return;
        }

        this.envelhecer();
        this.gastarEnergia();
        this.alimentar();

        if (this.tempoVibracaoSoltura > 0) {
            this.estado = "desprendendo";
            this.moverComPerlin();
            this.vibrarSoltura();
        } else {
            this.estado = this.ancorado ? "arrastando_linha" : "deriva";
            this.moverComPerlin();
        }

        this.deslocar();

        if (frameCount % 3 === 0) {
            this.produzirSubstrato(1);
        }

        this.verificarMorte();
    }

    moverComPerlin() {
        let n = noise(
            this.position.x * this.noiseEscala,
            this.position.y * this.noiseEscala,
            this.noiseTempo
        );

        let angulo = n * TWO_PI * 4;
        let forca = p5.Vector.fromAngle(angulo).mult(0.08);

        this.velocity.add(forca);
        this.velocity.limit(1.4);
        this.noiseTempo += 0.004;
    }

    ancorarEmLinha(linha) {
        if (this.ancorado) return;
        this.ancorado = true;
        this.linhaAncorada = linha;
        this.estado = "arrastando_linha";
    }

    iniciarVibracaoDesprendimento(duracao) {
        this.tempoVibracaoSoltura = duracao;
        this.estado = "desprendendo";
    }

    desancorar() {
        this.ancorado = false;
        this.linhaAncorada = null;
        this.estado = "deriva";
    }

    vibrarSoltura() {
        this.position.x += random(-1.4, 1.4);
        this.position.y += random(-1.4, 1.4);
        this.velocity.mult(0.78);

        this.tamanho = lerp(
            this.tamanho,
            this.tamanhoBase * 1.5,
            0.08
        );

        this.tempoVibracaoSoltura--;

        if (this.tempoVibracaoSoltura <= 0) {
            this.tamanho = this.tamanhoBase;
        }
    }

    deslocar() {
        this.position.add(this.velocity);

        if (this.tempoProtegido > 0) {
            this.tempoProtegido--;
            this.velocity.mult(0.985);
            return;
        }

        let margem = this.tamanho * 0.5;

        if (
            this.position.x > this.cwidth / 2 + margem ||
            this.position.x < -this.cwidth / 2 - margem ||
            this.position.y > this.cheight / 2 + margem ||
            this.position.y < -this.cheight / 2 - margem
        ) {
            this.motivoMorte = "borda";
            this.vivo = false;
        }

        this.velocity.mult(0.96);
    }

    alimentar() {
        this.fome += 0.006;

        if (this.fome > 80) {
            this.energia -= 0.01;
        }

        this.fome = constrain(this.fome, 0, 100);
    }

    produzirSubstrato(intensidade = 1) {
        this.substrato.position.x = this.position.x;
        this.substrato.position.y = this.position.y;

        if (random(1) < 0.23) {
            this.substrato.pintar(intensidade);
        }
    }

    envelhecer() {
        this.idade += 0.01;

        if (this.idade > 700) {
            this.vida -= 0.005;
        }
    }

    gastarEnergia() {
        this.energia -= 0.002;

        if (this.energia <= 0) {
            this.vida -= 0.01;
        }

        this.energia = constrain(this.energia, 0, 100);
    }

    verificarMorte() {
        if (this.vida <= 0) {
            this.vivo = false;
        }
    }

    exibir() {
        push();
        translate(this.position.x, this.position.y);
        noStroke();
        fill(this.corAtual);
        ellipse(0, 0, this.tamanho);
        pop();
    }
}

export default Ponto;
