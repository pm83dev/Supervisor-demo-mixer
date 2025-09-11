# Supervisore Demo - Turbomixer & Cooler

Demo di un'interfaccia di supervisione per un sistema industriale di turbomixer e cooler.

## Funzionalità

### 1. Stato Impianto
- Visualizzazione dello stato corrente di turbomixer e cooler
- Monitoraggio temperatura in tempo reale
- Sistema di allarmi attivi

### 2. Ciclo Turbomixer
- Visualizzazione degli step del ciclo produttivo
- Barra di progresso del ciclo
- Grafico in tempo reale di temperatura e torque
- Simulazione realistica del processo

### 3. Gestione Ricette
- Creazione, modifica ed eliminazione ricette
- Validazione dei parametri inseriti
- Interfaccia utente intuitiva con modal Bootstrap

## Struttura File

- `index.html` - Pagina principale con interfaccia a tab
- `index.js` - Logica JavaScript principale
- `cycle.html` - Pagina dedicata al ciclo (standalone)
- `cycle.js` - Logica JavaScript per il ciclo
- `recipe.html` - Pagina dedicata alle ricette (standalone)
- `recipe.js` - Logica JavaScript per le ricette
- `style.css` - Stili CSS personalizzati

## Tecnologie Utilizzate

- **HTML5** - Struttura semantica e accessibile
- **Bootstrap 5.3.2** - Framework CSS responsive
- **Chart.js** - Grafici interattivi in tempo reale
- **JavaScript ES6** - Logica applicativa moderna

## Funzionalità Implementate

### Correzioni Applicate:
1. ✅ **Navigazione navbar** - Funzionamento corretto dei tab
2. ✅ **Event listeners** - Gestione eventi DOM
3. ✅ **Form ricette** - Validazione e salvataggio
4. ✅ **Allarmi** - Visualizzazione corretta con Bootstrap
5. ✅ **Barra progresso** - Indicatore visuale del ciclo
6. ✅ **Accessibilità** - Elementi form associati correttamente
7. ✅ **Simulazione realistica** - Valori più credibili per temperatura e torque
8. ✅ **Reset automatico** - Il ciclo si resetta automaticamente al termine

## Come Utilizzare

1. Aprire `index.html` in un browser moderno
2. Navigare tra le sezioni usando la navbar
3. Monitorare lo stato dell'impianto in tempo reale
4. Osservare il progresso del ciclo automatico
5. Gestire le ricette tramite il modal

## Note Tecniche

- La demo utilizza dati simulati per la dimostrazione
- I grafici si aggiornano ogni secondo
- Il ciclo progredisce automaticamente ogni 20 secondi
- Tutte le funzionalità sono responsive e accessibili
