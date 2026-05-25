import PALETA_MICROBIOLOGIA from "./Paleta.js";

class Linha {

    constructor(pontoA, pontoB, cwidth, cheight, substrateLayer) {

        this.cwidth = cwidth;
        this.cheight = cheight;
        this.substrateLayer = substrateLayer;

        this.pontoA = pontoA;
        this.pontoB = pontoB;

        this.ancoraA = pontoA.position.copy();
        this.ancoraB = pontoB.position.copy();

        this.velocityA = p5.Vector.random2D().mult(random(0.12, 0.35));
        this.velocityB = p5.Vector.random2D().mult(random(0.12, 0.35));

        this.noiseA = random(1000);
        this.noiseB = random(1000);

        this.segmentos = [];
        this.quantidadeSegmentos = floor(random(8, 13));

        for (let i = 0; i < this.quantidadeSegmentos; i++) {
            this.segmentos.push({
                pos: createVector(),
                ruidoX: random(1000),
                ruidoY: random(1000),
                amplitude: random(5, 18),
                velocidade: random(0.004, 0.014)
            });
        }

        this.espessuraBase = max(
            0.35,
            min(pontoA.tamanho, pontoB.tamanho) * 0.18
        );

        this.espessura = this.espessuraBase;
        this.alpha = 210;
        this.fade = 1;

        this.viva = true;
        this.estado = "ancorada_invisivel";

        this.distanciaParaAparecer = max(
            18,
            (pontoA.tamanho + pontoB.tamanho) * 1.1
        );

        this.comprimentoSoltura = random(
            25,
            min(this.cwidth, this.cheight) * 0.055
        );

        this.comprimentoMorte = random(
            min(this.cwidth, this.cheight) * 0.22,
            min(this.cwidth, this.cheight) * 0.44
        );

        this.retilineidadeParaMorrer = random(0.72, 0.88);

        this.tempoSoltura = floor(random(45, 95));

        this.formouLaco = false;
        this.cooldownLaco = 0;
        this.pontoLaco = null;

        this.tempoLivre = 0;

        this.tempoMinimoEsfera = floor(random(180, 420));

        /*
        3–7 segundos aprox
        (60fps)
        */

        this.podeGerarEsfera = false;

        this.cor = color(
            random(PALETA_MICROBIOLOGIA)
        );
        
        this.cor.setAlpha(
            random(140,220)
        );
    }

    comportar() {

        if (this.estado === "morrendo") {
            this.apagarAteMorrer();
            this.atualizarFilamento();
            return;
        }

        if (
            this.estado === "ancorada_invisivel" ||
            this.estado === "ancorada_visivel"
        ) {
            this.manterPresoAosPontos();
            this.checarAparecimento();
            this.checarLimiteSoltura();
        }

        else if (this.estado === "soltando") {
            this.manterPresoAosPontos();
            this.vibrarSoltura();
        }

        else if (this.estado === "livre") {

            this.moverLivreOrganico();
        
            this.checarBordas();
        
            this.checarMortePorRetilineidade();
        
            this.tempoLivre++;
        
            if (this.tempoLivre > this.tempoMinimoEsfera) {
        
                this.podeGerarEsfera = true;
        
            }
        
        }

        this.atualizarFilamento();

        if (this.podeGerarEsfera && frameCount % 5 === 0) {

            this.pontoLaco = this.detectarLaco();
        
        }

    }

    manterPresoAosPontos() {

        if (!this.pontoA.vivo || !this.pontoB.vivo) {
            this.soltarSemMorrer();
            return;
        }

        this.ancoraA.x = this.pontoA.position.x;
        this.ancoraA.y = this.pontoA.position.y;

        this.ancoraB.x = this.pontoB.position.x;
        this.ancoraB.y = this.pontoB.position.y;

    }

    checarAparecimento() {

        let d = dist(
            this.ancoraA.x,
            this.ancoraA.y,
            this.ancoraB.x,
            this.ancoraB.y
        );

        if (
            this.estado === "ancorada_invisivel" &&
            d > this.distanciaParaAparecer
        ) {
            this.estado = "ancorada_visivel";
        }

    }

