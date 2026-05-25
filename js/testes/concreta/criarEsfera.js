import EsferaAquosa from "./EsferaAquosa.js";
import EsferaAlcalina from "./EsferaAlcalina.js";
import EsferaResidual from "./EsferaResidual.js";
import EsferaNeutra from "./EsferaNeutra.js";

function criarEsfera(
    cwidth,
    cheight,
    substrateLayer,
    x = null,
    y = null,
    linhaOrigem = null,
    corOrigem = null,
    tipoForcado = null
) {

    if (tipoForcado === "aquoso") {
        return new EsferaAquosa(
            cwidth,
            cheight,
            substrateLayer,
            x,
            y,
            linhaOrigem,
            corOrigem
        );
    }

    if (tipoForcado === "alcalino") {
        return new EsferaAlcalina(
            cwidth,
            cheight,
            substrateLayer,
            x,
            y,
            linhaOrigem,
            corOrigem
        );
    }

    if (tipoForcado === "residual") {
        return new EsferaResidual(
            cwidth,
            cheight,
            substrateLayer,
            x,
            y,
            linhaOrigem,
            corOrigem
        );
    }

    if (tipoForcado === "neutro") {
        return new EsferaNeutra(
            cwidth,
            cheight,
            substrateLayer,
            x,
            y,
            linhaOrigem,
            corOrigem
        );
    }

    let sorteio = random();

    if (sorteio < 0.15) {
        return new EsferaNeutra(cwidth, cheight, substrateLayer, x, y, linhaOrigem, corOrigem);
    }

    if (sorteio < 0.45) {
        return new EsferaAquosa(cwidth, cheight, substrateLayer, x, y, linhaOrigem, corOrigem);
    }

    if (sorteio < 0.80) {
        return new EsferaAlcalina(cwidth, cheight, substrateLayer, x, y, linhaOrigem, corOrigem);
    }

    return new EsferaResidual(cwidth, cheight, substrateLayer, x, y, linhaOrigem, corOrigem);
}

export default criarEsfera;
