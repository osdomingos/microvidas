import Esfera from "./Esfera.js";

class EsferaAlcalina extends Esfera {

    constructor(cwidth, cheight, substrateLayer, x = null, y = null, linhaOrigem = null, corOrigem = null) {
        super(cwidth, cheight, substrateLayer, x, y, linhaOrigem, corOrigem, "alcalino");

        this.corStrokeAlcalino = this.corBase;
        this.corPixelAlcalino = color(
            constrain(red(this.corBase) + random(-45, 45), 0, 255),
            constrain(green(this.corBase) + random(-45, 45), 0, 255),
            constrain(blue(this.corBase) + random(-45, 45), 0, 255)
        );

        this.espessuraStrokeAlcalino = random(1.1, 2.2);
        this.densidadeContornoAlcalino = floor(random(110, 180));
    }

    absorverPonto(ponto) {
        super.absorverPonto(ponto);
        this.criarClusterAlcalino();
    }

    criarClusterAlcalino() {
        let centro = p5.Vector.random2D().mult(random(0, this.raioBase * 0.55));
        let quantidade = floor(random(12, 28));

        for (let i = 0; i < quantidade; i++) {
            let espalhamento = p5.Vector.random2D().mult(random(0, this.raioBase * 0.22));
            let x = centro.x + espalhamento.x;
            let y = centro.y + espalhamento.y;
            let d = dist(0, 0, x, y);

            if (d > this.raioBase * 0.72) continue;

            let variacao = random(-55, 55);
            let r = constrain(red(this.corPixelAlcalino) + variacao, 0, 255);
            let g = constrain(green(this.corPixelAlcalino) + variacao, 0, 255);
            let b = constrain(blue(this.corPixelAlcalino) + variacao, 0, 255);

            this.manchas.push({
                x: x / this.raioBase,
                y: y / this.raioBase,
                tamanho: random(0.45, 1.15),
                cor: color(r, g, b, random(90, 170))
            });
        }
    }

    exibirForma() {
        this.exibirManchas();
        this.exibirAlcalina();
    }

    exibirAlcalina() {
        push();
        noStroke();

        for (let i = 0; i < this.densidadeContornoAlcalino; i++) {
            let angulo = map(
                i,
                0,
                this.densidadeContornoAlcalino,
                0,
                TWO_PI
            );

            let ruido = noise(i * 0.08, frameCount * 0.005);
            let raio = this.raioBase + map(ruido, 0, 1, -0.25, 0.25);
            let x = cos(angulo) * raio;
            let y = sin(angulo) * raio;

            fill(
                red(this.corStrokeAlcalino),
                green(this.corStrokeAlcalino),
                blue(this.corStrokeAlcalino),
                240
            );

            ellipse(x, y, this.espessuraStrokeAlcalino, this.espessuraStrokeAlcalino);
        }

        pop();
    }
}

export default EsferaAlcalina;