    checarLimiteSoltura() {

        let d = dist(
            this.ancoraA.x,
            this.ancoraA.y,
            this.ancoraB.x,
            this.ancoraB.y
        );

        if (
            this.estado === "ancorada_visivel" &&
            d >= this.comprimentoSoltura
        ) {
            this.iniciarSoltura();
        }

    }

    checarMortePorRetilineidade() {

        let comprimentoTela = dist(
            this.ancoraA.x,
            this.ancoraA.y,
            this.ancoraB.x,
            this.ancoraB.y
        );

        if (comprimentoTela < this.comprimentoMorte) return;

        let percurso = 0;

        let anterior = this.ancoraA;

        for (let seg of this.segmentos) {

            percurso += dist(
                anterior.x,
                anterior.y,
                seg.pos.x,
                seg.pos.y
            );

            anterior = seg.pos;

        }

        percurso += dist(
            anterior.x,
            anterior.y,
            this.ancoraB.x,
            this.ancoraB.y
        );

        let retilineidade = comprimentoTela / percurso;

        if (retilineidade > this.retilineidadeParaMorrer) {
            this.iniciarMorte();
        }

    }

    iniciarSoltura() {

        if (this.estado === "soltando") return;

        this.estado = "soltando";

        if (this.pontoA.vivo) {
            this.pontoA.iniciarVibracaoDesprendimento(this.tempoSoltura);
        }

        if (this.pontoB.vivo) {
            this.pontoB.iniciarVibracaoDesprendimento(this.tempoSoltura);
        }

    }

    vibrarSoltura() {

        if (this.pontoA.vivo) {
            this.ancoraA.x = this.pontoA.position.x + random(-1.4, 1.4);
            this.ancoraA.y = this.pontoA.position.y + random(-1.4, 1.4);
        }

        if (this.pontoB.vivo) {
            this.ancoraB.x = this.pontoB.position.x + random(-1.4, 1.4);
            this.ancoraB.y = this.pontoB.position.y + random(-1.4, 1.4);
        }

        this.tempoSoltura--;

        if (this.tempoSoltura <= 0) {

            if (this.pontoA.vivo) {
                this.pontoA.desancorar();
            }

            if (this.pontoB.vivo) {
                this.pontoB.desancorar();
            }

            this.velocityA = p5.Vector.random2D().mult(random(0.12, 0.35));
            this.velocityB = p5.Vector.random2D().mult(random(0.12, 0.35));

            this.estado = "livre";

        }

    }

    soltarSemMorrer() {

        if (this.pontoA && this.pontoA.vivo) {
            this.pontoA.desancorar();
        }

        if (this.pontoB && this.pontoB.vivo) {
            this.pontoB.desancorar();
        }

        this.velocityA = p5.Vector.random2D().mult(random(0.12, 0.35));
        this.velocityB = p5.Vector.random2D().mult(random(0.12, 0.35));

        this.estado = "livre";

    }

    iniciarMorte() {

        if (this.estado === "morrendo") return;

        this.estado = "morrendo";

    }

    apagarAteMorrer() {

        this.fade -= 0.0015;

        this.fade = constrain(this.fade, 0, 1);

        this.espessura = this.espessuraBase * this.fade;

        this.alpha = 210 * this.fade;

        if (this.fade <= 0.02) {
            this.viva = false;
        }

    }

    moverLivreOrganico() {

        let anguloA = noise(this.noiseA) * TWO_PI * 4;
        let anguloB = noise(this.noiseB) * TWO_PI * 4;

        let forcaA = p5.Vector.fromAngle(anguloA).mult(0.055);
        let forcaB = p5.Vector.fromAngle(anguloB).mult(0.055);

        this.velocityA.add(forcaA);
        this.velocityB.add(forcaB);

        this.velocityA.limit(0.4);
        this.velocityB.limit(0.4);

        this.ancoraA.add(this.velocityA);
        this.ancoraB.add(this.velocityB);

        this.velocityA.mult(0.96);
        this.velocityB.mult(0.96);

        this.noiseA += 0.006;
        this.noiseB += 0.006;

    }

