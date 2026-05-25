import paletaSubstrato from "./paletaSubstrato.js";

class Substrato {

    constructor(x, y, quimica, substrateLayer, cwidth, cheight) {
        this.position = createVector(x, y);
        this.quimica = quimica;
        this.cores = paletaSubstrato[this.quimica] || paletaSubstrato.neutro;
        this.substrateLayer = substrateLayer;
        this.cwidth = cwidth;
        this.cheight = cheight;
    }

    pintar(intensidade = 1) {
        if (!this.substrateLayer) return;

        let cor = random(this.cores);
        let x = this.position.x + this.cwidth / 2;
        let y = this.position.y + this.cheight / 2;

        this.substrateLayer.noStroke();

        let alphaBase = this.alphaPorQuimica();
        let alpha = floor(constrain(alphaBase * intensidade, 10, 85));
        let alphaHex = alpha.toString(16).padStart(2, "0");

        this.substrateLayer.fill(cor + alphaHex);

        let grandeMancha = random(1);
        let largura;
        let altura;

        if (grandeMancha < 0.05) {
            largura = random(34, 58);
            altura = random(34, 58);
        } else {
            largura = random(8, 28);
            altura = random(8, 28);
        }

        this.substrateLayer.ellipse(x, y, largura, altura);

        if (random(1) < 0.65) {
            this.pintarRuido(x, y, cor, intensidade);
        }

        if (random(1) < 0.18) {
            this.pintarVeias(x, y, cor, intensidade);
        }
    }

    alphaPorQuimica() {
        if (this.quimica === "neutro") return random(28, 58);
        if (this.quimica === "alcalino") return random(20, 44);
        if (this.quimica === "aquoso") return random(18, 40);
        if (this.quimica === "residual") return random(24, 54);
        if (this.quimica === "acido") return random(22, 48);
        return random(20, 45);
    }

    pintarRuido(x, y, cor, intensidade) {
        let qtd = floor(random(5, 12) * intensidade);
        this.substrateLayer.noStroke();

        for (let i = 0; i < qtd; i++) {
            let nx = x + random(-16, 16);
            let ny = y + random(-16, 16);
            this.substrateLayer.fill(cor + "30");
            this.substrateLayer.circle(nx, ny, random(0.5, 1.8));
        }
    }

    pintarVeias(x, y, cor, intensidade) {
        this.substrateLayer.noFill();
        this.substrateLayer.stroke(cor + "42");
        this.substrateLayer.strokeWeight(random(0.25, 0.8));
        this.substrateLayer.beginShape();

        let vx = x;
        let vy = y;
        let offset = random(1000);
        let passos = floor(random(3, 7));

        for (let i = 0; i < passos; i++) {
            let angulo = noise(offset + i * 0.12) * TWO_PI * 2;
            vx += cos(angulo) * random(2, 8) * intensidade;
            vy += sin(angulo) * random(2, 8) * intensidade;
            this.substrateLayer.curveVertex(vx, vy);
        }

        this.substrateLayer.endShape();
    }
}

export default Substrato;
