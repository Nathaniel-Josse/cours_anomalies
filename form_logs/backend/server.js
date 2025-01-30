import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import * as Sentry from '@sentry/node';
import '@sentry/tracing';
import dotenv from 'dotenv';

const app = express();
const port = 3000;

dotenv.config();

// Initialisation Sentry
Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
});

// Middleware Sentry
console.dir(Sentry);

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Initialize the OpenAI API client directly with the API key
//const openai = new OpenAI(process.env.OPENAI_API_KEY);

// Routes
app.get("/", (req, res) => {
    res.send("Formulaire simple (faut ouvrir le html...)");
});

app.post("/submit_form", (req, res) => {
    try {
        const { nom, prenom, email, password } = req.body;
        console.log(nom, prenom, email, password);
        checkForm(nom, prenom, email, password);
        Sentry.captureMessage("Formulaire soumis", "info", {
            nom,
            prenom,
            email,
            password,
        });
        res.status(200).send("Formulaire soumis avec succès !");
        // Simuler une erreur pour démonstration
        //throw new Error("Erreur dans le traitement du formulaire !");
    } catch (err) {
        Sentry.captureException(err); // Capture manuelle
        res.status(500).send("Une erreur est survenue !");
    }

    // Fonction de validation du formulaire
    function checkForm(nom, prenom, email, password) {
        if (!nom || !prenom || !email || !password) {
            throw new Error("Tous les champs sont obligatoires !");
        }
        if (password.length < 8) {
            throw new Error("Le mot de passe doit contenir au moins 8 caractères !");
        }
        if (!email.includes("@")) {
            throw new Error("L'adresse email n'est pas valide !");
        }
        if (!nom.match(/^[a-zA-Z]+$/)) {
            throw new Error("Le nom ne doit contenir que des lettres !");
        }
        if (!prenom.match(/^[a-zA-Z]+$/)) {
            throw new Error("Le prénom ne doit contenir que des lettres !");
        }
        return true;
    }
});

// Endpoint to handle chat POST requests
app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;

    if (!userMessage) {
        return res.status(400).send("Message is required");
    }

    try {
        const botResponse = await getChatbotResponse(userMessage);
        const userChatMessage = new ChatMessage({
        message: userMessage,
        sender: 'User',
        });
        await userChatMessage.save();
        const botChatMessage = new ChatMessage({
        message: botResponse,
        sender: 'Bot',
        });
        await botChatMessage.save();
        res.json({ userMessage, botResponse });
    } catch (error) {
        console.error("Error processing chat request:", error);
        res.status(500).send("Error processing request");
    }
});

app.listen(port, () => {
    console.log(`http://localhost:${port}`);
});