    atualizarFilamento() {

        for (let i = 0; i < this.segmentos.length; i++) {

            let seg = this.segmentos[i];

            let t = i / (this.segmentos.length - 1);

            let x = lerp(this.ancoraA.x, this.ancoraB.x, t);
            let y = lerp(this.ancoraA.y, this.ancoraB.y, t);

            let centro = sin(t * PI);

            let deslocamentoX = map(
                noise(seg.ruidoX),
                0,
                1,
                -seg.amplitude,
                seg.amplitude
            ) * centro;

            let deslocamentoY = map(
                noise(seg.ruidoY),
                0,
                1,
                -seg.amplitude,
                seg.amplitude
            ) * centro;

            if (
                this.estado === "ancorada_invisivel" ||
                this.estado === "ancorada_visivel"
            ) {
                deslocamentoX *= 0.35;
                deslocamentoY *= 0.35;
            }

            if (this.estado === "morrendo") {
                deslocamentoX *= this.fade;
                deslocamentoY *= this.fade;
            }

            seg.pos.x = x + deslocamentoX;
            seg.pos.y = y + deslocamentoY;

            seg.ruidoX += seg.velocidade;
            seg.ruidoY += seg.velocidade;

        }

    }

    checarBordas() {

        this.checarAncora(this.ancoraA, this.velocityA);
        this.checarAncora(this.ancoraB, this.velocityB);

    }

    checarAncora(ancora, velocity) {

        if (ancora.x > this.cwidth / 2) {
            ancora.x = this.cwidth / 2;
            velocity.x *= -1;
        }

        if (ancora.x < -this.cwidth / 2) {
            ancora.x = -this.cwidth / 2;
            velocity.x *= -1;
        }

        if (ancora.y > this.cheight / 2) {
            ancora.y = this.cheight / 2;
            velocity.y *= -1;
        }

        if (ancora.y < -this.cheight / 2) {
            ancora.y = -this.cheight / 2;
            velocity.y *= -1;
        }

    }

    exibir() {

        if (
            this.estado === "ancorada_invisivel"
        ) return;
    
        push();
    
        drawingContext.disable(
            drawingContext.DEPTH_TEST
        );
    
        noFill();
    
        stroke(
            red(this.cor),
            green(this.cor),
            blue(this.cor),
            this.alpha
        );
    
        strokeWeight(
            this.espessura
        );
    
        beginShape();
    
        curveVertex(
            this.ancoraA.x,
            this.ancoraA.y
        );
    
        for (
            let seg
            of this.segmentos
        ){
    
            curveVertex(
                seg.pos.x,
                seg.pos.y
            );
    
        }
    
        curveVertex(
            this.ancoraB.x,
            this.ancoraB.y
        );
    
        endShape();
    
        drawingContext.enable(
            drawingContext.DEPTH_TEST
        );
    
        pop();
    
    }

    detectarLaco() {

        if (this.cooldownLaco > 0) {
            this.cooldownLaco--;
            return null;
        }

        let pontos = [
            this.ancoraA,
            ...this.segmentos.map(seg => seg.pos),
            this.ancoraB
        ];

        for (let i = 0; i < pontos.length - 1; i++) {

            let a1 = pontos[i];
            let a2 = pontos[i + 1];

            for (let j = i + 3; j < pontos.length - 1; j++) {

                let b1 = pontos[j];
                let b2 = pontos[j + 1];

                if (
                    this.segmentosCruzam(
                        a1,
                        a2,
                        b1,
                        b2
                    )
                ) {

                    let x = (a1.x + a2.x + b1.x + b2.x) / 4;
                    let y = (a1.y + a2.y + b1.y + b2.y) / 4;

                    this.formouLaco = true;
                    this.cooldownLaco = 240;

                    return createVector(x, y);

                }

            }

        }

        return null;

    }

    segmentosCruzam(a, b, c, d) {

        let det = (b.x - a.x) * (d.y - c.y) -
            (b.y - a.y) * (d.x - c.x);

        if (abs(det) < 0.0001) return false;

        let t = ((c.x - a.x) * (d.y - c.y) -
            (c.y - a.y) * (d.x - c.x)) / det;

        let u = ((c.x - a.x) * (b.y - a.y) -
            (c.y - a.y) * (b.x - a.x)) / det;

        return (
            t > 0 &&
            t < 1 &&
            u > 0 &&
            u < 1
        );

    }

}

export default Linha;
