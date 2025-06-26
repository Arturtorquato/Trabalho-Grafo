let grafo = {};


fetch('capitais.json')
    .then(res => res.json())
    .then(data => {
        data.forEach(item => {
            const [cidade, info] = Object.entries(item)[0];
            grafo[cidade] = {
                pedagio: info.toll,
                vizinhos: info.neighbors
            };
        });
        preencherSelects();
    });

function preencherSelects() {
    const origem = document.getElementById('origem');
    const destino = document.getElementById('destino');
    Object.keys(grafo).forEach(cidade => {
        const op1 = document.createElement('option');
        op1.value = cidade;
        op1.textContent = cidade;
        origem.appendChild(op1);

        const op2 = document.createElement('option');
        op2.value = cidade;
        op2.textContent = cidade;
        destino.appendChild(op2);
    });
}

function calcular() {
    const origem = document.getElementById('origem').value;
    const destino = document.getElementById('destino').value;
    const precoCombustivel = parseFloat(document.getElementById('precoCombustivel').value);
    const autonomia = parseFloat(document.getElementById('autonomia').value);
    const resultado = document.getElementById('resultado');

    if (!origem || !destino) {
        resultado.textContent = "Selecione a origem e o destino.";
        return;
    }

    const { caminho, custo } = dijkstra(origem, destino, precoCombustivel, autonomia);

    if (caminho.length === 0) {
        resultado.textContent = "Não existe caminho entre as capitais selecionadas.";
    } else {
        resultado.textContent = `Caminho: ${caminho.join(' -> ')}\nCusto total: R$ ${custo.toFixed(2)}`;
    }
}

function dijkstra(origem, destino, precoCombustivel, autonomia) {
    const dist = {};
    const anterior = {};
    const visitados = new Set();
    const fila = new MinHeap();

    Object.keys(grafo).forEach(cidade => dist[cidade] = Infinity);
    dist[origem] = grafo[origem].pedagio;

    fila.insert(origem, dist[origem]);

    while (!fila.isEmpty()) {
        const { node: atual } = fila.extractMin();

        if (atual === destino) break;
        if (visitados.has(atual)) continue;
        visitados.add(atual);

        const vizinhos = grafo[atual].vizinhos;
        for (const [vizinho, distancia] of Object.entries(vizinhos)) {
            const custoDistancia = (distancia / autonomia) * precoCombustivel;
            const custoPedagio = grafo[vizinho].pedagio;
            const novoCusto = dist[atual] + custoDistancia + custoPedagio;

            if (novoCusto < dist[vizinho]) {
                dist[vizinho] = novoCusto;
                anterior[vizinho] = atual;
                fila.insert(vizinho, novoCusto);
            }
        }
    }

    const caminho = [];
    let atual = destino;
    if (dist[destino] === Infinity) {
        return { caminho: [], custo: Infinity };
    }
    while (atual) {
        caminho.unshift(atual);
        atual = anterior[atual];
    }
    return { caminho, custo: dist[destino] };
}


class MinHeap {
    constructor() {
        this.heap = [];
    }

    insert(node, priority) {
        this.heap.push({ node, priority });
        this.bubbleUp();
    }

    bubbleUp() {
        let idx = this.heap.length - 1;
        const element = this.heap[idx];

        while (idx > 0) {
            let parentIdx = Math.floor((idx - 1) / 2);
            let parent = this.heap[parentIdx];

            if (element.priority >= parent.priority) break;
            this.heap[idx] = parent;
            idx = parentIdx;
        }
        this.heap[idx] = element;
    }

    extractMin() {
        const min = this.heap[0];
        const end = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = end;
            this.sinkDown();
        }
        return min;
    }

    sinkDown() {
        let idx = 0;
        const length = this.heap.length;
        const element = this.heap[0];

        while (true) {
            let leftChildIdx = 2 * idx + 1;
            let rightChildIdx = 2 * idx + 2;
            let leftChild, rightChild;
            let swap = null;

            if (leftChildIdx < length) {
                leftChild = this.heap[leftChildIdx];
                if (leftChild.priority < element.priority) {
                    swap = leftChildIdx;
                }
            }
            if (rightChildIdx < length) {
                rightChild = this.heap[rightChildIdx];
                if (
                    (swap === null && rightChild.priority < element.priority) ||
                    (swap !== null && rightChild.priority < leftChild.priority)
                ) {
                    swap = rightChildIdx;
                }
            }
            if (swap === null) break;
            this.heap[idx] = this.heap[swap];
            idx = swap;
        }
        this.heap[idx] = element;
    }

    isEmpty() {
        return this.heap.length === 0;
    }
}
