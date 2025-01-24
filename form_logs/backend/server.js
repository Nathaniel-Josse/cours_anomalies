import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import * as Sentry from '@sentry/node';
import '@sentry/tracing';

const app = express();
const port = 3000;

// Initialisation Sentry
Sentry.init({
    dsn: "https://e3d1dac47e8ad1db841abe11c67cb890@o4508699121287168.ingest.de.sentry.io/4508699123384400",
    tracesSampleRate: 1.0,
});

// Middleware Sentry
console.dir(Sentry);

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Routes
app.get("/", (req, res) => {
    res.send("Formulaire simple");
});

app.post("/submit_form", (req, res) => {
    try {
        const { name, email, message } = req.body;
        console.log(name, email, message);
        // Simuler une erreur pour démonstration
        //throw new Error("Erreur dans le traitement du formulaire !");
    } catch (err) {
        Sentry.captureException(err); // Capture manuelle
        res.status(500).send("Une erreur est survenue !");
    }
});

app.listen(port, () => {
    console.log(`http://localhost:${port}`);
});