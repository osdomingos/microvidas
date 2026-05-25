import Esfera from "./Esfera.js";

class EsferaResidual extends Esfera {

    constructor(cwidth, cheight, substrateLayer, x = null, y = null, linhaOrigem = null, corOrigem = null) {
        super(cwidth, cheight, substrateLayer, x, y, linhaOrigem, corOrigem, "residual");

        this.raioMaxResidual = this.raioOriginal * random(1.5, 2);
        this.tempoSurtoResidual = 0;
    }

    absorverPonto(ponto) {
        super.absorverPonto(ponto);

        this.criarPontilhadoResidual();

        this.raioAlvo += random(0.9, 1.8);
        this.raioAlvo = constrain(
            this.raioAlvo,
            this.raioOriginal,
            this.raioMaxResidual
        );

        this.tempoSurtoResidual = floor(random(60, 120));
    }

    criarPontilhadoResidual() {
        let quantidade = floor(random(3, 8));

        for (let i = 0; i < quantidade; i++) {
            this.manchas.push({
                x: random(-0.75, 0.75),
                y: random(-0.75, 0.75),
                tamanho: random(0.7, 1.3),
                cor: color(
                    random(30, 90),
                    random(80, 160),
                    random(40, 90),
                    random(70, 130)
                )
            });
        }
    }

    comportamentoExtra() {
        this.surtoResidual();
    }

    surtoResidual() {
        if (this.tempoSurtoResidual <= 0) return;

        let impulso = p5.Vector.random2D().mult(
            map(
                this.tempoSurtoResidual,
                70,
                0,
                5,
                0.4
            )
        );

        this.position.add(impulso);
        this.rotacao += random(-0.9, 0.9);
        this.raioBase += random(-0.8, 1.2);

        this.velocity.add(
            p5.Vector.random2D().mult(random(0.15, 0.4))
        );

        this.velocity.limit(1.8);
        this.tempoSurtoResidual--;
    }
}

export default EsferaResidual;
