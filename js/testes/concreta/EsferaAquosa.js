import Esfera from "./Esfera.js";

class EsferaAquosa extends Esfera {

    constructor(cwidth, cheight, substrateLayer, x = null, y = null, linhaOrigem = null, corOrigem = null) {
        super(cwidth, cheight, substrateLayer, x, y, linhaOrigem, corOrigem, "aquoso");

        this.corMembrana = this.sortearCorMembrana();
        this.membranaRaio = this.raioBase;
        this.membranaRaioAlvo = this.raioBase;
        this.membranaRaioMax = this.raioOriginal * 2;
        this.membranaAlpha = random(100, 170);
    }

    absorverPonto(ponto) {
        super.absorverPonto(ponto);

        this.membranaRaioAlvo += random(4, 8);
        this.membranaRaioAlvo = constrain(
            this.membranaRaioAlvo,
            this.raioBase,
            this.membranaRaioMax
        );
    }

    atualizar() {
        this.membranaRaio = lerp(
            this.membranaRaio,
            this.membranaRaioAlvo,
            0.06
        );
    }

    exibirForma() {
        this.exibirMembrana();
        this.exibirCorpoCheio();
        this.exibirManchas();
    }

    exibirMembrana() {
        fill(
            red(this.corMembrana),
            green(this.corMembrana),
            blue(this.corMembrana),
            this.membranaAlpha
        );

        stroke(
            red(this.corMembrana),
            green(this.corMembrana),
            blue(this.corMembrana),
            180
        );

        strokeWeight(1.2);
        ellipse(0, 0, this.membranaRaio * 2);
        noStroke();
    }
}

export default EsferaAquosa;
