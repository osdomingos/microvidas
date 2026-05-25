import Esfera from "./Esfera.js";
import PALETA_MICROBIOLOGIA from "./Paleta.js";

class EsferaNeutra extends Esfera {

    constructor(cwidth, cheight, substrateLayer, x = null, y = null, linhaOrigem = null, corOrigem = null) {
        super(cwidth, cheight, substrateLayer, x, y, linhaOrigem, corOrigem, "neutro");

        this.corLinhasNeutras = color(random(PALETA_MICROBIOLOGIA));
        this.linhasContornoNeutro = [];
        this.criarLinhasContornoNeutro();

        this.vidaNeutra = random(
            1800,
            3600
        );
        
        this.vidaNeutraMax =
        this.vidaNeutra;
    }

    interagir(pontos, esferas) {

        this.quebrarEsferasAoContato(esferas);
    
        this.atualizarVida();
    
    }

    criarLinhasContornoNeutro() {
        let quantidade = floor(random(24, 42));

        for (let i = 0; i < quantidade; i++) {
            this.linhasContornoNeutro.push({
                angulo: random(TWO_PI),
                comprimento: random(7, 18),
                alpha: random(180, 255)
            });
        }
    }

    raioAtaque() {
        let maiorEspinho = 0;

        for (let l of this.linhasContornoNeutro) {
            maiorEspinho = max(maiorEspinho, l.comprimento);
        }

        return this.raioBase + maiorEspinho;
    }

    quebrarEsferasAoContato(esferas) {
        if (!esferas) return;

        let raioAtaque = this.raioAtaque();

        for (let outra of esferas) {
            if (outra === this) continue;
            if (!outra.vivo) continue;
            if (outra.estadoNascimento !== "livre") continue;
            if (outra.qualidade === "neutro") continue;

            let d = dist(
                this.position.x,
                this.position.y,
                outra.position.x,
                outra.position.y
            );

            let distanciaContato = raioAtaque + outra.raioBase;

            if (d < distanciaContato) {
                if (
                    outra.qualidade === "aquoso" &&
                    outra.membranaRaio &&
                    outra.membranaRaio > outra.raioBase + 1
                ) {
                    outra.membranaRaioAlvo = outra.raioBase;
                    outra.membranaRaio = outra.raioBase;
                    return;
                }

                this.esferaQuebrada = outra;
                return;
            }
        }
    }

    exibirForma() {
        this.exibirCorpoCheio();
        this.exibirLinhasNeutras();
    }

    exibirLinhasNeutras() {
        push();
        noStroke();

        for (let l of this.linhasContornoNeutro) {
            let r1 = this.raioBase * 0.85;
            let r2 = this.raioBase + l.comprimento;
            let passos = 5;

            for (let i = 0; i < passos; i++) {
                let t = i / (passos - 1);
                let r = lerp(r1, r2, t);
                let x = cos(l.angulo) * r;
                let y = sin(l.angulo) * r;

                fill(
                    red(this.corLinhasNeutras),
                    green(this.corLinhasNeutras),
                    blue(this.corLinhasNeutras),
                    230
                );

                ellipse(x, y, 2.2, 2.2);
            }
        }

        pop();
    }

    atualizarVida() {

        this.vidaNeutra--;
    
        let fatorVida = map(
    
            this.vidaNeutra,
    
            0,
            this.vidaNeutraMax,
    
            0,
            1,
    
            true
    
        );
    
        this.raioAlvo = lerp(
            this.raioAlvo,
            this.raioOriginal *
            fatorVida,
            0.004
        );
    
        if (
    
            this.vidaNeutra <= 0 ||
    
            this.raioAlvo < 0.8
    
        ){
    
            this.vivo = false;
    
        }
    
    }
}

export default EsferaNeutra;
