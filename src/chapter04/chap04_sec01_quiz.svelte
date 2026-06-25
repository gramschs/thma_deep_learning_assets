<script>
  import katex from 'katex';
  import Quiz  from '../shared/Quiz.svelte';

  // Hilfsfunktionen für Rendering
  function tex(str) {
    return katex.renderToString(str, { throwOnError: false });
  }
  function code(str) {
    return `<code>${str}</code>`;
  }
  function block(str) {
    return `<pre><code>${str}</code></pre>`;
  }

  const title = 'Lernkontrolle 4.1: Tensoren und Autograd';
  const nShow = 5;

  const pool = [

    // ── Tensoren (6 Fragen) ───────────────────────────────────────────────────

    {
      id:    'tensor-shared-memory',
      topic: 'Tensoren',
      text:  `Was gibt die folgende Zelle aus?${block(
`kraft_numpy  = np.array([1.0, 2.0, 3.0])
kraft_tensor = torch.from_numpy(kraft_numpy)
kraft_numpy[0] = 99.0
print(kraft_tensor[0].item())`)}`,
      options: [
        '1.0',
        '99.0',
        'Fehler: Tensor ist schreibgeschützt',
        '0.0',
      ],
      correct: 1,
      explanation:
        `${code('torch.from_numpy()')} kopiert die Daten nicht, sondern legt eine zweite Sicht auf denselben Speicher an. Ändern wir das NumPy-Array, ändert sich der Tensor mit. Für eine echte Kopie ist ${code('torch.tensor(kraft_numpy)')} nötig.`,
    },

    {
      id:    'tensor-copy-vs-view',
      topic: 'Tensoren',
      text:  `Welche Aussage beschreibt den Unterschied zwischen ${code('torch.from_numpy(arr)')} und ${code('torch.tensor(arr)')} korrekt?`,
      options: [
        `${code('from_numpy')} teilt den Speicher mit dem NumPy-Array; ${code('torch.tensor')} erstellt eine unabhängige Kopie.`,
        `${code('torch.tensor')} teilt den Speicher; ${code('from_numpy')} erstellt eine Kopie.`,
        'Beide Varianten erstellen immer eine unabhängige Kopie.',
        'Beide Varianten teilen immer den Speicher.',
      ],
      correct: 0,
      explanation:
        `${code('from_numpy')} gibt eine zweite Sicht auf denselben Speicherbereich zurück – Änderungen am Array wirken sich auf den Tensor aus und umgekehrt. ${code('torch.tensor')} hingegen kopiert die Daten; die beiden Objekte sind danach unabhängig.`,
    },

    {
      id:    'tensor-dtype-default',
      topic: 'Tensoren',
      text:  `Was ist der Standard-Datentyp eines frisch erzeugten PyTorch-Tensors (zum Beispiel via ${code('torch.tensor([1.0, 2.0])')})?`,
      options: [
        code('float64'),
        code('float32'),
        code('int32'),
        code('float16'),
      ],
      correct: 1,
      explanation:
        `PyTorch verwendet standardmäßig ${code('float32')}, nicht ${code('float64')} wie NumPy. Das halbiert den Speicherbedarf und reicht für das Training neuronaler Netze aus. Ein per ${code('from_numpy')} konvertierter Tensor bringt allerdings den NumPy-Datentyp (${code('float64')}) mit – deshalb konvertieren wir vor dem Training explizit mit ${code('.float()')}.`,
    },

    {
      id:    'tensor-broadcast-success',
      topic: 'Tensoren',
      text:  `Was gibt die folgende Zelle aus?${block(
`a = torch.ones(2, 3)
b = torch.arange(3)
print((a + b).shape)`)}`,
      options: [
        code('torch.Size([2])'),
        code('torch.Size([3])'),
        code('torch.Size([2, 3])'),
        'Fehler: Shapes sind inkompatibel',
      ],
      correct: 2,
      explanation:
        `${code('b')} hat Shape ${code('(3,)')} und wird per Broadcasting auf jede der beiden Zeilen von ${code('a')} (Shape ${code('(2, 3)')}) addiert. Das Ergebnis behält die Shape ${code('(2, 3)')}.`,
    },

    {
      id:    'tensor-broadcast-failure',
      topic: 'Tensoren',
      text:  `Was passiert beim Ausführen der folgenden Zelle?${block(
`a      = torch.zeros(4, 3)
b      = torch.ones(4)
result = a + b`)}`,
      options: [
        `Kein Fehler; Ergebnis hat Shape ${code('(4, 3)')}.`,
        `Kein Fehler; Ergebnis hat Shape ${code('(4, 4)')}.`,
        `RuntimeError: die letzte Dimension von ${code('a')} (3) und ${code('b')} (4) sind verschieden und keine davon ist 1.`,
        `Kein Fehler; Ergebnis hat Shape ${code('(4,)')}.`,
      ],
      correct: 2,
      explanation:
        `PyTorch richtet Shapes von rechts aus: ${code('(4, 3)')} und ${code('(4,)')}. Die letzte Dimension von ${code('a')} ist 3, die von ${code('b')} ist 4 – beide ungleich 1, also schlägt Broadcasting fehl. PyTorch wirft einen ${code('RuntimeError')}. Hätte ${code('b')} Shape ${code('(3,)')}, würde es funktionieren.`,
    },

    {
      id:    'tensor-matmul',
      topic: 'Tensoren',
      text:  `Was gibt die folgende Zelle aus?${block(
`gewichte = torch.tensor([[1.0, 0.0], [0.0, 2.0]])
eingabe  = torch.tensor([3.0, 4.0])
print(gewichte @ eingabe)`)}`,
      options: [
        'tensor([3., 8.])',
        'tensor([7., 7.])',
        'tensor([3., 4.])',
        'tensor([4., 8.])',
      ],
      correct: 0,
      explanation:
        `Das Matrix-Vektor-Produkt berechnet sich zeilenweise: ${tex('1 \\cdot 3 + 0 \\cdot 4 = 3')} und ${tex('0 \\cdot 3 + 2 \\cdot 4 = 8')}, also ${code('tensor([3., 8.]).')}.`,
    },

    // ── Autograd (5 Fragen) ───────────────────────────────────────────────────

    {
      id:    'autograd-requires-grad',
      topic: 'Autograd',
      text:  `Was bewirkt ${code('requires_grad=True')} beim Anlegen eines Tensors?`,
      options: [
        'Der Tensor wird automatisch auf der GPU gespeichert.',
        'PyTorch protokolliert alle Operationen mit diesem Tensor im Berechnungsgraphen.',
        'Der Tensor kann nach der Erstellung nicht mehr verändert werden.',
        `${code('backward()')} wird automatisch nach jeder Operation aufgerufen.`,
      ],
      correct: 1,
      explanation:
        `Mit ${code('requires_grad=True')} markiert PyTorch den Tensor als ableitbar und baut während des Forward Pass einen Berechnungsgraphen (Computational Graph) auf. Erst ein expliziter Aufruf von ${code('loss.backward()')} läuft diesen Graphen rückwärts ab und wendet die Kettenregel an.`,
    },

    {
      id:    'autograd-what-it-does-not',
      topic: 'Autograd',
      text:  'Welche der folgenden Aufgaben übernimmt Autograd <em>nicht</em>?',
      options: [
        'Gradienten der Verlustfunktion nach den Gewichten berechnen.',
        'Den Berechnungsgraphen während des Forward Pass aufbauen.',
        'Die Gewichte in Richtung des negativen Gradienten aktualisieren.',
        'Die Kettenregel automatisch anwenden.',
      ],
      correct: 2,
      explanation:
        `Autograd berechnet Gradienten und legt sie im Attribut ${code('.grad')} ab – aber es aktualisiert keine Gewichte. Den eigentlichen Optimierungsschritt muss man selbst anstoßen, zum Beispiel mit einem Optimierer wie ${code('torch.optim.SGD')}. Autograd stellt nur die Gradienten bereit; was damit gemacht wird, bleibt unsere Aufgabe.`,
    },

    {
      id:    'autograd-gradient-v1',
      topic: 'Autograd',
      text:  `Welchen Wert hat ${code('w.grad')} nach ${code('loss.backward()')}?${block(
`x      = torch.tensor(2.0)
w      = torch.tensor(1.5, requires_grad=True)
y_mess = torch.tensor(4.0)
y      = w * x
loss   = (y - y_mess) ** 2
loss.backward()`)}Die Formel lautet ${tex('\\frac{\\partial L}{\\partial w} = 2(wx - y_{\\text{mess}}) \\cdot x')}.`,
      options: [
        'tensor(4.)',
        'tensor(−4.)',
        'tensor(2.)',
        'tensor(−2.)',
      ],
      correct: 1,
      explanation:
        `Einsetzen: ${tex('2 \\cdot (1.5 \\cdot 2 - 4) \\cdot 2 = 2 \\cdot (-1) \\cdot 2 = -4')}. Das negative Vorzeichen zeigt: Vergrößern wir ${code('w')}, sinkt der Verlust – ${code('w')} ist also noch zu klein.`,
    },

    {
      id:    'autograd-gradient-v2',
      topic: 'Autograd',
      text:  `Welchen Wert hat ${code('w.grad')} nach ${code('loss.backward()')}?${block(
`x      = torch.tensor(3.0)
w      = torch.tensor(2.0, requires_grad=True)
y_mess = torch.tensor(5.0)
y      = w * x
loss   = (y - y_mess) ** 2
loss.backward()`)}Die Formel lautet ${tex('\\frac{\\partial L}{\\partial w} = 2(wx - y_{\\text{mess}}) \\cdot x')}.`,
      options: [
        'tensor(6.)',
        'tensor(−6.)',
        'tensor(3.)',
        'tensor(2.)',
      ],
      correct: 0,
      explanation:
        `Einsetzen: ${tex('2 \\cdot (2 \\cdot 3 - 5) \\cdot 3 = 2 \\cdot 1 \\cdot 3 = 6')}. Positiver Gradient: Vergrößern wir ${code('w')}, steigt der Verlust – der Optimierungsschritt würde ${code('w')} also verkleinern (${tex('y = 6 > y_{\\text{mess}} = 5')}, ${code('w')} ist zu groß).`,
    },

    {
      id:    'autograd-gradient-v3',
      topic: 'Autograd',
      text:  `Welchen Wert hat ${code('w.grad')} nach ${code('loss.backward()')}?${block(
`x      = torch.tensor(1.0)
w      = torch.tensor(3.0, requires_grad=True)
y_mess = torch.tensor(2.0)
y      = w * x
loss   = (y - y_mess) ** 2
loss.backward()`)}Die Formel lautet ${tex('\\frac{\\partial L}{\\partial w} = 2(wx - y_{\\text{mess}}) \\cdot x')}.`,
      options: [
        'tensor(−2.)',
        'tensor(2.)',
        'tensor(1.)',
        'tensor(4.)',
      ],
      correct: 1,
      explanation:
        `Einsetzen: ${tex('2 \\cdot (3 \\cdot 1 - 2) \\cdot 1 = 2 \\cdot 1 \\cdot 1 = 2')}. Positiver Gradient: ${code('w = 3')} ist zu groß (${tex('y = 3 > y_{\\text{mess}} = 2')}), der Optimierungsschritt würde ${code('w')} verkleinern.`,
    },

    // ── Stolpersteine (4 Fragen) ──────────────────────────────────────────────

    {
      id:    'autograd-accumulation',
      topic: 'Stolpersteine',
      text:  `Was gibt die folgende Zelle aus?${block(
`w      = torch.tensor(1.5, requires_grad=True)
x      = torch.tensor(2.0)
y_mess = torch.tensor(4.0)

for _ in range(2):
    loss = ((w * x) - y_mess) ** 2
    loss.backward()

print(w.grad)`)}`,
      options: [
        'tensor(−4.)',
        'tensor(−8.)',
        'tensor(4.)',
        'tensor(0.)',
      ],
      correct: 1,
      explanation:
        `${code('backward()')} überschreibt ${code('.grad')} nicht, sondern addiert den neuen Gradienten auf den alten. Der Gradient pro Durchlauf beträgt ${tex('-4')}; nach zwei Durchläufen steht ${tex('-4 + (-4) = -8')} in ${code('w.grad')}. In der Trainingsschleife muss deshalb vor jedem ${code('backward()')} der Gradient mit ${code('optimizer.zero_grad()')} geleert werden.`,
    },

    {
      id:    'autograd-relu-active',
      topic: 'Stolpersteine',
      text:  `Was gibt ${code('print(w1.grad)')} aus?${block(
`x  = torch.tensor(2.0)
t  = torch.tensor(2.0)
w1 = torch.tensor(0.5, requires_grad=True)
w2 = torch.tensor(3.0, requires_grad=True)
h    = torch.relu(w1 * x)
y    = w2 * h
loss = (y - t) ** 2
loss.backward()`)}`,
      options: [
        'tensor(0.)',
        'tensor(2.)',
        'tensor(12.)',
        'tensor(6.)',
      ],
      correct: 2,
      explanation:
        `Da ${tex('w_1 \\cdot x = 0.5 \\cdot 2 = 1 > 0')}, ist die ReLU aktiv (Ableitung 1). Mit der Kettenregel: ${tex('\\frac{\\partial L}{\\partial w_1} = 2(y-t) \\cdot w_2 \\cdot x = 2 \\cdot 1 \\cdot 3 \\cdot 2 = 12')}.`,
    },

    {
      id:    'autograd-relu-inactive',
      topic: 'Stolpersteine',
      text:  `Was gibt ${code('print(w1.grad)')} aus?${block(
`x  = torch.tensor(2.0)
t  = torch.tensor(2.0)
w1 = torch.tensor(-0.5, requires_grad=True)
w2 = torch.tensor(3.0, requires_grad=True)
h    = torch.relu(w1 * x)
y    = w2 * h
loss = (y - t) ** 2
loss.backward()`)}`,
      options: [
        'tensor(12.)',
        'tensor(−12.)',
        'tensor(0.)',
        'tensor(−4.)',
      ],
      correct: 2,
      explanation:
        `Da ${tex('w_1 \\cdot x = -0.5 \\cdot 2 = -1 < 0')}, liefert die ReLU ${tex('h = 0')} – das Neuron ist inaktiv, seine Ableitung ist 0. Der gesamte Gradient verschwindet: ${tex('\\partial L / \\partial w_1 = 0')}. Obwohl der Verlust (${tex('(0 - 2)^2 = 4')}) hoch ist, lernt das Neuron nichts. Dieses Phänomen nennt sich „Dying ReLU".`,
    },

    {
      id:    'autograd-no-update',
      topic: 'Stolpersteine',
      text:  `Was passiert mit den Gewichten ${code('w1')} und ${code('w2')}, nachdem ${code('loss.backward()')} aufgerufen wurde?`,
      options: [
        'PyTorch subtrahiert automatisch den Gradienten von den Gewichten (Gradientenabstieg).',
        `Die Gradienten werden in ${code('.grad')} gespeichert; die Gewichte selbst bleiben unverändert.`,
        'Die Gewichte werden auf null zurückgesetzt.',
        'PyTorch halbiert die Gewichte, um Overfitting zu vermeiden.',
      ],
      correct: 1,
      explanation:
        `${code('backward()')} füllt das Attribut ${code('.grad')} der Gewichte mit den berechneten Gradienten – aber es ändert die Gewichte nicht. Den eigentlichen Optimierungsschritt muss man selbst anstoßen, zum Beispiel mit ${code('w.data -= lr * w.grad')} oder durch einen Optimierer. Autograd berechnet Gradienten; das Drehen an den Gewichten bleibt unsere Aufgabe.`,
    },

  ];
</script>

<Quiz {title} {pool} {nShow} hint="Abschnitt 4.1" />
